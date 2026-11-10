/**
 * 第八十四轮：风格包管理（AI 通道面板里的「风格包」一节 + 三个弹层）。
 *
 * 旧版这一节是两行硬编码：集市用户一个包都没装，面板照样给「调用指令」，
 * 贴给 Agent 就是 style:unknown-style。现在列表读的是磁盘真值：
 * - 未安装 → 只给「安装」（插件自带的包从 script/excali-style 拷进工作区）；
 * - 已安装 → 才给「调用指令 / 效果图 / 移除」；
 * - 文件坏了 → 仍占一行（否则删不掉），只给「重新安装 / 移除」。
 *
 * 导入四通道对应四种网络现实：链接（GitHub raw 常打不开）、粘贴 JSON（没网）、
 * 本地文件（桌面端连带读同目录效果图）、让 Agent 代装（外部 Agent 有写盘权限，
 * 思源内置智能体没有——这一点必须在界面里说清，不能让用户白试）。
 */

import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { t } from "../i18n";
import {
  normalizePackUrl,
  readStyleCard,
  resolvePreviewUrl,
  styleAgentPrompt,
  styleTemplate,
  type ParsedStyleCard,
  type StyleEntry,
  type StyleLibraryApi,
} from "./ai/style-library";
import { styleCall, type SkillLayout } from "./ai/skill-dispatch";

type CopyFn = (id: string, text: string) => void;

export type StyleLibraryProps = {
  api: StyleLibraryApi;
  skill: SkillLayout;
  entries: StyleEntry[] | null;
  loadError: string;
  copy: CopyFn;
  copied: string | null;
  notify: (msg: string, timeout?: number) => void;
  /** 弹层开着时面板不许响应 Esc（否则先关面板、弹层还留着） */
  onModalOpenChange: (open: boolean) => void;
  /** 安装/移除成功 → 面板重扫目录（提示词里的包名也跟着更新） */
  onChanged: () => Promise<void> | void;
};

type ImportTab = "url" | "json" | "file" | "agent";

type ImportPreview = ParsedStyleCard & {
  text: string;
  previewBytes?: Uint8Array;
  /** 效果图为什么没带上（空串 = 一切正常） */
  previewNote: string;
};

type ImportState = {
  tab: ImportTab;
  step: "input" | "preview";
  url: string;
  json: string;
  loading: boolean;
  error: string;
  parsed: ImportPreview | null;
};

type Modal =
  | { type: "import"; state: ImportState }
  | { type: "remove"; entry: StyleEntry }
  | { type: "effect"; entry: StyleEntry };

function messageOf(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function newImport(tab: ImportTab): Modal {
  return {
    type: "import",
    state: { tab, step: "input", url: "", json: styleTemplate(), loading: false, error: "", parsed: null },
  };
}

function bytesUrl(bytes: Uint8Array): string {
  return URL.createObjectURL(new Blob([bytes as unknown as BlobPart], { type: "image/png" }));
}

function shortName(path: string): string {
  const clean = path.replace(/\\/g, "/");
  return clean.slice(clean.lastIndexOf("/") + 1) || path;
}

export function StyleLibrarySection(props: StyleLibraryProps) {
  const { api, skill, entries, loadError, copy, copied, notify, onChanged, onModalOpenChange } = props;
  const [modal, setModal] = useState<Modal | null>(null);
  const [busy, setBusy] = useState("");
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const thumbRef = useRef<Record<string, string>>({});
  const modalUrlRef = useRef("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const releaseModalUrl = useCallback(() => {
    if (modalUrlRef.current) URL.revokeObjectURL(modalUrlRef.current);
    modalUrlRef.current = "";
  }, []);

  useEffect(() => {
    onModalOpenChange(modal !== null);
  }, [modal, onModalOpenChange]);

  useEffect(() => {
    if (!modal) releaseModalUrl();
  }, [modal, releaseModalUrl]);

  // 弹层开着时 Esc 只关弹层（面板的 Esc 监听在捕获阶段，必须让它先让路）
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      setModal(null);
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [modal]);

  useEffect(() => {
    let alive = true;
    for (const entry of entries ?? []) {
      if (!entry.preview) continue;
      const key = `${entry.installed ? "i" : "b"}:${entry.preview}`;
      if (thumbRef.current[key]) continue;
      void api
        .previewSrc(entry)
        .then((src) => {
          if (!src) return;
          thumbRef.current[key] = src;
          if (alive) setThumbs((prev) => (prev[key] === src ? prev : { ...prev, [key]: src }));
        })
        .catch(() => undefined);
    }
    return () => {
      alive = false;
    };
  }, [entries, api]);

  useEffect(
    () => () => {
      for (const url of Object.values(thumbRef.current)) URL.revokeObjectURL(url);
      thumbRef.current = {};
      releaseModalUrl();
    },
    [releaseModalUrl],
  );

  const thumbOf = (entry: StyleEntry): string => {
    if (!entry.preview) return "";
    return thumbs[`${entry.installed ? "i" : "b"}:${entry.preview}`] ?? "";
  };

  const installedCount = (entries ?? []).filter((e) => e.installed && !e.error).length;
  const knownNames = (): Set<string> =>
    new Set((entries ?? []).filter((e) => e.installed && !e.error).map((e) => e.name));

  const installBundled = async (entry: StyleEntry): Promise<void> => {
    setBusy(entry.name);
    try {
      const result = await api.installBundled(entry.name);
      await onChanged();
      setModal(null);
      notify(t("已安装 {name}", { name: result.name }) + (result.wrotePreview ? " · " + t("含效果图") : ""));
    } catch (e) {
      notify(t("安装失败：{msg}", { msg: messageOf(e) }), 6000);
    } finally {
      setBusy("");
    }
  };

  const removeEntry = async (entry: StyleEntry): Promise<void> => {
    setBusy(entry.name);
    try {
      await api.remove(entry.name);
      await onChanged();
      setModal(null);
      notify(t("已移除 {name}", { name: entry.name }) + " · " + t("已画好的白板不受影响"));
    } catch (e) {
      notify(t("移除失败：{msg}", { msg: messageOf(e) }), 6000);
    } finally {
      setBusy("");
    }
  };

  const openDir = (): void => {
    if (api.openDir()) return;
    notify(t("仅桌面端支持在文件管理器中打开文件夹"), 4000);
  };

  /* ---------------- 导入：四通道 ---------------- */

  const patchImport = (patch: Partial<ImportState>): void => {
    setModal((prev) =>
      prev && prev.type === "import" ? { type: "import", state: { ...prev.state, ...patch } } : prev,
    );
  };

  const stage = (text: string, parsed: ParsedStyleCard, previewBytes: Uint8Array | undefined, note: string): void => {
    releaseModalUrl();
    if (previewBytes) modalUrlRef.current = bytesUrl(previewBytes);
    patchImport({
      step: "preview",
      loading: false,
      error: "",
      parsed: { ...parsed, text, previewBytes, previewNote: note },
    });
  };

  const readFromUrl = async (rawUrl: string): Promise<void> => {
    const url = normalizePackUrl(rawUrl);
    if (!/^https?:\/\//i.test(url)) {
      patchImport({ error: t("请填一个 http(s) 链接，或改成粘贴 JSON") });
      return;
    }
    patchImport({ loading: true, error: "" });
    try {
      const text = await api.fetchText(url);
      const parsed = readStyleCard(text, url, knownNames());
      if (!parsed.ok) throw new Error(parsed.error);
      let previewBytes: Uint8Array | undefined;
      let note = "";
      const previewUrl = resolvePreviewUrl(url, parsed.value.card.preview);
      if (parsed.value.card.preview && previewUrl) {
        const bytes = await api.fetchImage(previewUrl);
        if (bytes) previewBytes = bytes;
        else note = t("效果图没下下来（不影响安装；可之后把同名 PNG 放进 previews/）");
      } else if (parsed.value.card.preview) {
        note = t("效果图写的是相对路径，链接通道拿不到（不影响安装）");
      }
      stage(text, parsed.value, previewBytes, note);
    } catch (e) {
      patchImport({ loading: false, error: t("读取失败：{msg}", { msg: messageOf(e) }) });
    }
  };

  const parseJson = async (text: string): Promise<void> => {
    const parsed = readStyleCard(text, "粘贴的 JSON", knownNames());
    if (!parsed.ok) {
      patchImport({ error: parsed.error });
      return;
    }
    let previewBytes: Uint8Array | undefined;
    let note = "";
    if (parsed.value.card.preview) {
      if (/^https?:\/\//i.test(parsed.value.card.preview)) {
        const bytes = await api.fetchImage(parsed.value.card.preview);
        if (bytes) previewBytes = bytes;
        else note = t("效果图没下下来（不影响安装）");
      } else {
        note = t("粘贴模式拿不到相对路径的图；装好后把同名 PNG 放进 previews/ 即可显示");
      }
    }
    stage(text, parsed.value, previewBytes, note);
  };

  const stageFile = (text: string, path: string, previewBytes: Uint8Array | undefined): void => {
    const parsed = readStyleCard(text, shortName(path), knownNames());
    if (!parsed.ok) {
      patchImport({ error: parsed.error });
      return;
    }
    stage(text, parsed.value, previewBytes, previewBytes ? "" : t("这个 JSON 没带同目录的效果图（不影响安装）"));
  };

  const pickLocal = async (): Promise<void> => {
    try {
      const result = await api.pickFile();
      if (result.kind === "canceled") return;
      if (result.kind === "read-error") {
        patchImport({ error: t("读不了这个文件：{path}", { path: result.path }) });
        return;
      }
      if (result.kind === "unavailable") {
        fileInputRef.current?.click();
        return;
      }
      stageFile(result.text, result.path, result.previewBytes);
    } catch (e) {
      patchImport({ error: t("读取失败：{msg}", { msg: messageOf(e) }) });
    }
  };

  const commitImport = async (parsed: ImportPreview): Promise<void> => {
    setBusy(parsed.card.name);
    try {
      const result = await api.install({ text: parsed.text, previewBytes: parsed.previewBytes });
      await onChanged();
      setModal(null);
      notify(t("已导入 {name}", { name: result.name }) + (result.wrotePreview ? " · " + t("含效果图") : ""));
    } catch (e) {
      patchImport({ error: t("写入失败：{msg}", { msg: messageOf(e) }) });
    } finally {
      setBusy("");
    }
  };

  /* ---------------- 渲染：列表 ---------------- */

  const renderPkg = (entry: StyleEntry) => {
    const thumb = thumbOf(entry);
    const disabled = busy === entry.name;
    const installed = entry.installed && !entry.error;
    return (
      <div
        className={`exs-stylePkg${installed ? "" : " exs-stylePkg--off"}${entry.error ? " exs-stylePkg--bad" : ""}`}
        key={entry.name}
      >
        <button
          className={`exs-stylePkg__thumb${thumb ? "" : " exs-stylePkg__thumb--empty"}`}
          type="button"
          title={thumb ? t("看效果") : t("没有效果图")}
          disabled={!thumb}
          onClick={() => thumb && setModal({ type: "effect", entry })}
        >
          {thumb ? <img src={thumb} alt="" /> : null}
        </button>
        <div className="exs-stylePkg__mid">
          <div className="exs-stylePkg__nm">
            {entry.label}
            <code>{entry.name}</code>
            {!entry.bundled ? <span className="exs-stylePkg__src">{t("导入")}</span> : null}
          </div>
          <div className="exs-stylePkg__ds">
            {entry.error ? (
              <span className="exs-stylePkg__err">{t("文件损坏：{msg}", { msg: entry.error })}</span>
            ) : (
              entry.description || t("（未写 description）")
            )}
          </div>
        </div>
        <span
          className={`exs-stylePkg__chip${installed ? "" : " exs-stylePkg__chip--off"}${
            entry.error ? " exs-stylePkg__chip--bad" : ""
          }`}
        >
          {entry.error ? t("文件损坏") : installed ? t("已安装") : t("未安装")}
        </span>
        <div className="exs-stylePkg__acts">
          {installed ? (
            <>
              <button
                className="exs-stylePkg__btn exs-stylePkg__btn--solid"
                type="button"
                onClick={() => copy("call-" + entry.name, styleCall(entry.name, skill, entry.prompt))}
              >
                {copied === "call-" + entry.name ? t("已复制") : t("调用指令")}
              </button>
              {entry.preview ? (
                <button
                  className="exs-stylePkg__btn"
                  type="button"
                  onClick={() => copy("see-" + entry.name, api.previewAbs(entry))}
                >
                  {copied === "see-" + entry.name ? t("已复制") : t("效果图")}
                </button>
              ) : (
                <button className="exs-stylePkg__btn" type="button" disabled>
                  {t("无效果图")}
                </button>
              )}
              <button
                className="exs-stylePkg__btn exs-stylePkg__btn--danger"
                type="button"
                disabled={disabled}
                onClick={() => setModal({ type: "remove", entry })}
              >
                {t("移除")}
              </button>
            </>
          ) : entry.error ? (
            <>
              {entry.bundled ? (
                <button
                  className="exs-stylePkg__btn exs-stylePkg__btn--solid"
                  type="button"
                  disabled={disabled}
                  onClick={() => void installBundled(entry)}
                >
                  {disabled ? t("安装中…") : t("重新安装")}
                </button>
              ) : null}
              <button
                className="exs-stylePkg__btn exs-stylePkg__btn--danger"
                type="button"
                disabled={disabled}
                onClick={() => setModal({ type: "remove", entry })}
              >
                {t("移除")}
              </button>
            </>
          ) : (
            <>
              <button
                className="exs-stylePkg__btn exs-stylePkg__btn--solid"
                type="button"
                disabled={disabled}
                onClick={() => void installBundled(entry)}
              >
                {disabled ? t("安装中…") : t("安装")}
              </button>
              <button
                className="exs-stylePkg__btn"
                type="button"
                disabled={!thumb}
                onClick={() => thumb && setModal({ type: "effect", entry })}
              >
                {t("看效果")}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const importState = modal && modal.type === "import" ? modal.state : null;

  return (
    <div className="exs-styleLib">
      <div className="exs-styleLib__head">
        <b>{t("风格包")}</b>
        <span className="exs-styleLib__count">
          {t("已安装 {n} / {m}", { n: installedCount, m: (entries ?? []).length })}
        </span>
        <div className="exs-styleLib__acts">
          <button className="exs-stylePkg__btn" type="button" onClick={() => setModal(newImport("url"))}>
            ＋ {t("导入")}
          </button>
          <button className="exs-stylePkg__btn" type="button" onClick={openDir}>
            {t("打开文件夹")}
          </button>
        </div>
      </div>
      <div className="exs-styleLib__hint">
        {t("列表读的是 data/assets/excali-styles/；没装就没有文件，也就不给「调用指令」。")}
      </div>
      {loadError ? <div className="exs-styleLib__empty">{loadError}</div> : null}
      {entries === null ? <div className="exs-styleLib__empty">{t("读取中…")}</div> : null}
      {entries !== null && entries.length === 0 && !loadError ? (
        <div className="exs-styleLib__empty">{t("还没有任何风格包：插件自带的包会出现在这里，点「安装」即可。")}</div>
      ) : null}
      {entries !== null ? entries.map(renderPkg) : null}

      {modal ? (
        <div
          className="exs-styleModal"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className="exs-styleModal__box" role="dialog" aria-label={t("风格包")}>
            {modal.type === "import" && importState ? (
              <ImportDialog
                state={importState}
                busy={busy}
                dirAbs={api.dirAbs()}
                exists={
                  importState.parsed
                    ? (entries ?? []).some((e) => e.name === importState.parsed?.card.name && e.installed)
                    : false
                }
                copied={copied}
                copy={copy}
                onPatch={patchImport}
                onClose={() => setModal(null)}
                onReadUrl={(url) => void readFromUrl(url)}
                onParseJson={(text) => void parseJson(text)}
                onPickFile={() => void pickLocal()}
                fileInputRef={fileInputRef}
                onFile={(file) => {
                  void file.text().then((text) => stageFile(text, file.name, undefined));
                }}
                onCommit={(parsed) => void commitImport(parsed)}
                onOpenDir={openDir}
              />
            ) : null}
            {modal.type === "effect" ? (
              <EffectDialog
                entry={modal.entry}
                thumb={thumbOf(modal.entry)}
                abs={api.previewAbs(modal.entry)}
                copied={copied}
                copy={copy}
                onClose={() => setModal(null)}
                onInstall={
                  modal.entry.installed ? null : () => {
                    void installBundled(modal.entry);
                  }
                }
                busy={busy === modal.entry.name}
              />
            ) : null}
            {modal.type === "remove" ? (
              <RemoveDialog
                entry={modal.entry}
                busy={busy === modal.entry.name}
                onClose={() => setModal(null)}
                onConfirm={() => void removeEntry(modal.entry)}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- 效果图 ---------------- */

function EffectDialog(props: {
  entry: StyleEntry;
  thumb: string;
  abs: string;
  copied: string | null;
  copy: CopyFn;
  busy: boolean;
  onInstall: (() => void) | null;
  onClose: () => void;
}) {
  const { entry, thumb, abs, copied, copy, onInstall, onClose, busy } = props;
  const copyId = "see-" + entry.name;
  return (
    <>
      <div className="exs-styleModal__head">
        <div className="exs-styleModal__title">
          <b>{entry.label}</b>
          <span>
            {entry.name}
            {entry.description ? " · " + entry.description : ""}
          </span>
        </div>
        <button className="exs-styleModal__close" type="button" title={t("关闭")} onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="exs-styleModal__body">
        <div className="exs-styleModal__effect">
          {thumb ? <img src={thumb} alt="" /> : <span>{t("这个包没有效果图")}</span>}
        </div>
        {!entry.installed ? (
          <div className="exs-styleModal__hint">
            {t("未安装时只看不复制，避免给 Agent 一个不存在的路径。")}
          </div>
        ) : null}
      </div>
      <div className="exs-styleModal__foot">
        {entry.installed ? (
          <>
            <span className="exs-styleModal__hint">
              {t("效果图是本地绝对路径，不依赖网络。")}
            </span>
            <button className="exs-stylePkg__btn" type="button" onClick={() => copy(copyId, abs)}>
              {copied === copyId ? t("已复制") : t("复制路径")}
            </button>
          </>
        ) : (
          <>
            <span className="exs-styleModal__hint">{t("安装后「效果图」按钮才会复制本地路径。")}</span>
            <button className="exs-stylePkg__btn exs-stylePkg__btn--solid" type="button" disabled={busy} onClick={onInstall ?? undefined}>
              {busy ? t("安装中…") : t("安装这个包")}
            </button>
          </>
        )}
      </div>
    </>
  );
}

/* ---------------- 移除确认 ---------------- */

function RemoveDialog(props: { entry: StyleEntry; busy: boolean; onClose: () => void; onConfirm: () => void }) {
  const { entry, busy, onClose, onConfirm } = props;
  return (
    <>
      <div className="exs-styleModal__head">
        <div className="exs-styleModal__title">
          <b>{t("移除风格包")}</b>
          <span>{t("只删文件，不动已经画好的白板")}</span>
        </div>
        <button className="exs-styleModal__close" type="button" title={t("关闭")} onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="exs-styleModal__body">
        <div className="exs-styleModal__parse">
          <div className="exs-styleModal__parseMid">
            <div className="exs-styleModal__parseNm">
              {entry.label}
              <code>{entry.name}</code>
            </div>
            <div className="exs-styleModal__meta">{entry.description || t("（未写 description）")}</div>
          </div>
          <span className="exs-stylePkg__chip exs-stylePkg__chip--bad">{t("将移除")}</span>
        </div>
        <div className="exs-styleModal__warn exs-styleModal__warn--danger">
          {t("移除后再让 Agent 传 {name} 会报「风格不存在」；已经画好的白板不受影响。", { name: entry.name })}
          {entry.bundled ? t("内置包随时可以重新安装。") : t("文件删掉就没了，需要重新导入。")}
        </div>
      </div>
      <div className="exs-styleModal__foot">
        <button className="exs-stylePkg__btn" type="button" onClick={onClose}>
          {t("取消")}
        </button>
        <button
          className="exs-stylePkg__btn exs-stylePkg__btn--dangerSolid"
          type="button"
          disabled={busy}
          onClick={onConfirm}
        >
          {busy ? t("移除中…") : t("移除")}
        </button>
      </div>
    </>
  );
}

/* ---------------- 导入 ---------------- */

const TABS: Array<[ImportTab, string]> = [
  ["url", "链接"],
  ["json", "粘贴 JSON"],
  ["file", "本地文件"],
  ["agent", "让 Agent 代装"],
];

function ImportDialog(props: {
  state: ImportState;
  busy: string;
  dirAbs: string;
  exists: boolean;
  copied: string | null;
  copy: CopyFn;
  onPatch: (patch: Partial<ImportState>) => void;
  onClose: () => void;
  onReadUrl: (url: string) => void;
  onParseJson: (text: string) => void;
  onPickFile: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFile: (file: File) => void;
  onCommit: (parsed: ImportPreview) => void;
  onOpenDir: () => void;
}) {
  const { state, busy, dirAbs, exists, copied, copy, onPatch, onClose, onReadUrl, onParseJson, onPickFile, onFile, onCommit, onOpenDir } = props;
  const { tab, step, parsed, error, loading } = state;

  const tabs = (
    <div className="exs-styleModal__tabs">
      {TABS.map(([id, label]) => (
        <button
          key={id}
          type="button"
          className="exs-styleModal__tab"
          aria-selected={tab === id}
          onClick={() => onPatch({ tab: id, error: "" })}
        >
          {t(label)}
        </button>
      ))}
    </div>
  );

  if (step === "preview" && parsed) {
    const palette = parsed.pack.diff.fillPalette ?? [];
    return (
      <>
        <div className="exs-styleModal__head">
          <div className="exs-styleModal__title">
            <b>{t("导入风格包")}</b>
            <span>{t("确认后写入插件目录")}</span>
          </div>
          <button className="exs-styleModal__close" type="button" title={t("关闭")} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="exs-styleModal__body">
          <div className="exs-styleModal__parse">
            <div className="exs-styleModal__parseThumb">
              {parsed.previewBytes ? (
                <PreviewImage bytes={parsed.previewBytes} />
              ) : palette.length ? (
                <div className="exs-styleModal__palette">
                  {palette.slice(0, 4).map((c) => (
                    <i key={c} style={{ background: c }} />
                  ))}
                </div>
              ) : null}
            </div>
            <div className="exs-styleModal__parseMid">
              <div className="exs-styleModal__parseNm">
                {parsed.card.label}
                <code>{parsed.card.name}</code>
              </div>
              <div className="exs-styleModal__meta">
                {parsed.card.description || t("（未写 description）")}
              </div>
              <div className="exs-styleModal__meta">
                extends {parsed.pack.extendsFrom} · {palette.length} {t("色")} ·{" "}
                {parsed.card.version ? "v" + parsed.card.version : t("无版本号")}
              </div>
            </div>
            <span className="exs-stylePkg__chip">{t("校验通过")}</span>
          </div>
          <div className="exs-styleModal__kv">
            <div className="exs-styleModal__kvRow">
              <span>{t("写入")}</span>
              <code>…/data/assets/excali-styles/{parsed.card.name}.json</code>
            </div>
            <div className="exs-styleModal__kvRow">
              <span>{t("效果图")}</span>
              <code>
                {parsed.previewBytes
                  ? `…/previews/${parsed.card.name}.png`
                  : t("未提供（不影响使用）")}
              </code>
            </div>
          </div>
          {parsed.previewNote ? <div className="exs-styleModal__hint">{parsed.previewNote}</div> : null}
          {exists ? (
            <div className="exs-styleModal__warn">
              {t("已有同名包 {name}，写入会覆盖它的样式文件。", { name: parsed.card.name })}
            </div>
          ) : null}
          <div className="exs-styleModal__hint">{t("写入后立即生效——每次画图前插件都会重读这个目录。")}</div>
          {error ? <div className="exs-styleModal__err">{error}</div> : null}
        </div>
        <div className="exs-styleModal__foot">
          <button className="exs-stylePkg__btn" type="button" onClick={() => onPatch({ step: "input", parsed: null, error: "" })}>
            {t("返回")}
          </button>
          <button
            className="exs-stylePkg__btn exs-stylePkg__btn--solid"
            type="button"
            disabled={busy !== ""}
            onClick={() => onCommit(parsed)}
          >
            {busy ? t("写入中…") : t("写入 {name}.json", { name: parsed.card.name })}
          </button>
        </div>
      </>
    );
  }

  let body: ReactNode = null;
  if (tab === "url") {
    const normalized = normalizePackUrl(state.url);
    body = (
      <>
        <label className="exs-styleModal__field">
          <span className="exs-styleModal__label">{t("风格包链接")}</span>
          <input
            className="exs-styleModal__input"
            type="text"
            spellCheck={false}
            value={state.url}
            placeholder="https://github.com/你/仓库/blob/main/excali-style.json"
            onChange={(e) => onPatch({ url: e.target.value, error: "" })}
          />
        </label>
        <div className="exs-styleModal__hint">
          {normalized && /^https?:\/\//i.test(normalized)
            ? t("将读取 {url}", { url: normalized })
            : t("仓库根目录放 excali-style.json（+ preview.png）即可；GitHub 页面链接会自动换成 raw 地址")}
        </div>
        <div className="exs-styleModal__row">
          <button
            className="exs-stylePkg__btn exs-stylePkg__btn--solid"
            type="button"
            disabled={loading}
            onClick={() => onReadUrl(state.url)}
          >
            {loading ? t("读取中…") : t("读取")}
          </button>
          <span className="exs-styleModal__hint">{t("国内网络经常打不开 raw：失败就换「粘贴 JSON」或「让 Agent 代装」。")}</span>
        </div>
      </>
    );
  } else if (tab === "json") {
    body = (
      <>
        <label className="exs-styleModal__field">
          <span className="exs-styleModal__label">{t("JSON 内容")}</span>
          <textarea
            className="exs-styleModal__area"
            spellCheck={false}
            value={state.json}
            onChange={(e) => onPatch({ json: e.target.value, error: "" })}
          />
        </label>
        <div className="exs-styleModal__hint">
          {t("校验规则与加载器一致：name 小写、extends 必须存在、颜色 #rrggbb、preview 不许带路径。")}
        </div>
        <div className="exs-styleModal__row">
          <button className="exs-stylePkg__btn" type="button" onClick={() => onPatch({ json: styleTemplate(), error: "" })}>
            {t("插入空白模板")}
          </button>
          <button className="exs-stylePkg__btn exs-stylePkg__btn--solid" type="button" onClick={() => onParseJson(state.json)}>
            {t("校验并预览")}
          </button>
        </div>
      </>
    );
  } else if (tab === "file") {
    body = (
      <>
        <button className="exs-styleModal__drop" type="button" onClick={onPickFile}>
          <b>{t("选择一个 .json 文件")}</b>
          <span>{t("只在本机读取，不上传；桌面端会顺带读同目录的效果图")}</span>
          <u>{t("选择文件")}</u>
        </button>
        <input
          ref={props.fileInputRef}
          className="exs-styleModal__file"
          type="file"
          accept=".json,application/json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.currentTarget.value = "";
            if (file) onFile(file);
          }}
        />
        <div className="exs-styleModal__hint">{t("选好后会用同一套规则校验，再显示要写入的绝对路径。")}</div>
      </>
    );
  } else {
    body = (
      <>
        <div className="exs-styleModal__hint">
          {t("网络打不开 raw 时：外部 Agent（Qoder / Cursor）有自己的文件权限，可以让它直接写盘。把下面这段发过去。")}
        </div>
        <pre className="exs-styleModal__code">{styleAgentPrompt(dirAbs)}</pre>
        <div className="exs-styleModal__row">
          <button className="exs-stylePkg__btn exs-stylePkg__btn--solid" type="button" onClick={() => copy("agent", styleAgentPrompt(dirAbs))}>
            {copied === "agent" ? t("已复制") : t("复制这段")}
          </button>
          <button className="exs-stylePkg__btn" type="button" onClick={onOpenDir}>
            {t("打开文件夹")}
          </button>
        </div>
        <div className="exs-styleModal__warn">
          {t("思源内置智能体没有文件写入工具，走不通这条路——请改用「粘贴 JSON」。")}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="exs-styleModal__head">
        <div className="exs-styleModal__title">
          <b>{t("导入风格包")}</b>
          <span>{t("一份 JSON + 一张效果图")}</span>
        </div>
        <button className="exs-styleModal__close" type="button" title={t("关闭")} onClick={onClose}>
          ✕
        </button>
      </div>
      {tabs}
      <div className="exs-styleModal__body">
        {body}
        {error ? <div className="exs-styleModal__err">{error}</div> : null}
        {error && tab === "url" ? (
          <div className="exs-styleModal__row">
            <button className="exs-stylePkg__btn" type="button" onClick={() => onPatch({ tab: "agent", error: "" })}>
              {t("改用 Agent 代装")}
            </button>
            <button className="exs-stylePkg__btn" type="button" onClick={() => onPatch({ tab: "json", error: "" })}>
              {t("改用粘贴 JSON")}
            </button>
          </div>
        ) : null}
      </div>
      <div className="exs-styleModal__foot">
        <span className="exs-styleModal__hint">{t("只写两个文件：包 JSON + 效果图；不动其他包。")}</span>
        <button className="exs-stylePkg__btn" type="button" onClick={onClose}>
          {t("取消")}
        </button>
      </div>
    </>
  );
}

/** 预览确认页里的图：字节 → blob URL，卸载时释放 */
function PreviewImage(props: { bytes: Uint8Array }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    const url = bytesUrl(props.bytes);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [props.bytes]);
  return src ? <img src={src} alt="" /> : null;
}

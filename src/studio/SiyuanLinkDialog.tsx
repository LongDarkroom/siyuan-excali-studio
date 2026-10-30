/**
 * 2026-10-30：「新建思源链接」对话框。
 *
 * 为什么要有这个：Obsidian Excalidraw 在元素右键菜单里给一项「新建链接」，
 * 填完就能点跳转。我们此前只有 vendor 属性栏里那个裸输入框——用户贴进思源
 * 原生链接（siyuan://blocks/… / ((id '标题'))）一律不识别，且没有图形化入口
 * （设链接只能走脚本 API ea.setLink）。
 *
 * 两个入口都汇到同一处：
 *   ① 粘贴链接（实时识别：边打边告诉你是块引用还是文档，认不出就说该填什么）
 *   ② 搜思源文档（走 querySql 搜标题，回填规范形态 siyuan:doc/<id>）
 *
 * 产出统一是**规范形态**（siyuan:block/<id> / siyuan:doc/<id>）——与宿主
 * openBoardDocLink 的既有约定一致，落盘也是这个形态，跨版本不会散。
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { t } from "../i18n";
import {
  classifyLinkInput,
  describeSiyuanLink,
  normalizeSiyuanLink,
  parseSiyuanLink,
} from "./siyuan-link.ts";

/** 搜文档的结果（宿主注入，本组件不依赖思源 API） */
export type DocSearchHit = {
  id: string;
  title: string;
  /** 文档路径（展示用，副标题） */
  path?: string;
};

export type SiyuanLinkDialogProps = {
  onClose: () => void;
  notify: (msg: string, timeout?: number) => void;
  /** 确认：把规范形态的链接写进元素 */
  onConfirm: (canonicalLink: string, label: string) => void;
  /** 搜思源文档（宿主注入；失败返回空数组） */
  searchDocs?: (keyword: string) => Promise<DocSearchHit[]>;
  /** 已有的链接（编辑态预填） */
  initialLink?: string | null;
};

/**
 * 输入框里的内容 → 可用的链接。
 * 三种结果：空、可用（带说明）、不可用（带该填什么的引导）。
 *
 * 判错逻辑在 siyuan-link.ts 的 classifyLinkInput（纯 .ts，node 可直接断言）。
 */
function classifyInput(raw: string): {
  state: "empty" | "ok" | "bad";
  canonical: string | null;
  hint: string;
} {
  const c = classifyLinkInput(raw);
  return {
    state: c.state,
    canonical: c.canonical,
    hint: c.hint === "" ? "" : t(c.hint),
  };
}

export function SiyuanLinkDialog(props: SiyuanLinkDialogProps): React.JSX.Element {
  const { onClose, notify, onConfirm, searchDocs, initialLink } = props;
  const [raw, setRaw] = useState(initialLink ?? "");
  const [keyword, setKeyword] = useState("");
  const [hits, setHits] = useState<DocSearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  // Esc 关闭（不抢 vendor 的键盘通道：只在对话框自己身上监听）
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  const cls = useMemo(() => classifyInput(raw), [raw]);

  // 搜索文档（防抖 250ms；空词不搜）
  useEffect(() => {
    const kw = keyword.trim();
    if (!searchDocs || kw === "") {
      setHits([]);
      return;
    }
    let dead = false;
    setSearching(true);
    const timer = window.setTimeout(() => {
      void searchDocs(kw)
        .then((r) => {
          if (!dead) setHits(r);
        })
        .catch(() => {
          if (!dead) setHits([]);
        })
        .finally(() => {
          if (!dead) setSearching(false);
        });
    }, 250);
    return () => {
      dead = true;
      window.clearTimeout(timer);
    };
  }, [keyword, searchDocs]);

  const commit = (canonical: string, label: string): void => {
    onConfirm(canonical, label);
    notify(t("已设置链接：{label}", { label }));
    onClose();
  };

  return (
    <div className="exs-mask" onMouseDown={onClose}>
      <div className="exs-link-dialog" role="dialog" aria-label={t("新建思源链接")} onMouseDown={(e) => e.stopPropagation()}>
        <div className="exs-link-dialog__title">{t("新建思源链接")}</div>

        <label className="exs-link-dialog__label" htmlFor="exs-link-dialog-input">
          {t("粘贴思源链接")}
        </label>
        <input
          id="exs-link-dialog-input"
          ref={inputRef}
          className="exs-link-dialog__input"
          type="text"
          value={raw}
          placeholder={t("siyuan://blocks/… 或 ((20230101-xxxxxxx '标题'))")}
          onChange={(e) => setRaw(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && cls.canonical) {
              e.preventDefault();
              commit(cls.canonical, describeSiyuanLink(raw) ?? raw.trim());
            }
          }}
        />
        {cls.hint ? (
          <div className={"exs-link-dialog__hint" + (cls.state === "bad" ? " exs-link-dialog__hint--bad" : "")}>
            {cls.hint}
          </div>
        ) : null}

        {cls.canonical ? (
          <button
            type="button"
            className="exs-link-dialog__btn exs-link-dialog__btn--primary"
            onClick={() => commit(cls.canonical as string, describeSiyuanLink(raw) ?? raw.trim())}
          >
            {t("确认设置链接")}
          </button>
        ) : null}

        {searchDocs ? (
          <>
            <div className="exs-link-dialog__sep" />
            <label className="exs-link-dialog__label" htmlFor="exs-link-dialog-search">
              {t("或搜索一篇思源文档")}
            </label>
            <input
              id="exs-link-dialog-search"
              ref={searchRef}
              className="exs-link-dialog__input"
              type="search"
              value={keyword}
              placeholder={t("输入文档标题…")}
              onChange={(e) => setKeyword(e.target.value)}
            />
            {searching ? <div className="exs-link-dialog__hint">{t("搜索中…")}</div> : null}
            {!searching && keyword.trim() !== "" && hits.length === 0 ? (
              <div className="exs-link-dialog__hint">{t("没找到匹配的文档")}</div>
            ) : null}
            {hits.length > 0 ? (
              <ul className="exs-link-dialog__hits">
                {hits.map((h) => (
                  <li key={h.id}>
                    <button
                      type="button"
                      className="exs-link-dialog__hit"
                      onClick={() => commit(`siyuan:doc/${h.id}`, h.title)}
                    >
                      <span className="exs-link-dialog__hit-title">{h.title}</span>
                      {h.path ? <span className="exs-link-dialog__hit-path">{h.path}</span> : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}

        <button type="button" className="exs-link-dialog__btn" onClick={onClose}>
          {t("取消")}
        </button>
      </div>
    </div>
  );
}

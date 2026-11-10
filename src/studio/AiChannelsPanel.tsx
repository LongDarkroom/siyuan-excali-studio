/**
 * 第四十四轮：AI 通道面板（☰「AI 通道…」打开的 fixed 浮层）。
 *
 * 形态 = 居中弹层 + 半透明底：低频设置类面板，用完即关，不常驻占位
 * （荧光笔色板那种贴边浮层适合高频工具，这里不适用）。
 * 文案全部来自 ai/channels.ts 的元数据——四道门的语义（注册门/调用门/软门/
 * 入口门）必须与实现一字不差，改门先改元数据。
 *
 * 第八十三轮：下面加一节「技能分发」——把两份 SKILL.md 的位置当场填成绝对路径，
 * 复制成一段 Agent 读得懂的话。四条通道讲的是「谁能调」，这一节讲的是「怎么让
 * 外来的 Agent 自己学会调」，所以是并列关系，不是第五个开关。
 *
 * 第八十四轮：折叠区里的「风格包」改成磁盘真值（见 AiStyleLibrary.tsx）——
 * 没装就没有文件，也就不给调用指令；提示词里的包名同样只列已安装的。
 */

import { useCallback, useEffect, useRef, useState } from "react";
// 相对导入带 .ts 后缀（node --experimental-strip-types 不认无后缀相对路径；Vite 两边都认）
import { t } from "../i18n";
import { CHANNEL_META, type AiChannels, type ChannelId } from "./ai/channels";
import {
  SKILL_VERSION,
  agentSkillLink,
  channelNote,
  drawSkillDir,
  indexLine,
  installCommand,
  promptText,
  styleSkillDir,
  type SkillLayout,
} from "./ai/skill-dispatch";
import type { StyleEntry, StyleLibraryApi } from "./ai/style-library";
import { StyleLibrarySection } from "./AiStyleLibrary";
import { LineIcon } from "./line-icon";

export type AiChannelsPanelProps = {
  channels: AiChannels;
  onToggle: (id: ChannelId, on: boolean) => void;
  onClose: () => void;
  /** 第八十三轮：技能分发的路径与通道（pluginDir 空 = 拿不到宿主路径） */
  skill: SkillLayout;
  /** 第八十四轮：风格包目录的真实读写 */
  styleLibrary: StyleLibraryApi;
  notify: (msg: string, timeout?: number) => void;
};

/** `…/script/excali-draw`：面板只有 600 宽，绝对路径放不下，完整值走 title 与复制 */
function shortPath(abs: string): string {
  const parts = abs.split(/[\\/]/).filter(Boolean);
  return parts.length <= 2 ? abs : "…/" + parts.slice(-2).join("/");
}

export function AiChannelsPanel(props: AiChannelsPanelProps) {
  const { channels, onToggle, onClose, skill, styleLibrary, notify } = props;
  // 通道示例与技能条目共用一个「刚复制了谁」状态（都只是 1.6 秒的高亮）
  const [copied, setCopied] = useState<string | null>(null);
  const [skillOpen, setSkillOpen] = useState(false);
  const [styleEntries, setStyleEntries] = useState<StyleEntry[] | null>(null);
  const [styleError, setStyleError] = useState("");
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const skillBodyRef = useRef<HTMLDivElement | null>(null);

  const reloadStyles = useCallback(async (): Promise<void> => {
    try {
      const list = await styleLibrary.list();
      setStyleEntries(list);
      setStyleError("");
    } catch (e) {
      setStyleEntries([]);
      setStyleError(t("风格包目录读取失败：{msg}", { msg: e instanceof Error ? e.message : String(e) }));
    }
  }, [styleLibrary]);

  useEffect(() => {
    void reloadStyles();
  }, [reloadStyles]);

  // 折叠条本来就贴着面板下缘：展开后不滚一下，用户会以为「点了没反应」
  useEffect(() => {
    if (skillOpen) skillBodyRef.current?.scrollIntoView({ block: "nearest" });
  }, [skillOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        // 弹层自己处理 Esc；这里再关面板会把弹层留在孤立的层级里
        if (styleModalOpen) return;
        onClose();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose, styleModalOpen]);

  const copy = (id: string, text: string) => {
    void navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(id);
        setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600);
      })
      .catch(() => undefined);
  };

  const row = (id: string, label: string, value: string, full: string, action: string, hint: string) => (
    <div className="exs-ai-skill__row" key={id}>
      <span className="exs-ai-skill__label">
        {label}
        <span className="exs-ai-skill__hint">{hint}</span>
      </span>
      <span className="exs-ai-skill__val" title={full}>
        {value}
      </span>
      <button className="exs-ai-skill__copy" onClick={() => copy(id, full)}>
        {copied === id ? t("已复制") : action}
      </button>
    </div>
  );

  const installed = (styleEntries ?? []).filter((e) => e.installed && !e.error).map((e) => e.name);
  // 还没读到列表时 styles 缺省（提示词只说「见面板列表」），读到后才点名
  const promptSkill: SkillLayout = styleEntries === null ? skill : { ...skill, styles: installed };

  return (
    <div className="exs-ai-scrim" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="exs-ai-panel" role="dialog" aria-label={t("AI 通道")}>
        <div className="exs-ai-panel__head">
          <b>{t("AI 通道")}</b>
          <span>{t("四条通道共用同一套计划 DSL 与风格包")}</span>
          <button className="exs-ai-panel__close" title={t("关闭")} onClick={onClose}>
            ✕
          </button>
        </div>
        {CHANNEL_META.map((m) => (
          <div className="exs-ai-row" key={m.id}>
            <LineIcon d={m.icon} size={20} />
            <div className="exs-ai-row__mid">
              <div className="exs-ai-row__nm">
                {t(m.title)}
                <span className={`exs-ai-badge${channels[m.id] ? "" : " exs-ai-badge--off"}`}>{m.badge}</span>
              </div>
              <div className="exs-ai-row__ds">{t(m.desc)}</div>
              <div className="exs-ai-row__gate">{t(m.gate)}</div>
              {m.sample ? (
                <div className="exs-ai-row__sample">
                  <code>{m.sample}</code>
                  <button onClick={() => copy(m.id, m.sample)}>{copied === m.id ? t("已复制") : t("复制")}</button>
                </div>
              ) : null}
            </div>
            <button
              className={`exs-ai-sw${channels[m.id] ? " exs-ai-sw--on" : ""}`}
              role="switch"
              aria-checked={channels[m.id]}
              title={channels[m.id] ? t("已开启") : t("已关闭")}
              onClick={() => onToggle(m.id, !channels[m.id])}
            />
          </div>
        ))}

        <div className="exs-ai-skill">
          <div className="exs-ai-skill__head">
            <b>{t("技能分发")}</b>
            <span>{t("让 Agent 会画 · 会参照风格")}</span>
          </div>
          <div className="exs-ai-skill__card">
            <span className="exs-ai-skill__dot" />
            <div className="exs-ai-skill__mid">
              <div className="exs-ai-skill__title">{t("技能已随插件 · v{version}", { version: SKILL_VERSION })}</div>
              <div className="exs-ai-skill__sub">{t("复制提示词发给 Agent —— 它会按路径读技能，再动手画")}</div>
            </div>
            <button className="exs-ai-skill__primary" onClick={() => copy("prompt", promptText(promptSkill))}>
              {copied === "prompt" ? t("已复制") : t("复制提示词")}
            </button>
          </div>
          <button
            className="exs-ai-skill__fold"
            aria-expanded={skillOpen}
            onClick={() => setSkillOpen((v) => !v)}
          >
            <span className="exs-ai-skill__chev">›</span>
            {t("一次性设置与风格包")}
            <span className="exs-ai-skill__meta">{skill.hasCli ? t("本机有命令行") : t("本机无命令行")}</span>
          </button>
          {skillOpen ? (
            <div className="exs-ai-skill__body" ref={skillBodyRef}>
              {row(
                "draw",
                t("绘画技能"),
                shortPath(drawSkillDir(skill)),
                drawSkillDir(skill),
                t("复制路径"),
                t("就在插件里，随插件升级；Agent 靠它知道有哪些工具、怎么排"),
              )}
              {row(
                "style",
                t("风格技能"),
                shortPath(styleSkillDir(skill)),
                styleSkillDir(skill),
                t("复制路径"),
                t("配色 / 线宽 / 字号 / 留白，只在「统一风格、批量出图」时读"),
              )}
              {row(
                "install",
                t("装到全局（跨客户端）"),
                agentSkillLink(skill),
                installCommand(skill),
                skill.platform === "windows" ? t("PowerShell 命令") : t("安装命令"),
                t("装一次，Qoder / Cursor / 思源的新会话都会自动发现它"),
              )}
              {row(
                "index",
                t("AGENTS.md 索引行"),
                t("贴进仓库根目录的 AGENTS.md"),
                indexLine(skill),
                t("复制"),
                t("只对这个仓库生效的一行指针，贴一次即可"),
              )}
              <StyleLibrarySection
                api={styleLibrary}
                skill={skill}
                entries={styleEntries}
                loadError={styleError}
                copy={copy}
                copied={copied}
                notify={notify}
                onModalOpenChange={setStyleModalOpen}
                onChanged={reloadStyles}
              />
              <div className="exs-ai-skill__note">{t(channelNote(skill))}</div>
            </div>
          ) : null}
        </div>

        <div className="exs-ai-panel__foot">
          {t("全关 = 白板退回纯手动模式；开关即时写入插件设置（内置智能体一栏需重载生效）")}
        </div>
      </div>
    </div>
  );
}

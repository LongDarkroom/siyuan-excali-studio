/**
 * 界面文案（沿用本仓库 REword 的三条准则，见 siyuan-plugin-reader/src/i18n/index.ts）：
 * ① 中文原文即 key；② 缺失回落中文；③ 只有英文需要语言包。
 *
 * 第九十四轮：自建运行时语言切换。思源把 data/plugins/<name>/i18n/<语言>.json 读进
 * `Plugin#i18n`，但插件设置数据里只有一个「当前语言」——用户想在画布 ☰ 里切语言
 * 就必须自己持有两份表。这里把 zh_CN / en_US 同时打进产物（各 50KB 级），由
 * `uiLanguage` 偏好选表：
 *   - auto     跟随思源界面语言（window.siyuan.config.lang），无宿主时回落浏览器；
 *   - zh_CN/en 强制，跨 bundle 通过 window.__exsUiLanguage 同步（壳与引擎各有一份
 *              模块实例，但共享同一个 window）。
 * 引擎侧还要「切完立刻重绘」：模块级版本号 + subscribeI18n 给 React 的
 * useSyncExternalStore 用；壳侧的命令/顶栏是同步注册的，靠 onload 早读
 * localStorage 的 hint（见 readUiLanguageHint）在下一次启动就跟随。
 */

import type { UiLanguage } from "./studio/settings";
// JSON 必须带 import attribute：测试用 node --experimental-strip-types 直接跑 ts，
// 裸 JSON import 会 ERR_IMPORT_ATTRIBUTE_MISSING。
import zhCNTable from "../i18n/zh_CN.json" with { type: "json" };
import enUSTable from "../i18n/en_US.json" with { type: "json" };

type Table = Record<string, unknown>;
export type ConcreteUiLanguage = Exclude<UiLanguage, "auto">;

const TABLES: Record<ConcreteUiLanguage, Table> = {
  zh_CN: zhCNTable as Table,
  en_US: enUSTable as Table,
};

/** 启动期提示：命令/顶栏/斜杠必须在任何 await 之前注册，读 data.json 来不及，
 *  所以切换时顺手写一份同步可读的 hint，下一次启动立即生效。 */
const HINT_KEY = "exs-ui-language";

const bridge = globalThis as typeof globalThis & {
  __exsUiLanguage?: UiLanguage;
};
/** 跨 bundle 重绘广播：壳改设置时引擎那份模块实例靠它收到通知 */
const LANG_EVENT = "exs-ui-language-change";
if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener(LANG_EVENT, () => bump());
}

/** 思源当前语言；无宿主（单测/独立页）回落浏览器语言 */
function appLanguage(): string {
  const conf = (globalThis as typeof globalThis & { siyuan?: { config?: { lang?: unknown } } }).siyuan
    ?.config?.lang;
  if (typeof conf === "string" && conf !== "") return conf;
  return typeof navigator !== "undefined" ? navigator.language || "" : "";
}

/** auto 的落点：中文家族 → zh_CN，其余 → en_US（插件目前只带这两份表） */
function autoLanguage(): ConcreteUiLanguage {
  return appLanguage().toLowerCase().startsWith("zh") ? "zh_CN" : "en_US";
}

/** 直接从宿主注入的当前语言表（与 auto 结果同源，保留给 initI18n 的既有契约） */
let injected: Table = {};
let preference: UiLanguage = "auto";
let snapshot = 0;
const listeners = new Set<() => void>();

export function initI18n(fromPlugin: unknown): void {
  injected = fromPlugin && typeof fromPlugin === "object" ? (fromPlugin as Table) : {};
  bump();
}

export function normalizeUiLanguagePreference(v: unknown): UiLanguage {
  return v === "zh_CN" || v === "en_US" ? v : "auto";
}

function activeTable(): Table {
  const forced = bridge.__exsUiLanguage;
  if (forced === "zh_CN" || forced === "en_US") return TABLES[forced];
  if (forced === "auto") return Object.keys(injected).length > 0 ? injected : TABLES[autoLanguage()];
  if (preference === "zh_CN" || preference === "en_US") return TABLES[preference];
  if (Object.keys(injected).length > 0) return injected;
  return TABLES[autoLanguage()];
}

/** 当前生效语言（切换项的文案与画布 langCode 都读它） */
export function currentUiLanguage(): ConcreteUiLanguage {
  const forced = bridge.__exsUiLanguage;
  if (forced === "zh_CN" || forced === "en_US") return forced;
  if (forced === "auto") return autoLanguage();
  if (preference === "zh_CN" || preference === "en_US") return preference;
  return autoLanguage();
}

export function setUiLanguagePreference(value: unknown): void {
  const next = normalizeUiLanguagePreference(value);
  preference = next;
  /* auto 也要写进桥（而不是删掉）：引擎那份实例自己的 preference 还停在
     「上一次的显式语言」，删桥就等于让它继续用旧值。 */
  bridge.__exsUiLanguage = next;
  try {
    localStorage.setItem(HINT_KEY, next);
  } catch {
    // 隐私模式/受限上下文静默忽略：hint 只是启动加速，真源仍是插件设置
  }
  /* 壳与引擎各有一份模块实例：壳改设置时（如设置页选「跟随思源」）本侧没有
     订阅者，必须广播给引擎那份实例，已开的画布页签才会立刻重绘。 */
  if (listeners.size > 0) bump();
  else if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new CustomEvent(LANG_EVENT));
  }
}

export function readUiLanguageHint(): UiLanguage {
  try {
    return normalizeUiLanguagePreference(localStorage.getItem(HINT_KEY));
  } catch {
    return "auto";
  }
}

/** 引擎侧重绘用：任一次切表都会 +1，React 读快照强制重渲染 */
export function getI18nSnapshot(): number {
  return snapshot;
}

export function subscribeI18n(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function bump(): void {
  snapshot += 1;
  for (const listener of listeners) listener();
}

export function t(text: string, vars?: Record<string, string | number>): string {
  const raw = activeTable()[text];
  const s = typeof raw === "string" ? raw : text;
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** Excalidraw 的语言码（其 langCode 是字面量联合，故返回值收窄到具体码而非 string）。
 *  第九十四轮起跟随插件语言（☰ 切 English 后画布按钮也英文），不再单看浏览器语言。 */
export function excalidrawLangCode(): "zh-CN" | "zh-TW" | "en" {
  return currentUiLanguage() === "en_US" ? "en" : "zh-CN";
}
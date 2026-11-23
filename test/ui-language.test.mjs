// 第九十四轮·界面/画布语言切换。
//
// 三条最容易改坏的约定：
//   ① 启动期入口（顶栏/命令/斜杠）必须先于任何 await 注册，所以语言偏好走
//      localStorage 的同步 hint 先定调，读盘后再用设置校准；
//   ② 壳与引擎是两个 bundle、两份 i18n 模块实例——偏好只能通过 window 上的
//      桥（__exsUiLanguage）同步，且 auto 时必须删掉桥，回到「跟随思源」；
//   ③ 画布内置按钮的语言走 vendor 的 langCode，必须跟着插件语言走，
//      不能再只看 navigator.language。
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_SETTINGS,
  DEFAULT_UI_LANGUAGE,
  normalizeSettings,
  normalizeUiLanguage,
} from "../src/studio/settings.ts";
import {
  currentUiLanguage,
  excalidrawLangCode,
  getI18nSnapshot,
  readUiLanguageHint,
  setUiLanguagePreference,
  subscribeI18n,
  t,
} from "../src/i18n.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(resolve(ROOT, rel), "utf8");
const src = (rel) => read("src/" + rel);
const json = (rel) => JSON.parse(read(rel));
const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'\\])\/\/[^\n]*/g, "$1");

const MENU = stripComments(src("studio/StudioMenu.tsx"));
const APP = stripComments(src("studio/StudioApp.tsx"));
const TAB = stripComments(src("studio/tab.tsx"));
const INDEX = stripComments(src("index.ts"));
const I18N = stripComments(src("i18n.ts"));

// 偏好会写 hint；Node 里没有 localStorage，给一个最小桩（只在本文件生效）
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

/* ------------------------------ 设置层 ------------------------------ */

test("uiLanguage：默认 auto，只认三档，脏值回落", () => {
  assert.equal(DEFAULT_UI_LANGUAGE, "auto");
  assert.equal(DEFAULT_SETTINGS.uiLanguage, "auto");
  assert.equal(normalizeUiLanguage("auto"), "auto");
  assert.equal(normalizeUiLanguage("zh_CN"), "zh_CN");
  assert.equal(normalizeUiLanguage("en_US"), "en_US");
  for (const dirty of ["en", "zh_CN ", 1, null, undefined, {}, true]) {
    assert.equal(normalizeUiLanguage(dirty), "auto", `脏值 ${String(dirty)} 必须回落 auto`);
  }
  assert.equal(normalizeSettings({ uiLanguage: "en_US" }).uiLanguage, "en_US");
  assert.equal(normalizeSettings({ uiLanguage: "fr" }).uiLanguage, "auto");
  assert.equal(normalizeSettings(null).uiLanguage, "auto", "老配置没这一项 → 跟随思源");
});

/* ------------------------------ 运行时切换 ------------------------------ */

test("中英互切：表、桥、hint、vendor langCode 同步跟随", () => {
  setUiLanguagePreference("en_US");
  assert.equal(currentUiLanguage(), "en_US");
  assert.equal(globalThis.__exsUiLanguage, "en_US", "engine 是另一份模块实例，只能靠 window 桥同步");
  assert.equal(t("打开白板"), "Open whiteboard");
  assert.equal(excalidrawLangCode(), "en", "画布内置按钮（vendor langCode）必须跟着插件语言走");

  setUiLanguagePreference("zh_CN");
  assert.equal(currentUiLanguage(), "zh_CN");
  assert.equal(globalThis.__exsUiLanguage, "zh_CN");
  assert.equal(t("打开白板"), "打开白板");
  assert.equal(excalidrawLangCode(), "zh-CN");

  setUiLanguagePreference("auto");
  assert.equal(globalThis.__exsUiLanguage, "auto", "auto 也要显式写桥：引擎实例的 preference 还停在旧值，删桥等于继续用旧值");
  assert.equal(readUiLanguageHint(), "auto", "hint 与设置同源，下次启动不残留");
});

test("auto：跟随思源界面语言（无宿主时回落浏览器语言）", () => {
  const prev = globalThis.siyuan;
  setUiLanguagePreference("auto");
  globalThis.siyuan = { config: { lang: "zh_CN" } };
  try {
    assert.equal(currentUiLanguage(), "zh_CN");
    assert.equal(t("打开白板"), "打开白板");
    globalThis.siyuan = { config: { lang: "en_US" } };
    assert.equal(currentUiLanguage(), "en_US");
    assert.equal(t("打开白板"), "Open whiteboard");
  } finally {
    if (prev === undefined) delete globalThis.siyuan;
    else globalThis.siyuan = prev;
  }
});

test("hint：只用于启动期同步定调，脏值回落 auto", () => {
  setUiLanguagePreference("en_US");
  assert.equal(readUiLanguageHint(), "en_US");
  store.set("exs-ui-language", "garbage");
  assert.equal(readUiLanguageHint(), "auto");
  setUiLanguagePreference("auto");
});

test("订阅：切表递增快照并通知已开页签重绘；退订后不再打扰", () => {
  let hits = 0;
  const off = subscribeI18n(() => hits++);
  const before = getI18nSnapshot();
  setUiLanguagePreference("en_US");
  assert.ok(getI18nSnapshot() > before, "快照必须变化，useSyncExternalStore 才会重渲染");
  assert.equal(hits, 1);
  setUiLanguagePreference("en_US");
  assert.equal(hits, 2, "同值也要通知（写设置路径不判重，判重在宿主）");
  off();
  setUiLanguagePreference("zh_CN");
  assert.equal(hits, 2, "退订后（页签已关）不许再回调");
});

/* ------------------------------ 接线契约 ------------------------------ */

test("☰：语言项显示「目标语言」，夹在 AI 通道之后、帮助之前", () => {
  assert.ok(MENU.includes('t("切换界面语言与画布语言")'), "菜单项（含 tooltip）必须在");
  assert.match(MENU, /onSelect=\{props\.onToggleUiLanguage\}/);
  assert.match(MENU, /props\.uiLanguage === "en_US" \? "简体中文" : "English"/, "显示要切去的语言，不是当前语言");
  const ai = MENU.indexOf('t("AI 通道…")');
  const lang = MENU.indexOf('t("切换界面语言与画布语言")');
  const help = MENU.indexOf('t("帮助")');
  assert.ok(ai < lang && lang < help, "顺序：AI 通道… → 切换语言 → 帮助");
});

test("StudioApp：切换即写设置、跨表重绘、画布 langCode 跟着走", () => {
  assert.match(APP, /useSyncExternalStore\(subscribeI18n, getI18nSnapshot\)/, "模块级 t() 的重绘靠外部 store 订阅");
  assert.match(APP, /useEffect\(\(\) => \{\s*setUiLanguagePreference\(uiLanguage\);/, "宿主偏好要在每次挂载/变更时灌进运行时表");
  assert.match(APP, /const next = currentUiLanguage\(\) === "en_US" \? "zh_CN" : "en_US";/);
  assert.match(APP, /setUiLanguagePreference\(next\);\s*onUiLanguageChange\(next\);/, "先本地即时生效，再写回设置");
  assert.match(APP, /langCode=\{excalidrawLangCode\(\)\}/, "vendor 画布语言不许再看 navigator");
});

test("tab.tsx：两项通道进 Pick 并透传", () => {
  assert.match(TAB, /"uiLanguage"[\s\S]*?"onUiLanguageChange"/, "StudioTabHost 的 Pick 必须包含两项");
  assert.match(TAB, /uiLanguage=\{host\.uiLanguage\}/);
  assert.match(TAB, /onUiLanguageChange=\{host\.onUiLanguageChange\}/);
});

test("index.ts：hint 抢在 await 之前定调，读盘后用设置校准", () => {
  const init = INDEX.indexOf("initI18n(this.i18n)");
  const hint = INDEX.indexOf("setUiLanguagePreference(readUiLanguageHint())");
  const ready = INDEX.indexOf("this.ready = this.bootstrapState()");
  const topbar = INDEX.indexOf("this.addTopBar({");
  assert.ok(init >= 0 && hint > init, "先 initI18n 再灌 hint");
  assert.ok(hint < ready && hint < topbar, "hint 必须早于读盘与顶栏注册（入口文案要在同步段定下来）");
  assert.match(INDEX, /await this\.loadState\(\);\s*setUiLanguagePreference\(this\.settings\.uiLanguage\)/, "读盘后校准一次");
});

test("index.ts：宿主通道 getter 读设置、回写同值早退、立即落盘", () => {
  assert.match(INDEX, /get uiLanguage\(\)\s*\{\s*return plugin\.settings\.uiLanguage;/, "与 fontFamily 同风格用 getter");
  assert.match(INDEX, /onUiLanguageChange: \(value\) => this\.rememberUiLanguage\(value\)/);
  assert.match(INDEX, /private rememberUiLanguage\(value: UiLanguage\): void/);
  assert.match(INDEX, /setUiLanguagePreference\(next\);\s*if \(this\.settings\.uiLanguage === next\) return;/, "运行时表先更新，同值不刷 saveData");
  assert.match(INDEX, /this\.settings = \{ \.\.\.this\.settings, uiLanguage: next \};\s*this\.persist\(\);/, "改完立即落盘");
});

test("设置页有「界面语言」一行：跟随思源 / 简体中文 / English", () => {
  assert.match(INDEX, /title: t\("界面语言"\)/);
  assert.match(INDEX, /\["auto", t\("跟随思源"\)\]/, "默认项的口径要写明「跟随思源」");
  assert.match(INDEX, /\["zh_CN", "简体中文"\]/);
  assert.match(INDEX, /\["en_US", "English"\]/);
  assert.match(INDEX, /el\.addEventListener\("change", \(\) => this\.rememberUiLanguage\(el\.value as UiLanguage\)\)/);
});

test("i18n.ts：auto 口径只看思源 lang，不猜浏览器", () => {
  assert.match(I18N, /siyuan[\s\S]{0,40}?\.config\?\.lang/, "宿主语言是真源");
  assert.match(I18N, /startsWith\("zh"\) \? "zh_CN" : "en_US"/);
  assert.match(I18N, /bridge\.__exsUiLanguage = next;/, "auto 也要写桥（引擎实例的旧 preference 不会自己复位）");
  assert.match(I18N, /if \(forced === "auto"\) return autoLanguage\(\);/, "桥上的 auto 直接走跟随思源");
  assert.match(I18N, /window\.dispatchEvent\(new CustomEvent\(LANG_EVENT\)\)/, "壳侧改设置要广播给引擎那份实例");
  assert.match(I18N, /window\.addEventListener\(LANG_EVENT, \(\) => bump\(\)\)/, "接收侧收到广播即重绘");
  assert.match(I18N, /return currentUiLanguage\(\) === "en_US" \? "en" : "zh-CN";/);
});

test("新增文案两份语言包都有，中文原文即 key", () => {
  const zh = json("i18n/zh_CN.json");
  const en = json("i18n/en_US.json");
  const keys = [
    "切换界面语言与画布语言",
    "界面语言",
    "跟随思源",
    "画布与插件界面的语言。跟随思源 = 思源界面是中文就中文，否则英文。画布与已打开的页签立即切换；顶栏、命令、斜杠等入口文案在重启思源后跟随。",
  ];
  for (const k of keys) {
    assert.ok(k in zh, `zh_CN 缺键：${k}`);
    assert.ok(k in en, `en_US 缺键：${k}`);
    assert.equal(zh[k], k, `中文原文即 key：${k}`);
    assert.notEqual(en[k], k, `en_US 漏译：${k}`);
  }
  // 两份表键集必须一致，否则切英文会露出中文原文
  assert.deepEqual(Object.keys(zh).sort(), Object.keys(en).sort());
});
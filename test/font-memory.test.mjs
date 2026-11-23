// 第九十三轮·新增文本默认字体（2026-11-23 二次修订：改成单向）。
// 背景：嵌入式 <Excalidraw> 初始化走 restore(initialData, null, null)——不读 localStorage；
// 而 currentItemFontFamily 是工具偏好（vendor 标 export:false），我们的载荷白名单也不收。
// 所以每次开板都会回落 vendor 默认 Excalifont(5)，必须由插件注入。
//
// 语义（唯一口径，别再加第二条通道）：
//   设置页下拉 = 唯一来源 → 开板写进 initialData → 新打的字用它；
//   画布内换字体只影响这块板这一次会话，**不回写设置、不跨板传播**（否则会出现
//   「我选好的字体被某块板上的临时选择冲掉」）。
//
// 三条最容易改坏的不变量：
//   ① 新建 / 打开两个分支都要带 currentItemFontFamily，漏一个就又开始「打开就丢」；
//   ② 只能单向：handleChange 里不许读 currentItemFontFamily 回写；
//   ③ 键域必须是「vendor 现役值 + 插件内置 101~106」；4 是历史空位、100 是 Xiaolai
//      回落专用的 id，都不许进键域，脏值一律回落 5。
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  BUNDLED_TEXT_FONT_FAMILIES,
  DEFAULT_SETTINGS,
  DEFAULT_TEXT_FONT_FAMILY,
  TEXT_FONT_FAMILIES,
  TEXT_FONT_NAMES,
  VENDOR_TEXT_FONT_FAMILIES,
  normalizeSettings,
  normalizeTextFontFamily,
} from "../src/studio/settings.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(resolve(ROOT, rel), "utf8");
}
function src(rel) {
  return read("src/" + rel);
}
function stripComments(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'\\])\/\/[^\n]*/g, "$1");
}

const SETTINGS = stripComments(src("studio/settings.ts"));
const APP = stripComments(src("studio/StudioApp.tsx"));
const TAB = stripComments(src("studio/tab.tsx"));
const INDEX = stripComments(src("index.ts"));

/* ------------------------------ 数据层：设置 ------------------------------ */

test("fontFamily：默认 Excalifont(5)，接口里要有这一项", () => {
  assert.equal(DEFAULT_TEXT_FONT_FAMILY, 5, "默认必须与 vendor DEFAULT_FONT_FAMILY（Excalifont）同值");
  assert.equal(DEFAULT_SETTINGS.fontFamily, 5);
  assert.match(SETTINGS, /fontFamily:\s*TextFontFamily/, "接口里要有这一项");
  assert.ok(!TEXT_FONT_FAMILIES.includes(4), "4 是 vendor 的历史空位（Obsidian 自定义字体），不能进键域");
  for (const id of TEXT_FONT_FAMILIES) assert.equal(typeof TEXT_FONT_NAMES[id], "string", `缺显示名：${id}`);
});

test("键域 = vendor FONT_FAMILY 现役值 + 插件内置 6 款，逐一对上", () => {
  const vendor = read("node_modules/@excalidraw/excalidraw/dist/dev/chunk-4FTI6OG3.js");
  const block = vendor.match(/var FONT_FAMILY = \{([\s\S]*?)\};/)?.[1] ?? "";
  const vendorIds = [...block.matchAll(/:\s*(\d+)/g)].map((m) => Number(m[1])).sort((a, b) => a - b);
  assert.deepEqual(vendorIds, [...VENDOR_TEXT_FONT_FAMILIES].sort((a, b) => a - b), "vendor 升级字体枚举时这里必须同步");
  const all = [...vendorIds, ...BUNDLED_TEXT_FONT_FAMILIES].sort((a, b) => a - b);
  assert.deepEqual(all, [...TEXT_FONT_FAMILIES].sort((a, b) => a - b), "设置页下拉必须把内置字体一起列出来");
});

test("内置字样：id 与 BUNDLED_FONTS 的顺序/族名严格对表（插队会让旧板整体换字）", async () => {
  const { BUNDLED_FONTS, ENUM_ID_BASE } = await import("../scripts/excalidraw-fonts-patch.mjs");
  assert.deepEqual(
    [...BUNDLED_TEXT_FONT_FAMILIES],
    BUNDLED_FONTS.map((_, i) => ENUM_ID_BASE + i),
    "id 是按 BUNDLED_FONTS 下标算的，顺序变了就整体平移",
  );
  BUNDLED_FONTS.forEach((f, i) => {
    const id = ENUM_ID_BASE + i;
    assert.ok(TEXT_FONT_FAMILIES.includes(id), `内置字体 ${f.family}(${id}) 没进设置页下拉的键域`);
    assert.equal(TEXT_FONT_NAMES[id], f.family, `显示名必须与注册族名逐字一致：${id}`);
  });
  // 画布上本来就能选这 6 款——设置页下拉不该是它们的盲区
  assert.equal(TEXT_FONT_NAMES[102], "Smiley Sans", "Smiley Sans（得意黑）必须在列");
});

test("归一：只认键域里的值（含下拉框的数字字符串），脏值回落 Excalifont", () => {
  for (const id of TEXT_FONT_FAMILIES) {
    assert.equal(normalizeTextFontFamily(id), id);
    assert.equal(normalizeTextFontFamily(String(id)), id, "select.value 是字符串，归一必须接住");
    assert.equal(normalizeSettings({ fontFamily: id }).fontFamily, id);
  }
  for (const bad of [4, 0, 10, 100, -1, 5.5, "abc", "", Number.NaN, Infinity, null, undefined, {}, []]) {
    assert.equal(normalizeTextFontFamily(bad), 5, `脏值 ${String(bad)} 必须回落 5`);
  }
  assert.equal(normalizeSettings({}).fontFamily, 5, "老 data.json 没这一项 → 补默认");
  assert.equal(normalizeSettings(null).fontFamily, 5);
});

/* ------------------------------ 注入：设置 → 画布 ------------------------------ */

test("initialData：新建与打开两个分支都必须带上设置里的字体", () => {
  assert.match(APP, /const font = \{ currentItemFontFamily: fontFamily \};/, "设置值要先收成 appState 里的一项");
  assert.match(
    APP,
    /if \(!initial\) return \{ appState: \{ \.\.\.stroke, \.\.\.grid, \.\.\.font \} \}/,
    "空板分支漏掉 font 就等于没做这个功能",
  );
  assert.match(
    APP,
    /appState: \{ \.\.\.initial\.appState, \.\.\.\(stroke \?\? \{\}\), \.\.\.grid, \.\.\.font, viewBackgroundColor: bg \}/,
    "打开分支：font 必须在 ...initial.appState 之后；viewBackgroundColor 仍是最后覆盖",
  );
  assert.match(
    APP,
    /\[initial, accent, gridModeEnabled, fontFamily, mode\]/,
    "useMemo 依赖漏 fontFamily，改设置后开的新页签会拿旧值",
  );
});

test("挂载后一次性对表：现场的字体不是设置值就补一次，且只补一次", () => {
  assert.match(APP, /const fontSeededRef = useRef\(false\)/, "要有一次性闸");
  assert.match(
    APP,
    /if \(!api \|\| fontSeededRef\.current\) return;\s*fontSeededRef\.current = true;/,
    "没有闸 = 每次 api 变化都盖用户的临时选择",
  );
  assert.match(
    APP,
    /api\.updateScene\(\{ appState: \{ currentItemFontFamily: fontFamily \} as never \}\)/,
    "兜底补写要走 updateScene 的 appState 通道",
  );
});

/* ------------------------------ 单向：画布不许回写 ------------------------------ */

test("handleChange 里不许读 currentItemFontFamily 回写设置（单向硬约束）", () => {
  assert.ok(!/fontFamilyRef/.test(APP), "回写的影子 ref 必须删掉");
  assert.ok(!/const fontNow = Number\(appState\.currentItemFontFamily\)/.test(APP), "onChange 里不许再读字体");
  assert.ok(!/onFontFamilyChange/.test(APP), "StudioApp 不该再有回写通道");
  assert.ok(!/normalizeTextFontFamily/.test(APP), "不回写就不用归一化了");
});

test("tab.tsx：只透传 fontFamily，没有回写口", () => {
  assert.match(TAB, /fontFamily=\{host\.fontFamily\}/);
  assert.ok(!/onFontFamilyChange/.test(TAB), "宿主契约里不该再有回写口");
});

test("index.ts：getter 只读，设置页下拉是唯一写入点", () => {
  assert.match(INDEX, /get fontFamily\(\)\s*\{\s*return plugin\.settings\.fontFamily;/, "用 getter 读");
  assert.ok(!/rememberFontFamily/.test(INDEX), "画布回写的方法必须删掉");
  assert.ok(!/onFontFamilyChange/.test(INDEX), "宿主不该再暴露回写口");
  assert.match(INDEX, /title: t\("新增文本默认字体"\)/, "设置页要有这一行");
  assert.match(INDEX, /for \(const id of TEXT_FONT_FAMILIES\)/, "选项必须来自同一份键域（别手抄枚举）");
  assert.match(
    INDEX,
    /el\.addEventListener\("change", \(\) => \{\s*this\.settings = normalizeSettings\(\{ \.\.\.this\.settings, fontFamily: Number\(el\.value\) \}\);\s*this\.persist\(\);/,
    "下拉一改就落盘，这是字体唯一的写入点",
  );
  assert.ok(!/fontFamilyEl/.test(INDEX), "闭包节点变量已退役，别再拿它的旧值回填");
});

test("两份语言包都有字体设置行的文案，中文原文即 key", () => {
  const zh = JSON.parse(read("i18n/zh_CN.json"));
  const en = JSON.parse(read("i18n/en_US.json"));
  const keys = ["新增文本默认字体"].concat(
    INDEX.match(/t\(\s*\n?\s*"(新增文字用的默认字体[^"]+)"/)?.slice(1) ?? [],
  );
  assert.equal(keys.length, 2, "应抓到标题 + 描述两条");
  assert.ok(/只由这里决定/.test(keys[1]), "描述要说清「只由这里决定」，否则又会被当成双向记忆");
  for (const k of keys) {
    assert.ok(k in zh, `zh_CN 缺键：${k}`);
    assert.ok(k in en, `en_US 缺键：${k}`);
    assert.equal(zh[k], k, "中文原文即 key");
  }
});

/**
 * 第八十四轮：风格包管理。
 *
 * ① 纯函数真跑：卡片解析（一份 JSON 双语义）、URL 归一、效果图落点、列表合并；
 * ② 接线与文案：宿主十一项能力、面板只认接口、样式类齐备、双语齐备；
 * ③ 内置包元数据与模板/仓库约定对得上。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  STYLE_PREVIEW_DIR,
  STYLE_TEMPLATE_FILE,
  baseNameOf,
  buildStyleEntries,
  declaredPreviewOf,
  installedNames,
  isPngBytes,
  isPreviewFile,
  isStyleName,
  normalizePackUrl,
  previewFileNameFor,
  rawDirOf,
  readStyleCard,
  resolvePreviewUrl,
  styleAgentPrompt,
  styleJsonPath,
  styleNameOf,
  stylePreviewPath,
  styleTemplate,
  withPreviewField,
} from "../src/studio/ai/style-library.ts";
import { buildStyleDialogOptions } from "../src/studio/desktop-bridge.ts";
import { STYLE_DIR } from "../src/studio/ai/style-pack.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(resolve(ROOT, rel), "utf8");
}

function stripComments(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'\\])\/\/[^\n]*/g, "$1");
}

const PANEL = stripComments(read("src/studio/AiChannelsPanel.tsx"));
const LIB = stripComments(read("src/studio/AiStyleLibrary.tsx"));
const INDEX = stripComments(read("src/index.ts"));
const TAB = stripComments(read("src/studio/tab.tsx"));
const APP = stripComments(read("src/studio/StudioApp.tsx"));
const CSS = read("src/index.css");

function pack(over = {}) {
  return JSON.stringify({
    $schema: "https://example.com/excali-style.schema.json",
    name: "my-style",
    label: "我的风格",
    description: "一句话说明",
    version: "1.0.0",
    extends: "pencil",
    background: "#ffffff",
    ink: "#1e1e1e",
    palette: ["#d0bfff", "#b2f2bb"],
    strokeWidth: 2,
    preview: "my-style.png",
    ...over,
  });
}

/* ---------------- ① 纯函数 ---------------- */

test("readStyleCard：样式字段走加载器同款校验，展示字段只收白名单", () => {
  const ok = readStyleCard(pack());
  assert.equal(ok.ok, true);
  assert.equal(ok.value.pack.name, "my-style");
  assert.equal(ok.value.pack.extendsFrom, "pencil");
  assert.equal(ok.value.card.label, "我的风格");
  assert.equal(ok.value.card.description, "一句话说明");
  assert.equal(ok.value.card.preview, "my-style.png");
  assert.equal(ok.value.card.version, "1.0.0");
  assert.equal(ok.value.card.prompt, "", "没写 prompt 就是空串（用通用文案）");

  const palette = readStyleCard(pack({ palette: ["#ff0000"] }));
  assert.deepEqual(palette.ok && palette.value.pack.diff.fillPalette, ["#ff0000"], "palette 映射到 fillPalette");

  const custom = readStyleCard(pack({ prompt: "照 README 画" }));
  assert.equal(custom.ok && custom.value.card.prompt, "照 README 画");
});

test("readStyleCard：坏包给可读错误，不把 style:xxx 前缀原样甩给用户", () => {
  const badColor = readStyleCard(pack({ ink: "black" }));
  assert.equal(badColor.ok, false);
  assert.ok(badColor.error.includes("ink"), "指出字段");
  assert.equal(badColor.error.includes("style:"), false, "前缀已剥掉");

  const badExtends = readStyleCard(pack({ extends: "ghost" }));
  assert.equal(badExtends.ok, false);
  assert.ok(badExtends.error.includes("ghost"));

  const badPreview = readStyleCard(pack({ preview: "../outside.png" }));
  assert.equal(badPreview.ok, false);
  assert.ok(badPreview.error.includes("不能带路径"));

  const notJson = readStyleCard("{");
  assert.equal(notJson.ok, false);
});

test("readStyleCard：description/prompt 截断，字符串以外的类型当没写", () => {
  const long = readStyleCard(pack({ description: "字".repeat(200), prompt: "p".repeat(500) }));
  assert.equal(long.ok && long.value.card.description.length, 120);
  assert.equal(long.ok && long.value.card.prompt.length, 400);

  const weird = readStyleCard(pack({ description: 42, version: null, prompt: {} }));
  assert.equal(weird.ok && weird.value.card.description, "");
  assert.equal(weird.ok && weird.value.card.version, "");
  assert.equal(weird.ok && weird.value.card.prompt, "");
});

test("readStyleCard：extends 可以指向已安装的包（已知集合传入才放行）", () => {
  assert.equal(readStyleCard(pack({ extends: "solar" })).ok, false, "不在已知集合就要报");
  const ok = readStyleCard(pack({ name: "solar-warm", extends: "solar" }), "inline", new Set(["solar"]));
  assert.equal(ok.ok, true);
  assert.equal(ok.value.pack.extendsFrom, "solar");
});

test("withPreviewField：只改写 preview，其余字段（含 $schema）原样保留", () => {
  const next = withPreviewField(pack({ preview: "whatever.png" }), "my-style.png");
  const raw = JSON.parse(next);
  assert.equal(raw.preview, "my-style.png");
  assert.equal(raw.description, "一句话说明");
  assert.equal(raw.version, "1.0.0");
  assert.equal(raw.$schema, "https://example.com/excali-style.schema.json");
  assert.ok(next.endsWith("\n"), "落盘文件以换行结尾");
  assert.equal(readStyleCard(next).ok, true, "改写后仍能过校验");
});

test("normalizePackUrl：GitHub 页面链接换成 raw，raw 与其它链接原样", () => {
  assert.equal(
    normalizePackUrl("https://github.com/me/styles/blob/main/excali-style.json"),
    "https://raw.githubusercontent.com/me/styles/main/excali-style.json",
  );
  assert.equal(
    normalizePackUrl("https://github.com/me/styles/raw/main/styles/x.json"),
    "https://raw.githubusercontent.com/me/styles/main/styles/x.json",
  );
  const raw = "https://raw.githubusercontent.com/me/styles/main/excali-style.json";
  assert.equal(normalizePackUrl(raw), raw);
  assert.equal(normalizePackUrl("  https://example.com/a.json  "), "https://example.com/a.json");
  assert.equal(normalizePackUrl(""), "");
});

test("resolvePreviewUrl：相对图按包的 raw 同目录解析，绝对地址直接用", () => {
  const raw = "https://raw.githubusercontent.com/me/styles/main/styles/mine.json";
  assert.equal(
    resolvePreviewUrl(raw, "preview.png"),
    "https://raw.githubusercontent.com/me/styles/main/styles/preview.png",
  );
  assert.equal(
    resolvePreviewUrl(raw, "./preview.png"),
    "https://raw.githubusercontent.com/me/styles/main/styles/preview.png",
  );
  assert.equal(resolvePreviewUrl(raw, "https://cdn.example.com/p.png"), "https://cdn.example.com/p.png");
  assert.equal(resolvePreviewUrl(raw, ""), "");
  assert.equal(resolvePreviewUrl("npm:package", "preview.png"), "", "非 http 包地址没得拼");
  assert.equal(rawDirOf("https://example.com"), "", "只有域名时不拼");
});

test("isPngBytes：只认 PNG 魔数，HTML/空字节都不行", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]);
  assert.equal(isPngBytes(png), true);
  assert.equal(isPngBytes(new Uint8Array([0x3c, 0x68, 0x74, 0x6d, 0x6c])), false);
  assert.equal(isPngBytes(new Uint8Array(8)), false, "全零不是 PNG");
  assert.equal(isPngBytes(undefined), false);
});

test("名字与文件名：禁路径穿越，preview 只许同目录 png", () => {
  assert.equal(isStyleName("manga-ink"), true);
  assert.equal(isStyleName("My Style"), false, "不会自动 slug（写盘名直接来自 JSON）");
  assert.equal(isStyleName("../evil"), false);
  assert.equal(isStyleName("a".repeat(33)), false);
  assert.equal(isStyleName(""), false);

  assert.equal(isPreviewFile("manga-ink.png"), true);
  assert.equal(isPreviewFile("Manga_Ink-2.png"), true);
  assert.equal(isPreviewFile("preview.svg"), false);
  assert.equal(isPreviewFile("../x.png"), false);
  assert.equal(isPreviewFile(".png"), false);

  assert.equal(previewFileNameFor("manga-ink"), "manga-ink.png");
  assert.equal(styleJsonPath("manga-ink"), STYLE_DIR + "/manga-ink.json");
  assert.equal(stylePreviewPath("x.png"), STYLE_DIR + "/" + STYLE_PREVIEW_DIR + "/x.png");
  assert.equal(baseNameOf("assets/excali-styles/previews/x.png"), "x.png");
  assert.equal(baseNameOf("C:\\data\\x.json"), "x.json");
});

test("styleNameOf / declaredPreviewOf：坏档也能按名字移除，图只认合法文件名", () => {
  assert.equal(styleNameOf('{"name":"Manga Ink"}', "x.json"), "manga-ink", "slug 一下");
  assert.equal(styleNameOf('{"name":"  "}', "broken-file.json"), "broken-file", "空名回落文件名");
  assert.equal(styleNameOf("{", "broken-file.json"), "broken-file", "坏 JSON 回落文件名");

  assert.equal(declaredPreviewOf('{"preview":"a.png"}'), "a.png");
  assert.equal(declaredPreviewOf('{"preview":" ../a.png "}'), "", "带路径的不清");
  assert.equal(declaredPreviewOf('{"preview":42}'), "");
  assert.equal(declaredPreviewOf("{"), "");
});

function card(name, over = {}) {
  return { name, label: name.toUpperCase(), description: "", preview: "", version: "", prompt: "", ...over };
}

test("buildStyleEntries：内置包保序，没装就如实未装；图只认真实存在的文件", () => {
  const entries = buildStyleEntries({
    bundled: [
      card("manga-ink", { preview: "manga-ink-arch.png" }),
      card("doodle-marker", { preview: "doodle-visual.png" }),
    ],
    installed: [],
    bundledPreviews: ["manga-ink-arch.png"],
    installedPreviews: [],
  });
  assert.deepEqual(entries.map((e) => e.name), ["manga-ink", "doodle-marker"], "保持插件里的顺序");
  assert.equal(entries[0].installed, false);
  assert.equal(entries[0].bundled, true);
  assert.equal(entries[0].preview, "manga-ink-arch.png", "插件里真有图才给");
  assert.equal(entries[1].preview, "", "缺图的名不假装有");
});

test("buildStyleEntries：装了的内置包用已装文件里的元数据与工作区图", () => {
  const entries = buildStyleEntries({
    bundled: [card("manga-ink", { preview: "manga-ink-arch.png", description: "旧文案" })],
    installed: [
      {
        fileName: "manga-ink.json",
        text: pack({ name: "manga-ink", label: "改名后", description: "新文案", preview: "manga-ink.png" }),
      },
    ],
    bundledPreviews: ["manga-ink-arch.png"],
    installedPreviews: ["manga-ink.png"],
  });
  assert.equal(entries.length, 1);
  assert.equal(entries[0].installed, true);
  assert.equal(entries[0].label, "改名后", "已装文件的元数据优先");
  assert.equal(entries[0].description, "新文案");
  assert.equal(entries[0].preview, "manga-ink.png");
});

test("buildStyleEntries：坏档仍占一行（否则删不掉），外部包追加在后", () => {
  const entries = buildStyleEntries({
    bundled: [card("manga-ink")],
    installed: [
      { fileName: "manga-ink.json", text: pack({ name: "manga-ink", ink: "black" }) },
      { fileName: "solar.json", text: pack({ name: "solar", extends: "pencil" }) },
      { fileName: "gone.json", text: "{" },
    ],
    bundledPreviews: [],
    installedPreviews: [],
  });
  assert.deepEqual(entries.map((e) => [e.name, e.installed, e.bundled, !!e.error]), [
    ["manga-ink", true, true, true],
    ["solar", true, false, false],
    ["gone", true, false, true],
  ]);
  assert.ok(entries[0].error.includes("ink"), "坏在哪要能看见");
  assert.equal(entries[2].label, "gone", "坏档没有 label，用包名顶上");
});

test("installedNames：按文件名建已知集合，用来放行 extends 链", () => {
  const known = installedNames([
    { fileName: "solar.json", text: "{}" },
    { fileName: "Base Pack.json", text: "{}" },
  ]);
  assert.equal(known.has("solar"), true);
  assert.equal(known.has("base-pack"), true);
});

test("模板：能直接过校验，$schema 指向风格仓库", () => {
  const text = styleTemplate();
  const result = readStyleCard(text);
  assert.equal(result.ok, true, "空白模板必须是合法包");
  assert.equal(result.ok && result.value.pack.extendsFrom, "pencil");
  assert.ok(text.includes(`schema/excali-style.schema.json`));
  assert.equal(STYLE_TEMPLATE_FILE, "excali-style.json");
  assert.equal(readStyleCard(text).ok && readStyleCard(text).value.card.preview, "preview.png");
});

test("Agent 提示词：目录填绝对路径，拿不到就留可代入的占位", () => {
  const filled = styleAgentPrompt("/ws/data/assets/excali-styles");
  assert.ok(filled.includes("/ws/data/assets/excali-styles"));
  assert.ok(filled.includes("previews/<name>.png"));
  assert.equal(filled.includes("<工作区>/data/assets/excali-styles"), false, "填了就不带占位");
  assert.ok(styleAgentPrompt("  ").includes("<工作区>/data/assets/excali-styles"));
});

/* ---------------- ② 接线与文案 ---------------- */

test("接线：宿主实现十一项能力，页签透传，面板只认接口", () => {
  for (const call of [
    "list: () => this.listStyleEntries()",
    "installBundled: (name) => this.installBundledStyle(name)",
    "install: (input) => this.installStyle(input)",
    "remove: (name) => this.removeStyle(name)",
    "dirAbs: () => this.styleDirAbs()",
    "fetchText: (url) => this.fetchStyleText(url)",
    "fetchImage: (url) => this.fetchStyleImage(url)",
    "pickFile: () => pickStyleFile(this.styleDirAbs())",
    "previewSrc: (entry) => this.stylePreviewSrc(entry)",
    "previewAbs: (entry) => this.stylePreviewAbs(entry)",
  ]) {
    assert.ok(INDEX.includes(call), "宿主缺能力：" + call);
  }
  assert.match(INDEX, /openDir: \(\) => \{[\s\S]{0,120}openPathInFileManager\(dir\)/, "打开文件夹走桌面桥");
  assert.match(INDEX, /STYLE_JSON_MAX_BYTES = 512 \* 1024/);
  assert.match(INDEX, /STYLE_PREVIEW_MAX_BYTES = 4 \* 1024 \* 1024/);
  assert.match(INDEX, /if \(bytes && !isPngBytes\(bytes\)\) throw new Error\("效果图不是 PNG 文件"\)/);
  assert.match(INDEX, /withPreviewField\(input\.text, fileName\)/, "落盘前改名，声明与文件一致");
  assert.match(INDEX, /if \(remaining\.has\(file\)\) continue;/, "共用图不能误删");

  assert.match(TAB, /\| "styleLibrary"/);
  assert.match(TAB, /styleLibrary=\{host\.styleLibrary\}/);
  assert.match(APP, /styleLibrary: StyleLibraryApi/);
  assert.match(APP, /styleLibrary=\{styleLibrary\}/);
});

test("面板：列表读磁盘真值，导入四通道，移除要二次确认", () => {
  assert.match(PANEL, /styleLibrary\.list\(\)/);
  assert.match(PANEL, /styleEntries === null \? skill : \{ \.\.\.skill, styles: installed \}/, "提示词用已装列表");
  assert.match(PANEL, /<StyleLibrarySection/);
  assert.match(PANEL, /onModalOpenChange=\{setStyleModalOpen\}/);
  assert.equal(PANEL.includes("STYLE_PACKS"), false, "旧硬编码退役");

  assert.match(LIB, /readStyleCard\(/);
  assert.match(LIB, /normalizePackUrl\(/);
  assert.match(LIB, /styleTemplate\(\)/);
  assert.match(LIB, /styleAgentPrompt\(dirAbs\)/);
  assert.match(LIB, /styleCall\(entry\.name, skill, entry\.prompt\)/, "卡片自带 prompt 时整段替换");
  assert.match(LIB, /api\.install\(\{ text: parsed\.text, previewBytes: parsed\.previewBytes \}\)/);
  assert.match(LIB, /api\.remove\(entry\.name\)/);
  assert.match(LIB, /type: "remove"/, "移除走确认弹层");
  assert.match(LIB, /const onKey = \(e: KeyboardEvent\) => \{[\s\S]{0,160}stopPropagation\(\)/, "弹层 Esc 不让面板跟着关");
  assert.equal(/fetch\(/.test(LIB), false, "React 树不直接发请求，走宿主接口");
  assert.equal(/siyuan/i.test(LIB), false, "React 树不碰思源 API");
});

test("样式：组件用到的每个 exs-style* 类都有规则", () => {
  const used = new Set((LIB + PANEL).match(/exs-style[A-Za-z0-9_-]*/g) ?? []);
  assert.ok(used.size >= 25, "这一块类名不少，别把样式丢了（实得 " + used.size + "）");
  for (const cls of used) assert.ok(CSS.includes("." + cls), "样式缺：." + cls);
  assert.ok(CSS.includes(".exs-ai-skill__hint"), "技能条目的灰字解释也要有样式");
});

test("i18n：面板与风格库的新文案双语齐备，中文原文即 key", () => {
  const zh = JSON.parse(read("i18n/zh_CN.json"));
  const en = JSON.parse(read("i18n/en_US.json"));
  const keys = new Set();
  for (const code of [PANEL, LIB]) {
    for (const m of code.matchAll(/\bt\(\s*"([^"]+)"/g)) keys.add(m[1]);
  }
  assert.ok(keys.size >= 60, "至少 60 条新文案（实得 " + keys.size + "）");
  for (const k of keys) {
    assert.equal(zh[k], k, "zh 缺词条或值不等于 key：" + k);
    assert.ok(typeof en[k] === "string" && en[k] !== k && en[k].length > 0, "en 缺真翻译：" + k);
  }
  assert.deepEqual(Object.keys(zh), Object.keys(en), "两份语言包键序一致");
});

test("桌面桥：系统选择器只收 .json，初始目录跟风格包目录走", () => {
  const opt = buildStyleDialogOptions("/ws/data/assets/excali-styles");
  assert.equal(opt.defaultPath, "/ws/data/assets/excali-styles");
  assert.deepEqual(opt.properties, ["openFile"]);
  assert.deepEqual(opt.filters, [{ name: "Excali Style", extensions: ["json"] }]);
  assert.equal(buildStyleDialogOptions("  ").defaultPath, undefined);
});

/* ---------------- ③ 内置包与仓库约定 ---------------- */

test("模板与 schema 随包分发：template 就是 styleTemplate() 的落盘版", () => {
  const bundled = read("script/excali-style/template/excali-style.json");
  assert.equal(bundled, styleTemplate(), "两处必须是同一份，手改就会 drift");
  const schema = JSON.parse(read("script/excali-style/schema/excali-style.schema.json"));
  assert.equal(
    schema.$id,
    "https://raw.githubusercontent.com/LongDarkroom/excali-style-skill/main/schema/excali-style.schema.json",
  );
  assert.deepEqual(schema.required, ["name"]);
  assert.equal(schema.additionalProperties, false, "写错字段名要能被编辑器抓出来");
  for (const key of Object.keys(JSON.parse(bundled))) {
    assert.ok(key === "$schema" || key in schema.properties, "模板字段不在 schema 里：" + key);
  }
  assert.equal(schema.properties.preview.pattern, "^[A-Za-z0-9][A-Za-z0-9._-]{0,79}\\.png$", "与代码白名单同口径");
  assert.equal(schema.properties.name.pattern, "^[a-z0-9][a-z0-9._-]{0,31}$", "与 NAME_RE 同口径");
  assert.ok(schema.properties.groupColor.oneOf, "hash/roles 两种模式都要能校验");
});

test("内置两包：卡片元数据齐备，preview 指向真实存在的效果图", () => {
  const seen = new Set();
  for (const id of ["manga-ink", "doodle-marker"]) {
    const json = JSON.parse(read(`script/excali-style/styles/${id}.json`));
    seen.add(json.name);
    assert.equal(json.name, id);
    assert.ok(json.description.length > 0, "缺 description：" + id);
    assert.match(json.version, /^\d+\.\d+\.\d+$/);
    assert.ok(isPreviewFile(json.preview), "preview 只许文件名：" + id);
    assert.doesNotThrow(() => readFileSync(resolve(ROOT, "script/excali-style/previews", json.preview)));
    const parsed = readStyleCard(JSON.stringify(json));
    assert.equal(parsed.ok, true, "内置包必须能过面板校验：" + id);
  }
  assert.equal(seen.size, 2);
});

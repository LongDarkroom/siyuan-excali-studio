// 画布内嵌思源块（第三十一轮，方向 A）：块引用解析 / Embeddable 元素构造 /
// 链接白名单 / 渲染页契约 / 构建-打包接线。
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  BLOCK_LINK_MAX_CHARS,
  EMBED_DEFAULT_HEIGHT,
  EMBED_DEFAULT_WIDTH,
  blockIdOfEmbedLink,
  blockLinkIconElementOf,
  blockLinkIconLayout,
  blockLinkTextSkeleton,
  embedPageLink,
  isEmbeddableAllowed,
  makeEmbeddableElement,
  parseSiYuanBlockRef,
} from "../src/studio/embeddable.ts";
import { blockIconKeyOf, svgIconDataUrl } from "../src/studio/block-icons.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

test("parseSiYuanBlockRef：整链 / 裸 id / 带标注文本，无效返回 null", () => {
  const id = "20240101120000-abcdefg";
  assert.equal(parseSiYuanBlockRef(`siyuan://blocks/${id}`), id);
  assert.equal(parseSiYuanBlockRef(id), id);
  assert.equal(parseSiYuanBlockRef(`在思源中：${id} 请看这段`), id);
  assert.equal(parseSiYuanBlockRef(""), null);
  assert.equal(parseSiYuanBlockRef("siyuan://blocks/"), null);
  assert.equal(parseSiYuanBlockRef("12345-abc"), null);
  assert.equal(parseSiYuanBlockRef("https://example.com/20240101120000-abcdefg"), id);
});

test("embedPageLink：根相对路径 + blockId/theme 参数，同源直达渲染页", () => {
  const link = embedPageLink("20240101120000-abcdefg", "dark");
  assert.ok(link.startsWith("/plugins/siyuan-excali-studio/embed/siyuan/index.html?"));
  const qs = new URLSearchParams(link.split("?")[1]);
  assert.equal(qs.get("blockId"), "20240101120000-abcdefg");
  assert.equal(qs.get("theme"), "dark");
});

test("isEmbeddableAllowed：本插件 embed 放行、http(s) 放行、危险协议拒绝", () => {
  assert.equal(isEmbeddableAllowed("/plugins/siyuan-excali-studio/embed/siyuan/index.html?blockId=x"), true);
  assert.equal(isEmbeddableAllowed("/plugins/siyuan-excali-studio/embed/markdown/index.html"), true);
  assert.equal(isEmbeddableAllowed("https://excalidraw.com"), true);
  assert.equal(isEmbeddableAllowed("http://127.0.0.1:6806/plugins/x"), true);
  assert.equal(isEmbeddableAllowed("javascript:alert(1)"), false);
  assert.equal(isEmbeddableAllowed("data:text/html,<script>"), false);
  assert.equal(isEmbeddableAllowed("/plugins/other-plugin/x"), false);
  assert.equal(isEmbeddableAllowed(null), false);
  assert.equal(isEmbeddableAllowed(undefined), false);
  assert.equal(isEmbeddableAllowed(42), false);
});

test("makeEmbeddableElement：全字段形状与 vendor 期望一致（type/link/无多余必填）", () => {
  const el = makeEmbeddableElement({
    id: "emb-x",
    link: embedPageLink("20240101120000-abcdefg", "light"),
    x: 10,
    y: 20,
    width: EMBED_DEFAULT_WIDTH,
    height: EMBED_DEFAULT_HEIGHT,
    index: "a0",
    seed: 7,
  });
  assert.equal(el.type, "embeddable");
  assert.equal(el.id, "emb-x");
  assert.equal(el.link, embedPageLink("20240101120000-abcdefg", "light"));
  assert.equal(el.width, 600);
  assert.equal(el.height, 420);
  assert.equal(el.isDeleted, false);
  assert.equal(el.frameId, null);
  assert.equal(el.locked, false);
  // JSON 可序列化（ExcalidrawElement 的硬要求）
  assert.deepEqual(JSON.parse(JSON.stringify(el)), el);
});

test("渲染页契约：getBlockDOM 数据通道、blockId 参数、siyuan:// 打开链接、资源路径修正", () => {
  const html = readFileSync(join(ROOT, "src-embed/siyuan/index.html"), "utf8");
  assert.ok(html.includes("/api/block/getBlockDOM"), "数据通道必须走内核原生 DOM 接口");
  assert.ok(html.includes('qs.get("blockId")'), "从 URL 参数取块 ID");
  assert.ok(html.includes('qs.get("theme")'), "主题参数接入（明暗配色）");
  assert.ok(html.includes('siyuan://blocks/"'), "「在思源中打开」按钮指向块协议");
  assert.ok(html.includes('"assets\\//g'), "相对资源路径修正到根路径");
  assert.ok(!html.includes("vditor"), "零第三方渲染依赖（渲染交给内核）");
  assert.ok(html.includes("<!DOCTYPE html>"), "自包含单文件");
});

test("StudioApp 接线：validateEmbeddable 白名单 + 菜单动作连通", () => {
  const app = readFileSync(join(ROOT, "src/studio/StudioApp.tsx"), "utf8");
  assert.ok(app.includes("validateEmbeddable={isEmbeddableAllowed}"), "白名单 prop 挂到 vendor");
  assert.ok(app.includes("parseSiYuanBlockRef"), "输入解析进主流程");
  assert.ok(app.includes("embedPageLink(blockId, mode)"), "link 携带画布当前主题");
  const menu = readFileSync(join(ROOT, "src/studio/StudioMenu.tsx"), "utf8");
  assert.ok(menu.includes("onEmbedBlock"), "菜单有嵌入动作");
  assert.ok(menu.includes('t("嵌入思源块…")'), "菜单文案");
});

test("构建-打包接线：copy-dist 拷贝 embed 目录、pack 清单包含 embed/", () => {
  const copy = readFileSync(join(ROOT, "scripts/copy-dist.mjs"), "utf8");
  assert.ok(copy.includes('src-embed", "siyuan"'), "copy-dist 从 src-embed 拷贝");
  const pack = readFileSync(join(ROOT, "scripts/pack.mjs"), "utf8");
  assert.ok(/DIRS = \[[^\]]*"embed"/.test(pack), "发布包必须带 embed/ 渲染页");
  // 产品侧落地（构建后核验）
  const built = readFileSync(join(ROOT, "embed/siyuan/index.html"), "utf8");
  assert.ok(built.includes("/api/block/getBlockDOM"), "embed/siyuan/index.html 已随构建落位");
});

test("i18n：嵌入功能词条双语齐备", () => {
  const zh = JSON.parse(readFileSync(join(ROOT, "i18n/zh_CN.json"), "utf8"));
  const en = JSON.parse(readFileSync(join(ROOT, "i18n/en_US.json"), "utf8"));
  const keys = ["嵌入思源块…", "粘贴思源块链接或块 ID（siyuan://blocks/…）", "无法识别思源块 ID", "已嵌入思源块"];
  for (const k of keys) {
    assert.ok(zh[k], `zh_CN 缺词条：${k}`);
    assert.ok(en[k], `en_US 缺词条：${k}`);
  }
});

/* ---------------- 2026-10-28 拖拽链接：类型图标 + 字体跟随 ---------------- */

const BID_A = "20240101120000-abcdefg";

test("blockIconKeyOf：常见 type 全覆盖（官方搜索过滤菜单口径）+ 长尾回退通用", () => {
  assert.equal(blockIconKeyOf("d"), "file");
  assert.equal(blockIconKeyOf("p"), "paragraph");
  assert.equal(blockIconKeyOf("h", "h1"), "h1");
  assert.equal(blockIconKeyOf("h", "h6"), "h6");
  assert.equal(blockIconKeyOf("h", "h7"), "headings", "超范围 subtype 回整体标题图标");
  assert.equal(blockIconKeyOf("h"), "headings");
  assert.equal(blockIconKeyOf("l", "u"), "list");
  assert.equal(blockIconKeyOf("l", "o"), "orderedList");
  assert.equal(blockIconKeyOf("l", "t"), "check");
  assert.equal(blockIconKeyOf("i", "u"), "listItem");
  assert.equal(blockIconKeyOf("i", "o"), "orderedList");
  assert.equal(blockIconKeyOf("i", "t"), "check");
  assert.equal(blockIconKeyOf("c"), "code");
  assert.equal(blockIconKeyOf("m"), "math");
  assert.equal(blockIconKeyOf("t"), "table");
  assert.equal(blockIconKeyOf("b"), "quote");
  assert.equal(blockIconKeyOf("s"), "super");
  assert.equal(blockIconKeyOf("av"), "database");
  assert.equal(blockIconKeyOf("query_embed"), "sql");
  assert.equal(blockIconKeyOf("html"), "html5");
  assert.equal(blockIconKeyOf("iframe"), "globe");
  assert.equal(blockIconKeyOf("widget"), "both");
  assert.equal(blockIconKeyOf("video"), "video");
  assert.equal(blockIconKeyOf("audio"), "record");
  assert.equal(blockIconKeyOf("custom"), "plugin");
  // 长尾 / 脏输入一律通用回退（数据库行 / 视图页签拖入 = blocks 查不到 → 走这里）
  assert.equal(blockIconKeyOf("thematic_break"), "block");
  assert.equal(blockIconKeyOf(undefined), "block");
  assert.equal(blockIconKeyOf(null, null), "block");
  assert.equal(blockIconKeyOf(42), "block");
  assert.equal(blockIconKeyOf("d ".trim() || "x"), "file", "空白容忍走 trim");
});

test("svgIconDataUrl：base64 形态（外置通道 parseDataUrl 只认 ;base64,）+ 着色/模式正确", () => {
  const url = svgIconDataUrl("file", "#6965db");
  assert.ok(url.startsWith("data:image/svg+xml;base64,"), "必须是 base64 dataURL");
  const svg = Buffer.from(url.slice(url.indexOf(",") + 1), "base64").toString("utf8");
  assert.ok(svg.includes("<svg"), "解码回 SVG 文本");
  assert.ok(svg.includes('viewBox="0 0 24 24"'), "Lucide 系原生 viewBox");
  assert.ok(svg.includes('stroke="#6965db"'), "颜色写实进 stroke");
  assert.ok(svg.includes('fill="none"'), "stroke 模式不填充");
  // Material fill 系（listItem）走 fill 模式 + 原生 viewBox
  const fill = Buffer.from(
    svgIconDataUrl("listItem", "#a8a5ff").slice(svgIconDataUrl("listItem", "#a8a5ff").indexOf(",") + 1),
    "base64",
  ).toString("utf8");
  assert.ok(fill.includes('viewBox="30 -930 900 900"'), "fill 系保留原生 viewBox");
  assert.ok(fill.includes('fill="#a8a5ff"') && fill.includes('stroke="none"'), "fill 模式整体着色");
  // 未知键回退通用图标
  const fallback = svgIconDataUrl("no-such-key", "#000");
  assert.ok(fallback.startsWith("data:image/svg+xml;base64,"), "未知键不抛错");
  assert.ok(Buffer.from(fallback.slice(fallback.indexOf(",") + 1), "base64").toString("utf8").includes('viewBox="0 0 24 24"'), "回退到自绘通用图标（Lucide 系）");
  // 每枚图标键都能产出合法 dataURL（20+ 枚枚举级防漏）
  for (const key of ["file","paragraph","headings","h1","h2","h3","h4","h5","h6","list","orderedList","check","listItem","code","math","table","quote","super","html5","sql","database","globe","both","video","record","plugin","block"]) {
    assert.ok(svgIconDataUrl(key, "#000000").startsWith("data:image/svg+xml;base64,"), `图标 ${key} 可组装`);
  }
});

test("blockLinkTextSkeleton：fontFamily 可选参（缺省回落 Excalifont，字体跟随用）", () => {
  const def = blockLinkTextSkeleton({ blockId: BID_A, title: "段落", x: 0, y: 0, accent: "#000" });
  assert.equal(def.fontFamily, "1", "缺省回落 Excalifont");
  const followed = blockLinkTextSkeleton({ blockId: BID_A, title: "段落", x: 0, y: 0, accent: "#000", fontFamily: "102", fontSize: 18 });
  assert.equal(followed.fontFamily, "102", "传入即透传（画布当前默认字体的字符串枚举）");
  assert.equal(followed.fontSize, 18);
});

test("blockLinkIconLayout：图标随字号缩放、对一行文字垂直居中、文字让位", () => {
  const l = blockLinkIconLayout(20);
  assert.equal(l.size, 22, "边长 = fontSize × 1.1");
  assert.equal(l.dy, 2, "文字高 25，图标 22，下沉 (25-22)/2 四舍五入");
  assert.equal(l.textOffsetX, 28, "文字右移 = 图标 + 间距 6");
  const small = blockLinkIconLayout(0);
  assert.equal(small.size, 22, "非法字号回落 20 的布局");
});

test("blockLinkIconElementOf：image 元素形状（fileId/link/groupIds 齐、JSON 可序列化）", () => {
  const el = blockLinkIconElementOf({
    id: "icon-el-1",
    fileId: "icon-1",
    x: 10,
    y: 12,
    size: 22,
    link: `siyuan:block/${BID_A}`,
    groupIds: ["g1"],
    index: "a0",
    seed: 7,
  });
  assert.equal(el.type, "image");
  assert.equal(el.fileId, "icon-1");
  assert.equal(el.link, `siyuan:block/${BID_A}`, "显式传入 link 时保留（向后兼容）");
  assert.deepEqual(el.groupIds, ["g1"]);
  assert.equal(el.width, 22);
  assert.equal(el.height, 22);
  assert.equal(el.isDeleted, false);
  assert.equal(el.frameId, null);
  assert.equal(el.status, "saved");
  assert.deepEqual(el.scale, [1, 1]);
  assert.deepEqual(JSON.parse(JSON.stringify(el)), el, "ExcalidrawElement 的可序列化硬要求");
});

test("blockLinkIconElementOf：link 缺省 → null（2026-10-28 双角标修复：链接只挂文字）", () => {
  const el = blockLinkIconElementOf({
    id: "icon-el-2",
    fileId: "icon-2",
    x: 0,
    y: 0,
    size: 22,
    groupIds: ["g2"],
    index: "a0",
    seed: 8,
  });
  assert.equal(el.link, null, "图标不挂 link，vendor 就不会画 ↗ 角标");
});

// 2026-10-25 大修回归契约：嵌入块沙箱自渲染 / 菜单清理 / 复制引用语义 /
// agent 通道注册时序 / AI 面板示例与注册名一致 / 菜单实底 / 落地页指引。
// 由 docs/大修调研报告-2026-10-25.md 的 P0-P1 修复项固化而来，防回归。
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { isPluginEmbedLink, PLUGIN_EMBED_PREFIX, embedPageLink } from "../src/studio/embeddable.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

/* ---------------- 嵌入块：vendor 沙箱白名单根因修复 ---------------- */

test("isPluginEmbedLink：本插件 embed 前缀识别，其它链接不成", () => {
  assert.ok(isPluginEmbedLink(embedPageLink("20240101120000-abcdefg", "light")));
  assert.ok(isPluginEmbedLink(PLUGIN_EMBED_PREFIX + "markdown/index.html"));
  assert.equal(isPluginEmbedLink("https://excalidraw.com"), false);
  assert.equal(isPluginEmbedLink("/plugins/other/embed/x"), false);
  assert.equal(isPluginEmbedLink(null), false);
});

test("StudioApp：renderEmbeddable 自渲染已接线，且 sandbox 显式带 allow-same-origin", () => {
  const app = read("src/studio/StudioApp.tsx");
  assert.ok(app.includes("renderEmbeddable={renderPluginEmbeddable}"), "prop 挂到 vendor");
  const m = /const renderPluginEmbeddable = useCallback\(([\s\S]*?)\n  \}, \[\]\);/.exec(app);
  assert.ok(m, "应能定位 renderPluginEmbeddable 实现");
  assert.ok(m[1].includes("isPluginEmbedLink"), "只对本插件 embed 前缀接管");
  assert.ok(m[1].includes("return null"), "其余链接回落 vendor 默认渲染");
  assert.ok(m[1].includes("allow-scripts allow-same-origin"), "sandbox 必须带 allow-same-origin（vendor 默认不给，opaque origin 拿不到内核会话）");
});

/* ---------------- ☰ 菜单清理 ---------------- */

test("StudioMenu：不再渲染上游 Socials / 上游 Help / ToggleTheme", () => {
  const menu = read("src/studio/StudioMenu.tsx");
  assert.ok(!menu.includes("DefaultItems.Socials"), "自建白板不带官方社交链接（GitHub/X/Discord）");
  assert.ok(!/DefaultItems\.Help\b/.test(menu), "上游帮助打开 excalidraw.com 文档，与自建「帮助」重复");
  assert.ok(!menu.includes("DefaultItems.ToggleTheme"), "手动切主题会与「画布跟随思源主题」脱钩");
  assert.ok(menu.includes("onHelp"), "自建帮助（快捷键速查）保留");
  assert.ok(menu.includes("DefaultItems.ChangeCanvasBackground"), "更改画布背景保留");
});

test("菜单实底：毛玻璃升级块已移除，token 不再被引用", () => {
  const css = read("src/index.css");
  assert.ok(!/context-menu[\s\S]{0,200}backdrop-filter/.test(css), "右键菜单不得再走 backdrop-filter");
  assert.ok(!css.includes("--exs-menu-bg"), "半透明菜单底 token 应随毛玻璃一起退场");
  assert.ok(css.includes("--exs-menu-solid"), "实底 token 应保留并被基础规则使用");
});

/* ---------------- 复制此白板的引用：语义重做 ---------------- */

test("copyBoardRefFor：复制图片嵌入 markdown（建档移除后的口径，非文档 id 引用）", () => {
  const src = read("src/index.ts");
  const m = /private copyBoardRefFor\(custom: Custom\): void \{([\s\S]*?)\n  \}/.exec(src);
  assert.ok(m, "应能定位 copyBoardRefFor");
  assert.ok(m[1].includes("toAssetRef(path)"), "复制物应基于白板文件的 assets 引用");
  assert.ok(/!\[\$\{title\}\]\(\$/.test(m[1]), "复制物应是思源原生图片语法 ![标题](assets/excali/x.svg)，粘贴即插入白板");
  assert.ok(!m[1].includes("adoptBoardFile"), "建档已移除：复制引用不再触发建档");
  assert.ok(!m[1].includes("embedRef(") && !m[1].includes("inlineRef("), "文档 id 引用形态（![[id]] / ((id))）退役");
});

/* ---------------- agent 通道：注册时序 + 调用复查 ---------------- */

test("registerAgentCapabilities 必须在 await this.ready 之后（注册门读得到用户设置）", () => {
  const src = read("src/index.ts");
  const readyAt = src.indexOf("await this.ready");
  const regAt = src.indexOf("this.registerAgentCapabilities();");
  assert.ok(readyAt > 0 && regAt > 0, "两处锚点都应存在");
  assert.ok(regAt > readyAt, `注册（@${regAt}）必须晚于设置就绪（@${readyAt}），否则通道开关恒读默认值`);
});

test("agentRun：调用侧复查通道开关", () => {
  const src = read("src/index.ts");
  const m = /private async agentRun\(([\s\S]*?)\n  \}/.exec(src);
  assert.ok(m, "应能定位 agentRun");
  assert.ok(m[1].includes("aiChannels.agent"), "已注册能力在通道关闭后也应拒绝执行");
});

/* ---------------- AI 面板示例与注册名一致 ---------------- */

test("AI 通道面板 sample 里的工具名 ⊆ 实际注册的能力名（前端 + 内核 MCP）", () => {
  const channels = read("src/studio/ai/channels.ts");
  const index = read("src/index.ts");
  const kernel = read("src/kernel/index.ts");
  const registered = new Set([
    ...[...index.matchAll(/addAgentCapability\(\{[\s\S]*?name: "(excali_[a-z_]+)"/g)].map((m) => m[1]),
    ...[...kernel.matchAll(/"(excali_file_[a-z_]+)"/g)].map((m) => m[1]),
  ]);
  // 只校验完整工具名（`excali_file_*` 这类 glob 通配不校验）
  const sampled = [...channels.matchAll(/sample: "([^"]*)"/g)]
    .flatMap((m) => m[1].split("·"))
    .map((s) => s.trim())
    .filter((s) => /^excali_/.test(s) && !s.includes("*") && !s.includes(" "));
  assert.ok(registered.size >= 6, `注册名应至少 6 个（前端 4 + 内核 MCP），实际 ${registered.size}`);
  assert.ok(sampled.length >= 4, `面板 sample 里应有 agent 四能力名，实际 ${sampled.length}`);
  for (const name of sampled) {
    assert.ok(registered.has(name), `面板示例 ${name} 未注册（复制给智能体必失败）`);
  }
  assert.ok(!sampled.includes("excali_read_board"), "历史错名 excali_read_board 不得再现");
  assert.ok(sampled.includes("excali_open_board"), "agent 通道示例应含 excali_open_board（修复后的正确名）");
});

/* ---------------- 素材库落地页指引 ---------------- */

test("library-import 落地页：指引指向素材库面板 ⋮ 菜单（☰ 菜单项已撤）", () => {
  const html = read("src-import/library-import.html");
  assert.ok(!html.includes("☰ → 刷新素材库"), "旧指引指向已撤除的 ☰ 菜单项");
  assert.ok(html.includes("⋮"), "新指引应指向素材库面板右上 ⋮ 菜单");
});

/* ---------------- i18n 同步 ---------------- */

test("大修新增词条双语齐备，死键已清", () => {
  const zh = JSON.parse(read("i18n/zh_CN.json"));
  const en = JSON.parse(read("i18n/en_US.json"));
  for (const k of ["复制图片引用", "已复制图片引用：粘贴到思源正文即插入白板", "白板还没保存，保存后才能复制引用", "通道已关闭：内置智能体"]) {
    assert.ok(zh[k], `zh_CN 缺：${k}`);
    assert.ok(en[k], `en_US 缺：${k}`);
  }
  for (const dead of ["还没建档，复制不了引用：在白板行右键「建档」", "还没有脚本：首次启用会自动安装 4 个内置脚本到 {dir}", "还没有关联文档，复制不了引用", "已复制行内引用：粘贴到思源正文即成块引用", "建档", "已建档", "打开存档文档", "新建时自动建档"]) {
    assert.ok(!(dead in zh) && !(dead in en), `死键应删除：${dead}`);
  }
});

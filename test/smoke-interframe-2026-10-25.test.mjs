// 2026-10-25 交互框回归契约：思源拖拽协议解析 / 拖入建框 / 嵌入页 postMessage /
// ⌘点击跳转 / 斜杠插入白板 / openTab 右侧分屏 / 文档内白板图片块装饰（↗+徽标+右键）。
// 由 docs/交互框与跳转-调研与方案-2026-10-25.md 的批次 1-4 固化而来。
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  SIYUAN_DROP_DOCUMENTS,
  SIYUAN_DROP_FILE,
  blockIdOfEmbedLink,
  embedPageLink,
  hasSiYuanDrag,
  pluginEmbeddableAt,
  siYuanDropIds,
} from "../src/studio/embeddable.ts";
import { blockIdFromLink } from "../src/studio/board-lib.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

const ID_A = "20240101120000-abcdefg";
const ID_B = "20250202210000-hijklmn";

/** 造一个假 dataTransfer（types + getData 表） */
const fakeDT = (table, types = Object.keys(table)) => ({ types, getData: (t) => table[t] ?? "" });

/* ---------------- 思源拖拽协议解析（embeddable.ts 纯函数） ---------------- */

test("siYuanDropIds ①：文档树纯文档多选（application/siyuan-documents JSON.ids）", () => {
  const dt = fakeDT({ [SIYUAN_DROP_DOCUMENTS]: JSON.stringify({ ids: [ID_A, ID_B] }) });
  assert.deepEqual(siYuanDropIds(dt), [ID_A, ID_B]);
  // ids 里混了非块形状（脏值）只留合法的
  const dirty = fakeDT({ [SIYUAN_DROP_DOCUMENTS]: JSON.stringify({ ids: [ID_A, "/notebook/path", 42] }) });
  assert.deepEqual(siYuanDropIds(dirty), [ID_A]);
  // 脏 JSON 当没拖
  assert.deepEqual(siYuanDropIds(fakeDT({ [SIYUAN_DROP_DOCUMENTS]: "{oops" })), []);
});

test("siYuanDropIds ②：文档树混选（siyuan-file 逗号拼接，path 形态=笔记本被过滤）", () => {
  const dt = fakeDT({ [SIYUAN_DROP_FILE]: `${ID_A},/法学,${ID_B},` });
  assert.deepEqual(siYuanDropIds(dt), [ID_A, ID_B]);
  // 只拖了笔记本 → 空数组（画布侧提示「不是文档或块」）
  assert.deepEqual(siYuanDropIds(fakeDT({ [SIYUAN_DROP_FILE]: "/法学,/工作" })), []);
});

test("siYuanDropIds ③：正文块条（动态 gutter MIME，ids 在零宽空格第三段）", () => {
  const ZWSP = "\u200b";
  const mime = `application/siyuan-gutterNodeParagraph${ZWSP}h${ZWSP}${ID_A},${ID_B}${ZWSP}/ws/dir`;
  const dt = { types: [mime], getData: () => "" };
  assert.deepEqual(siYuanDropIds(dt), [ID_A, ID_B]);
});

test("siYuanDropIds：非思源拖拽 / 空 types / getData 抛错 → []，绝不抛出", () => {
  assert.deepEqual(siYuanDropIds(fakeDT({ "text/plain": "https://x.com" })), []);
  assert.deepEqual(siYuanDropIds({ types: [], getData: () => "" }), []);
  const throws = { types: [SIYUAN_DROP_DOCUMENTS], getData: () => { throw new Error("protected"); } };
  assert.deepEqual(siYuanDropIds(throws), []);
});

test("hasSiYuanDrag：dragover 阶段只看 types（此时 getData 读不到内容）", () => {
  assert.equal(hasSiYuanDrag([SIYUAN_DROP_DOCUMENTS]), true);
  assert.equal(hasSiYuanDrag([SIYUAN_DROP_FILE]), true);
  assert.equal(hasSiYuanDrag(["application/siyuan-gutterNodeHeading\u200bh\u200bid\u200b/ws"]), true);
  assert.equal(hasSiYuanDrag(["text/plain", "Files"]), false);
  assert.equal(hasSiYuanDrag([]), false);
  assert.equal(hasSiYuanDrag(undefined), false);
});

/* ---------------- 嵌入链接 ↔ 块 ID / 命中测试 ---------------- */

test("blockIdOfEmbedLink：embedPageLink 的反向；非本插件链接 / 脏 blockId → null", () => {
  assert.equal(blockIdOfEmbedLink(embedPageLink(ID_A, "dark")), ID_A);
  assert.equal(blockIdOfEmbedLink("https://excalidraw.com"), null);
  assert.equal(blockIdOfEmbedLink("/plugins/siyuan-excali-studio/embed/siyuan/index.html?blockId=nope"), null);
});

test("pluginEmbeddableAt：场景坐标命中思源嵌入框，普通 embeddable / 网页框不命中", () => {
  const els = [
    { type: "rectangle", x: 0, y: 0, width: 100, height: 100 },
    { type: "embeddable", x: 200, y: 100, width: 600, height: 420, link: "https://excalidraw.com" },
    { type: "embeddable", x: 400, y: 300, width: 600, height: 420, link: embedPageLink(ID_A, "light") },
  ];
  assert.equal(pluginEmbeddableAt(els, { x: 500, y: 400 })?.link, embedPageLink(ID_A, "light"));
  assert.equal(pluginEmbeddableAt(els, { x: 250, y: 150 }), null, "普通网页 embeddable 不算");
  assert.equal(pluginEmbeddableAt(els, { x: 50, y: 50 }), null);
});

test("blockIdFromLink：siyuan:block/<块ID> 精确形状；doc/白板链接不吃掉", () => {
  assert.equal(blockIdFromLink(`siyuan:block/${ID_A}`), ID_A);
  assert.equal(blockIdFromLink(`siyuan://block/${ID_B}`), ID_B);
  assert.equal(blockIdFromLink(`siyuan:doc/${ID_A}`), null, "doc 形态归 docIdFromLink");
  assert.equal(blockIdFromLink(`siyuan:block/not-a-block-id`), null);
});

/* ---------------- 画布侧接线（StudioApp.tsx） ---------------- */

test("onCanvasDrop：思源分支在最前（早于白板卡/图片文件），多块网格排布 + 选中", () => {
  const app = read("src/studio/StudioApp.tsx");
  const drop = app.slice(app.indexOf("const onCanvasDrop"), app.indexOf("const board = decodeBoardDrag"));
  assert.ok(drop.includes("hasSiYuanDrag(types)"), "先判思源拖拽标记");
  assert.ok(drop.includes("siYuanDropIds("), "drop 阶段解析块 ID");
  assert.ok(drop.includes("已嵌入 {n} 个思源块"), "结果要有数量反馈");
  assert.ok(drop.includes("EMBED_DEFAULT_WIDTH + 24"), "多块按网格排布");
  assert.ok(drop.includes("selectedElementIds"), "插入后选中");
  const siYuanAt = app.indexOf("hasSiYuanDrag(types)");
  // 锚点必须是调用处（decodeBoardDrag 在 import 行就出现，直接 indexOf 会误判）
  assert.ok(siYuanAt < app.indexOf("const board = decodeBoardDrag"), "思源分支在白板卡分支之前");
});

test("拖拽提示条：dragover 亮 / dragLeave 出界灭 / drop 收", () => {
  const app = read("src/studio/StudioApp.tsx");
  assert.match(app, /onDragOver=\{\(e\) => \{[\s\S]{0,120}setDropHint\(hasSiYuanDrag/, "dragover 检测思源标记");
  assert.match(app, /松开以嵌入思源块/, "提示条文案");
  const css = read("src/index.css");
  assert.ok(css.includes(".exs-root .exs-drop-hint"), "提示条样式");
});

test("嵌入页 postMessage：「在思源中打开」不再 _top 跳协议，改发 exs-open-block", () => {
  const html = read("src-embed/siyuan/index.html");
  assert.ok(html.includes('postMessage({ type: "exs-open-block", blockId'), "postMessage 契约");
  assert.ok(html.includes("e.preventDefault()"), "拦掉 href 默认跳转");
});

test("StudioApp message 监听：origin 校验 + 转 siyuan:block/ 链接", () => {
  const app = read("src/studio/StudioApp.tsx");
  const m = app.slice(app.indexOf("const onMessage = (e: MessageEvent)"));
  assert.ok(m.slice(0, 600).includes("e.origin !== location.origin"), "同源校验必须在最前");
  assert.ok(m.slice(0, 600).includes("exs-open-block"));
  assert.ok(m.slice(0, 600).includes("siyuan:block/"));
});

test("⌘/Ctrl+点嵌入框跳文档：pointerdown 命中链扩展（白板卡之后追加嵌入框分支）", () => {
  const app = read("src/studio/StudioApp.tsx");
  const seg = app.slice(app.indexOf("const onPointerDown = (event: PointerEvent)"));
  const cardAt = seg.indexOf("boardCardAt(");
  const embedAt = seg.indexOf("pluginEmbeddableAt(");
  assert.ok(cardAt > 0 && embedAt > cardAt, "嵌入框命中在白板卡命中之后");
  assert.ok(seg.slice(embedAt, embedAt + 500).includes("blockIdOfEmbedLink"), "链接反解块 ID");
});

/* ---------------- 宿主侧（index.ts） ---------------- */

test("openBoardDocLink：siyuan:block/ → openTab position right（双页阅读）；移动端走兜底", () => {
  const index = read("src/index.ts");
  const fn = index.slice(index.indexOf("private openBoardDocLink"), index.indexOf("private openDocOf"));
  assert.ok(fn.includes("blockIdFromLink(link)"), "块链接解析");
  assert.ok(fn.includes('position: "right"'), "右侧分屏");
  assert.ok(fn.indexOf("isMobileFrontend()") < fn.indexOf('position: "right"'), "移动端先兜底");
});

test("斜杠「插入白板…」：pickBoardRef 选库内白板 → protyle.insert(![]())", () => {
  const index = read("src/index.ts");
  const item = index.slice(index.indexOf('id: "excaliStudioInsertBoard"'));
  assert.ok(item.slice(0, 700).includes("pickBoardRef()"), "复用白板选择器");
  assert.ok(item.slice(0, 700).includes('protyle.insert(`![](${ref})`)'), "插入图片块（所见即所得）");
  assert.ok(index.indexOf('id: "excaliStudioInsertBoard"') > index.indexOf('id: "excaliStudio"'), "第二项在原「白板」项之后");
});

test("registerBoardDecorations：switch-protyle / click-editorcontent 重扫 + open-menu-image 右键", () => {
  const index = read("src/index.ts");
  const fn = index.slice(index.indexOf("private registerBoardDecorations"), index.indexOf("private async refreshBoardLib"));
  assert.ok(fn.includes('"switch-protyle"'), "切页签重扫");
  assert.ok(fn.includes('"click-editorcontent"'), "点正文重扫（幂等）");
  assert.ok(fn.includes('"open-menu-image"'), "图片右键菜单");
  assert.ok(fn.includes("svgAssetPathOf([detail.element])"), "图片右键用 detail.element 取路径");
  assert.ok(fn.includes("isBoardDataPath"), "右键入口只对白板库内的 svg 开放");
  assert.ok(index.includes("this.registerBoardDecorations();"), "onload 里接线");
});

test("boardAssetRefOf：绝对地址 / 相对引用 / 查询串都能落到白板目录；库外返回 null", () => {
  const index = read("src/index.ts");
  assert.ok(/private boardAssetRefOf/.test(index), "宿主要有资产引用归一");
  const src = read("src/studio/board-block-decorate.ts");
  assert.ok(src.includes("data-exs-board-open"), "↗ 按钮注入去重标记");
  assert.ok(src.includes("data-exs-board-badge"), "徽标注入去重标记");
  assert.ok(src.includes(".protyle-action"), "悬停按钮锚点");
  assert.ok(src.includes(".protyle-attr"), "徽标锚点");
});

/* ---------------- i18n 同步 ---------------- */

test("交互框词条双语齐备", () => {
  const zh = JSON.parse(read("i18n/zh_CN.json"));
  const en = JSON.parse(read("i18n/en_US.json"));
  for (const k of ["插入白板…", "松开以嵌入思源块", "拖入的不是文档或块，已忽略", "已嵌入 {n} 个思源块"]) {
    assert.ok(zh[k], `zh_CN 缺：${k}`);
    assert.ok(en[k], `en_US 缺：${k}`);
  }
  assert.ok(read("src/index.css").includes(".exs-board-badge"), "徽标样式");
});

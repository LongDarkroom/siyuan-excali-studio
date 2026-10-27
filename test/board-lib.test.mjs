/**
 * 2026-10-17 第十八轮：白板库（文件形态）+ 删除链路。
 * 纯函数（显示名/指纹/删除计划）在 studio/board-lib.ts 真断言；
 * 宿主与 dock 的接线（菜单、缓存、删除顺序）照本仓惯例文本扫描。
 * 2026-10-17 第二十二轮：dock 搜索框删除，filterBoardFiles（内存过滤）随之退役。
 * 2026-10-27：建档（白板↔文档绑定）整体移除——白板回归纯文件，本文件改为断言
 * 「建档已移除」的源码契约与纯文件口径。
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  boardDisplayName,
  deletePlanOf,
  fileLibViewKey,
  toBoardFileItems,
} from "../src/studio/board-lib.ts";
import { DEFAULT_SETTINGS, normalizeSettings } from "../src/studio/settings.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(resolve(ROOT, rel), "utf8");
const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'\\])\/\/[^\n]*/g, "$1");

const INDEX = stripComments(read("src/index.ts"));
const DOCK = stripComments(read("src/siyuan/ExcaliDock.ts"));
const DOC = stripComments(read("src/siyuan/doc.ts"));
const TAB = stripComments(read("src/studio/tab.tsx"));
const IO = stripComments(read("src/kernel/io.ts"));

/* ------------------------------ 行为：纯函数 ------------------------------ */

test("toBoardFileItems：/data 归一路径 + 剥 .svg 文件名，保序", () => {
  const entries = [
    { path: "assets/a.svg", updated: 3 },
    { path: "assets/b.svg", updated: 2 },
    { path: "/data/assets/c.svg", updated: 1 },
  ];
  const items = toBoardFileItems(entries);
  assert.deepEqual(
    items.map((x) => [x.dataPath, x.name]),
    [
      ["/data/assets/a.svg", "a.svg"],
      ["/data/assets/b.svg", "b.svg"],
      ["/data/assets/c.svg", "c.svg"],
    ],
  );
  assert.deepEqual(
    items.map((x) => x.updated),
    [3, 2, 1],
    "保持 readDir 的新→旧序，不做二次排序",
  );
  assert.equal("docId" in items[0], false, "建档移除：文件项不再带文档绑定字段");
});

test("boardDisplayName：剥 .svg 用文件名（白板 = 纯文件，无文档标题）", () => {
  assert.equal(
    boardDisplayName({ dataPath: "/data/assets/b.svg", name: "excali-1016.svg", updated: 0 }),
    "excali-1016",
  );
  assert.equal(boardDisplayName({ dataPath: "/data/assets/excali/a.svg", name: "a.svg", updated: 0 }), "a");
});

test("fileLibViewKey：打开态/时间任一变化都要变；同名不同路径不撞", () => {
  const item = { dataPath: "/data/assets/a.svg", name: "a.svg", updated: 1 };
  const k1 = fileLibViewKey([item], new Set());
  assert.notEqual(k1, fileLibViewKey([item], new Set(["/data/assets/a.svg"])), "已打开徽标翻转必须触发重渲染");
  assert.notEqual(k1, fileLibViewKey([{ ...item, updated: 2 }], new Set()), "修改时间变化也要变");
  assert.notEqual(
    fileLibViewKey([item], new Set()),
    fileLibViewKey([{ ...item, dataPath: "/data/assets/b.svg" }], new Set()),
    "不同路径是同值跳过的底线，不能撞指纹",
  );
});

test("deletePlanOf：删文件 + 备份链；白板 = 纯文件，不牵连文档树", () => {
  const plan = deletePlanOf({ dataPath: "/data/assets/a.svg", name: "a.svg", updated: 0 });
  assert.equal(plan.svgPath, "/data/assets/a.svg");
  assert.deepEqual(
    plan.bakPaths,
    ["/data/assets/a.svg.bak.svg", "/data/assets/a.svg.bak2.svg", "/data/assets/a.svg.bak3.svg"],
    "第十九轮：备份滚动三份，删除计划列全链条",
  );
  assert.equal("doc" in plan, false, "建档移除：删除只碰文件与备份，不动文档树");
});

/* ------------------------------ 行为：设置默认值 ------------------------------ */

test("2026-10-27：建档设置项随功能移除（白名单归一，旧档里的键被静默丢弃）", () => {
  assert.equal("autoCreateDoc" in DEFAULT_SETTINGS, false);
  assert.equal("autoOpenBoard" in DEFAULT_SETTINGS, false);
  assert.equal("boardDir" in DEFAULT_SETTINGS, false);
  assert.equal("autoCreateDoc" in normalizeSettings({ autoCreateDoc: true }), false, "旧档的开关键不再进入设置");
  assert.equal("boardDir" in normalizeSettings({ boardDir: "/Excali 白板" }), false, "建档落点设置退役");
  assert.equal(normalizeSettings({}).saveDir, "assets/excali", "保存目录归一口径不变");
});

/* ------------------------------ 接线：建档已移除（源码契约） ------------------------------ */

test("2026-10-27：建档（白板↔文档绑定）已整体移除，无死代码残留", () => {
  for (const gone of [
    "adoptBoardFile",
    "rememberBoardDoc",
    "boardSvgByDocId",
    "boardDocs",
    "autoOpenedDocs",
    "autoCreateDoc",
    "autoOpenBoard",
    "createDocWithMd",
    "appendImageBlock",
    "setBlockAttrs",
    // getBlockAttrs 不在清单：index.ts 的 AI 只读白名单含 block/getBlockAttrs 端点，属合法保留
    "removeDoc",
    "rewriteAssetRefs",
    "listBoardDocs",
    "currentNotebook",
    "firstNotebook",
    "boardDocPath",
    "embedRef",
    "inlineRef",
    "toBoardDocItem",
    "BoardDocItem",
    "custom-excali-svg",
    "checkupRunning",
    "runCheckup",
    "registerBoardDocEvents",
    "open-menu-doctree",
    "open-menu-filetab",
    "新建时自动建档",
    "打开存档文档",
    "已建档",
    "白板体检",
  ]) {
    assert.equal(INDEX.includes(gone), false, `index.ts 不再有：${gone}`);
  }
  for (const gone of ["createDocWithMd", "appendImageBlock", "setBlockAttrs", "rewriteAssetRefs", "removeDoc", "listBoardDocs", "getBlockAttrs", "firstNotebook", "currentNotebook", "custom-excali-svg"]) {
    assert.equal(DOC.includes(gone), false, `doc.ts 不再有：${gone}`);
  }
  for (const gone of ["boardDocPath", "embedRef", "inlineRef", "toBoardDocItem", "countBacklinks", "BoardDocItem", "parseSiyuanStamp"]) {
    assert.equal(read("src/studio/board-lib.ts").includes(gone), false, `board-lib.ts 不再有：${gone}`);
  }
});

/* ------------------------------ 接线：宿主 ------------------------------ */

test("宿主：库列表唯一真源 = 保存目录 readDir；读挂保留上一次列表", () => {
  assert.match(INDEX, /entries = await listBoardEntries\(this\.settings\.saveDir\);/, "文件列表读保存目录");
  assert.match(INDEX, /this\.boardFiles = toBoardFileItems\(entries\);/, "目录扫描结果 = 库列表（第二十五轮：目录即库）");
  const at = INDEX.indexOf("private async refreshBoardLib");
  assert.ok(at > 0, "refreshBoardLib 入口存在");
  const body = INDEX.slice(at, at + 1200);
  assert.match(body, /白板库读保存目录失败/, "读挂有告警，不静默");
  assert.match(body, /if \(entries\) this\.boardFiles =/, "读挂就不动列表（entries 为 null 不赋值）");
  assert.match(body, /finally \{\s*this\.libLoading = false;/, "防重入标志整轮结束才复位");
});

test("宿主：新建 = 文件先行，createBoardFile 只落空文件返回路径（建档分支已删）", () => {
  assert.match(INDEX, /private async createBoardFile\(name: string\): Promise<\{ path: string \}>\s*\{/, "返回值只剩 path");
  assert.match(INDEX, /const \{ path \} = await this\.createBoardFile\(name\);/, "新建链路只拿路径");
  assert.match(INDEX, /await this\.openStudioTab\(path\);/, "页签带着路径开：画布从第一帧起就归属文件");
  assert.match(INDEX, /this\.rememberBoardFile\(target\);/, "新文件即时进库缓存：库里立即可见");
  assert.match(INDEX, /sceneToSvgText\(\{ elements: \[\], appState: \{\}, files: \{\} \}\)/, "落一份空 scene 的 SVG（创建即文件）");
  assert.match(INDEX, /创建白板失败：\{msg\}/, "创建失败给可见提示，不静默");
});

test("宿主：删除链路 = 先关页签（不冲刷）→ 删文件/备份 → 缓存出账", () => {
  assert.match(INDEX, /if \(s\.data\.dataPath === item\.dataPath\) s\.closeForDelete\(\);/, "开着的页签先关，且不等冲刷");
  assert.match(INDEX, /await removeSvg\(plan\.svgPath\);/, "删工程文件");
  assert.match(INDEX, /for \(const bak of plan\.bakPaths\)[\s\S]{0,120}await removeSvg\(bak\);/, "第十九轮：备份逐档删，每档都可能不存在");
  assert.match(INDEX, /this\.boardFiles = this\.boardFiles\.filter\(\(f\) => f\.dataPath !== item\.dataPath\);/, "文件列表出账");
  assert.match(INDEX, /deletePlanOf\(item\)/, "确认框列单走纯函数，删前列全");
  assert.match(INDEX, /删除不可恢复/, "确认框明示不可恢复");
});

test("宿主：页签侧 closeForDelete 不冲刷、不弹确认（删除已确认过）", () => {
  assert.match(TAB, /closeForDelete: \(\) => void/, "会话暴露删除用关闭");
  assert.match(TAB, /skipDisposeFlush = true;[\s\S]{0,60}tab\.close\(\);/, "跳过 dispose 兜底 flush，避免把场景写回即将删除的文件");
});

test("宿主：deleteActiveBoard 只对活动画布有意义，其余现刷库再找", () => {
  assert.match(INDEX, /private deleteActiveBoard\(\): void \{/, "dock 头部「－」入口");
  assert.match(INDEX, /this\.tabs\.get\(this\.activeCustom\)\?\.data\.dataPath/, "当前活动画布的路径");
  assert.match(INDEX, /没有可删除的白板：当前没有打开已保存的白板/, "没开板时给提示，不静默");
  assert.match(INDEX, /void this\.refreshBoardLib\(\)\.then\(\(\) => \{/, "缓存没命中（刚保存的板）现刷一次再找");
});

test("宿主：行右键菜单 = siyuan Menu 全套动作，面板零 siyuan import", () => {
  assert.match(INDEX, /import \{[^}]*\bMenu\b[^}]*\} from "siyuan"/, "Menu 从 siyuan 导入");
  assert.match(INDEX, /new Menu\("excali-file-menu"\)/);
  assert.match(INDEX, /label: t\("复制图片引用"\)/, "复制引用 = 图片嵌入 markdown（建档已移除）");
  assert.match(
    INDEX,
    /!\[\$\{boardDisplayName\(item\)\}\]\(\$\{toAssetRef\(item\.dataPath\)\}\)/,
    "复制物 = ![标题](assets/excali/x.svg)，思源原生图片语法粘贴即用",
  );
  assert.match(INDEX, /label: t\("删除…"\), click: \(\) => void this\.deleteBoardFile\(item\)/, "删除走确认框");
  assert.equal(DOCK.includes('from "siyuan"'), false, "库数据与菜单全走 DockHost 接口，面板不 import 思源 API");
});

test("宿主：重命名后开着的页签会话跟位（绑定同步随建档退役）", () => {
  assert.match(INDEX, /renameBoard[\s\S]*?void this\.refreshBoardLib\(\);/, "改名后全量重同步列表");
  assert.match(INDEX, /private applyRenameToSession\(oldPath: string, newPath: string\): void \{/, "dock 发起改名要自己接住会话");
  assert.match(INDEX, /s\.data\.dataPath = newPath;[\s\S]{0,80}s\.tab\.updateTitle\(fileNameOf\(newPath\)\);/, "页签 data/标题跟上，去重才继续成立");
  assert.equal(/重命名后同步白板绑定/.test(INDEX), false, "建档移除：改名不再同步文档绑定");
});

/* ------------------------------ 接线：dock 面板 ------------------------------ */

test("dock：原生形态复刻 kmind-zen——原生头部 + 原生列表（搜索框已删）", () => {
  assert.match(DOCK, /data-act="new"/, "＋新建在库头部");
  assert.match(DOCK, /data-act="delete-active"/, "删除当前白板在库头部");
  assert.match(DOCK, /data-act="lib-refresh"/, "⟳刷新");
  assert.match(DOCK, /data-role="liblist"/);
  assert.equal(DOCK.includes('data-role="lib-search"'), false, "第二十二轮：搜索框按用户拍板删除（纯复刻）");
  assert.equal(DOCK.includes("filterBoardFiles"), false, "内存过滤随搜索框退役，board-lib 不留死函数");
  assert.equal(DOCK.includes('data-role="canvas"'), false, "第二十轮：画布操作区整块删除");
  assert.equal(DOCK.includes("exs-dock__foot"), false, "页脚（脚本/设置/帮助）已移出：脚本进 ☰、帮助进 ☰、设置在顶栏");
  assert.equal(DOCK.includes("exs-dock__swatch"), false, "背景色板已删（☰ 有 ChangeCanvasBackground）");
  assert.match(DOCK, /data-role="del-active"[\s\S]*?disabled/, "删除按钮初始禁用（没有打开的白板）");
  assert.match(DOCK, /delActiveBtn\.disabled = !host\.hasActiveBoard\(\);/, "置灰态走窄接口，只随结构事件变");
  assert.equal(DOCK.includes("已建档"), false, "建档移除：「已建档」徽标退役");
  assert.match(DOCK, /fileLibViewKey\(view\.files, view\.opened\)/, "指纹含打开态");
  assert.match(DOCK, /t\("已打开"\)/);
  assert.match(DOCK, /const refresh = \(\): void => \{\s*renderLib\(\);/, "refresh 只刷库 + 置灰态，没有每帧状态路径");
});

test("dock：单击开画板、右键行进宿主菜单，均经窄接口（双击开文档随建档退役）", () => {
  assert.match(DOCK, /host\.openBoardFile\(file\)/);
  assert.match(DOCK, /host\.openFileMenu\(file, e\.clientX, e\.clientY\)/);
  assert.match(DOCK, /e\.preventDefault\(\);/, "挡掉浏览器/dock 默认上下文菜单");
  assert.match(DOCK, /host\.deleteActiveBoard\(\)/);
  assert.equal(DOCK.includes("dblclick"), false, "建档移除：双击开绑定文档退役");
  assert.equal(DOCK.includes("openDocOf"), false, "DockHost 不再有 openDocOf");
  assert.equal(DOCK.includes('from "@excalidraw'), false);
});

/* ------------------------------ 接线：☰ 复制引用 ------------------------------ */

test("☰ 复制引用：复制图片嵌入 markdown ![标题](assets/x.svg)（建档移除后的口径）", () => {
  assert.match(TAB, /onCopyBoardRef=\{\(\) => host\.copyBoardRef\(custom\)\}/, "渲染时闭包补 custom");
  assert.match(INDEX, /private copyBoardRefFor\(custom: Custom\): void \{/, "同步函数：不再需要建档的异步链");
  assert.match(INDEX, /已复制图片引用：粘贴到思源正文即插入白板/, "成功提示点明粘贴即插入");
  assert.match(
    INDEX,
    /!\[\$\{title\}\]\(\$\{toAssetRef\(path\)\}\)/,
    "复制物 = ![标题](assets/excali/x.svg)，思源原生图片语法粘贴即用",
  );
  assert.equal(/embedRef\(|inlineRef\(/.test(INDEX), false, "文档 id 引用形态（![[id]] / ((id))）随建档退役");
});

/* ------------------------------ 第二十五轮：专属目录 ------------------------------ */

test("专属目录：默认 assets/excali，库只扫这个目录；登记表退役", () => {
  assert.equal(DEFAULT_SETTINGS.saveDir, "assets/excali", "默认落点必须是专属目录（assets 根目录是所有图片的公共池）");
  assert.equal(INDEX.includes("boardRegistry"), false, "登记表已退役：宿主不许再有登记表");
  assert.equal(INDEX.includes("boards: [...this.boardRegistry]"), false, "持久化不再写 boards");
  assert.match(INDEX, /this\.settings = \{ \.\.\.this\.settings, saveDir: DEDICATED_BOARD_DIR \};/, "迁移完成把保存目录指到专属目录");
  assert.match(INDEX, /this\.dirMigrated = failed\.length === 0;/, "部分失败不置完成标记，下次启动补搬");
  assert.match(INDEX, /migrationCandidates\(\{/, "候选只走三条真源");
  assert.match(INDEX, /recent: this\.recent,[\s\S]{0,120}registry: this\.legacyBoards,[\s\S]{0,120}autoNamed/, "recent/旧登记表/自动命名都进候选（文档绑定候选随建档退役）");
  assert.equal(/docSvgs/.test(INDEX + read("src/studio/migration.ts")), false, "建档移除：迁移候选不再有文档绑定来源");
  assert.match(INDEX, /isAutoNamedBoard\(fileNameOf\(p\)\)/, "自动命名扫描");
  assert.match(INDEX, /renameSvg\(old, await uniqueTargetPath\(DEDICATED_BOARD_DIR, fileNameOf\(old\)\)\)/, "搬文件带 .bak 链、撞名避重");
  assert.match(INDEX, /this\.recent = remapPaths\(this\.recent, remap\)/, "recent 跟到新路径");
});

test("恢复页签旧路径：读盘失败换到保存目录同名文件，并把页签数据跟位", () => {
  assert.match(TAB, /const remapped = await host\.remapPath\(data\.dataPath\);/, "只在读盘失败后试新路径");
  assert.match(TAB, /data\.dataPath = remapped;/, "页签数据跟位（否则下次保存写回旧路径）");
  assert.match(INDEX, /remapPath: \(dataPath\) => this\.remapBoardPath\(dataPath\)/, "宿主窄接口接线");
  assert.match(INDEX, /joinSavePath\(this\.settings\.saveDir, fileNameOf\(old\)\)/, "按文件名到保存目录找");
});

/* ------------------------------ 接线：第十九轮 BAK 纪律 + 恢复入口 ------------------------------ */

test("第五十四轮：备份链退役——写侧不再产生 .bak，读侧留着收拾存量", () => {
  const STORAGE = stripComments(read("src/studio/storage.ts"));
  assert.equal(
    /writeBackup/.test(STORAGE + stripComments(read("src/kernel/io.ts")) + stripComments(INDEX)),
    false,
    "写备份的出口整个删掉，不留调用不到的死代码",
  );
  assert.equal(
    /keepBackup/.test(read("src/studio/settings.ts") + stripComments(INDEX)),
    false,
    "设置项一并撤掉（normalizeSettings 是白名单，旧档里的 keepBackup 键会被静默丢掉）",
  );
  assert.match(STORAGE, /export const BACKUP_KEEP = 3;/, "链条命名口径留着，服务老用户库里的存量档");
  assert.match(STORAGE, /!isBackupPath\(r\.name\)/, "白板库列表仍排除备份档");
  assert.match(STORAGE, /for \(let slot = 1; slot <= BACKUP_KEEP; slot\+\+\)/, "重命名仍把存量链整排搬走（留下就是孤档）");
  assert.match(INDEX, /for \(const bak of plan\.bakPaths\)/, "删除白板仍扫一遍存量档");
});

test("保存去重：正文逐字 + 载荷语义两道门（前端 + 内核同口径）", () => {
  assert.match(
    INDEX,
    /if \(current !== null && sceneTextsEquivalent\(current, svgText\)\) return \{ path: currentPath \};/,
    "自动保存：语义等价就不落盘（归一化的字节差不再刷 mtime / 惊动同步）",
  );
  assert.match(IO, /if \(current !== null && sceneTextsEquivalent\(current, text\)\) return;/, "内核写盘同口径");
  const CODEC = stripComments(read("src/studio/scene-codec.ts"));
  assert.match(CODEC, /export function sceneTextsEquivalent/, "比较是纯函数，能真断言");
  assert.match(CODEC, /if \(a === b\) return true;/, "逐字相等先短路，不白解两次载荷");
  assert.match(CODEC, /key === "boundElements" && Array\.isArray\(v\) && v\.length === 0/, "归一化主产物：空 boundElements 等同缺键");
});

test("第十九轮 D·重名避重：探重逻辑在 storage.ts，两条可输名的路径都走它", () => {
  const STORAGE = stripComments(read("src/studio/storage.ts"));
  assert.match(STORAGE, /for \(let i = 0; i < 50; i\+\+\)/, "逐档探存在性");
  assert.match(STORAGE, /i === 0 \? fileName : `\$\{base\}_\$\{i - 1\}\.svg`/, "Obsidian getNewUniqueFilepath 的 _0/_1 语义（首撞是 _0 不是 _1）");
  assert.match(STORAGE, /if \(exclude && cand === exclude\) return cand;/, "改名撞自己不算撞");
  assert.match(STORAGE, /if \(!\(await fileExists\(cand\)\)\) return cand;/, "第一个空位即停");
  // 第二十一轮：新建（createBoardFile）与改名（renameBoard）都接上；覆盖保存只盖自己，不探重
  assert.match(INDEX, /const target = await uniqueTargetPath\(this\.settings\.saveDir, sanitizeFileName\(name, t\("未命名白板"\)\)\);/);
  assert.match(INDEX, /const target = await uniqueTargetPath\(this\.settings\.saveDir, sanitizeFileName\(newName\), oldData\);/);
  assert.equal(INDEX.includes("const target = currentPath ?? joinSavePath"), false, "旧的直拼路径不许残落在保存链路上，否则避重被旁路");
});

test("第十九轮：宿主恢复通道按链新→旧走，验过内容才盖回", () => {
  assert.match(INDEX, /restoreFromBackup: \(dataPath\) => this\.restoreFromBackup\(dataPath\)/, "host 接线在页签注册处");
  assert.match(INDEX, /for \(const bak of backupChainOf\(target\)\)/, "新→旧逐档试");
  assert.match(INDEX, /if \(!hasNonEmptyScene\(text\)\) continue;/, "坏档也滚动得进来：拿到不等于能用");
  assert.match(INDEX, /putSvg\(target, text\);[\s\S]{0,120}return true;/, "写回原路径才算恢复");
});

test("第十九轮：解码失败页有「从备份恢复」，恢复成功重走同一条 open", () => {
  assert.match(TAB, /restoreFromBackup: \(dataPath: string\) => Promise<boolean>;/, "宿主窄接口");
  assert.match(TAB, /host\.restoreFromBackup\(data\.dataPath\)/);
  assert.match(TAB, /t\("从备份恢复"\)/);
  assert.match(TAB, /t\("没有找到可用的备份"\)/, "全链没好档要给可见提示");
  assert.match(TAB, /await open\(\);/, "恢复后不用关页签重开");
  assert.match(TAB, /if \(!data\.dataPath \|\| restoring\) return;/, "新建板没路径不显按钮，点击不重入");
});

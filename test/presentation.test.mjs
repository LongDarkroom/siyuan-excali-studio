/**
 * 第五十三轮·批 0：演示模式的片单（画框 → 幻灯片）。
 *
 * 四段断言，顺序即这轮的风险排序：
 * ① 纯逻辑真跑：谁能进片单、没排序时按什么排、排序语义（整份重编）、
 *    排除页、空名回落、签名去重——这几条决定了用户改画框名/挪位置会不会跳页；
 * ② 分层红线：presentation-plan 必须零 React/思源/vendor 依赖（node 侧直接跑），
 *    rail-actions 里演示那颗钉子的落点是 top-right、且不进默认清单；
 * ③ 接线：onChange 同步片单、元数据写回走正常场景更新、镜头收成 focusFrame
 *    （自算 fit 直接写 appState，避开 scrollToContent 在嵌入环境的不稳）、抽屉与右上角按钮的通道；
 * ④ 文案：本片新增词条双语齐备，且两份语言包都没有重复键。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DECK_ROW_TOLERANCE,
  PRESENTATION_KEY,
  deckOf,
  deckSignature,
  moveSlide,
  slideTitle,
  toggleSlide,
  toggleSlideReveal,
  visibleSlides,
} from "../src/studio/presentation-plan.ts";
import { DEFAULT_PINNED_ACTIONS, PRESENTATION, RAIL_ACTIONS, railActionMount, railActionOf } from "../src/studio/rail-actions.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function src(rel) {
  return readFileSync(resolve(ROOT, "src", rel), "utf8");
}
const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'\\])\/\/[^\n]*/g, "$1");
function json(rel) {
  return JSON.parse(readFileSync(resolve(ROOT, rel), "utf8"));
}

const APP = stripComments(src("studio/StudioApp.tsx"));
const INDEX = stripComments(src("index.ts"));
const DRAWER = stripComments(src("studio/PresentationDrawer.tsx"));
const MENU = stripComments(src("studio/PresentationSettingsMenu.tsx"));
const STAGE = stripComments(src("studio/PresentationStage.tsx"));
const CSS = src("index.css");

/** 造一块画框：默认 400×300，name/meta 按需覆盖 */
function frame(id, x, y, over = {}) {
  return { id, type: "frame", x, y, width: 400, height: 300, name: "", ...over };
}
const meta = (order, included, reveal) => ({
  customData: {
    [PRESENTATION_KEY]: {
      ...(order === null ? {} : { order }),
      ...(included === undefined ? {} : { included }),
      ...(reveal === undefined ? {} : { reveal }),
    },
  },
});

/* ------------------------------ ① 纯逻辑 ------------------------------ */

test("片单只认活着的画框", () => {
  const deck = deckOf([
    frame("a", 0, 0),
    { id: "r", type: "rectangle", x: 10, y: 10, width: 20, height: 20 },
    frame("gone", 500, 0, { isDeleted: true }),
    frame("b", 900, 0),
  ]);
  assert.deepEqual(deck.slides.map((s) => s.id), ["a", "b"], "非 frame 与已删除的不进片单");
  assert.equal(deck.hasOrdered, false, "没写过 order = 没排过序");
  assert.equal(deck.slides.every((s) => s.included), true, "入片是默认态，历史画框不用补数据");
  assert.equal(deck.slides[0].w, 400, "宽高拿来算中心点");
});

test("没排过序按阅读顺序：先上后下，同一行先左后右", () => {
  const deck = deckOf([
    frame("右下", 800, 700),
    frame("左上", 0, 0),
    frame("右上", 800, 0),
    frame("左下", 0, 700),
  ]);
  assert.deepEqual(deck.slides.map((s) => s.id), ["左上", "右上", "左下", "右下"], "z 字形阅读顺序");
  // 行判定用中心点差 + 容差：差在容差之内算同一行，比 x；超出才分行
  const tol = DECK_ROW_TOLERANCE;
  const near = deckOf([frame("右边", 500, 300 + tol - 1), frame("左边", 0, 300)]);
  assert.deepEqual(near.slides.map((s) => s.id), ["左边", "右边"], "中心差在容差内 = 同一行，按左右");
  const far = deckOf([frame("下面", 500, 300 + tol + 1), frame("上面", 0, 300)]);
  assert.deepEqual(far.slides.map((s) => s.id), ["上面", "下面"], "超出容差 = 换行，谁在上面谁先放");
});

test("排过序之后：认 order，挪位置和改名都不跳页", () => {
  const deck = deckOf([
    frame("第一页", 900, 900, meta(0)),
    frame("第二页", 0, 0, meta(1)),
    frame("没排过", 400, 400, meta(null)),
  ]);
  assert.equal(deck.hasOrdered, true, "只要有一个显式 order 就按 order 走");
  assert.deepEqual(deck.slides.map((s) => s.id), ["第一页", "第二页", "没排过"], "没写过 order 的兜底落末尾");
  // 同值 order 也要定全序，不然同一份数据两次算出的片单会抖
  const tie = deckOf([frame("zz", 0, 0, meta(3)), frame("aa", 0, 0, meta(3))]);
  assert.deepEqual(tie.slides.map((s) => s.id), ["aa", "zz"], "order 同值按 id 定序，不靠数组顺序的运气");
});

test("排序：一次显式排序就整份重编，此后 order 是唯一真源", () => {
  const deck = deckOf([frame("a", 0, 0), frame("b", 400, 0), frame("c", 800, 0)]);
  const patches = moveSlide(deck, 0, 2);
  assert.deepEqual(patches.map((p) => p.id), ["b", "c", "a"], "移动后按新顺序返回每一页");
  assert.deepEqual(
    patches.map((p) => p.patch[PRESENTATION_KEY].order),
    [0, 1, 2],
    "整份重编：不是只给动过的那页写 order",
  );
  assert.equal(patches.every((p) => p.patch[PRESENTATION_KEY].included === true), true, "重编时把入片态一起写回，别把排除页洗回来");
  assert.deepEqual(moveSlide(deck, 1, 1), [], "原地不动不产生写入（省一次可撤销的场景更新）");
  assert.deepEqual(moveSlide(deck, 0, 9), [], "越界不写");
  assert.deepEqual(moveSlide(deck, -1, 0), [], "负下标不写");
});

test("逐条出场：默认跟随全局（auto），整页是页级例外且只写这一页", () => {
  const deck = deckOf([
    frame("a", 0, 0),
    frame("b", 400, 0, meta(null, undefined, "all")),
    frame("c", 800, 0, meta(null, undefined, "乱写的值")),
  ]);
  assert.deepEqual(deck.slides.map((s) => [s.id, s.reveal]), [
    ["a", "auto"],
    ["b", "all"],
    ["c", "auto"],
  ], "缺省 auto；只有明确 all 才整页；脏值回落 auto");

  const toAll = toggleSlideReveal(deck, "a");
  assert.deepEqual(toAll, [{ id: "a", patch: { [PRESENTATION_KEY]: { reveal: "all" } } }], "只写这一页的 reveal（不动页序）");
  assert.deepEqual(toggleSlideReveal(deck, "b"), [{ id: "b", patch: { [PRESENTATION_KEY]: { reveal: "auto" } } }], "再点一次切回逐条");
  assert.deepEqual(toggleSlideReveal(deck, "不存在"), [], "片单里没有的 id 不写");

  const patches = moveSlide(deck, 0, 2);
  assert.deepEqual(patches.map((p) => p.patch[PRESENTATION_KEY].reveal), ["all", "auto", "auto"], "排序整份重编时页级例外不许丢");
  const excluded = toggleSlide(deck, "a");
  assert.deepEqual(excluded.map((p) => p.patch[PRESENTATION_KEY].reveal), ["auto", "all", "auto"], "入片开关同样保留例外");
  assert.notEqual(deckSignature(deck), deckSignature(deckOf([frame("a", 0, 0), frame("b", 400, 0), frame("c", 800, 0)])), "reveal 变化要进签名");
});

test("排除一页：只翻目标页，其它页的入片态与顺序保住", () => {
  const deck = deckOf([frame("a", 0, 0, meta(0)), frame("b", 400, 0, meta(1, false)), frame("c", 800, 0, meta(2))]);
  const patches = toggleSlide(deck, "a");
  assert.deepEqual(
    patches.map((p) => [p.id, p.patch[PRESENTATION_KEY].included]),
    [["a", false], ["b", false], ["c", true]],
    "b 原本就是排除页，不该被这次操作洗成入片",
  );
  assert.deepEqual(
    patches.map((p) => p.patch[PRESENTATION_KEY].order),
    [0, 1, 2],
    "顺序跟着片单当前顺序落定，排除不会把页序打乱",
  );
  assert.deepEqual(toggleSlide(deck, "不存在"), [], "片单里没有的 id 不写");
  const shown = visibleSlides(deckOf([{ ...frame("a", 0, 0), ...meta(0, true) }, { ...frame("b", 400, 0), ...meta(1, false) }]));
  assert.deepEqual(shown.map((s) => s.id), ["a"], "放映用的那份剔掉排除页");
});

test("空画框名回落成可翻译的 key，签名能抓到挪动和改名", () => {
  assert.equal(slideTitle(frame("a", 0, 0)), "未命名页", "空名返回 i18n key，由消费方 t()");
  assert.equal(slideTitle({ ...frame("a", 0, 0), name: "  标题  " }), "标题", "首尾空白不吃进来");
  const base = deckOf([frame("a", 0, 0)]);
  assert.equal(deckSignature(base), deckSignature(deckOf([frame("a", 0, 0)])), "同数据同签名（onChange 每帧都算，靠它去重）");
  assert.notEqual(deckSignature(base), deckSignature(deckOf([frame("a", 10, 0)])), "挪了位置要变：面板得跟着重排");
  assert.notEqual(deckSignature(base), deckSignature(deckOf([{ ...frame("a", 0, 0), name: "改名" }])), "改名要变");
  assert.notEqual(deckSignature(base), deckSignature(deckOf([{ ...frame("a", 0, 0), ...meta(0) }])), "排序状态要变");
});

/* ------------------------------ ② 分层红线 ------------------------------ */

test("presentation-plan 是纯逻辑：零 React / 思源 / vendor 依赖", () => {
  const PLAN = src("studio/presentation-plan.ts");
  for (const banned of ['from "react"', 'from "siyuan"', "@excalidraw", "../i18n"]) {
    assert.equal(PLAN.includes(banned), false, `不许依赖 ${banned}（node 侧要能直接 import 跑单测）`);
  }
  assert.equal(PRESENTATION_KEY, "presentation", "元数据命名空间就是这一个键，别开第二个");
});

test("演示那颗钉子：落点在右上角，且不进默认清单", () => {
  const action = railActionOf(PRESENTATION);
  assert.ok(action, "动作表里得有演示模式");
  assert.equal(railActionMount(action), "top-right", "落点：钉上以后进画布右上角，不占右缘竖条");
  assert.ok(action.icon.length > 0, "图标非空");
  assert.equal(DEFAULT_PINNED_ACTIONS.includes(PRESENTATION), false, "默认不钉（入口越少越好，用户拍板）");
  assert.equal(RAIL_ACTIONS.filter((a) => railActionMount(a) === "top-right").length, 1, "右上角只此一枚");
});

/* ------------------------------ ③ 接线 ------------------------------ */

test("画布：片单跟着 onChange 走，元数据写回走正常场景更新", () => {
  assert.match(APP, /syncDeck\(elements as readonly FrameLike\[\]\);/, "onChange 里同步片单");
  // 第七十六轮：页序签名去重 + 图状态**独立**签名去重（边来自箭头，页序签名看不见它）
  assert.match(
    APP,
    /const sig = deckSignature\(next\);\s*\n\s*if \(sig !== deckSigRef\.current\) \{/,
    "页序签名变了才 setDeck（抽屉开着也别每帧 setState）",
  );
  assert.match(APP, /if \(gsSig === graphSigRef\.current\) return;/, "图状态另用自己的签名去重（箭头变了路线才变）");
  assert.match(APP, /captureUpdate: CaptureUpdateAction\.IMMEDIATELY/, "写元数据要立即记一次撤销点（改页序该能 ⌘Z）");
  assert.match(APP, /custom\[key\] = \{ \.\.\.\(custom\[key\] as Record<string, unknown> \| undefined\), \.\.\.value \};/, "customData 深合并：别把别的插件的命名空间整块覆盖掉");
  assert.match(APP, /applyDeckPatches\(moveSlide\(deck, from, to\)\)/, "上移下移 → 算补丁 → 写场景");
  assert.match(APP, /applyDeckPatches\(toggleSlide\(deck, id\)\)/, "入片开关同理");
  assert.match(APP, /applyDeckPatches\(toggleSlideReveal\(deck, id\)\)/, "页级逐条/整页也走同一条写回");
});

test("镜头收成 focusFrame：自算 fit 直接写 appState（不依赖 scrollToContent）", () => {
  assert.equal(/api\.scrollToContent\(/.test(APP), false, "不再调用 api.scrollToContent（嵌入环境里对数组/字符串都不稳）");
  assert.match(APP, /const focusFrame = useCallback\(\s*\n\s*\(frameId: string, fit = 0\.92\): void => \{[\s\S]{0,520}\.frameId === frameId\)/, "画框成员按 frameId 归拢，算包围盒");
  assert.match(APP, /Math\.min\(\(vw \* fit\) \/ bw, \(vh \* fit\) \/ bh\)/, "自算 fit：用视口宽高算目标 zoom");
  // 取景scroll 的符号是本功能的头号历史坑（写反 = 镜头飞到画布另一侧，点第2页跳到左边）：
  // vendor 屏幕映射 screen=(scene+scroll)*zoom，要场景中心 cx 落在视口中线 vw/2 ⇒
  // scrollX = vw/(2*zoom) - cx（减号在前）。锁死这个顺序，别让它再翻回去。
  assert.match(APP, /const toScrollX = vw \/ \(2 \* zoom\) - cx;/, "scrollX 口径对齐 vendor _Me：(vw/2)/zoom - cx");
  assert.match(APP, /const toScrollY = vh \/ \(2 \* zoom\) - cy;/, "scrollY 口径对齐 vendor _Me：(vh/2)/zoom - cy");
  assert.match(APP, /api\.updateScene\(\{\s*appState: \{/, "目标 scrollX\/scrollY\/zoom 直接落 appState");
  assert.match(APP, /focusFrame\(slide\.id, presentSettings\.fit\)/, "抽屉跳页委托 focusFrame，并透传设置的取景系数（滑块对跳页生效）");
});

test("全屏切换首帧按真实视口取景（不读 vendor 滞后的 appState 宽高）", () => {
  // 根因（第八十二轮）：全屏后 vendor 的 width/height 由 ResizeObserver → setState
  // 异步更新；fullscreenchange 后一帧读 appState 还是旧视口，第一页就不居中/不铺满，
  // 要翻下一页再翻回来才对。取景必须直接量 vendor 容器（updateDOMRect 同口径）。
  assert.match(
    APP,
    /querySelector<HTMLElement>\("\.excalidraw"\)\?\.getBoundingClientRect\(\)/,
    "focusFrame 量的是画布容器真实尺寸",
  );
  assert.match(APP, /const vw = box && box\.width > 0 \? box\.width : st\.width \|\| 1200;/, "量不到才回落 appState 宽");
  assert.match(APP, /const vh = box && box\.height > 0 \? box\.height : st\.height \|\| 800;/, "量不到才回落 appState 高");
});

test("全屏动画期间不抢跑：尺寸停稳 120ms 后再对当前页取景", () => {
  // 第八十三轮：macOS 原生全屏 fullscreenchange 在动画开始时触发，之后尺寸还会变
  // 几百毫秒；事件后一帧取景会对到中间尺寸上（表现为「翻一页再翻回来才居中」）。
  // 改由 ResizeObserver 观察画布容器，最后一次变化停稳 120ms 再取景；
  // fullscreenchange 里的一帧取景只留作没有 ResizeObserver 时的兜底。
  assert.match(
    APP,
    /if \(typeof ResizeObserver !== "undefined"\) return;/,
    "有 ResizeObserver 时事件处理器不直接取景（避免对到动画中间尺寸）",
  );
  assert.match(
    APP,
    /useEffect\(\(\) => \{\s*\n\s*if \(!presenting\) return;\s*\n\s*const target = canvasRef\.current;/,
    "只在放映中观察画布容器",
  );
  assert.match(APP, /const ro = new ResizeObserver\(/, "用 ResizeObserver 跟踪尺寸，不轮询");
  assert.equal(APP.includes("primed"), false, "首次回调不跳过：瞬时全屏（无过渡帧）只会有这一次回调");
  assert.match(APP, /ro\.observe\(target\)/, "观察的是画布容器（focusFrame 量的同一块 DOM）");
  assert.match(APP, /window\.clearTimeout\(timer\);\s*\n\s*timer = window\.setTimeout\(settle, 120\);/, "连续变化只留最后一次，停稳 120ms 才取景");
  assert.match(APP, /if \(!presentingRef\.current \|\| !snap \|\| !cur\) return;/, "定时器到点时已退出放映/换页为空则不取景");
  assert.match(
    APP,
    /presentCamUntilRef\.current = performance\.now\(\) \+ PRESENT_CAM_MS;[\s\S]{0,120}focusFrameRef\.current\(snap\.plans\[cur\.page\]\.frameId, snap\.fit\)/,
    "重新对准的是当前页（同一个 focusFrame 口径）",
  );
  assert.match(APP, /ro\.disconnect\(\)/, "退出放映或重挂时断开观察");
});

test("抽屉只读片单、只发意图；写数据与动镜头都在 StudioApp", () => {
  assert.match(DRAWER, /import \{ slideTitle, type Deck \} from "\.\/presentation-plan";/, "抽屉只认片单类型");
  assert.equal(DRAWER.includes("api"), false, "抽屉拿不到 imperative API");
  assert.equal(/from "siyuan"|updateScene|scrollToContent/.test(DRAWER), false, "不许直接写场景或动镜头");
  assert.match(DRAWER, /disabled=\{shown === 0\}/, "没有入片页时「开始演示」是灰的");
  // 第八十一轮：↑↓ 改页序退役，页序靠拖把手；键盘用户仍有 ↑↓ 兜底
  assert.equal(/aria-label=\{t\("上移"\)\}/.test(DRAWER), false, "上移按钮已退役");
  assert.equal(/aria-label=\{t\("下移"\)\}/.test(DRAWER), false, "下移按钮已退役");
  assert.match(DRAWER, /data-grip=\{s\.id\}/, "每页左侧有拖拽把手");
  assert.match(DRAWER, /onPointerDown=\{\(e\) => beginDrag\(e, s\.id, i\)\}/, "把手按下进入拖动（指针事件，不走 HTML5 DnD）");
  assert.match(
    DRAWER,
    /if \(cur\?\.active && commit && target >= 0 && target !== cur\.from\) props\.onMove\(cur\.from, target\);/,
    "松手才提交一次 onMove（单步撤销）；Esc/pointercancel 不提交",
  );
  assert.match(DRAWER, /const onGripKeyDown = \(e: React\.KeyboardEvent<HTMLButtonElement>, id: string, i: number\): void =>/, "把手可聚焦，↑↓ 当键盘兜底");
  assert.match(APP, /<PresentationDrawer/, "抽屉渲染在画布里");
  assert.match(APP, /openPresentation: \(\) => openPresentDrawer\(\)/, "宿主面板的演示动作经窄接口开抽屉（开时拉最新设置）");
  assert.match(INDEX, /if \(id === PRESENTATION\) \{[\s\S]{0,160}actions\.openPresentation\(\);/, "宿主：有活动画布才开抽屉");
  assert.match(INDEX, /showMessage\(t\("先打开一块白板，再放映"\)\)/, "没有活动画布时提示，不静默");
});

test("抽屉的设置面板：逐条/幕布/打字机只发意图，值从宿主设置现拉", () => {
  assert.match(APP, /settings=\{presentSettings\}/, "偏好从本地快照进抽屉（getter 不触发重渲染）");
  assert.match(APP, /onSetting=\{changePresentSetting\}/);
  assert.match(APP, /onToggleReveal=\{toggleDeckReveal\}/);
  assert.match(APP, /normalizePresentationSettings\(getPresentationSettings\(\)\)/, "开抽屉/进片场时拉一份并归一");
  assert.match(
    APP,
    /onPresentationSetting\(key, next\[key\]\);/,
    "改一项就往上写一项（StudioApp 不直接碰宿主 settings）",
  );
  assert.match(
    INDEX,
    /getPresentationSettings: \(\) => this\.settings\.presentation,/,
    "宿主把设置快照交给画布",
  );
  assert.match(
    INDEX,
    /normalizePresentationSettings\(\{ \.\.\.this\.settings\.presentation, \[key\]: value \}\)[\s\S]{0,220}this\.persist\(\);/,
    "写回前归一、同值短路、不同值才落盘",
  );
  assert.match(src("studio/tab.tsx"), /getPresentationSettings=\{host\.getPresentationSettings\}/, "tab 透传 getter");
  assert.match(src("studio/tab.tsx"), /onPresentationSetting=\{host\.onPresentationSetting\}/, "tab 透传写回");

  // 抽屉只读 props：不 import 宿主设置存储、不直接写盘
  assert.equal(/from "\.\.\/index"|from "siyuan"|\.persist\(/.test(DRAWER + MENU), false, "抽屉/设置列表不碰宿主或磁盘");
  for (const label of [
    "画面",
    "遮罩画框外",
    "放映时隐藏网格",
    "出场效果",
    "逐条出场",
    "打字机效果",
    "播放",
    "自动前进",
    "方向键沿边导航",
    "开始演示时全屏",
  ]) {
    assert.ok(MENU.includes(label), `设置列表缺一项：${label}`);
  }
  assert.match(MENU, /role="switch"/, "开关是 button+role=switch：主题改不到 input 的样式");
  assert.match(MENU, /aria-checked=\{props\.checked\}/, "开关态对读屏可见");
  assert.equal(MENU.includes('type="range"'), false, "滑杆已退役（自动前进改开关）");
  assert.match(MENU, /const AUTO_ADVANCE_SECONDS = 10;/, "自动前进固定 10 秒/页");
  assert.match(DRAWER, /onClick=\{\(\) => props\.onToggleReveal\(s\.id\)\}/, "每页的逐条/整页 mini 按钮");
  assert.match(DRAWER, /aria-pressed=\{s\.reveal === "auto"\}/, "开关态对读屏可见");
});

test("第八十轮：抽屉卡片有缩略图/序号/页名，双击改名只发意图", () => {
  assert.match(DRAWER, /props\.thumbs\[s\.id\]/, "缩略图由宿主生成，抽屉只显示");
  assert.match(DRAWER, /exs-present-card__no/, "卡片带序号角标");
  assert.match(DRAWER, /onDoubleClick=\{\(\) => startRename\(s\.id, s\.name\)\}/, "双击页名进入改名");
  assert.match(DRAWER, /props\.onRename\(cur\.id, name\)/, "改名交给宿主写场景");
  assert.match(APP, /onRename=\{renameDeckSlide\}/, "宿主的改名回调接线");
  assert.match(APP, /captureUpdate: CaptureUpdateAction\.IMMEDIATELY/, "改名走可撤销的正常场景更新");
  assert.match(APP, /thumbSignature\(all, s\.id, bg\)/, "缩略图按签名去重");
  assert.match(APP, /exportingFrame: frame as never/, "vendor 按画框裁切生成缩略图");
});

test("样式：右上角按钮走 vendor 扩展位，抽屉是画布内 absolute 浮层", () => {
  const fab = CSS.slice(CSS.indexOf(".exs-root .excalidraw .exs-present-fab {"), CSS.indexOf("}", CSS.indexOf(".exs-root .excalidraw .exs-present-fab {")));
  assert.ok(fab.length > 20, "FAB 有样式（选择器带 .excalidraw：扩展位在 vendor DOM 里）");
  const drawer = CSS.slice(CSS.indexOf(".exs-present-drawer {"), CSS.indexOf("}", CSS.indexOf(".exs-present-drawer {")));
  assert.match(drawer, /position: absolute;/, "absolute：含块是 .exs-root，思源右 Dock 开着也不跑偏");
  assert.equal(/position: fixed/.test(drawer), false, "不许 fixed（第三十八轮色板的教训）");
  assert.match(drawer, /z-index: 8;/, "层级：压过画布 UI、低于思源 Dialog（≥11）");
  assert.match(CSS, /\.exs-root \{\s*\n\s*position: relative;\s*\n\s*\}/, ".exs-root 是定位含块");
});

test("抽屉默认居中浮窗：拖动记忆、双击回中，列表用渐隐滚动", () => {
  assert.match(
    CSS,
    /\.exs-present-drawer \{[^}]*top: 50%;[^}]*left: 50%;[^}]*transform: translate\(-50%, -50%\);/,
    "默认居中，不占画布右缘",
  );
  assert.match(
    CSS,
    /@keyframes exs-present-in-center \{[^}]*translate\(calc\(-50% \+ 12px\), -50%\)/,
    "居中态的进场动画带上 -50% 基准，不会先闪到未居中位置",
  );
  assert.match(DRAWER, /exs-present-drawer--center/, "居中态有独立类名");
  assert.match(DRAWER, /transform: "none"/, "拖过之后由内联位置接管，清掉居中位移");
  assert.match(DRAWER, /useState<DrawerPos \| null>\(\(\) => readPos\(\)\)/, "首帧直接读记忆位，不先渲染再跳");
  assert.match(DRAWER, /onDoubleClick=\{onHeadDoubleClick\}/, "双击头部回到居中");
  // 第八十一轮返工：点一下头部（没拖动）曾把默认值 0,0 写进记忆 → 抽屉永远贴左上角
  assert.match(DRAWER, /if \(o\.rx === 0 && o\.ry === 0\) return null;/, "读记忆时丢掉写坏的 0,0（回中）");
  assert.match(DRAWER, /if \(!moved && Math\.hypot\(ev\.clientX - clientX0, ev\.clientY - clientY0\) < 3\) return;/, "3px 起步阈值：点一下不算拖");
  assert.match(DRAWER, /if \(moved\) writePos\(last\);/, "只有真的拖过才落位");
  assert.match(DRAWER, /let last: DrawerPos = \{\s*\n\s*rx: cbRect\.width > 0/, "落位起点是当前位置，不是 0,0");
  assert.match(DRAWER, /<FadeScroll className="exs-present-drawer__body">/, "片单改用隐藏滚动条 + 底部渐隐");
  const body = CSS.slice(CSS.indexOf(".exs-present-drawer__body {"), CSS.indexOf("}", CSS.indexOf(".exs-present-drawer__body {")));
  assert.equal(/scrollbar-width/.test(body), false, "不再用系统细滚动条");
});

test("抽屉拖动松手不重播进场动画（松手闪一下）", () => {
  assert.match(DRAWER, /const \[settled, setSettled\] = useState\(false\);/, "有「已入场」标记");
  assert.match(DRAWER, /settled \? " exs-present-drawer--settled" : ""/, "已入场后挂 --settled");
  assert.match(
    DRAWER,
    /onAnimationEnd=\{\(e\) => \{\s*\n\s*if \(e\.target === e\.currentTarget\) setSettled\(true\);/,
    "只认自己那条进场动画，子元素冒泡不算",
  );
  assert.match(DRAWER, /setSettled\(true\);\s*\n\s*setDragging\(true\);/, "抓住即算入场结束：打断动画时不会有 animationend");
  assert.match(CSS, /\.exs-present-drawer--settled \{\s*\n\s*animation: none;/, "--settled 把动画关死");
  // 同为单类名选择器，靠书写顺序压过 --center 的 animation-name
  assert.ok(
    CSS.indexOf(".exs-present-drawer--settled") > CSS.indexOf(".exs-present-drawer--center"),
    "--settled 必须排在 --center 之后",
  );
});

/* ------------------------------ ④ 文案 ------------------------------ */

test("i18n：本片词条双语齐备，中文原文即 key", () => {
  const zh = json("i18n/zh_CN.json");
  const en = json("i18n/en_US.json");
  const keys = [
    railActionOf(PRESENTATION).title,
    railActionOf(PRESENTATION).desc,
    "固定到右上角",
    "已固定在右上角",
    "演示",
    "{n} 页",
    "按位置排序",
    "未命名页",
    "还没有演示页",
    "先在画布上框住一页内容，或点下方「＋ 新建页」按标准比例插一页。",
    "空白页",
    "新建页",
    "新建标准画框",
    "新建 {ratio} 画框",
    "插到最后一页右侧，尺寸随现有页缩放",
    "插入后可随时拖动、缩放，插入本身可撤销。",
    "拖动调整页序",
    "拖动调整页序（聚焦后可用 ↑↓）",
    "宽屏",
    "经典",
    "近宽屏",
    "竖版",
    "已插入 {ratio} 画框 · {w}×{h}",
    "这一页不放映",
    "重新入片",
    "这一页整页一起出",
    "这一页逐条出场",
    "拖动左侧把手改页序；双击页名改名；≡ 管整页还是逐条，眼睛管放不放。",
    "双击重命名",
    "把镜头开过去看这一页",
    "生成预览…",
    "开始演示",
    "先画一个画框，再开始演示",
    "演示设置",
    "画面",
    "遮罩画框外",
    "放映时隐藏网格",
    "出场效果",
    "逐条出场",
    "打字机效果",
    "播放",
    "自动前进",
    "每页停留 10 秒后自动翻页",
    "开始演示时全屏",
    "自动保存",
    "先打开一块白板，再放映",
  ];
  for (const k of keys) {
    assert.equal(zh[k], k, `zh 缺词条或值不等于 key：${k}`);
    assert.ok(typeof en[k] === "string" && en[k] !== k && en[k].length > 0, `en 缺词条：${k}`);
  }
  assert.equal(zh["关闭"], "关闭", "抽屉关闭钮复用既有词条（不许重复注册）");
});

test("i18n：两份语言包都没有重复键（重复键会让 zh/en 键序断言假性通过）", () => {
  for (const rel of ["i18n/zh_CN.json", "i18n/en_US.json"]) {
    const txt = readFileSync(resolve(ROOT, rel), "utf8");
    const keys = [...txt.matchAll(/^\s{2}"((?:[^"\\]|\\.)+)":/gm)].map((m) => m[1]);
    const seen = new Set();
    const dup = [];
    for (const k of keys) {
      if (seen.has(k)) dup.push(k);
      seen.add(k);
    }
    assert.deepEqual(dup, [], `${rel} 有重复键：${dup.join(", ")}`);
  }
});

/* ------------------------------ ⑤ 2026-11-08：设置收敛 ------------------------------ */

test("设置收敛为 7 个开关：预设/滑杆退役，整份复位通道一起删干净", () => {
  const SETTINGS = stripComments(src("studio/settings.ts"));
  const TAB = stripComments(src("studio/tab.tsx"));

  assert.equal(SETTINGS.includes("SIMPLE_PRESENTATION"), false, "一键预设整块退役");
  assert.equal(MENU.includes("onReset"), false, "设置列表不再接整份复位");
  assert.equal(MENU.includes("RangeRow"), false, "滑杆组件退役");
  assert.match(MENU, /onSetting\("autoAdvance", on \? AUTO_ADVANCE_SECONDS : 0\)/, "开关只写 10 / 0");
  assert.equal(CSS.includes(".exs-present-presets {"), false, "预设按钮样式一起删");
  assert.equal(CSS.includes(".exs-present-set--range"), false, "滑杆样式一起删");
  assert.equal(APP.includes("resetPresentSettings"), false, "宿主不再有整份复位回调");
  assert.equal(TAB.includes("onPresentationSettings"), false, "tab 不再透传整份写盘");
  assert.equal(INDEX.includes("rememberPresentationSettings"), false, "index 不再保留整份写盘实现");
  // 旧 data.json 里的 cursor/speed/fit 仍要被归一保留：运行时取景/打字机还在读它们
  assert.match(SETTINGS, /cursor: boolOr\(r\.cursor/, "旧键保留，不因 UI 退役丢数据");
  assert.match(SETTINGS, /speed: Math\.round\(clampNum\(r\.speed/);
  assert.match(SETTINGS, /fit: clampNum\(r\.fit/);
});

test("i18n：2026-11-08 放映底栏词条双语齐备、两份键序一致", () => {
  const zh = json("i18n/zh_CN.json");
  const en = json("i18n/en_US.json");
  const keys = [
    "上一页",
    "下一页",
    "暂停自动前进",
    "继续自动前进",
    "← → 翻页 · 空格 下一步 · F 全屏 · Esc 退出",
    "← → 翻页 · 空格 下一步 · P 暂停 · F 全屏 · Esc 退出",
  ];
  for (const k of keys) {
    assert.equal(zh[k], k, `zh 缺词条或值不等于 key：${k}`);
    assert.ok(typeof en[k] === "string" && en[k] !== k && en[k].length > 0, `en 缺词条：${k}`);
  }
  assert.deepEqual(Object.keys(zh), Object.keys(en), "两份语言包键序一致");
});

/* ------------------------------ ⑥ 第八十一轮：双列 + 拖拽 + 标准画框 ------------------------------ */

test("抽屉改成双列浏览窗：宽度、网格、统一画幅都落在 CSS 上", () => {
  const drawer = CSS.slice(CSS.indexOf(".exs-present-drawer {"), CSS.indexOf("}", CSS.indexOf(".exs-present-drawer {")));
  assert.match(drawer, /width: 560px;/, "窄长条 300px 加宽成浏览窗");
  assert.match(
    CSS,
    /\.exs-present-list \{[^}]*display: grid;[^}]*grid-template-columns: repeat\(auto-fill, minmax\(210px, 1fr\)\);/,
    "双列网格：画布窄时自动退回一列",
  );
  assert.match(
    CSS,
    /\.exs-present-card__preview \{[^}]*aspect-ratio: 16 \/ 9;[^}]*height: auto;/,
    "卡片画幅统一 16:9（不同画框比例靠 contain 留边，行高不再参差）",
  );
  assert.match(CSS, /\.exs-present-dragghost \{[^}]*position: absolute;/, "拖动替身相对抽屉定位（抽屉有 backdrop-filter，fixed 会被它当含块）");
  assert.match(
    CSS,
    /\.exs-root\.exs-presenting \.exs-bottom-dock,[\s\S]{0,120}\.exs-root\.exs-presenting \.exs-script-rail \{\s*\n\s*display: none;/,
    "放映中仍然整体让位（本轮没碰这条）",
  );
});

test("拖拽改页序：把手在左、松手才提交、Esc 取消、键盘 ↑↓ 兜底", () => {
  assert.match(
    DRAWER,
    /className="exs-present-grip"\s*\n\s*data-grip=\{s\.id\}/,
    "每张卡左侧有独立把手（整卡可点，不能让拖动和选中打架）",
  );
  assert.match(DRAWER, /if \(e\.button !== 0\) return;/, "只认主键");
  assert.match(DRAWER, /Math\.hypot\(ev\.clientX - cur\.startX, ev\.clientY - cur\.startY\) < 4/, "4px 起步阈值：点一下不算拖");
  assert.match(DRAWER, /const targetAt = \(clientX: number, clientY: number\): number =>/, "落点按最近卡片中心算（双列里插入线不好读）");
  assert.match(DRAWER, /if \(ev\.key !== "Escape"\) return;/, "Esc 取消拖动");
  assert.match(DRAWER, /const delta = e\.key === "ArrowUp" \|\| e\.key === "ArrowLeft" \? -1/, "键盘 ↑/← 前移、↓/→ 后移");
  assert.match(DRAWER, /props\.onMove\(i, to\);\s*\n\s*focusGrip\(id\);/, "键盘挪完焦点还给这一页");
  assert.match(DRAWER, /if \(sc\) \{\s*\n\s*const r = sc\.getBoundingClientRect\(\);/, "拖到列表上下边缘自动滚动");
});

test("新建页：按固定比例插画框，一次 updateScene、随后飞过去", () => {
  assert.match(DRAWER, /import \{[^}]*FRAME_RATIOS[^}]*\} from "\.\/frame-presets\.ts";/, "比例表是纯模块，抽屉只渲染");
  assert.match(DRAWER, /FRAME_RATIOS\.map\(/, "比例按钮由 FRAME_RATIOS 生成，不手抄尺寸");
  assert.match(DRAWER, /props\.onAddSlide\(ratio\);/, "插页只发意图，写场景在 StudioApp");
  assert.match(DRAWER, /writeRatio\(ratio\)/, "记住上次比例");
  assert.match(APP, /onAddSlide=\{addDeckSlide\}/, "抽屉接上宿主的新建页");
  assert.match(APP, /const size = frameSizeFor\(ratio, anchor\);/, "尺寸沿用现有页的视觉体量（对角线缩放）");
  assert.match(APP, /let at = nextFrameSpot\(boxes, anchor\);/, "落点在末页右侧；空板才回落到视口中心");
  assert.match(APP, /makeElement\(\{\s*\n\s*type: "frame",/, "用插件自己的 makeElement 建画框");
  assert.match(
    APP,
    /elements: \[\.\.\.all, el as never\],\s*\n\s*appState: \{ selectedElementIds: \{ \[id\]: true \} \} as never,\s*\n\s*captureUpdate: CaptureUpdateAction\.IMMEDIATELY,/,
    "插入 + 选中一次落地 = 一个撤销点",
  );
  assert.match(APP, /window\.requestAnimationFrame\(\(\) => focusFrame\(id, presentSettings\.fit\)\);/, "新页在末页右侧，很可能在视口外：插完把镜头开过去");
  assert.match(APP, /if \(s\.blank\) continue;/, "空画框没有包围盒可裁：跳过缩略图队列，卡片改显「空白页」");
});

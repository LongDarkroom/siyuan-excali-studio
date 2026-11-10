/**
 * 第五十三轮·批 1B + 第八十轮：镜头 + 遮罩 + 底栏 + 键位打磨。
 *
 * 断言分三段：
 * ① 接线：舞台只住在 .exs-canvas 里（含块跟画布走，不许 fixed）、放映留白进偏好、
 *    遮罩颜色取画布底色、相机飞行窗内换页排队不丢输入、按住方向键不连翻；
 * ② 舞台实现：SVG mask 挖洞 + rAF 跟随相机（屏幕 = (场景 + scroll) × zoom），
 *    相机静止时不写 DOM；底栏只读 props、只发意图（页码预览 / 设置 / 全屏 / 终止）；
 * ③ 样式与文案：遮罩压画布、HUD 压遮罩、控件可点而画布不被挡住；气泡尾巴与
 *    滚动条隐藏；双语齐全。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = (rel) => readFileSync(resolve(ROOT, "src/" + rel), "utf8");
const json = (rel) => JSON.parse(readFileSync(resolve(ROOT, rel), "utf8"));
const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'\\])\/\/[^\n]*/g, "$1");
const APP = stripComments(src("studio/StudioApp.tsx"));
const STAGE = stripComments(src("studio/PresentationStage.tsx"));
const CSS = src("index.css");

/* ------------------------------ ① 接线 ------------------------------ */

test("舞台住在画布里：遮罩/HUD 跟着 .exs-canvas，不用 fixed", () => {
  assert.ok(APP.includes('from "./PresentationStage"'), "StudioApp 必须引入舞台层");
  const at = APP.indexOf("<PresentationStage");
  assert.ok(at > APP.indexOf('className="exs-canvas"'), "舞台在 .exs-canvas 之内");
  assert.ok(at < APP.indexOf('className="exs-bottom-dock"'), "舞台不是根节点的兄弟（含块必须是画布）");
  for (const prop of [
    "api={api}",
    "plan={presentPlan}",
    "titles={presentSnapRef.current?.titles ?? []}",
    "frameIds={presentSnapRef.current?.plans.map((p) => p.frameId) ?? []}",
    "thumbs={presentThumbs}",
    "page={presenting.page}",
    "mask={presentScrim}",
    "maskColor={presentMaskColor}",
    "settings={presentSettings}",
    "onSetting={changePresentSetting}",
    "fullscreen={presentFullscreen}",
    "onToggleFullscreen={toggleFullscreen}",
    "onJump={presentJump}",
    "onExit={exitPresentation}",
  ]) {
    assert.ok(APP.includes(prop), `舞台缺 prop：${prop}`);
  }
  assert.match(APP, /presenting && presentPlan \?/, "只在放映且有当前页时渲染");
  const stageCss = CSS.slice(CSS.indexOf("批 1B"));
  assert.equal(/\.exs-present-(scrim|hud)[^{]*\{[^}]*position:\s*fixed/.test(stageCss), false, "舞台不许脱离画布用 fixed");
});

test("页名在进片场时定格：放映中不跟着片单重算", () => {
  assert.match(APP, /titles: shown\.map\(\(s\) => t\(slideTitle\(s\)\)\)/, "HUD 用与 plans 同序的页名快照");
  assert.match(APP, /const presentPlan = presenting \? presentSnapRef\.current\?\.plans\[presenting\.page\] : undefined/);
});

test("遮罩换成画布底色：不再压黑，颜色按当前主题取", () => {
  assert.match(APP, /const \[presentMaskColor, setPresentMaskColor\] = useState/, "遮罩颜色是独立状态");
  assert.match(APP, /setPresentMaskColor\(presentBgRef\.current\(\)\)/, "进片场取当前画布底色（亮/暗主题各一色）");
  assert.match(STAGE, /fill=\{props\.maskColor\}/, "颜色从 prop 写进 SVG 属性");
  assert.equal(/\.exs-present-scrim__fill\s*\{[^}]*fill:/.test(CSS), false, "CSS 不许再定幕布颜色（会盖掉属性退回压黑）");
});

test("镜头：留白走进片场定格的偏好；飞行窗内换页排队，不丢输入", () => {
  assert.match(APP, /const PRESENT_CAM_MS = \d+;/, "飞行窗有常量");
  assert.match(APP, /\(frameId: string, fit = 0\.92\): void =>/, "focusFrame 留白兜底 0.92（实际取值来自设置 ps.fit）");
  assert.match(APP, /focusFrame\(plans\[nav\.page\]\.frameId, presentSnapRef\.current\.fit\)/, "进片场按偏好留白");
  assert.match(APP, /focusFrame\(snap\.plans\[next\.page\]\.frameId, snap\.fit\)/, "换页同一口径（放映中改设置不换镜头）");
  assert.match(APP, /presentCamUntilRef\.current = performance\.now\(\) \+ PRESENT_CAM_MS/, "换页时开飞行窗");
  assert.match(
    APP,
    /if \(pageChanged && performance\.now\(\) < presentCamUntilRef\.current\) \{[\s\S]{0,180}queuePresent\(nav, kind\);\s*\n\s*return;/,
    "窗内只记意图（连同出场方式），不改游标（否则镜头会被反复重定向）",
  );
  const qAt = APP.indexOf("const queuePresent = ");
  assert.ok(qAt > 0, "排队要有自己的落地器，不再靠 60ms 轮询捡");
  const q = APP.slice(qAt, APP.indexOf("const presentGo = useCallback", qAt));
  assert.match(q, /presentPendingRef\.current = \{ nav, kind \};/, "先记最后意图");
  assert.match(
    q,
    /window\.setTimeout\(\s*\n?\s*fire,\s*\n?\s*Math\.max\(0, presentCamUntilRef\.current - performance\.now\(\)\),/,
    "落地时刻钉在飞行窗结束那一瞬（连按不留 60ms 空窗）",
  );
  assert.match(q, /if \(left > 0\) \{[\s\S]{0,140}window\.setTimeout\(fire, left\);/, "中途又开新飞行窗就顺延，不插第三段");
  assert.match(q, /presentGoRef\.current\(pending\.nav, pending\.kind\);/, "追的是最后一次意图（带上出场方式）");
  assert.match(q, /cancelPresentFlush\(\);/, "排队前先取消旧定时器（否则旧窗会把新意图提前落地）");
  const flushAt = APP.indexOf("const timer = window.setInterval");
  assert.ok(flushAt > 0, "自动前进仍要有那个 60ms 轮询");
  const flush = APP.slice(flushAt, APP.indexOf("}, [presenting]);", flushAt));
  assert.equal(/presentGoRef\.current/.test(flush), false, "60ms 轮询不许再管换页落地——那是转场之间卡一下的来源");
  assert.match(
    APP,
    /if \(presentCamRafRef\.current\) window\.cancelAnimationFrame\(presentCamRafRef\.current\);\s*\n\s*if \(presentFlushTimerRef\.current\) window\.clearTimeout\(presentFlushTimerRef\.current\);/,
    "卸载兜底：飞行 rAF 与排队定时器一起归零",
  );
  assert.match(
    APP,
    /const cur = presentPendingRef\.current\?\.nav \?\? presentNavRef\.current;/,
    "连按以排队页 / 已落地导航状态为基准推进（否则两次快按算成同一目标）",
  );
  assert.match(APP, /navNext\(snap\.plans, snap\.graph, cur, direction\)/, "前进走图（Advanced Canvas 口径）");
  assert.match(APP, /navPrev\(snap\.plans, snap\.graph, cur\)/, "后退沿访问栈回退");
  assert.match(
    APP,
    /presentSnapRef\.current = null;\s*\n\s*presentPendingRef\.current = null;\s*\n\s*presentCamUntilRef\.current = 0;/,
    "退片场清掉排队与飞行窗",
  );
});

test("镜头曲线：480ms + easeOutQuart + zoom 等比 + 飞行期间不重建元素缓存", () => {
  assert.match(
    APP,
    /const PRESENT_CAM_MS = 480;/,
    "480ms：easeOut 峰值是均速 4 倍，要和旧口径（260ms + easeInOut，峰值 2 倍）的每帧位移持平就得给到这里",
  );
  const at = APP.indexOf("const focusFrame = useCallback");
  assert.ok(at > 0, "取景走自算的 focusFrame");
  const body = APP.slice(at, APP.indexOf("focusFrameRef.current = focusFrame;", at));
  assert.match(body, /const e = 1 - Math\.pow\(1 - t, 4\);/, "easeOutQuart：起步即最快，尾巴收边");
  assert.equal(/2 \* t \* t/.test(body), false, "不许退回 easeInOutQuad（两头慢 = 按下先愣一下）");
  assert.match(body, /zoom: \{ value: fromZoom \* Math\.pow\(zoom \/ fromZoom, e\) \}/, "zoom 等比插值，视觉上才是匀速推近");
  assert.equal(/fromZoom \+ \(zoom - fromZoom\) \* e/.test(body), false, "不许退回 zoom 线性插值");
  assert.match(body, /shouldCacheIgnoreZoom = t < 1;/, "飞行期间开闸、落点关闸（vendor 动画同款）");
  assert.match(APP, /shouldCacheIgnoreZoom: false/, "中途退出也要把闸关回去");
  assert.match(
    APP,
    /if \(presentCamRafRef\.current\) \{[\s\S]{0,140}\}[\s\S]{0,60}api\.updateScene\(\{[\s\S]{0,400}scrollX: snap\.scrollX/,
    "退出先掐飞行 rAF，再回填视口（否则镜头会在回填后继续抢写）",
  );
});

test("点页码预览跳页：落到整页态（最后一条）；放映中旧排队先清", () => {
  assert.match(
    APP,
    /presentPendingRef\.current = null;\s*\n\s*presentGo\(navJump\(snap\.plans, cur, page\), "jump"\)/,
    "点页码不该只露第一条——那会像翻到一张空页；跳页不打字",
  );
});

test("键位：按住不连翻，但重复事件照样吃干净", () => {
  const at = APP.indexOf("if (event.repeat) return;");
  assert.ok(at > APP.indexOf("event.stopImmediatePropagation();"), "先吞事件再挡连发，免得漏给 vendor 平移画布");
  assert.ok(at < APP.indexOf("act();", at), "挡连发在动作之前");
});

/* ------------------------------ ② 舞台实现 ------------------------------ */

test("遮罩：SVG mask 挖洞，rAF 跟随相机", () => {
  assert.match(STAGE, /requestAnimationFrame/, "相机动画期间要逐帧跟随");
  assert.match(STAGE, /cancelAnimationFrame/, "卸载必须停帧");
  assert.match(STAGE, /const sx = \(x \+ \(st\.scrollX \|\| 0\)\) \* zoom;/, "屏幕 =（场景 + scroll）× zoom");
  assert.match(STAGE, /const sy = \(y \+ \(st\.scrollY \|\| 0\)\) \* zoom;/);
  assert.match(STAGE, /w \* zoom/, "洞的宽高也跟着 zoom");
  assert.match(STAGE, /setAttribute\("width"/, "洞的尺寸写到 SVG 属性上");
  assert.match(STAGE, /mask id=\{maskId\}/);
  assert.ok(STAGE.includes("url(#${maskId})"), "填充层用这张 mask");
  assert.match(STAGE, /const maskId = "exs-present-hole-" \+ \(props\.plan\.frameId/, "多画板并存时 mask id 不能撞（画框 id 工作区唯一）");
  assert.match(STAGE, /if \(sig === last\) return;/, "相机静止时不写 DOM");
  assert.equal(STAGE.includes("setState"), false, "不许每帧 setState 拖着整棵树重渲染");
  assert.match(STAGE, /HOLE_PAD/, "洞要比画框外扩一圈");
});

test("遮罩开关：关掉只留 HUD，rAF 也不空转", () => {
  assert.match(STAGE, /if \(!props\.mask\) return;/, "关遮罩不启动跟随帧");
  assert.match(STAGE, /\{props\.mask \? \(\s*\n\s*<svg ref=\{svgRef\} className="exs-present-scrim"/, "关遮罩不渲染 SVG");
  assert.match(STAGE, /<\/svg>\s*\n\s*\) : null\}/, "开关是渲染条件，不是 CSS 隐藏");
  assert.match(STAGE, /className="exs-present-hud"/, "HUD 始终在（关遮罩仍要翻页/退出）");
});

test("底栏：翻页 / 页码预览 / 设置 / 全屏 / 终止，只读 props、只发意图", () => {
  for (const cls of [
    "exs-present-hud__bottom",
    "exs-present-counter",
    "exs-present-preview",
    "exs-present-preview__row",
    "exs-present-preview__row--on",
    "exs-present-tool",
    "exs-present-stop",
  ]) {
    assert.ok(STAGE.includes(cls), `底栏缺 ${cls}`);
  }
  assert.match(STAGE, /onClick=\{props\.onExit\}/, "终止只上报");
  assert.match(STAGE, /onClick=\{\(\) => \{\s*\n\s*setPreviewOpen\(false\);\s*\n\s*props\.onJump\(i\);/, "预览行只上报");
  assert.match(STAGE, /aria-selected=\{i === props\.page\}/, "当前页对读屏可见");
  assert.match(STAGE, /props\.thumbs\[props\.frameIds\[i\] \?\? ""\]/, "预览行按画框 id 查缩略图");
  assert.match(STAGE, /aria-expanded=\{previewOpen\}/, "页码按钮是预览开关");
  assert.equal(STAGE.includes("updateScene"), false, "舞台只读 appState，不改场景");
});

test("设置齿轮：放映底栏与抽屉共用同一份列表，向上弹", () => {
  assert.ok(STAGE.includes('from "./PresentationSettingsMenu"'), "共用设置组件");
  assert.match(STAGE, /exs-present-menuhost exs-present-menuhost--up/, "放映里的气泡向上弹");
  assert.match(STAGE, /onSetting=\{props\.onSetting\}/);
  assert.match(STAGE, /<PresentationSettingsMenu/, "直接渲染共享列表");
});

test("全屏键：强调色实心，状态对读屏可见，与 F 键同一通道", () => {
  assert.match(STAGE, /className=\{"exs-present-tool exs-present-tool--soft"/, "全屏走强调色按钮");
  assert.match(STAGE, /title=\{props\.fullscreen \? t\("退出全屏"\) : t\("全屏演示"\)\}/);
  assert.match(STAGE, /aria-pressed=\{props\.fullscreen\}/);
  assert.match(STAGE, /onClick=\{props\.onToggleFullscreen\}/, "全屏只上报");
  assert.match(APP, /const toggleFullscreen = useCallback/, "宿主有统一开关");
  assert.match(APP, /applyFullscreen\(value as boolean\)/, "设置里的全屏即时生效");
  assert.match(APP, /addEventListener\("fullscreenchange", sync\)/, "Esc / 宿主退全屏时状态回写");
  assert.match(
    APP,
    /focusFrameRef\.current\(snap\.plans\[cur\.page\]\.frameId, snap\.fit\)/,
    "全屏改变视口尺寸后按新视口重新取景（否则当前页偏出新画面）",
  );
});

test("分层：vendor 只进类型，不碰思源 API", () => {
  assert.ok(STAGE.includes('import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";'));
  assert.equal(/^import(?! type).*from "@excalidraw\/excalidraw/m.test(STAGE), false, "运行时不许 import vendor");
  assert.equal(STAGE.includes('from "siyuan"'), false);
  assert.equal(STAGE.includes('from "../..'), false);
});

/* ------------------------------ ③ 样式与文案 ------------------------------ */

test("层级：遮罩压画布（5）、HUD 压遮罩（7），都低于抽屉（8）", () => {
  assert.match(CSS, /\.exs-canvas \.exs-present-scrim \{[^}]*position: absolute;[^}]*inset: 0;[^}]*z-index: 5;/);
  assert.match(CSS, /\.exs-canvas \.exs-present-hud \{[^}]*position: absolute;[^}]*inset: 0;[^}]*z-index: 7;/);
  // 洞边描边已退役：幕布色 = 画布底色时，那圈灰线是画面里唯一的矩形，会被当成「画框没去掉」
  assert.equal(CSS.includes("exs-present-scrim__edge"), false, "CSS 不许再有洞边描边");
  assert.equal(STAGE.includes("exs-present-scrim__edge"), false, "舞台不许再渲染洞边描边");
  assert.equal(STAGE.includes("edgeRef"), false, "描边退役后 rAF 也不该再写第二块矩形");
  assert.match(CSS, /\.exs-present-hud \{[^}]*pointer-events: none;/, "HUD 整层不挡画布");
  assert.match(CSS, /\.exs-present-hud__bottom \{[^}]*pointer-events: auto;/, "底栏可点");
  assert.match(CSS, /\.exs-present-counter \{[^}]*pointer-events: auto;/, "页码可点");
  assert.match(CSS, /\.exs-present-tool \{[^}]*pointer-events: auto;/, "齿轮/全屏可点");
  assert.match(CSS, /\.exs-present-stop \{[^}]*pointer-events: auto;/, "终止可点");
  assert.match(CSS, /\.exs-present-tool--soft \{[^}]*background: var\(--exs-accent\)/, "全屏用主题强调色实心");
  assert.match(CSS, /\.exs-present-stop \{[^}]*background: var\(--exs-danger-container\)/, "终止用主题软红容器色");
});

test("气泡：有小尾巴，原生滚动条藏起来，没到底才渐隐", () => {
  assert.match(CSS, /\.exs-present-menu::before \{[^}]*transform: rotate\(45deg\)/, "尾巴是旋转方块");
  assert.match(CSS, /\.exs-present-menuhost--up \.exs-present-menu::before \{[^}]*bottom: -5\.5px/, "向上的气泡尾巴在底部");
  assert.match(CSS, /\.exs-present-drawer \.exs-present-menu::before \{[^}]*right: 39px/, "抽屉里的尾巴对准齿轮");
  assert.match(CSS, /\.exs-present-scroll::-webkit-scrollbar \{\s*\n\s*display: none;/, "藏掉原生滚动条");
  assert.match(CSS, /\.exs-present-scroll--more \{[^}]*mask-image: linear-gradient/, "没到底时底部渐隐");
});

test("i18n：底栏与设置词条两份语言包都在，中文键值一致", () => {
  const zh = json("i18n/zh_CN.json");
  const en = json("i18n/en_US.json");
  for (const k of [
    "第 {n} / {total} 页",
    "第 {n} 页",
    "上一页",
    "下一页",
    "幻灯片预览",
    "演示设置",
    "全屏演示",
    "退出全屏",
    "终止演示",
    "画面",
    "出场效果",
    "播放",
  ]) {
    assert.ok(k in zh, `zh_CN 缺键：${k}`);
    assert.ok(k in en, `en_US 缺键：${k}`);
    assert.equal(zh[k], k, `中文值必须等于键：${k}`);
  }
  const used = [...STAGE.matchAll(/\bt\("([^"]+)"/g)].map((m) => m[1]);
  assert.ok(used.length >= 8, `至少抓到 8 处 t()，实得 ${used.length}`);
  for (const k of used) {
    assert.ok(k in zh, `zh_CN 缺键：${k}`);
    assert.ok(k in en, `en_US 缺键：${k}`);
  }
});

/* ------------------------------ ④ 2026-11-08：放映控件 ------------------------------ */

test("底栏把翻页/暂停还给鼠标用户；键位提示自动退场，鼠标回顶部再唤回", () => {
  for (const prop of [
    "autoAdvance={presentSnapRef.current?.autoAdvance ?? 0}",
    "paused={presentPaused}",
    "onPrev={presentPrev}",
    "onNext={() => presentNext()}",
    "onTogglePause={togglePresentPause}",
  ]) {
    assert.ok(APP.includes(prop), `舞台缺 prop：${prop}`);
  }

  assert.match(STAGE, /onPrev: \(\) => void/);
  assert.match(STAGE, /onNext: \(\) => void/);
  assert.match(STAGE, /onTogglePause: \(\) => void/);
  assert.match(STAGE, /onClick=\{props\.onPrev\}/, "上一页只上报");
  assert.match(STAGE, /onClick=\{props\.onNext\}/, "下一页只上报");
  assert.match(STAGE, /onClick=\{props\.onTogglePause\}/, "暂停只上报");
  assert.match(STAGE, /\{props\.autoAdvance > 0 \? \(/, "没开自动前进时不给一个无效的暂停键");
  assert.match(STAGE, /aria-pressed=\{props\.paused\}/, "暂停态对读屏可见");
  assert.match(STAGE, /exs-present-hud__keys/, "全屏后仍有一行键位提示");
  assert.match(STAGE, /P 暂停/);
  assert.match(STAGE, /Esc 退出/);

  // 2026-11-08：提示不再常驻——进片场 4.5s 淡出，鼠标回顶部 64px 再唤回
  assert.match(STAGE, /const HINT_LINGER_MS = \d+;/);
  assert.match(STAGE, /const HINT_REVEAL_BAND = \d+;/);
  assert.match(STAGE, /const HINT_REHIDE_MS = \d+;/);
  assert.match(STAGE, /e\.clientY - hud\.getBoundingClientRect\(\)\.top/, "以 HUD 顶边为基准量热区");
  assert.match(STAGE, /setHintVisible\(true\)/, "回到带子里再露");
  assert.match(STAGE, /setHintVisible\(false\)/, "到时淡出");
  assert.match(STAGE, /exs-present-hud__keys--hidden/, "退场是加类");
  assert.match(STAGE, /aria-hidden=\{!hintVisible\}/, "退场后对读屏也收起");
  assert.match(CSS, /\.exs-present-hud__keys \{[^}]*transition: opacity/, "只过渡透明度（不改 display）");
  assert.match(CSS, /\.exs-present-hud__keys--hidden \{[^}]*opacity: 0;/, "隐藏态只是透明");
  assert.equal(
    /\.exs-present-hud__keys--hidden \{[^}]*display:\s*none/.test(CSS),
    false,
    "不许 display:none——那是给画布和底栏挪位",
  );

  // 暂停是本次放映的运行时状态：不落盘、P 键可达、进退片场都清
  assert.match(APP, /const presentPausedRef = useRef\(false\)/);
  assert.match(APP, /const \[presentPaused, setPresentPaused\] = useState\(false\)/);
  assert.match(APP, /pause: togglePresentPause/);
  assert.match(APP, /case "P":[\s\S]{0,80}act = keys\.pause;/);
  assert.match(APP, /presentPausedRef\.current = false;\s*\n\s*setPresentPaused\(false\)/);
  const toggle = APP.slice(APP.indexOf("const togglePresentPause = useCallback"), APP.indexOf("presentNextRef.current = presentNext"));
  assert.equal(toggle.includes("onPresentationSetting"), false, "暂停不动落盘偏好，下次开演仍按用户设的秒数");
  assert.match(toggle, /else bumpAutoDeadline\(\);/, "恢复时重新排期");

  for (const cls of [
    ".exs-present-nav {",
    ".exs-present-nav--on {",
    ".exs-present-hud__keys {",
    ".exs-present-hud__keys--hidden {",
  ]) {
    assert.ok(CSS.includes(cls), `样式缺 ${cls}`);
  }
  assert.match(CSS, /\.exs-present-nav \{[^}]*pointer-events: auto;/, "底栏按钮可点");
  assert.match(CSS, /\.exs-present-hud__keys \{[^}]*pointer-events: none;/, "键位提示不挡画布");
});

test("HUD 与气泡跟着主题走：底栏用插件药丸材质，菜单实底不透白板", () => {
  // 底栏材质与插件 .exs-bottom-bar 同源：亮色白药丸、暗色深药丸
  assert.match(CSS, /\.exs-present-hud__bottom \{[^}]*background: var\(--island-bg-color\)/, "底栏用 island 底色");
  assert.match(CSS, /\.exs-present-hud__bottom \{[^}]*border: 1px solid var\(--exs-pill-border\)/, "底栏用 pill 描边");
  assert.match(CSS, /\.exs-present-hud__bottom \{[^}]*box-shadow: var\(--exs-pill-shadow\)/, "底栏用 pill 阴影");
  // 页码是浅紫药丸，字色另取 HUD 强调色（accent 白字在浅紫上读不清）
  assert.match(CSS, /\.exs-present-counter \{[^}]*background: var\(--exs-accent-container\)/, "页码是强调容器色");
  assert.match(CSS, /\.exs-present-counter \{[^}]*color: var\(--exs-hud-accent-text\)/, "页码字色用 HUD 强调色");
  // 预览与设置气泡：与插件菜单同源实底，亮/暗各一套
  assert.match(CSS, /\.exs-present-preview \{[^}]*background: var\(--exs-menu-solid\)/, "预览用菜单实底");
  assert.match(CSS, /\.exs-present-preview::after \{[^}]*background: var\(--exs-menu-solid\)/, "尾巴与面板同色");
  assert.equal(
    /\.exs-present-hud__bottom \.exs-present-menu/.test(CSS),
    false,
    "放映里的深玻璃例外已删——菜单必须跟主题，不许局部改写 token",
  );
  assert.equal(CSS.includes("rgba(24, 26, 31, 0.94)"), false, "旧深玻璃底色不留");
  assert.equal(
    /\.exs-present-(preview|menu)[^}]*backdrop-filter/.test(CSS),
    false,
    "气泡不再透出白板",
  );
  for (const token of [
    "--exs-hud-accent-text",
    "--exs-hud-accent-ring",
    "--exs-hud-danger-text",
    "--exs-hud-danger-container-hover",
    "--exs-hud-hint-bg",
    "--exs-hud-hint-border",
    "--exs-hud-hint-shadow",
  ]) {
    assert.equal(CSS.split(token + ":").length - 1, 2, `${token} 必须亮/暗各一份`);
  }
});

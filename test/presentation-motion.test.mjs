/**
 * 第八十二轮：出场编排（PPT 式动效）。
 *
 * 断言分三段：
 * ① 纯逻辑真跑：曲线求值（含过冲）、档位默认、步号合并、错峰分组、写入形状——
 *    这几条错了用户看到的就是「动效没生效」「顺序乱了」「元素飞出去回不来」；
 * ② 现场接线：动画只写 opacity + x/y、一律 NEVER、中断先落终态、跳页不动画、
 *    退出按坐标快照回填——这几条错了就是「放映完白板歪了一半」；
 * ③ 分层与文案：motion 不许 import React/vendor，四档效果与步号说明双语齐备。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  EFFECTS,
  EFFECT_IDS,
  EFFECT_LABELS,
  STAGGER_MS,
  STAGGER_SLOTS,
  cubicBezier,
  defaultEffect,
  effectOfUnit,
  mergeByStep,
  motionGroups,
  motionRows,
  motionTotalMs,
  poseOf,
  resolveEffect,
  rowsSignature,
  setMotionPatch,
  stepOfUnit,
} from "../src/studio/presentation-motion.ts";
import { buildRunPatches, pageRows, planPage, snapshotOpacity } from "../src/studio/presentation-run.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = (rel) => readFileSync(resolve(ROOT, "src/" + rel), "utf8");
const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'\\])\/\/[^\n]*/g, "$1");
const json = (rel) => JSON.parse(readFileSync(resolve(ROOT, rel), "utf8"));
const APP = stripComments(src("studio/StudioApp.tsx"));
const DRAWER = stripComments(src("studio/PresentationDrawer.tsx"));
const CSS = src("index.css");

const frame = (id, over = {}) => ({ id, type: "frame", x: 0, y: 0, width: 400, height: 300, ...over });
const el = (id, over = {}) => ({ id, type: "rectangle", x: 0, y: 0, width: 100, height: 50, frameId: "f1", ...over });
/** 写在元素身上的编排元数据（和 vendor 的 customData 同形） */
const meta = (m) => ({ customData: { presentation: m } });

/* ------------------------------ ① 曲线与档位 ------------------------------ */

test("曲线：端点到位、中段单调，弹入必须过冲", () => {
  for (const id of EFFECT_IDS) {
    const ease = cubicBezier(...EFFECTS[id].cubic);
    assert.equal(ease(0), 0, `${id} 起点`);
    assert.equal(ease(1), 1, `${id} 终点`);
    // 采样 0..1 的进度，最后一段必须收在 1 附近（牛顿 + 二分兜底不许把曲线跑飞）
    const tail = ease(0.999);
    assert.ok(tail > 0.9 && tail <= 1.02, `${id} 收尾越界：${tail}`);
  }
  const pop = cubicBezier(...EFFECTS.pop.cubic);
  const peak = Math.max(...Array.from({ length: 60 }, (_, i) => pop((i + 1) / 60)));
  assert.ok(peak > 1.02, `弹入要飞过终点再回来，峰值只有 ${peak}`);
  const fade = cubicBezier(...EFFECTS.fade.cubic);
  assert.ok(Math.max(...Array.from({ length: 60 }, (_, i) => fade((i + 1) / 60))) <= 1.0001, "浮现不许过冲");
});

test("poseOf：没到点是满偏移，落定必须归零（不许留小数）", () => {
  assert.deepEqual(poseOf("rise", -10), { o: 0, dx: 0, dy: EFFECTS.rise.dy });
  assert.deepEqual(poseOf("slide", 0), { o: 0, dx: EFFECTS.slide.dx, dy: 0 });
  assert.deepEqual(poseOf("pop", EFFECTS.pop.ms + 1), { o: 1, dx: 0, dy: 0 });
  const mid = poseOf("fade", EFFECTS.fade.ms / 2);
  assert.ok(mid.o > 0 && mid.o < 1, "中段半透明");
  // 偏移和透明度共用一条进度：偏移 = 起点 × (1 - 进度)，所以一定是负相关
  assert.ok(Math.sign(mid.dy) === Math.sign(EFFECTS.fade.dy), "中段还在起点那一侧");
  const over = poseOf("pop", EFFECTS.pop.ms * 0.6);
  // 过冲的数学形状：进度 >1 ⇒ 偏移 = 起点 × (1 − 进度) 翻到终点另一侧（元素飞过位置再退回来）
  assert.ok(over.dy < 0, `弹入过冲：0.6 时长处 dy 该翻负，实测 ${over.dy}`);
  assert.equal(over.o, 1, "透明度不吃过冲（进度夹在 1，不许写出 >100 的 opacity）");
  assert.ok(poseOf("fade", EFFECTS.fade.ms * 0.6).dy > 0, "没过冲的档在同一点仍停在起点那一侧");
});

test("默认档位按类型给：文本浮现、箭头连线滑入、图片升起、形状弹入", () => {
  assert.equal(defaultEffect("text"), "fade");
  assert.equal(defaultEffect("arrow"), "slide");
  assert.equal(defaultEffect("line"), "slide");
  assert.equal(defaultEffect("image"), "rise");
  assert.equal(defaultEffect("rectangle"), "pop");
  assert.equal(defaultEffect(undefined), "pop", "认不出的类型也要有档，不许 undefined");
});

test("显式选过的效果优先，且跟着带头元素走（容器不是它的绑定文字）", () => {
  const shape = el("box", meta({ effect: "rise" }));
  const label = { ...el("t1", { type: "text", containerId: "box" }), text: "标题" };
  assert.equal(effectOfUnit(["box", "t1"], [shape, label]), "rise", "整条跟容器的档");

  const rect = el("box2");
  const txt = { ...el("t2", { type: "text", containerId: "box2" }), text: "正文" };
  assert.equal(effectOfUnit(["box2", "t2"], [rect, txt]), "pop", "没显式选时按带头的矩形给弹入，不被 text 抢成浮现");

  const onlyText = { ...el("t3", { type: "text" }), text: "独立文本" };
  assert.equal(effectOfUnit(["t3"], [onlyText]), "fade");

  const r = resolveEffect(["t3"], [onlyText]);
  assert.deepEqual(r, { effect: "fade", auto: true }, "没选过 = auto，抽屉要显示成「自动」亮着");
  assert.deepEqual(resolveEffect(["box"], [shape]), { effect: "rise", auto: false });
});

test("脏数据当没编过：0/负数/小数/超上限/认不出的效果一律忽略", () => {
  for (const bad of [0, -3, 1.5, 1000, "2", null, undefined]) {
    assert.equal(stepOfUnit(["a"], [el("a", meta({ step: bad }))]), null, `step=${bad} 不该作数`);
  }
  for (const bad of ["zoom", "", null, 3]) {
    assert.equal(resolveEffect(["a"], [el("a", meta({ effect: bad }))]).auto, true, `effect=${bad} 不该作数`);
  }
  assert.equal(stepOfUnit(["a"], [el("a", meta({ step: 7 }))]), 7);
});

/* ------------------------------ 步号合并 ------------------------------ */

test("没编步 = 原样一条一步（老白板零行为变化）", () => {
  const rows = pageRows([frame("f1"), el("a"), el("b", { x: 200 })], "f1");
  assert.deepEqual(
    mergeByStep(rows).map((u) => u.key),
    ["e:a", "e:b"],
  );
});

test("同号合并成一次按键；编过步的先出，没编的排在后面按阅读顺序", () => {
  const all = [
    frame("f1"),
    el("first", { x: 300, ...meta({ step: 1 }) }), // 位置在最右，但标了第 1 步
    el("second", { x: 200, ...meta({ step: 2 }) }),
    el("also1", { x: 100, groupIds: ["G"], ...meta({ step: 1 }) }),
    el("auto", { x: 0 }),
    el("auto2", { x: 50 }),
  ];
  const merged = mergeByStep(pageRows(all, "f1"));
  assert.deepEqual(merged.map((u) => u.key), ["s:1", "s:2", "e:auto", "e:auto2"], "步 1 → 步 2 → 没编的按阅读顺序");
  assert.deepEqual(merged[0].ids, ["also1", "first"], "同号并进去（顺序按阅读顺序，first 在 also1 之后）");
  assert.equal(merged[1].ids.length, 1);

  // buildRunPatches 只看 units：合并后一次按键就把两条一起点亮
  const plan = planPage(all, "f1");
  assert.deepEqual(plan.units.map((u) => u.key), ["s:1", "s:2", "e:auto", "e:auto2"]);
  const step0 = buildRunPatches(all, plan, 0, snapshotOpacity(all));
  assert.equal(step0.find((p) => p.id === "auto")?.opacity, 0, "第 1 步只点亮同号的两条");
  assert.equal(step0.find((p) => p.id === "second")?.opacity, 0);
});

test("页面上的步号来自画框内元素，别页的编排不参与", () => {
  const all = [frame("f1"), frame("f2", { x: 600 }), el("a", { ...meta({ step: 3 }) }), el("b", { frameId: "f2", ...meta({ step: 1 }) })];
  assert.deepEqual(planPage(all, "f1").units.map((u) => u.key), ["s:3"], "f2 的步号不许混进 f1 的计划");
});

/* ------------------------------ 错峰分组 ------------------------------ */

test("同一步里的视觉条数决定错峰；整页模式一律不错峰", () => {
  const all = [frame("f1"), el("a"), el("b", { x: 200 }), el("c", { x: 400 }), el("d", { x: 600 })];
  const ids = ["a", "b", "c", "d"];
  const g = motionGroups(all, ids);
  assert.deepEqual(g.map((x) => x.delay), [0, STAGGER_MS, STAGGER_MS * 2, STAGGER_MS * 3], "一条条排开");
  assert.equal(motionTotalMs(g), STAGGER_MS * 3 + EFFECTS.pop.ms);
  assert.deepEqual(motionGroups(all, ids, true).map((x) => x.delay), [0, 0, 0, 0], "整页一起出 = 错峰归零");
});

test("错峰有上限：条数再多也不会排成一列长龙", () => {
  const all = [frame("f1"), ...Array.from({ length: 12 }, (_, i) => el(`x${i}`, { x: i * 10 }))];
  const g = motionGroups(all, all.slice(1).map((e) => e.id));
  const delays = g.map((x) => x.delay);
  assert.equal(Math.max(...delays), STAGGER_SLOTS * STAGGER_MS, "第 6 条起挤在同一时刻");
  assert.equal(motionTotalMs(g), STAGGER_SLOTS * STAGGER_MS + EFFECTS.pop.ms);
});

test("动画分组跟编排分组同口径：绑定文字进容器的组、同组的元素一条", () => {
  const all = [
    el("box"),
    { ...el("label", { type: "text", containerId: "box" }), text: "嗨" },
    el("g1", { groupIds: ["G"], x: 200 }),
    el("g2", { groupIds: ["G"], x: 250 }),
  ];
  const g = motionGroups(all, ["box", "label", "g1", "g2"]);
  assert.deepEqual(g.map((x) => x.key), ["e:box", "g:G"], "容器一条、组一条");
  assert.deepEqual(g[0].ids, ["box", "label"], "绑定文字跟着容器一起飞");
  assert.deepEqual(g[1].ids, ["g2", "g1"].sort(), "组内两个元素同一条");
});

test("显式步号在动画分组里也排在前面（和 mergeByStep 同一口径）", () => {
  const all = [el("late", { x: 0 }), el("early", { x: 300, ...meta({ step: 2 }) }), el("early2", { x: 400, ...meta({ step: 1 }) })];
  const g = motionGroups(all, ["late", "early", "early2"]);
  assert.deepEqual(g.map((x) => x.key), ["e:early2", "e:early", "e:late"]);
});

/* ------------------------------ 写入形状 ------------------------------ */

test("写一条 = 给这条的每个元素都写；null 走删键不是写 null", () => {
  const patches = setMotionPatch(["a", "b"], { effect: "pop", step: 3 });
  assert.deepEqual(patches.map((p) => p.id), ["a", "b"]);
  assert.deepEqual(patches[0].patch.presentation, { effect: "pop", step: 3 });
  const cleared = setMotionPatch(["a"], { step: null }).map((p) => p.patch.presentation);
  assert.equal("step" in cleared[0], true, "键要在（覆盖写入）");
  assert.equal(cleared[0].step, undefined, "但值是 undefined——序列化就没了，别留 null");
  assert.deepEqual(setMotionPatch(["a"], {}), [], "什么都没改就不该产生补丁");
});

test("签名只认影响行的字段：挪位置不刷新，改步号/加元素才刷新", () => {
  const base = [frame("f1"), el("a"), el("b", { x: 200 })];
  const moved = [frame("f1"), el("a", { x: 500 }), el("b", { x: 200 })];
  assert.equal(rowsSignature(base), rowsSignature(moved), "纯挪动不该让抽屉重算");
  assert.notEqual(rowsSignature(base), rowsSignature([...base, el("c")]), "加元素要重算");
  assert.notEqual(rowsSignature(base), rowsSignature([frame("f1"), el("a", meta({ step: 1 })), el("b", { x: 200 })]), "标步号要重算");
});

/* ------------------------------ ② 现场接线 ------------------------------ */

test("动画只写 opacity + x/y，而且从基准算（不许把上帧偏移当真坐标累加）", () => {
  const at = APP.indexOf("const applyPosePatches");
  const body = APP.slice(at, APP.indexOf("const presentApply", at));
  assert.match(body, /captureUpdate: CaptureUpdateAction\.NEVER/, "放映补丁不进撤销栈");
  assert.match(body, /\{ \.\.\.e, opacity: p\.opacity, x: p\.x, y: p\.y \}/, "一份补丁同时落 opacity 与坐标");
  assert.match(body, /x: b\.x \+ p\.dx/, "坐标 = 基准 + 偏移");
  assert.equal(/x: e\.x \+ p\.dx/.test(body), false, "不许读现场 x 再加偏移");
  assert.match(body, /const final: PosePatch\[\] = \[\];/, "收尾落终态而不是继续写中间帧");
});

test("中断先落终态：换页 / 跳页 / 退出都不得把元素留在半空", () => {
  const at = APP.indexOf("const finishMotion");
  const body = APP.slice(at, APP.indexOf("const startMotion", at));
  assert.match(body, /motionRef\.current = null;[\s\S]{0,80}window\.cancelAnimationFrame\(m\.raf\)/, "先摘状态再取消 rAF");
  assert.match(body, /opacity: m\.target\.get\(id\) \?\? OPACITY_DEFAULT/, "终态回元素自己的原始透明度");
  assert.match(APP, /finishMotion\(\);\s*\n\s*const patches = buildRunPatches\(/, "presentApply 第一件事就是收尾");
  const exit = APP.slice(APP.indexOf("const exitPresentation"), APP.indexOf("const presentNext = useCallback"));
  assert.match(exit, /finishMotion\(\);[\s\S]{0,120}applyFullscreen\(false\)/, "退出也先收尾，且早于回填");
});

test("只有向前推进才飞；跳页、倒退、放映中换口径给终态", () => {
  const at = APP.indexOf("const presentApply");
  const body = APP.slice(at, APP.indexOf("const bumpAutoDeadline", at));
  assert.match(body, /\(cur: Cursor, kind: PresentNav = "jump"\)/, "默认不动画：忘了传 kind 的调用点是硬切");
  assert.match(body, /if \(kind === "jump" \|\| !startMotion\(ids, together\)\) applyRunPatches\(show\);/);
  assert.match(body, /const together = cur\.step < 0;/, "整页模式把错峰全归零");
  assert.match(body, /const hide = patches\.filter\(\(p\) => p\.opacity === 0\);/, "藏起来的硬切");
  assert.match(APP, /presentApply\(next, kind\);/, "presentGo 把导航语义传给动画");
});

test("快照与复原都带上坐标：退出后白板不许歪", () => {
  const at = APP.indexOf("const enterPresentation");
  const body = APP.slice(at, APP.indexOf("const exitPresentation", at));
  assert.match(body, /pose: snapshotPose\(all\)/, "进片场抓坐标快照");
  const exit = APP.slice(APP.indexOf("const exitPresentation"), APP.indexOf("const presentNext = useCallback"));
  assert.match(exit, /buildRestorePoses\(all, snap\.pose\)/, "退出按坐标表回填");
  assert.match(exit, /if \(op === undefined && text === undefined && pose === undefined\) return e;/, "没动过的元素不产生无谓写入");
});

test("抽屉：四档效果 + 自动 + 步号，同值不写", () => {
  assert.match(DRAWER, /EFFECT_IDS\.map\(\(id\) =>/, "四档一排");
  assert.match(DRAWER, /aria-pressed=\{!r\.auto && r\.effect === id\}/, "选中态要既对上档、又不是默认档");
  assert.match(DRAWER, /onClick=\{\(\) => props\.onRowMotion\(r\.ids, \{ effect: null \}\)\}/, "A = 清掉显式档回自动");
  assert.match(DRAWER, /if \(next !== row\.step\) props\.onRowMotion\(row\.ids, \{ step: next \}\);/, "同值不写（一次写入一个撤销点）");
  assert.match(DRAWER, /const \[motionOpen, setMotionOpen\] = useState\(false\)/, "默认收起：浮层不常驻占位");
});

/* ------------------------------ ③ 分层与文案 ------------------------------ */

test("presentation-motion 是纯逻辑：不碰 React / vendor / vendor 类型", () => {
  const M = src("studio/presentation-motion.ts");
  assert.equal(M.includes('from "react"'), false);
  assert.equal(M.includes('from "siyuan"'), false);
  assert.equal(M.includes("@excalidraw"), false);
  assert.equal(M.includes("../i18n"), false);
  const runtime = [...M.matchAll(/^import (?!type).* from "([^"]+)";$/gm)].map((m) => m[1]);
  assert.deepEqual(runtime, ["./presentation-plan.ts"], "运行期只许依赖片单纯逻辑（对 run 只能 import type，反向就成环）");
});

test("样式：编排区按主题 token，控件不靠位移", () => {
  assert.match(CSS, /\.exs-present-motion \{[^}]*border: 1px solid var\(--exs-menu-border\);/);
  assert.match(CSS, /\.exs-present-motion__list \{[^}]*max-height: 190px;[^}]*overflow-y: auto;/, "条目多就内部滚，别把抽屉顶出画布");
  assert.match(CSS, /\.exs-present-fx--on \{[^}]*background: var\(--exs-accent-container\);[^}]*color: var\(--exs-accent-on-container\);/);
  assert.match(CSS, /\.exs-present-mrow__step \{[^}]*box-sizing: border-box;/, "本仓库没有全局 box-sizing，定宽输入框必须自己声明");
  assert.match(CSS, /\.exs-present-mrow__label \{[^}]*flex: 1;[^}]*text-overflow: ellipsis;/, "名字最长，独占弹性宽度");
});

test("i18n：四档效果名与编排说明双语齐备，英文确实是英文", () => {
  const zh = json("i18n/zh_CN.json");
  const en = json("i18n/en_US.json");
  const keys = [...Object.values(EFFECT_LABELS), "出场编排", "按类型自动", "第几步出场"];
  for (const k of keys) {
    assert.equal(zh[k], k, `zh 缺词条或值不等于 key：${k}`);
    assert.ok(typeof en[k] === "string" && en[k] !== k, `en 缺词条：${k}`);
  }
  assert.ok("出场效果" in zh && "出场效果" in en, "行内分组标题复用既有词条");
});

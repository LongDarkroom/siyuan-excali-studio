/**
 * 第八十六轮：第五档效果「划线」。
 *
 * 断言分三段：
 * ① 几何真跑：谁算可划、前沿怎么推、裁剪后是不是「左半截 + 前沿斜口」、
 *    低透明度层会不会晚半步收笔、竖条会不会改成从上往下擦、旋转元素会不会出框；
 * ② 现场接线：几何补丁走 NEVER、中断/退出要按快照回填 points、没可划元素回落浮现、
 *    抽屉只给能划的条显示这一档；
 * ③ 分层与文案：纯几何层不碰 React/vendor，效果名与说明双语齐备。
 *
 * 第八十八轮补形状：矩形/椭圆/菱形按 vendor 的轮廓公式擦，现场临时换成折线、
 * 收笔再换回；裁完必须首尾闭合，否则 vendor 判不出「环」就不填色。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DRAW_SEGMENTS,
  drawBoxOf,
  drawFrame,
  isDrawableElement,
} from "../src/studio/presentation-draw.ts";
import {
  EFFECTS,
  EFFECT_IDS,
  EFFECT_LABELS,
  defaultEffect,
  motionRows,
} from "../src/studio/presentation-motion.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = (rel) => readFileSync(resolve(ROOT, "src/" + rel), "utf8");
const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'\\])\/\/[^\n]*/g, "$1");
const json = (rel) => JSON.parse(readFileSync(resolve(ROOT, rel), "utf8"));
const APP = stripComments(src("studio/StudioApp.tsx"));
const DRAWER = stripComments(src("studio/PresentationDrawer.tsx"));
const M = src("studio/presentation-motion.ts");
const D = src("studio/presentation-draw.ts");

/** 高亮素材的最小替身：带填充的折线（真实那组是 54 片几百点的描迹，几何规则一样） */
const ribbon = (id, over = {}) => ({
  id,
  type: "line",
  x: 100,
  y: 50,
  width: 200,
  height: 40,
  angle: 0,
  points: [
    [0, 0],
    [200, 0],
    [200, 40],
    [0, 40],
  ],
  backgroundColor: "#ffc9c9",
  opacity: 45,
  ...over,
});
const BOX = { x: 100, y: 50, w: 200, h: 40 };

/** 形状的最小替身：轮廓完全由 type + 宽高 + 圆角决定（vendor 公式同源） */
const shape = (id, type, over = {}) => ({
  id,
  type,
  x: 120,
  y: 60,
  width: 240,
  height: 120,
  angle: 0,
  backgroundColor: "#ffd8a8",
  strokeColor: "#1e1e1e",
  ...over,
});

const maxX = (points) => Math.max(...points.map((q) => q[0]));
const maxY = (points) => Math.max(...points.map((q) => q[1]));
const minX = (points) => Math.min(...points.map((q) => q[0]));

/* ------------------------------ ① 几何真跑 ------------------------------ */

test("可划判据：填充折线 + 矩形/椭圆/菱形；文字/图片/箭头/透明连线都不算", () => {
  assert.equal(isDrawableElement(ribbon("a")), true, "填充折线就是素材库高亮那种");
  assert.equal(isDrawableElement(ribbon("a", { backgroundColor: "transparent" })), false, "透明填充是普通连线");
  assert.equal(isDrawableElement(ribbon("a", { backgroundColor: undefined })), false);
  assert.equal(isDrawableElement(ribbon("a", { type: "arrow" })), false, "箭头擦半截会断，走滑入");
  assert.equal(isDrawableElement(ribbon("a", { type: "freedraw" })), false);
  assert.equal(isDrawableElement(ribbon("a", { isDeleted: true })), false);
  assert.equal(isDrawableElement(ribbon("a", { points: [[0, 0], [10, 10]] })), false, "两个点画不出面");
  for (const type of ["rectangle", "ellipse", "diamond"]) {
    assert.equal(isDrawableElement(shape("s", type)), true, `${type} 的轮廓能从宽高算出来`);
    assert.equal(isDrawableElement(shape("s", type, { width: 1 })), false, "太小的形状没有轮廓");
  }
  assert.equal(isDrawableElement({ id: "t", type: "text", x: 0, y: 0, width: 80, height: 20, text: "标题" }), false);
  assert.equal(isDrawableElement({ id: "i", type: "image", x: 0, y: 0, width: 80, height: 80 }), false);
});

test("可划外接框只算可划的那几片；一条里没有就 null（现场回落浮现）", () => {
  const label = { id: "t", type: "text", x: 0, y: 0, width: 300, height: 20, text: "说明" };
  const b = drawBoxOf([ribbon("a", { x: 100, y: 50 }), ribbon("b", { x: 140, y: 70, width: 300, height: 60 }), label]);
  assert.deepEqual(b, { x: 100, y: 50, w: 340, h: 80 }, "绑定文字不参与前沿的范围");
  assert.equal(drawBoxOf([label, ribbon("c", { backgroundColor: "transparent" })]), null);
});

test("进度三态：没到 = 藏、过去了 = 原样、中间 = 左半截 + 斜口", () => {
  const e = ribbon("a");
  assert.deepEqual(drawFrame(e, BOX, 0), { kind: "hidden" });
  assert.deepEqual(drawFrame(e, BOX, 1), { kind: "done" });
  const mid = drawFrame(e, BOX, 0.5);
  assert.equal(mid.kind, "clip");
  const g = mid.geom;
  assert.equal(g.x, e.x, "x 不挪：折线坐标本来就相对元素原点");
  assert.equal(g.y, e.y);
  assert.equal(minX(g.points), 0, "左边原样保留");
  assert.ok(maxX(g.points) > 0 && maxX(g.points) < 200, `前沿要切在中间，实测 ${maxX(g.points)}`);
  assert.ok(g.width <= 200 && g.height <= 40, "宽高收到裁剪后的包围盒");
  // 前沿带斜度：上下两端的收笔位置不该一样
  const top = Math.max(...g.points.filter((q) => q[1] <= 1).map((q) => q[0]));
  const bottom = Math.max(...g.points.filter((q) => q[1] >= 39).map((q) => q[0]));
  assert.ok(Math.abs(top - bottom) > 1, `斜口两端差 ${Math.abs(top - bottom)}，不该是直刀`);
});

test("裁完把起点补回末尾：vendor 靠首尾闭合判填充，环口切开就整块没色", () => {
  const f = drawFrame(ribbon("a"), BOX, 0.5);
  assert.equal(f.kind, "clip");
  const p = f.geom.points;
  assert.deepEqual(p[0], p[p.length - 1], "折线的首尾必须重合");
  const s = shape("r", "rectangle");
  const g = drawFrame(s, drawBoxOf([s]), 0.5).geom;
  assert.deepEqual(g.points[0], g.points[g.points.length - 1], "形状换来的折线也要闭合");
});

test("单调：进度越大露出的越多，且不会越过包围盒", () => {
  const e = ribbon("a");
  let last = -Infinity;
  for (let i = 0; i <= 10; i += 1) {
    const p = i / 10;
    const f = drawFrame(e, BOX, p);
    if (f.kind === "hidden") {
      assert.equal(p, 0, "只有起点可以是整块隐藏");
      continue;
    }
    if (f.kind === "done") continue;
    const edge = maxX(f.geom.points);
    assert.ok(edge >= last - 1e-6, `p=${p} 反而缩回去了：${last} → ${edge}`);
    assert.ok(edge <= 200 + 1e-6, "裁剪只会往里收");
    last = edge;
  }
  assert.ok(last > 100, "走到 0.8 附近应该已经露出大半");
});

test("渐层软边：透明度越低的那一片收笔越晚（叠出来才是软的）", () => {
  const solid = ribbon("s", { opacity: 100 });
  const light = ribbon("l", { opacity: 28 });
  assert.notEqual(DRAW_SEGMENTS, 0, "前沿按折线近似，段数是明确常量");
  const a = drawFrame(solid, BOX, 0.5);
  const b = drawFrame(light, BOX, 0.5, 28);
  assert.equal(a.kind, "clip");
  assert.equal(b.kind, "clip");
  assert.ok(maxX(b.geom.points) < maxX(a.geom.points), "低透明度层必须落后半步");
});

test("竖版自动改成从上往下擦（横着扫一根竖高亮像在刮）", () => {
  const tall = ribbon("v", {
    x: 50,
    y: 50,
    width: 40,
    height: 200,
    points: [
      [0, 0],
      [40, 0],
      [40, 200],
      [0, 200],
    ],
  });
  const box = { x: 50, y: 50, w: 40, h: 200 };
  const f = drawFrame(tall, box, 0.5);
  assert.equal(f.kind, "clip");
  assert.ok(maxY(f.geom.points) > 0 && maxY(f.geom.points) < 200, "沿长轴切，不是横着切");
  assert.ok(f.geom.height <= 200);
});

test("旋转元素：前沿会被换算到元素自己的坐标系里，裁完还在框内", () => {
  const turned = ribbon("r", { angle: Math.PI / 2 });
  const box = drawBoxOf([turned]); // 旋转 90° 后场景里是竖的：外接框也得跟着转
  assert.deepEqual(box, { x: 180, y: -30, w: 40, h: 200 }, "可划外接框按旋转后的真实占位算");
  assert.deepEqual(drawFrame(turned, box, 0), { kind: "hidden" });
  assert.deepEqual(drawFrame(turned, box, 1), { kind: "done" });
  const f = drawFrame(turned, box, 0.5);
  assert.equal(f.kind, "clip");
  const g = f.geom;
  assert.ok(g.points.length >= 3);
  assert.ok(g.width > 0 && g.width <= 200 + 1e-6, "局部宽度是 200（旋转不改元素自己的宽高）");
  assert.ok(g.height > 0 && g.height <= 40 + 1e-6);
});

test("多层叠起来：同一个前沿下三层各自收在自己那一步", () => {
  const layers = [ribbon("l1", { opacity: 28 }), ribbon("l2", { opacity: 60 }), ribbon("l3", { opacity: 100 })];
  const edges = layers.map((e) => {
    const f = drawFrame(e, BOX, 0.55, e.opacity);
    assert.equal(f.kind, "clip");
    return maxX(f.geom.points);
  });
  assert.ok(edges[0] < edges[1] && edges[1] < edges[2], `三层要排开：${edges.join(" / ")}`);
});

test("矩形也能划：轮廓临时换折线，擦到中间是左半截、整高都在", () => {
  const rect = shape("r", "rectangle");
  const box = drawBoxOf([rect]);
  assert.deepEqual(box, { x: 120, y: 60, w: 240, h: 120 }, "可划外接框照形状的宽高算");
  assert.deepEqual(drawFrame(rect, box, 0), { kind: "hidden" });
  assert.deepEqual(drawFrame(rect, box, 1), { kind: "done" });
  const f = drawFrame(rect, box, 0.5);
  assert.equal(f.kind, "clip");
  const g = f.geom;
  assert.equal(g.swap, true, "形状这一帧要现场换成折线，收笔再换回");
  assert.equal(g.x, rect.x, "x/y 不挪");
  assert.equal(g.y, rect.y);
  assert.equal(minX(g.points), 0, "左边原样保留");
  assert.ok(maxX(g.points) > 60 && maxX(g.points) < 240, `前沿切在中间，实测 ${maxX(g.points)}`);
  assert.ok(minX(g.points) >= 0 && maxX(g.points) <= 240, "轮廓不出形状自己的宽");
  const ys = g.points.map((q) => q[1]);
  assert.ok(Math.min(...ys) <= 1 && Math.max(...ys) >= 119, "上下两条边都要在，半截是整个高");
});

test("折线不带 swap：现场不用改 type（只有形状才换形）", () => {
  const f = drawFrame(ribbon("a"), BOX, 0.5);
  assert.equal(f.kind, "clip");
  assert.equal(f.geom.swap, false);
});

test("圆角矩形：轮廓被采样成一串点，收角从 (r,0) 开始", () => {
  const rect = shape("r", "rectangle", { roundness: { type: 3, value: 32 } });
  const box = drawBoxOf([rect]);
  const f = drawFrame(rect, box, 0.5);
  assert.equal(f.kind, "clip");
  assert.ok(f.geom.points.length > 10, `圆角要采样，实测 ${f.geom.points.length} 点`);
  assert.ok(minX(f.geom.points) >= 0 && maxX(f.geom.points) <= 240);
  // 自适应半径封顶 32：前沿刚扫进左边时，最左的点落在圆角下端（y=32），不是左上角
  const early = drawFrame(rect, box, 0.045);
  assert.equal(early.kind, "clip");
  const leftMost = early.geom.points.reduce((a, b) => (a[0] <= b[0] ? a : b));
  assert.ok(Math.abs(leftMost[0]) < 1e-6, "轮廓左边缘还在");
  assert.ok(leftMost[1] >= 30, `最左的点该在圆角下端，实测 y=${leftMost[1]}`);
});

test("椭圆/菱形也能沿自己的轮廓擦开", () => {
  for (const type of ["ellipse", "diamond"]) {
    const el = shape("s", type);
    assert.equal(isDrawableElement(el), true, `${type} 可划`);
    const box = drawBoxOf([el]);
    assert.equal(drawFrame(el, box, 0).kind, "hidden");
    assert.equal(drawFrame(el, box, 1).kind, "done");
    const f = drawFrame(el, box, 0.5);
    assert.equal(f.kind, "clip", `${type} 要能裁`);
    assert.equal(f.geom.swap, true);
    assert.ok(maxX(f.geom.points) > 0 && maxX(f.geom.points) < el.width, "前沿在中间");
    assert.ok(
      f.geom.points.every((q) => q[0] >= -1e-6 && q[0] <= el.width + 1e-6 && q[1] >= -1e-6 && q[1] <= el.height + 1e-6),
      `${type} 的轮廓不出自己的宽高`,
    );
  }
});

test("竖版形状：从上往下擦，不是横着切", () => {
  const tall = shape("v", "rectangle", { x: 50, y: 50, width: 80, height: 240 });
  const box = drawBoxOf([tall]);
  const f = drawFrame(tall, box, 0.5);
  assert.equal(f.kind, "clip");
  assert.ok(maxY(f.geom.points) > 0 && maxY(f.geom.points) < 240, "沿长轴切");
  assert.ok(f.geom.height <= 240 + 1e-6);
});

test("旋转的形状：轮廓在元素坐标系里裁，外接框按旋转后的占位算", () => {
  const turned = shape("r", "rectangle", { angle: Math.PI / 2 });
  const box = drawBoxOf([turned]);
  assert.ok(Math.abs(box.x - 180) < 1e-6 && Math.abs(box.y) < 1e-6, `旋转 90° 后落点：${box.x}, ${box.y}`);
  assert.deepEqual({ w: box.w, h: box.h }, { w: 120, h: 240 }, "旋转 90° 后宽高对调");
  assert.equal(drawFrame(turned, box, 0).kind, "hidden");
  assert.equal(drawFrame(turned, box, 1).kind, "done");
  const f = drawFrame(turned, box, 0.5);
  assert.equal(f.kind, "clip");
  assert.equal(f.geom.swap, true);
  assert.ok(f.geom.width > 0 && f.geom.width <= 240 + 1e-6, "局部宽度仍是 240");
  assert.ok(f.geom.height > 0 && f.geom.height <= 120 + 1e-6);
});

/* ------------------------------ ② 编排与现场 ------------------------------ */

test("效果注册：第五档是显式选的，默认档永远不会自动变成划线", () => {
  assert.ok(EFFECT_IDS.includes("draw"));
  assert.equal(EFFECT_LABELS.draw, "划线");
  assert.equal(EFFECTS.draw.ms, 760, "比其余四档长一点，是手刷一下的节奏");
  assert.equal(EFFECTS.draw.dx, 0, "划线不挪位置");
  assert.equal(EFFECTS.draw.dy, 0);
  for (const type of ["text", "arrow", "line", "image", "rectangle", "freedraw"]) {
    assert.notEqual(defaultEffect(type), "draw", `${type} 的自动档不许是划线`);
  }
});

test("抽屉的行要能看出「这条划得开」：填充折线/矩形 true，纯文字 false", () => {
  const rows = motionRows(
    [
      ribbon("hl"),
      { id: "box", type: "rectangle", x: 0, y: 0, width: 80, height: 40 },
      { id: "txt", type: "text", x: 0, y: 200, width: 80, height: 20, text: "标题" },
    ],
    [
      { key: "e:hl", ids: ["hl"] },
      { key: "e:box", ids: ["box"] },
      { key: "e:txt", ids: ["txt"] },
    ],
  );
  assert.deepEqual(rows.map((r) => r.drawable), [true, true, false]);
});

test("现场：几何补丁 NEVER、按快照回填、没可划的回落浮现", () => {
  const at = APP.indexOf("const applyDrawPatches");
  assert.ok(at > 0, "要有独立的几何补丁函数（不能塞进坐标补丁里）");
  const body = APP.slice(at, APP.indexOf("const motionRef", at));
  assert.match(body, /captureUpdate: CaptureUpdateAction\.NEVER/, "放映补丁不进撤销栈");
  assert.match(body, /const next: Record<string, unknown> = \{/, "补丁要能增删字段（形状换形）");
  assert.match(body, /if \(p\.points\) next\.points = p\.points;/, "折线才写 points，形状还原时不塞空数组");
  assert.match(
    body,
    /if \(p\.swap\) \{[\s\S]{0,220}next\.type = "line";[\s\S]{0,220}next\.polygon = true;[\s\S]{0,220}next\.roundness = null;/,
    "擦的时候临时换成多边形折线；带 roundness 的 line 会走曲线，圆角必须关掉",
  );
  assert.match(
    body,
    /\} else if \(p\.restore\) \{[\s\S]{0,220}delete next\.points;[\s\S]{0,220}next\.type = p\.restore\.type;/,
    "收笔/中断写回原来的类型，并把临时折线点删干净",
  );
  assert.match(APP, /function shapeRestoreOf[\s\S]{0,200}type: el\.type \?\? "line"/, "按快照记下原类型");

  const motion = APP.slice(APP.indexOf("const motionRef"), APP.indexOf("const presentApply"));
  assert.match(motion, /drawFrame\(b\.el, box, p\.o, want\)/, "进度 + 该显示的透明度一起喂给几何层");
  assert.match(motion, /if \(box === null\) \{[\s\S]{0,400}Math\.round\(\(run\.target\.get\(id\) \?\? OPACITY_DEFAULT\) \* p\.o\)/, "没有可划元素时回落浮现");
  assert.match(motion, /if \(!isDrawableElement\(b\.el\)\)/, "绑定文字跟着淡入，不参与裁剪");
  assert.match(motion, /if \(!run\.hidden\.has\(id\)\)/, "藏起来的只写一次，不每帧重画");
  assert.match(motion, /if \(!run\.settled\.has\(id\)\)/, "收笔后落回原几何，只写一次");

  const finish = APP.slice(APP.indexOf("const finishMotion"), APP.indexOf("const startMotion"));
  assert.match(finish, /restorePatchOf\(b\.el, want\)/, "中断也按快照还原：折线回 points、形状回类型");
  assert.match(APP, /points: el\.type === "line" \? el\.points \?\? \[\] : undefined/, "折线回填折线；形状不带 points");
  assert.match(APP, /applyDrawPatches\(finalGeo\);/, "收尾同样落原几何");
});

test("抽屉：只给画得开的条显示「划线」，菜单高度按六项留位", () => {
  assert.match(DRAWER, /if \(id === "draw" && !fxMenu\.row\.drawable\) return null;/, "文字/图片/箭头那几条不显示这一档");
  assert.match(DRAWER, /const menuH = 312;/, "菜单从五项变六项，贴底时整块还要露出来");
  assert.match(DRAWER, /draw: "顺着它自己的形状擦出来/, "菜单副行说人话");
});

/* ------------------------------ ③ 分层与文案 ------------------------------ */

test("纯几何层：不碰 React / 思源 / vendor，也不 import 兄弟模块", () => {
  assert.equal(D.includes('from "react"'), false);
  assert.equal(D.includes('from "siyuan"'), false);
  assert.equal(D.includes("@excalidraw"), false);
  assert.equal(D.includes("../i18n"), false);
  const runtime = [...D.matchAll(/^import (?!type).* from "([^"]+)";$/gm)].map((m) => m[1]);
  assert.deepEqual(runtime, [], "几何层连兄弟模块都不依赖，node 侧直接跑");
  assert.match(M, /from "\.\/presentation-draw\.ts"/, "编排层引用同一份判据，别各写一套");
});

test("i18n：划线名与说明双语齐备", () => {
  const zh = json("i18n/zh_CN.json");
  const en = json("i18n/en_US.json");
  for (const k of ["划线", "顺着它自己的形状擦出来，适合高亮、笔刷这类填充图形。"]) {
    assert.equal(zh[k], k, `zh 缺词条：${k}`);
    assert.ok(typeof en[k] === "string" && en[k] !== k, `en 缺词条：${k}`);
  }
});

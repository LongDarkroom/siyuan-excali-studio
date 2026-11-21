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
  TRACE_CURVE_STRIDE,
  TRACE_SAMPLE_STEP,
  drawBoxOf,
  drawFrame,
  isDrawableElement,
  isTraceableStroke,
  strokePathOf,
  traceFrame,
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

/** 箭头的最小替身：直线两点起步，折线/弧线都由 points + roundness 决定 */
const arrow = (id, over = {}) => ({
  id,
  type: "arrow",
  x: 100,
  y: 50,
  width: 200,
  height: 0,
  angle: 0,
  points: [
    [0, 0],
    [200, 0],
  ],
  ...over,
});
/** 弧线箭头：vendor 用 roundness 把控制点再平滑成曲线 */
const curve = (id, over = {}) => ({
  id,
  type: "arrow",
  x: 40,
  y: 40,
  width: 240,
  height: 160,
  angle: 0,
  roundness: { type: 3 },
  points: [
    [0, 120],
    [60, 0],
    [180, 0],
    [240, 120],
  ],
  ...over,
});

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

/* --------------------------- ①b 箭头/连线「画出来」 --------------------------- */

/** vendor 的曲线骨架（roughjs `_curve`，tightness=0）：首尾补虚点、每个控制点一段三次 */
const vendorCurve = (pts) => {
  const pad = [pts[0], pts[0], ...pts, pts[pts.length - 1]];
  const out = [pad[1]];
  for (let i = 1; i + 2 < pad.length; i += 1) {
    const c1 = [
      pad[i][0] + (pad[i + 1][0] - pad[i - 1][0]) / 6,
      pad[i][1] + (pad[i + 1][1] - pad[i - 1][1]) / 6,
    ];
    const c2 = [
      pad[i + 1][0] + (pad[i][0] - pad[i + 2][0]) / 6,
      pad[i + 1][1] + (pad[i][1] - pad[i + 2][1]) / 6,
    ];
    out.push(c1, c2, pad[i + 1]);
  }
  const sampled = [out[0]];
  for (let i = 0; i + 3 < out.length; i += 3) {
    const [p0, p1, p2, p3] = [out[i], out[i + 1], out[i + 2], out[i + 3]];
    for (let k = 1; k <= 64; k += 1) {
      const t = k / 64;
      const u = 1 - t;
      sampled.push([
        u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
      ]);
    }
  }
  return sampled;
};
const distToPolyline = (pt, line) => {
  let best = Infinity;
  for (let i = 1; i < line.length; i += 1) {
    const [ax, ay] = line[i - 1];
    const [bx, by] = line[i];
    const dx = bx - ax;
    const dy = by - ay;
    const l2 = dx * dx + dy * dy;
    const t = l2 ? Math.max(0, Math.min(1, ((pt[0] - ax) * dx + (pt[1] - ay) * dy) / l2)) : 0;
    best = Math.min(best, Math.hypot(pt[0] - ax - dx * t, pt[1] - ay - dy * t));
  }
  return best;
};
const maxDeviation = (a, b) => Math.max(...a.map((pt) => distToPolyline(pt, b)));

test("可描判据：直箭头、折线、弧线、直角路由都算；文字/画笔/图片/退化点不算", () => {
  assert.equal(isTraceableStroke(arrow("a")), true);
  assert.equal(isTraceableStroke({ ...arrow("a"), type: "line" }), true, "普通连线也能画出来");
  assert.equal(isTraceableStroke(curve("c")), true);
  assert.equal(isTraceableStroke({ ...arrow("a"), elbowed: true }), true, "直角路由渲染时直接吃 points，截断有效");
  assert.equal(isTraceableStroke({ ...arrow("a"), type: "freedraw" }), false);
  assert.equal(isTraceableStroke({ ...arrow("a"), isDeleted: true }), false);
  assert.equal(isTraceableStroke({ ...arrow("a"), points: [[0, 0]] }), false);
  assert.equal(isTraceableStroke({ ...arrow("a"), points: [[0, 0], [0, 0]] }), false, "零长度没有可画的路径");
});

test("直箭头：每帧只是原控制点的前缀 + 一个笔尖点，落定恢复零差异", () => {
  const a = arrow("a");
  const path = strokePathOf(a);
  assert.ok(path);
  assert.equal(path.len, 200);
  assert.deepEqual(path.dense, [[0, 0], [200, 0]], "直线不插采样点——vendor 终态本来就是这一条");
  assert.deepEqual(traceFrame(a, path, 0), { kind: "hidden" });
  assert.deepEqual(traceFrame(a, path, 1), { kind: "done" });
  const f = traceFrame(a, path, 0.5);
  assert.equal(f.kind, "clip");
  assert.deepEqual(f.geom.points, [[0, 0], [100, 0]], "首点 + 笔尖，没有任何插出来的抖动点");
  assert.equal(f.geom.x, a.x, "x/y 不挪，坐标本来就相对元素原点");
  assert.equal(f.geom.y, a.y);
  assert.equal(f.geom.swap, false, "箭头不换类型，收笔只写回字段");
  assert.deepEqual(f.geom.trace, { flat: true }, "实线描线走折线（圆角关掉、顶点精确）");
});

test("直角路由：拐角先按最终半径 16 采样成折线，笔尖过弯不再把圆角夹尖", () => {
  const a = arrow("elbow", {
    elbowed: true,
    width: 160,
    height: 120,
    points: [[0, 0], [160, 0], [160, 120]],
  });
  const path = strokePathOf(a);
  assert.ok(path, "直角箭头也要有路径表");
  const has = (x, y) => path.dense.some((q) => Math.hypot(q[0] - x, q[1] - y) < 0.01);
  assert.ok(has(144, 0), "拐角前一侧的圆角落点：距拐点 16");
  assert.ok(has(160, 16), "拐角后一侧的圆角落点");
  assert.ok(!has(160, 0), "尖角本身不在折线上——圆角从出现那一刻就是最终形状");
  const near = Math.min(...path.dense.map((q) => Math.hypot(q[0] - 160, q[1])));
  assert.ok(near > 3, `折线要真的绕过拐点，最近点实测 ${near.toFixed(2)}px`);
  // 笔尖刚过拐点：前缀里已经带着整段圆角（旧做法这时 vendor 会把半径夹到 0，拐角是尖的）
  const f = traceFrame(a, path, (144 + 20) / path.len);
  assert.equal(f.kind, "clip");
  const pts = f.geom.points;
  const arc = pts.filter((q) => q[0] > 144 && q[1] > 0.01 && q[1] < 16);
  assert.ok(arc.length >= 3, `圆角弧上至少落了三个点，实测 ${arc.length}`);
  assert.equal(f.geom.trace.flat, true);
});

test("折线箭头：拐点原样保留，笔尖落在半路也不丢角", () => {
  const a = arrow("a", {
    width: 100,
    height: 100,
    points: [
      [0, 0],
      [100, 0],
      [100, 100],
    ],
  });
  const path = strokePathOf(a);
  assert.ok(path);
  assert.equal(path.len, 200);
  assert.deepEqual(path.dense, [[0, 0], [100, 0], [100, 100]], "普通折线（非肘形）原样用控制点");
  const f = traceFrame(a, path, 0.75);
  assert.equal(f.kind, "clip");
  assert.deepEqual(f.geom.points, [[0, 0], [100, 0], [100, 50]], "前两个控制点原样，笔尖在第二段中间");
});

test("弧线：骨架按 vendor 的同一套曲线口径密采样，画出来的就是落定形状", () => {
  const c = curve("c");
  const path = strokePathOf(c);
  assert.ok(path);
  assert.equal(path.kind, "curve", "带圆角的弧线终态走 roughjs curve()");
  assert.deepEqual(path.dense[0], [0, 120], "起点是第一段曲线的起点");
  assert.deepEqual(path.dense[path.dense.length - 1], [240, 120], "终点仍在最后一个控制点");
  assert.ok(path.dense.length > 40, `8px 一步要够密，实测 ${path.dense.length} 点`);
  for (let i = 1; i < path.dense.length; i += 1) {
    const step = Math.hypot(path.dense[i][0] - path.dense[i - 1][0], path.dense[i][1] - path.dense[i - 1][1]);
    assert.ok(step > 0.1 && step <= TRACE_SAMPLE_STEP + 1, `采样间距要均匀在 ${TRACE_SAMPLE_STEP}px 上下，实测 ${step.toFixed(2)}`);
  }
  const dev = maxDeviation(path.dense, vendorCurve(c.points));
  assert.ok(dev < 1, `骨架和 vendor 曲线的最大偏离要小于一个像素，实测 ${dev.toFixed(2)}px`);
  assert.ok(dev > 0, "不是同一条折线，是逼近");
});

test("弧线描线不拍平：保留圆角走 curve()，点按 ~30px 路标取（粗细才和终态一档）", () => {
  // 拍平成 8px 折线再关圆角会走 linearPath：preserveVertices 让双描几乎重合，墨量少约 30%，
  // 收笔换成 curve() 时整条线突然变粗——就是「细的突然变粗箭头」的根因
  const c = curve("c");
  const path = strokePathOf(c);
  assert.ok(path?.way, "弧线要有路标表");
  assert.equal(path.way[0], 0);
  assert.ok(path.way.length >= 4 && path.way.length <= Math.ceil(path.len / 12) + 1, `路标别太密，实测 ${path.way.length} 个`);
  for (let i = 1; i < path.way.length; i += 1) {
    const gap = path.cum[path.way[i]] - path.cum[path.way[i - 1]];
    assert.ok(gap >= TRACE_CURVE_STRIDE - 1e-6, `路标间距要够稀疏，实测 ${gap.toFixed(1)}px`);
  }
  const f = traceFrame(c, path, 0.5);
  assert.equal(f.kind, "clip");
  assert.deepEqual(f.geom.trace, { flat: false }, "弧线描线不许关圆角：必须和终态同样走 curve()");
  assert.ok(f.geom.points.length <= path.way.length + 1, `描线点来自路标，实测 ${f.geom.points.length} 点`);
  const dev = maxDeviation(f.geom.points, vendorCurve(c.points));
  assert.ok(dev < 1, `路标前缀要落在终态曲线上，实测最大偏离 ${dev.toFixed(2)}px`);
});

test("弧线路标前缀与终态形状只差一个像素以内：收笔不会跳形", () => {
  const c = curve("c");
  const path = strokePathOf(c);
  const late = traceFrame(c, path, 0.995);
  assert.equal(late.kind, "clip");
  // 路标 + 笔尖拼出来的折线，和落定后 vendor 画的整条弧比
  const dev = maxDeviation(late.geom.points, vendorCurve(c.points));
  assert.ok(dev < 1.5, `收笔前最后一帧和终态的最大偏离实测 ${dev.toFixed(2)}px`);
});

test("两点带圆角的直箭头：描线也只喂起点 + 笔尖，和终态的 curve() 两点口径一致", () => {
  const a = { ...arrow("s"), width: 200, height: 0, roundness: { type: 2 } };
  const path = strokePathOf(a);
  assert.ok(path);
  assert.equal(path.kind, "curve", "roundness 在，终态走 curve()——两点也算");
  assert.deepEqual(path.way, [0], "两点直线没有中间路标");
  const f = traceFrame(a, path, 0.5);
  assert.equal(f.kind, "clip");
  assert.deepEqual(f.geom.points, [[0, 0], [100, 0]], "起点 + 笔尖");
  assert.deepEqual(f.geom.trace, { flat: false });
});

test("三控制点的弧：vendor 是两段三次曲线，描迹必须穿过中间那个点", () => {
  // 旧实现给三控制点只补一段三次曲线，实测和 vendor 的弧差 27px：动画画的是另一条弧
  const c = { ...arrow("c"), roundness: { type: 2 }, points: [[0, 0], [100, 50], [200, 0]] };
  const path = strokePathOf(c);
  assert.ok(path);
  assert.ok(
    path.dense.some((q) => Math.hypot(q[0] - 100, q[1] - 50) < 0.5),
    "vendor 的曲线穿过中间控制点，描迹也要穿过",
  );
  const dev = maxDeviation(path.dense, vendorCurve(c.points));
  assert.ok(dev < 1, `三控制点弧的最大偏离实测 ${dev.toFixed(2)}px`);
});

test("弧线：只追加不回改，先落下的部分一个字都不动（没有果冻感）", () => {
  const c = curve("c");
  const path = strokePathOf(c);
  const early = traceFrame(c, path, 0.45);
  const late = traceFrame(c, path, 0.8);
  assert.equal(early.kind, "clip");
  assert.equal(late.kind, "clip");
  const frozen = early.geom.points.slice(0, -1); // 去掉还在走的笔尖
  assert.ok(frozen.length >= 3);
  assert.deepEqual(late.geom.points.slice(0, frozen.length), frozen, "已画的折线点不许回改");
});

test("弧线：笔尖沿骨架走、步进均匀，不会忽快忽慢", () => {
  const c = curve("c");
  const path = strokePathOf(c);
  // 笔尖该落在骨架的哪一点（和 pointAtPath 同口径：在 dense 上按弧长线性插值）
  const tipAt = (target) => {
    let i = 1;
    while (i < path.cum.length && path.cum[i] < target) i += 1;
    if (i >= path.cum.length) return path.dense[path.dense.length - 1];
    const a = path.dense[i - 1];
    const b = path.dense[i];
    const span = path.cum[i] - path.cum[i - 1];
    const t = span > 0 ? (target - path.cum[i - 1]) / span : 0;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  };
  const tipSteps = [];
  let lastTip = null;
  for (let i = 0; i <= 40; i += 1) {
    const f = traceFrame(c, path, i / 40);
    assert.equal(f.kind, i === 0 ? "hidden" : i === 40 ? "done" : "clip");
    if (f.kind !== "clip") continue;
    const pts = f.geom.points;
    const tip = pts[pts.length - 1];
    const want = tipAt(path.len * (i / 40));
    const miss = Math.hypot(tip[0] - want[0], tip[1] - want[1]);
    assert.ok(miss < 1e-6, `p=${i / 40} 笔尖没走到该到的位置，差 ${miss.toFixed(3)}px`);
    if (lastTip) {
      const d = Math.hypot(tip[0] - lastTip[0], tip[1] - lastTip[1]);
      if (d > 1e-6) tipSteps.push(d);
    }
    lastTip = tip;
  }
  const avg = tipSteps.reduce((a, b) => a + b, 0) / tipSteps.length;
  const worst = Math.max(...tipSteps);
  assert.ok(worst < avg * 1.6, `笔尖步进忽快忽慢：平均 ${avg.toFixed(2)}，最大 ${worst.toFixed(2)}`);
});

test("虚线/点线：弧线描线照样保留圆角走 curve()，虚线不会被每段重置成实线", () => {
  const dashed = { ...curve("d"), strokeStyle: "dashed" };
  const f = traceFrame(dashed, strokePathOf(dashed), 0.5);
  assert.equal(f.kind, "clip");
  assert.deepEqual(f.geom.trace, { flat: false }, "非实线不许关圆角：linearPath 每段都是新子路径");
});

test("描线帧的宽高用终态尺寸：别让 vendor 按小框把粗糙度降档", () => {
  // adjustRoughness：线性元素 maxSize<50 时粗糙度砍半/三分之一。描线时把 width/height
  // 缩成「已画部分的包围盒」，线条画到中段会从细突然变粗一下——也是「衔接不上」的一档
  const c = curve("c");
  const path = strokePathOf(c);
  const early = traceFrame(c, path, 0.08);
  assert.equal(early.kind, "clip");
  assert.deepEqual(early.geom.points.length, 2, "刚起步只有起点和笔尖");
  assert.equal(early.geom.width, c.width, "宽高保持终态，不随前缀缩水");
  assert.equal(early.geom.height, c.height);
  assert.equal(early.geom.swap, false);
});

test("效果注册：箭头/连线默认就是划线，文本/图片/形状不会被抢走", () => {
  assert.ok(EFFECT_IDS.includes("draw"));
  assert.equal(EFFECT_LABELS.draw, "划线");
  assert.equal(EFFECTS.draw.ms, 760, "比其余四档长一点，是手刷一下的节奏");
  assert.equal(EFFECTS.draw.dx, 0, "划线不挪位置");
  assert.equal(EFFECTS.draw.dy, 0);
  assert.deepEqual(EFFECTS.draw.cubic, [0.3, 0.02, 0.14, 1], "起步轻、收尾长，才像顺着手背滑出去");
  assert.equal(defaultEffect("arrow"), "draw", "箭头默认画出来");
  assert.equal(defaultEffect("line"), "draw", "连线默认也画出来");
  assert.equal(defaultEffect("rectangle"), "draw", "矩形默认荧光笔划线");
  assert.equal(defaultEffect("ellipse"), "draw");
  assert.equal(defaultEffect("diamond"), "draw");
  for (const type of ["text", "image", "freedraw"]) {
    assert.notEqual(defaultEffect(type), "draw", `${type} 的自动档不许是划线`);
  }
});

test("抽屉的行要能看出「这条画得出来」：填充折线/矩形/箭头 true，纯文字 false", () => {
  const rows = motionRows(
    [
      ribbon("hl"),
      { id: "box", type: "rectangle", x: 0, y: 0, width: 80, height: 40 },
      { id: "txt", type: "text", x: 0, y: 200, width: 80, height: 20, text: "标题" },
      arrow("ar"),
      { ...arrow("elbow"), elbowed: true },
    ],
    [
      { key: "e:hl", ids: ["hl"] },
      { key: "e:box", ids: ["box"] },
      { key: "e:txt", ids: ["txt"] },
      { key: "e:ar", ids: ["ar"] },
      { key: "e:elbow", ids: ["elbow"] },
    ],
  );
  assert.deepEqual(rows.map((r) => r.drawable), [true, true, false, true, true], "直角路由箭头也能画");
});

test("现场：几何补丁 NEVER、按快照回填；有面走清洗扫、细笔画走描线", () => {
  const at = APP.indexOf("const applyDrawPatches");
  assert.ok(at > 0, "要有独立的几何补丁函数（不能塞进坐标补丁里）");
  const body = APP.slice(at, APP.indexOf("const motionRef", at));
  assert.match(body, /captureUpdate: CaptureUpdateAction\.NEVER/, "放映补丁不进撤销栈");
  assert.match(body, /const next: Record<string, unknown> = \{/, "补丁要能增删字段（形状换形）");
  assert.match(body, /if \(p\.points\) next\.points = p\.points;/, "折线/箭头才写 points，形状还原时不塞空数组");
  assert.match(
    body,
    /if \(p\.swap\) \{[\s\S]{0,220}next\.type = "line";[\s\S]{0,220}next\.polygon = true;[\s\S]{0,220}next\.roundness = null;/,
    "擦的时候临时换成多边形折线；带 roundness 的 line 会走曲线，圆角必须关掉",
  );
  assert.match(
    body,
    /\} else if \(p\.restore\) \{[\s\S]{0,260}delete next\.points;[\s\S]{0,200}next\.type = p\.restore\.type;/,
    "收笔/中断写回原来的类型，并把临时折线点删干净（折线/箭头留着）",
  );
  assert.match(
    APP,
    /function restorePatchOf[\s\S]{0,700}startArrowhead: el\.startArrowhead,[\s\S]{0,200}endArrowhead: el\.endArrowhead,/,
    "描线期间关掉的箭头尖/肘形路由也要进快照",
  );
  assert.match(body, /if \(p\.trace\.flat\) next\.roundness = null;/, "折线口径的实线才关圆角；弧线保留圆角走 curve()，粗细和终态一档");
  assert.match(
    body,
    /if \(p\.trace\) \{[\s\S]{0,240}next\.elbowed = false;[\s\S]{0,120}next\.startArrowhead = null;[\s\S]{0,80}next\.endArrowhead = null;/,
    "描线中必须关掉箭头尖与肘形路由（否则 vendor 缩尖、按移动笔尖重算圆角）",
  );
  assert.match(body, /next\.elbowed = p\.restore\.elbowed;/, "收笔写回肘形路由");
  assert.match(body, /next\.endArrowhead = p\.restore\.endArrowhead;/, "收笔写回箭头尖");

  const motion = APP.slice(APP.indexOf("const motionRef"), APP.indexOf("const presentApply"));
  assert.match(motion, /const path = strokePathOf\(e\);/, "开跑前把每条箭头的路径表算好");
  assert.match(motion, /ink\.set\(id, \{/, "终态 rough 操作流能复刻的进覆盖层");
  assert.match(motion, /trace\.set\(id, path\);/, "复刻不了的（填充面等）仍走几何重渲染");
  assert.match(motion, /isDrawableElement\(b\.el\) && box/, "有可裁的面才走前沿清洗扫");
  assert.match(motion, /drawFrame\(b\.el, box, p\.o, want\)/, "进度 + 该显示的透明度一起喂给几何层");
  assert.match(motion, /traceFrame\(b\.el, run\.trace\.get\(id\) as StrokePath, p\.o\)/, "箭头/连线沿路径长出来");
  assert.match(
    motion,
    /const painted = run\.ink\.get\(id\);[\s\S]{0,900}inkRef\.current\?\.reveal\(id, p\.o\)/,
    "走覆盖层的元素只推遮罩，画布里的那份保持透明",
  );
  assert.match(motion, /if \(!f\) \{[\s\S]{0,400}Math\.round\(want \* p\.o\)/, "没有几何的成员（绑定文字）回落淡入");
  assert.match(motion, /if \(!run\.hidden\.has\(id\)\)/, "藏起来的只写一次，不每帧重画");
  assert.match(motion, /if \(!run\.settled\.has\(id\)\)/, "收笔后落回原几何，只写一次");

  const finish = APP.slice(APP.indexOf("const finishMotion"), APP.indexOf("const startMotion"));
  assert.match(finish, /restorePatchOf\(b\.el, want\)/, "中断也按快照还原：折线/箭头回 points、形状回类型");
  assert.match(finish, /isDrawableElement\(b\.el\) \|\| isTraceableStroke\(b\.el\)/, "描了一半的箭头也要还原");
  assert.match(APP, /points: linear \? el\.points \?\? \[\] : undefined/, "折线/箭头回填原始点集；形状不带 points");
  assert.match(APP, /applyDrawPatches\(finalGeo\);/, "收尾同样落原几何");
});

test("抽屉：只给画得开的条显示「划线」，菜单高度按六项留位", () => {
  assert.match(DRAWER, /if \(id === "draw" && !fxRow\.drawable\) return null;/, "文字/图片/直角路由那几条不显示这一档");
  assert.match(DRAWER, /const menuH = 384;/, "菜单多了「以后这类默认」，贴底时整块还要露出来");
  assert.match(DRAWER, /draw: "顺着它自己的形状画出来/, "菜单副行说人话");
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

test("「合」可撤销、多条的组能「拆」：快照还原优先，其它重排清历史", () => {
  assert.match(DRAWER, /const undoMerge = /, "撤销入口");
  assert.match(DRAWER, /mergeToast\.before/, "撤销回到合并前那张组表");
  assert.match(DRAWER, /aria-label=\{t\("拆回独立步"\)\}/, "组头有「拆」");
  assert.match(DRAWER, /lastIndexOf\(groupSignature\(g\)\)/, "合并出来的组按快照还原，不过度拆碎");
  assert.match(DRAWER, /splitOrderGroup\(groups, index\)/, "本来就在一组的几条拆成各自一步");
  assert.match(DRAWER, /window\.setTimeout\(\(\) => setMergeToast\(null\), 6000\)/, "提示条是一次性的，不常驻");
  const drops = DRAWER.split("clearMergeHistory();").length - 1;
  assert.ok(drops >= 4, `拖动/↑↓/固定顺序都要清历史，实测 ${drops} 处`);
});

test("i18n：划线名与说明双语齐备", () => {
  const zh = json("i18n/zh_CN.json");
  const en = json("i18n/en_US.json");
  for (const k of ["划线", "顺着它自己的形状画出来，适合图形、高亮、笔刷和箭头连线。"]) {
    assert.equal(zh[k], k, `zh 缺词条：${k}`);
    assert.ok(typeof en[k] === "string" && en[k] !== k, `en 缺词条：${k}`);
  }
});

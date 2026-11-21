/**
 * 第九十二轮：描线不再跳粗细——覆盖层按终态 rough 操作流重画。
 *
 * 断言：
 * ① 选项同源：同 seed 下 inkShapeOf 产出的 path 必须与直接调 roughjs（照着
 *    vendor generateRoughOptions 的口径）逐字相同；虚线的节奏、非实线 +0.5、
 *    小包围盒降档都要对上；
 * ② 几何同源：端点被 preserveVertices 钉住，肘形走 vendor 的 Q 路由；
 * ③ 遮罩前缀沿骨架单调推进；收笔进度恰好落终态；
 * ④ 接线：画布元素压黑、只推遮罩、收笔撤层；深色滤镜与层序在 CSS 里。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import rough from "roughjs";
import { elbowPathData, strokePathOf, traceRevealPoints } from "../src/studio/presentation-draw.ts";
import { inkShapeOf } from "../src/studio/presentation-ink.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = (rel) => readFileSync(resolve(ROOT, "src/" + rel), "utf8");
const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));

const gen = rough.generator();

const arrow = (over = {}) => ({
  id: "a1",
  type: "arrow",
  x: 0,
  y: 0,
  width: 153.1,
  height: 44.8,
  points: [
    [0, 0],
    [54.1, -44.8],
    [153.1, -44.8],
  ],
  roundness: { type: 2 },
  seed: 372631415,
  strokeColor: "#1e1e1e",
  strokeWidth: 2,
  roughness: 1,
  strokeStyle: "solid",
  backgroundColor: "transparent",
  elbowed: false,
  ...over,
});

/** 测试侧按 vendor 公式独立组一份选项（不 import 被测模块的私有函数） */
function vendorOptions(el, continuous = false) {
  const w = el.width;
  const h = el.height;
  const maxSize = Math.max(w, h);
  const minSize = Math.min(w, h);
  const linear = el.type === "arrow" || el.type === "line";
  const keep =
    (minSize >= 20 && maxSize >= 50) || (linear && maxSize >= 50);
  const roughness = keep ? el.roughness : Math.min(el.roughness / (maxSize < 10 ? 3 : 2), 2.5);
  const solid = el.strokeStyle === "solid";
  return {
    seed: el.seed,
    stroke: el.strokeColor,
    strokeWidth: solid ? el.strokeWidth : el.strokeWidth + 0.5,
    roughness,
    preserveVertices: continuous || el.roughness < 2,
    disableMultiStroke: !solid,
    strokeLineDash:
      el.strokeStyle === "dashed"
        ? [8, 8 + el.strokeWidth]
        : el.strokeStyle === "dotted"
          ? [1.5, 6 + el.strokeWidth]
          : undefined,
    fillWeight: el.strokeWidth / 2,
    hachureGap: el.strokeWidth * 4,
  };
}

function dsOf(drawable) {
  return drawable.sets
    .filter((s) => s.type === "path")
    .map((s) => gen.opsToPath(s));
}

test("弧线：覆盖层与画布终态逐字同一份 rough 操作流（两个抖动刀口都在）", () => {
  const el = arrow();
  const shape = inkShapeOf(el);
  assert.ok(shape);
  const want = dsOf(gen.curve(el.points, vendorOptions(el)));
  assert.equal(shape.strokes.length, want.length);
  assert.deepEqual(
    shape.strokes.map((s) => s.d),
    want,
  );
  // roughjs 把两遍刀放在同一条 path 里（两个子路径）；这里数 M 的个数
  assert.equal((shape.strokes[0].d.match(/M/g) || []).length, 2, "实线是双描，两遍刀都要在");
  for (const s of shape.strokes) {
    assert.equal(s.stroke, "#1e1e1e");
    assert.equal(s.width, 2);
    assert.equal(s.dash, undefined);
  }
  assert.equal(shape.band, 7);
});

test("直线：无圆角走 linearPath 口径", () => {
  const el = arrow({ roundness: null, points: [[0, 0], [120, 0]], height: 0 });
  const shape = inkShapeOf(el);
  assert.ok(shape);
  const want = dsOf(gen.linearPath(el.points, vendorOptions(el)));
  assert.deepEqual(
    shape.strokes.map((s) => s.d),
    want,
  );
});

test("虚线/点线：节奏与 +0.5 笔宽照 vendor；单描", () => {
  const dash = inkShapeOf(arrow({ strokeStyle: "dashed" }));
  assert.ok(dash);
  assert.equal(dash.strokes.length, 1);
  assert.equal(dash.strokes[0].width, 2.5);
  assert.equal(dash.strokes[0].dash, "8 10");
  assert.deepEqual(
    dash.strokes.map((s) => s.d),
    dsOf(gen.curve(arrow({ strokeStyle: "dashed" }).points, vendorOptions(arrow({ strokeStyle: "dashed" })))),
  );

  const dot = inkShapeOf(arrow({ strokeStyle: "dotted", strokeWidth: 4 }));
  assert.ok(dot);
  assert.equal(dot.strokes[0].width, 4.5);
  assert.equal(dot.strokes[0].dash, "1.5 10");
});

test("小包围盒按 vendor 降档：短箭头的粗糙度必须跟着终态框走", () => {
  const short = arrow({
    width: 30,
    height: 10,
    points: [
      [0, 0],
      [30, 10],
    ],
    roundness: null,
  });
  const shape = inkShapeOf(short);
  assert.ok(shape);
  const want = vendorOptions(short);
  assert.equal(want.roughness, 0.5);
  assert.deepEqual(
    shape.strokes.map((s) => s.d),
    dsOf(gen.linearPath(short.points, want)),
  );
});

test("端点落位：抖动只在小半径内，起止点贴元素首尾", () => {
  const el = arrow();
  const shape = inkShapeOf(el);
  assert.ok(shape);
  for (const s of shape.strokes) {
    const m = s.d.match(/^M\s*(-?[\d.]+)\s+(-?[\d.]+)/);
    assert.ok(m, "path 以 move 开头");
    assert.ok(Math.hypot(Number(m[1]), Number(m[2])) < 3);
    const nums = s.d.match(/-?[\d.]+/g).map(Number);
    assert.ok(Math.hypot(nums[nums.length - 2] - 153.1, nums[nums.length - 1] + 44.8) < 3);
  }
});

test("肘形：走 vendor 的 Q 路由，首尾精确", () => {
  const el = arrow({
    elbowed: true,
    roundness: null,
    width: 160,
    height: 80,
    points: [
      [0, 0],
      [80, 0],
      [80, 80],
      [160, 80],
    ],
  });
  const shape = inkShapeOf(el);
  assert.ok(shape);
  // vendor 对肘形走 generator.path(vendor 路由字符串, preserveVertices)：
  // roughjs 把 Q 采样成 bcurveTo，这里必须与同一条路径逐字相同
  const want = dsOf(gen.path(elbowPathData(el.points), vendorOptions(el, true)));
  assert.deepEqual(
    shape.strokes.map((s) => s.d),
    want,
  );
  assert.equal(shape.strokes.length, 1);
  const nums = shape.strokes[0].d.match(/-?[\d.]+/g).map(Number);
  assert.ok(Math.hypot(nums[nums.length - 2] - 160, nums[nums.length - 1] - 80) < 3);
});

test("复刻不了的口径回落旧描线：有填充面的 line / 非折线元素 / 旋转过的旧数据", () => {
  assert.equal(inkShapeOf(arrow({ type: "line", backgroundColor: "#ffc9c9" })), null);
  assert.equal(inkShapeOf({ ...arrow(), type: "rectangle" }), null);
  assert.equal(inkShapeOf(arrow({ points: [[0, 0]] })), null);
  assert.equal(inkShapeOf(arrow({ angle: 0.3 })), null);
});

test("遮罩前缀：单调沿骨架推进，收笔落终态", () => {
  const el = arrow();
  const path = strokePathOf(el);
  assert.ok(path);
  assert.deepEqual(traceRevealPoints(path, 0), []);
  const mid = traceRevealPoints(path, 0.5);
  assert.deepEqual(mid[0], path.dense[0]);
  let last = -1;
  for (const p of mid) {
    // 逐点单调前进：每一点都在上一点之后（前缀不会回头）
    const i = path.dense.findIndex((q) => q[0] === p[0] && q[1] === p[1]);
    if (i >= 0) {
      assert.ok(i > last);
      last = i;
    }
  }
  const end = traceRevealPoints(path, 1);
  const tip = end[end.length - 1];
  const final = path.dense[path.dense.length - 1];
  assert.ok(Math.hypot(tip[0] - final[0], tip[1] - final[1]) < 1e-6);
});

test("接线：画布压黑、只推遮罩、收笔撤层；无覆盖层才走旧 traceFrame", () => {
  const app = src("studio/StudioApp.tsx");
  assert.match(app, /inkShapeOf\(e as unknown as InkElementLike\)/);
  assert.match(app, /inkRef\.current\?\.begin\(/);
  assert.match(app, /inkRef\.current\?\.reveal\(id, p\.o\)/);
  assert.match(app, /inkRef\.current\?\.end\(id\)/);
  assert.match(app, /inkRef\.current\?\.clear\(\)/);
  assert.match(app, /<InkOverlay ref=\{inkRef\} api=\{api\} \/>/);
  // 覆盖层元素在画布里保持透明：几何一律不写（落定才 restore 回 opacity）
  assert.match(app, /run\.hidden\.add\(id\);\s*out\.push\(\{ id, x: b\.x, y: b\.y, opacity: 0 \}\);/);
});

test("样式与依赖：覆盖层在幕布之下、深色同款反色、roughjs 进正式依赖", () => {
  const css = src("index.css");
  assert.match(css, /\.exs-canvas \.exs-ink-layer \{[\s\S]*?z-index: 4;/);
  assert.match(css, /\.exs-canvas \.exs-ink-svg \{/);
  assert.match(css, /\.exs-root\[data-theme-mode="dark"\] \.exs-ink-layer \{[^}]*invert\(93%\) hue-rotate\(180deg\)/);
  assert.equal(pkg.dependencies.roughjs, "^4.6.4");
});

test("覆盖层的路径序列化与 roughjs 逐字一致（含节数）", () => {
  const el = arrow();
  const shape = inkShapeOf(el);
  const drawable = gen.curve(el.points, vendorOptions(el));
  const info = gen.toPaths(drawable).filter((p) => p.stroke !== "none");
  assert.equal(shape.strokes.length, info.length);
  for (let i = 0; i < info.length; i += 1) {
    assert.equal(shape.strokes[i].d, info[i].d);
    assert.equal(shape.strokes[i].stroke, info[i].stroke);
    assert.equal(shape.strokes[i].width, info[i].strokeWidth);
  }
});

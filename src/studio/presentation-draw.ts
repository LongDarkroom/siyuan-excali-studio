/**
 * 第八十六轮：第五档效果「划线」的纯几何层。
 *
 * 素材库里拖出来的高亮不是一条笔画，而是一叠**填充折线**（演示板那一组就有 54 片，
 * 透明度 28/45/60/100 逐层叠出来）。所以「按它的形状画出来」不能按笔尖逐点走——填充
 * 多边形没有笔顺。这里的做法是：**沿它的长轴推一条带弧度的前沿，把多边形按帧裁掉前沿
 * 右边那块**，低透明度层晚半步收笔，于是前沿是一片渐层软边而不是一刀切。
 *
 * 前沿是「x ≤ f(y)」这种下凸区域（f 是凹函数，区域因此是凸的），
 * 用 8 条半平面近似它就够：Sutherland–Hodgman 只会向外多留一丝丝，肉眼看不出。
 * 一次只裁 10 条边、只算到前沿附近的那几片，其余靠包围盒快速跳过。
 *
 * 第八十八轮：矩形/椭圆/菱形没有折线，就先在**元素自己的坐标系**里按 vendor 的同一套
 * 公式画一圈轮廓（圆角半径、菱形顶点、椭圆采样），裁完打上 `swap`：现场把这一帧临时
 * 写成等价的多边形折线，收笔再换回来。轮廓点和折线点落在同一个坐标系，后续裁剪不用分叉。
 * 两条 vendor 硬约束：① 折线要有填充必须首尾闭合（isPathALoop 距离 ≤ 8），裁完得把起点
 * 补回末尾；② 带 roundness 的 line 走的是 curve，换形时圆角必须置空、polygon 置 true。
 *
 * 纯逻辑：不 import React / 思源 / vendor，也不 import 兄弟模块——放映现场自己接线。
 */

/** 前沿折线分几段：8 段已经看不出折角，再多只是白算 */
export const DRAW_SEGMENTS = 8;
/** 前沿的倾斜（每单位垂直距离横移多少）：顶端先走，读出「手腕一扫」 */
export const DRAW_TILT = 0.06;
/** 前沿中段前凸的比例（占厚度）：带一点弧度，才不像直刀 */
export const DRAW_BULGE = 0.03;
/** 低透明度层落后多少（占长轴 span）：叠出渐层软边，不是一刀切 */
export const DRAW_LAG = 0.012;

/** 一段圆角弧切成几刀：二次曲线 6 段已经看不出折角 */
const CORNER_SAMPLES = 6;
/** 椭圆采样多少点：48 点周长误差不到 0.1px，够粗也够圆 */
const ELLIPSE_SAMPLES = 48;
/** vendor 的圆角口径（getCornerRadius）：比例档 0.25×短边，自适应档封顶 32 */
const PROPORTIONAL_RADIUS = 0.25;
const ADAPTIVE_RADIUS = 32;

const EPS = 1e-6;

export type DrawPoint = readonly [number, number];

/** vendor 的圆角对象（type 1 旧版 / 2 比例 / 3 自适应，结构兼容即可） */
export type DrawRoundness = { type?: number; value?: number | null };

/** 本模块要用的字段（vendor 元素结构上都能满足，node 侧也能喂假对象） */
export type DrawElementLike = {
  id: string;
  type?: string;
  isDeleted?: boolean;
  x: number;
  y: number;
  width?: number;
  height?: number;
  angle?: number;
  points?: readonly DrawPoint[];
  backgroundColor?: string;
  opacity?: number;
  /** 形状的圆角：轮廓要按 vendor 的半径口径生成，否则擦出来的圆角和原图对不上 */
  roundness?: DrawRoundness | null;
};

export type DrawBox = { x: number; y: number; w: number; h: number };

/** 裁剪后的几何：x/y 不动（折线坐标相对元素原点），宽高收到裁剪后的包围盒 */
export type DrawGeom = {
  x: number;
  y: number;
  width: number;
  height: number;
  points: [number, number][];
  /** true = 这是形状临时换成的折线，现场要连 type/polygon/roundness 一起写 */
  swap: boolean;
};

/**
 * 一帧的状态：
 * - `hidden` = 前沿还没到，整块不可见；
 * - `done` = 前沿已经过去，原样显示（不必再写几何）；
 * - `clip` = 正在擦，给出裁过的多边形。
 */
export type DrawFrame = { kind: "hidden" } | { kind: "done" } | { kind: "clip"; geom: DrawGeom };

/**
 * 什么算「能划开」：带填充的折线，或够大的矩形/椭圆/菱形。
 *
 * 素材库高亮/笔刷/描迹都是 `line` + 非透明背景色；普通连线、箭头（透明填充）不算——
 * 它们被擦到一半会断成半截，留着走滑入更稳（菜单里也不给这一档）。
 * 第八十八轮：三种形状没有折线可裁，但轮廓能从宽高算出来——现场把轮廓临时写成折线，
 * 擦完再换回形状。形状不看填充：只描边的框也有轮廓可擦，照着边框扫出来一样好看。
 */
export function isDrawableElement(e: DrawElementLike): boolean {
  if (e.isDeleted) return false;
  if (e.type === "rectangle" || e.type === "ellipse" || e.type === "diamond") {
    return (e.width ?? 0) > 1 && (e.height ?? 0) > 1;
  }
  if (e.type !== "line") return false;
  if (!e.points || e.points.length < 3) return false;
  const bg = e.backgroundColor;
  return typeof bg === "string" && bg !== "" && bg !== "transparent";
}

export function drawableOf(list: readonly DrawElementLike[]): DrawElementLike[] {
  return list.filter(isDrawableElement);
}

/** 一条里可划部分的外接框（场景坐标，旋转元素取旋转后的外接）；没有可划的就 null */
export function drawBoxOf(list: readonly DrawElementLike[]): DrawBox | null {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const e of list) {
    if (!isDrawableElement(e)) continue;
    // 旋转过的元素：按转完之后的真实占位算，否则前沿扫不到它伸出来的那半截
    const b = sceneBounds(e);
    x0 = Math.min(x0, b.x0);
    y0 = Math.min(y0, b.y0);
    x1 = Math.max(x1, b.x1);
    y1 = Math.max(y1, b.y1);
  }
  if (!Number.isFinite(x0)) return null;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/** 有向面积两倍：判断点在边界哪一侧（旋转/平移不改变符号，所以局部坐标里照用） */
function cross(ax: number, ay: number, bx: number, by: number, px: number, py: number): number {
  return (bx - ax) * (py - ay) - (by - ay) * (px - ax);
}

function intersect(
  prev: readonly number[],
  cur: readonly number[],
  ax: number,
  ay: number,
  bx: number,
  by: number,
): [number, number] {
  const dx = cur[0] - prev[0];
  const dy = cur[1] - prev[1];
  const ex = bx - ax;
  const ey = by - ay;
  const den = dx * ey - dy * ex;
  if (Math.abs(den) < 1e-12) return [cur[0], cur[1]];
  const t = ((ax - prev[0]) * ey - (ay - prev[1]) * ex) / den;
  return [prev[0] + dx * t, prev[1] + dy * t];
}

/** 半平面裁剪（Sutherland–Hodgman）：`sign` 让「前沿身后」那一侧算内侧 */
function clipHalf(
  poly: readonly (readonly [number, number])[],
  ax: number,
  ay: number,
  bx: number,
  by: number,
  sign: number,
): { poly: [number, number][]; cut: boolean } {
  const out: [number, number][] = [];
  let cut = false;
  for (let i = 0; i < poly.length; i += 1) {
    const cur = poly[i];
    const prev = poly[(i + poly.length - 1) % poly.length];
    const ci = cross(ax, ay, bx, by, cur[0], cur[1]) * sign >= -EPS;
    const pi = cross(ax, ay, bx, by, prev[0], prev[1]) * sign >= -EPS;
    if (ci) {
      if (!pi) {
        out.push(intersect(prev, cur, ax, ay, bx, by));
        cut = true;
      }
      out.push([cur[0], cur[1]]);
    } else if (pi) {
      out.push(intersect(prev, cur, ax, ay, bx, by));
      cut = true;
    }
  }
  return { poly: out, cut };
}

/** 元素旋转后的场景包围盒（宽高在 vendor 里是未旋转的外接尺寸） */
function sceneBounds(e: DrawElementLike): { x0: number; y0: number; x1: number; y1: number } {
  const w = e.width ?? 0;
  const h = e.height ?? 0;
  const a = e.angle ?? 0;
  if (!a) return { x0: e.x, y0: e.y, x1: e.x + w, y1: e.y + h };
  const cx = e.x + w / 2;
  const cy = e.y + h / 2;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [dx, dy] of [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ]) {
    const sx = cx + dx * cos - dy * sin;
    const sy = cy + dx * sin + dy * cos;
    x0 = Math.min(x0, sx);
    y0 = Math.min(y0, sy);
    x1 = Math.max(x1, sx);
    y1 = Math.max(y1, sy);
  }
  return { x0, y0, x1, y1 };
}

/** vendor 的圆角半径口径：比例/旧版 = 0.25×，自适应 = min(0.25×, value ?? 32) */
function cornerRadius(size: number, roundness?: DrawRoundness | null): number {
  if (!roundness) return 0;
  if (roundness.type === 1 || roundness.type === 2) return size * PROPORTIONAL_RADIUS;
  if (roundness.type === 3) {
    const fixed = typeof roundness.value === "number" ? roundness.value : ADAPTIVE_RADIUS;
    return size <= fixed / PROPORTIONAL_RADIUS ? size * PROPORTIONAL_RADIUS : fixed;
  }
  return 0;
}

/** 二次贝塞尔采样（不含起点、含终点）：vendor 的圆角就是「两端各退 r、控制点在顶点」的 Q */
function quadTo(
  a: DrawPoint,
  c: DrawPoint,
  b: DrawPoint,
  out: [number, number][],
): void {
  for (let i = 1; i <= CORNER_SAMPLES; i += 1) {
    const t = i / CORNER_SAMPLES;
    const u = 1 - t;
    out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
  }
}

/** 矩形轮廓：圆角按 vendor 的 getCornerRadius，直角就是四个顶点（闭合由 polygon 自己连） */
function rectOutline(w: number, h: number, roundness?: DrawRoundness | null): [number, number][] {
  const r = cornerRadius(Math.min(w, h), roundness);
  if (!(r > 0.5)) {
    return [
      [0, 0],
      [w, 0],
      [w, h],
      [0, h],
    ];
  }
  const pts: [number, number][] = [
    [r, 0],
    [w - r, 0],
  ];
  quadTo([w - r, 0], [w, 0], [w, r], pts);
  pts.push([w, h - r]);
  quadTo([w, h - r], [w, h], [w - r, h], pts);
  pts.push([r, h]);
  quadTo([r, h], [0, h], [0, h - r], pts);
  pts.push([0, r]);
  quadTo([0, r], [0, 0], [r, 0], pts);
  pts.pop(); // 最后一点落回起点，闭合边自己连
  return pts;
}

/** 菱形轮廓：顶点公式照 vendor 的 getDiamondPoints；圆角是四角内退的二次弧 */
function diamondOutline(w: number, h: number, roundness?: DrawRoundness | null): [number, number][] {
  const topX = Math.floor(w / 2) + 1;
  const topY = 0;
  const rightX = w;
  const rightY = Math.floor(h / 2) + 1;
  const bottomX = topX;
  const bottomY = h;
  const leftX = 0;
  const leftY = rightY;
  // vendor 的命名就这么拧：verticalRadius 是横向退让，horizontalRadius 是纵向退让
  const vr = cornerRadius(Math.abs(topX - leftX), roundness);
  const hr = cornerRadius(Math.abs(rightY - topY), roundness);
  if (!(vr > 0.5) || !(hr > 0.5)) {
    return [
      [topX, topY],
      [rightX, rightY],
      [bottomX, bottomY],
      [leftX, leftY],
    ];
  }
  const pts: [number, number][] = [
    [topX + vr, topY + hr],
    [rightX - vr, rightY - hr],
  ];
  quadTo([rightX - vr, rightY - hr], [rightX, rightY], [rightX - vr, rightY + hr], pts);
  pts.push([bottomX + vr, bottomY - hr]);
  quadTo([bottomX + vr, bottomY - hr], [bottomX, bottomY], [bottomX - vr, bottomY - hr], pts);
  pts.push([leftX + vr, leftY + hr]);
  quadTo([leftX + vr, leftY + hr], [leftX, leftY], [leftX + vr, leftY - hr], pts);
  pts.push([topX - vr, topY + hr]);
  quadTo([topX - vr, topY + hr], [topX, topY], [topX + vr, topY + hr], pts);
  pts.pop();
  return pts;
}

/** 椭圆轮廓：一圈等角采样，落在元素自己的 [0,w]×[0,h] 里 */
function ellipseOutline(w: number, h: number): [number, number][] {
  const rx = w / 2;
  const ry = h / 2;
  const pts: [number, number][] = [];
  for (let i = 0; i < ELLIPSE_SAMPLES; i += 1) {
    const a = (Math.PI * 2 * i) / ELLIPSE_SAMPLES;
    pts.push([rx + rx * Math.cos(a), ry + ry * Math.sin(a)]);
  }
  return pts;
}

/** 形状 → 自身坐标系里的轮廓；折线元素返回 null（它本来就有 points） */
function shapeOutline(el: DrawElementLike): [number, number][] | null {
  const w = el.width ?? 0;
  const h = el.height ?? 0;
  if (!(w > 1) || !(h > 1)) return null;
  if (el.type === "rectangle") return rectOutline(w, h, el.roundness);
  if (el.type === "diamond") return diamondOutline(w, h, el.roundness);
  if (el.type === "ellipse") return ellipseOutline(w, h);
  return null;
}

/**
 * 某一帧怎么画。`p` 是 0..1 的进度（曲线已经算好），`box` 是这一条可划部分的外接框。
 * `opacity` 是这一条**该显示的**透明度（缺省读元素自己的）——放映时元素的现场 opacity
 * 可能还是 0（刚被藏过），用它算渐层软边会让整组晚半拍。
 *
 * 竖向的长条会自动改成从上往下擦：横着扫一根竖高亮不像在写字，像在刮。
 */
export function drawFrame(el: DrawElementLike, box: DrawBox, p: number, opacity?: number): DrawFrame {
  if (!isDrawableElement(el) || !(box.w > 0) || !(box.h > 0)) return { kind: "done" };
  const prog = p <= 0 ? 0 : p >= 1 ? 1 : p;
  const vertical = box.h > box.w;
  const lo = vertical ? box.y : box.x;
  const span = vertical ? box.h : box.w;
  const perpLo = vertical ? box.x : box.y;
  const thick = vertical ? box.w : box.h;
  const margin = span * 0.02 + 6;
  const o = typeof opacity === "number" ? opacity : typeof el.opacity === "number" ? el.opacity : 100;
  const op = Math.min(100, Math.max(0, o));
  // 低透明度那几层晚半步收笔 → 前沿是渐层软边
  const F = lo - margin + (span + margin * 2) * prog - (1 - op / 100) * span * DRAW_LAG;

  const mid = perpLo + thick / 2;
  const half = thick > 0 ? thick / 2 : 1;
  const slope = vertical ? DRAW_TILT : -DRAW_TILT;
  const front = (c: number): number => {
    const u = (c - mid) / half;
    return F + slope * (c - mid) + DRAW_BULGE * thick * (1 - u * u);
  };

  const b = sceneBounds(el);
  const sweepMin = vertical ? b.y0 : b.x0;
  const sweepMax = vertical ? b.y1 : b.x1;
  const lean = Math.abs(slope) * thick;
  const bulge = DRAW_BULGE * thick;
  // 快速跳过：整块在前沿身后（done）或前头（hidden），不用逐边裁。
  // 可划元素一定落在 box 里，所以垂直于长轴那一维不必再判。
  if (sweepMax < F - lean - EPS) return { kind: "done" };
  if (sweepMin > F + lean + bulge + EPS) return { kind: "hidden" };

  // 前沿折线（场景坐标）+ 一个「身后」参考点：旋转/平移不改有向面积符号，所以局部照用
  const c0 = perpLo - margin;
  const c1 = perpLo + thick + margin;
  const segs: { ax: number; ay: number; bx: number; by: number }[] = [];
  for (let i = 0; i < DRAW_SEGMENTS; i += 1) {
    const ca = c0 + ((c1 - c0) * i) / DRAW_SEGMENTS;
    const cb = c0 + ((c1 - c0) * (i + 1)) / DRAW_SEGMENTS;
    const fa = front(ca);
    const fb = front(cb);
    segs.push(vertical ? { ax: ca, ay: fa, bx: cb, by: fb } : { ax: fa, ay: ca, bx: fb, by: cb });
  }
  const refX = vertical ? mid : lo - span;
  const refY = vertical ? lo - span : mid;

  const angle = el.angle ?? 0;
  const cx = (el.width ?? 0) / 2;
  const cy = (el.height ?? 0) / 2;
  const cos = Math.cos(-angle);
  const sin = Math.sin(-angle);
  const toLocal = (sx: number, sy: number): [number, number] => {
    const dx = sx - el.x - cx;
    const dy = sy - el.y - cy;
    return [dx * cos - dy * sin + cx, dx * sin + dy * cos + cy];
  };
  const [rx, ry] = toLocal(refX, refY);

  // 形状才需要临时换折线；轮廓和折线都在元素自己的坐标系里，后面的裁剪完全同一套
  const swap = el.type !== "line";
  const outline = swap
    ? shapeOutline(el)
    : ((el.points ?? []) as readonly DrawPoint[]).map((q): [number, number] => [q[0], q[1]]);
  if (!outline) return { kind: "done" };
  let poly: [number, number][] = outline;
  let cut = false;
  for (const s of segs) {
    const [ax, ay] = toLocal(s.ax, s.ay);
    const [bx, by] = toLocal(s.bx, s.by);
    const sign = cross(ax, ay, bx, by, rx, ry) >= 0 ? 1 : -1;
    const r = clipHalf(poly, ax, ay, bx, by, sign);
    poly = r.poly;
    cut = cut || r.cut;
    if (poly.length === 0) return { kind: "hidden" };
  }
  if (!cut) return { kind: "done" };
  if (poly.length < 3) return { kind: "hidden" };

  // vendor 只给「首尾闭合」的折线填色（isPathALoop：首尾距 ≤ 8）。裁过一刀的环口被切开，
  // 不把起点补回末尾就会整块丢填充——高亮那种描边还是透明的，等于擦到一半什么都看不见。
  poly.push([poly[0][0], poly[0][1]]);

  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const q of poly) {
    x0 = Math.min(x0, q[0]);
    y0 = Math.min(y0, q[1]);
    x1 = Math.max(x1, q[0]);
    y1 = Math.max(y1, q[1]);
  }
  return {
    kind: "clip",
    geom: { x: el.x, y: el.y, width: x1 - x0, height: y1 - y0, points: poly, swap },
  };
}

/* ------------------------------ 第九十轮：箭头/连线「画出来」 ------------------------------ */

/**
 * 填充高亮是「推一条前沿把面裁掉」，箭头/连线是细笔画，没有面可裁。
 * 这里改成**沿它自己的路径长出来**：每帧只留「笔尖之前」的那一段点集喂给 vendor，
 * 箭头尖自然跟着走。两条硬规矩：
 * ① 直线/手画折线用原控制点，只在末端插一个笔尖点——落定恢复时一个像素都不差；
 * ② 弧线沿原曲线每隔 TRACE_STEP 钉一个定点，**只追加、不回改**。整段重新均分会让已画
 *    出的部分逐帧变形（观感像果冻），所以定点一旦落下就不再动，只有笔尖附近那一段在长。
 *
 * 直角路由箭头（elbowed）也走同一套：vendor 渲染时直接吃 element.points（只做拐角圆角），
 * 不会按绑定重算；只有走 mutateElement 的写入才重算，而放映补丁是 updateScene 整替换。
 */
export const TRACE_STEP = 30;
/** 每段三次贝塞尔的采样数：30px 左右的定点间距下，形状误差远小于一个像素 */
const TRACE_SAMPLES = 32;

export type StrokePath = {
  /** 采样折线（元素局部坐标） */
  dense: [number, number][];
  cum: number[];
  len: number;
  /** 弧长上的定点（不含起点）：曲线的固定落点；直线/折线就是原控制点 */
  anchors: { at: number; pt: [number, number] }[];
};

export function isTraceableStroke(e: DrawElementLike): boolean {
  if (e.isDeleted) return false;
  if (e.type !== "arrow" && e.type !== "line") return false;
  const pts = e.points;
  if (!pts || pts.length < 2) return false;
  for (let i = 1; i < pts.length; i += 1) {
    if (Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) > 0.5) return true;
  }
  return false;
}

/** points-on-curve 的 curveToBezier（vendor 曲线箭头用的同一套公式，tightness=0） */
function curveToBezier(pts: readonly DrawPoint[]): [number, number][] {
  const len = pts.length;
  const clone = (p: DrawPoint): [number, number] => [p[0], p[1]];
  if (len < 3) return [clone(pts[0]), clone(pts[0]), clone(pts[1]), clone(pts[1])];
  if (len === 3) return [clone(pts[0]), clone(pts[1]), clone(pts[2]), clone(pts[2])];
  const pad: DrawPoint[] = [pts[0], pts[0], ...pts.slice(1), pts[len - 1]];
  const out: [number, number][] = [clone(pad[0])];
  for (let i = 1; i + 2 < pad.length; i += 1) {
    const c1: [number, number] = [
      pad[i][0] + (pad[i + 1][0] - pad[i - 1][0]) / 6,
      pad[i][1] + (pad[i + 1][1] - pad[i - 1][1]) / 6,
    ];
    const c2: [number, number] = [
      pad[i + 1][0] + (pad[i][0] - pad[i + 2][0]) / 6,
      pad[i + 1][1] + (pad[i][1] - pad[i + 2][1]) / 6,
    ];
    out.push(c1, c2, clone(pad[i + 1]));
  }
  return out;
}

function sampleCurve(pts: readonly DrawPoint[]): [number, number][] {
  const c = curveToBezier(pts);
  const out: [number, number][] = [c[0]];
  for (let i = 0; i + 3 < c.length; i += 3) {
    const p0 = c[i];
    const p1 = c[i + 1];
    const p2 = c[i + 2];
    const p3 = c[i + 3];
    for (let j = 1; j <= TRACE_SAMPLES; j += 1) {
      const t = j / TRACE_SAMPLES;
      const u = 1 - t;
      out.push([
        u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
      ]);
    }
  }
  return out;
}

function pointAtPath(path: StrokePath, target: number): [number, number] {
  const { dense, cum } = path;
  let lo = 0;
  let hi = cum.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  if (lo === 0) return [dense[0][0], dense[0][1]];
  const a = dense[lo - 1];
  const b = dense[lo];
  const span = cum[lo] - cum[lo - 1];
  const t = span > 0 ? Math.min(1, (target - cum[lo - 1]) / span) : 0;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** 一条箭头/连线的路径表；退化到没有长度就 null（调用方回落淡入） */
export function strokePathOf(e: DrawElementLike): StrokePath | null {
  if (!isTraceableStroke(e)) return null;
  const ctrl = (e.points ?? []).map((q): [number, number] => [q[0], q[1]]);
  const curved = !!e.roundness && ctrl.length >= 3;
  const dense = curved ? sampleCurve(ctrl) : ctrl;
  const cum: number[] = [0];
  for (let i = 1; i < dense.length; i += 1) {
    cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  }
  const len = cum[cum.length - 1] ?? 0;
  if (!(len > 0.5)) return null;

  const anchors: { at: number; pt: [number, number] }[] = [];
  if (curved) {
    let next = TRACE_STEP;
    for (let i = 1; i < dense.length && next <= len; i += 1) {
      while (next <= cum[i] && next <= len) {
        anchors.push({ at: next, pt: pointAtPath({ dense, cum, len, anchors: [] }, next) });
        next += TRACE_STEP;
      }
    }
  } else {
    for (let i = 1; i < ctrl.length; i += 1) anchors.push({ at: cum[i], pt: ctrl[i] });
  }
  return { dense, cum, len, anchors };
}

/** 某一帧的描线几何：笔尖之前的定点 + 一个移动的笔尖点 */
export function traceFrame(el: DrawElementLike, path: StrokePath, p: number): DrawFrame {
  if (p <= 0) return { kind: "hidden" };
  if (p >= 1) return { kind: "done" };
  const target = path.len * p;
  const pts: [number, number][] = [[path.dense[0][0], path.dense[0][1]]];
  for (const a of path.anchors) {
    if (a.at > target - 0.5) break;
    pts.push([a.pt[0], a.pt[1]]);
  }
  const tip = pointAtPath(path, target);
  const last = pts[pts.length - 1];
  if (Math.hypot(tip[0] - last[0], tip[1] - last[1]) > 0.6) pts.push(tip);
  if (pts.length < 2) return { kind: "hidden" };

  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const q of pts) {
    x0 = Math.min(x0, q[0]);
    y0 = Math.min(y0, q[1]);
    x1 = Math.max(x1, q[0]);
    y1 = Math.max(y1, q[1]);
  }
  return {
    kind: "clip",
    geom: { x: el.x, y: el.y, width: x1 - x0, height: y1 - y0, points: pts, swap: false },
  };
}

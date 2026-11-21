/**
 * 描线覆盖层：把**终态的 roughjs 操作流**原样画一遍。
 *
 * 为什么不再走「改 points 重渲染」：roughjs 的抖动拓扑跟着控制点数走。终态
 * 三点弧在三个点上各抖一次、两遍刀分得开；描线用 ~30px 路标喂进去，抖点变成
 * 七八处、两遍刀互相咬合（实测同一条弧墨量差 ~30%）。收笔那一下粗细、弯口、
 * 双线质感都会跳一档，粗笔尤其明显。只要还在画布元素上做文章，就永远在「另一条
 * 线」和「跳动」之间二选一。
 *
 * 所以：描线期间画布里的元素压成 opacity 0，覆盖层用**同一个 seed、同一份
 * generateRoughOptions、同一个 generator 调用**算出终态 drawable，SVG 按
 * opsToPath 序列化——几何与画布逐字节同源；再拿一条沿骨架增长的遮罩带把它逐步
 * 揭开。收笔撤层、画布元素现形，两边是同一份形状，像素不变。
 *
 * 选项照抄 vendor（Excalidraw 0.18.1，Shape.ts）：
 * - dashed → strokeLineDash [8, 8 + sw]；dotted → [1.5, 6 + sw]；非实线
 *   disableMultiStroke 且宽度 +0.5；
 * - roughness 走 adjustRoughness：包围盒不够大时按 1/2（<10px 按 1/3）降档——
 *   所以这里必须拿**终态**的 width/height，不能拿描线中途的包围盒；
 * - preserveVertices = continuousPath || roughness < 2（artist 档这里恒真）。
 */

import rough from "roughjs";
import type { RoughGenerator } from "roughjs/bin/generator";
import { elbowPathData, type DrawElementLike } from "./presentation-draw.ts";

/** 覆盖层要读的字段：vendor 元素结构上都有 */
export type InkElementLike = DrawElementLike & {
  width?: number;
  height?: number;
  points?: readonly (readonly [number, number])[];
  seed: number;
  strokeColor: string;
  strokeWidth: number;
  roughness: number;
};

/** 一条 SVGGlyph 对应的 stroke 设置（元素局部坐标） */
export type InkStroke = {
  d: string;
  stroke: string;
  width: number;
  /** 虚线节奏，已经拼成 stroke-dasharray 的字符串（如 "8 10"） */
  dash?: string;
};

export type InkShape = {
  strokes: InkStroke[];
  /** 遮罩带半宽（覆盖粗糙抖动 + 笔宽） */
  band: number;
};

const generator: RoughGenerator = rough.generator();
const ROUGHNESS_CARTOONIST = 2;

/** vendor adjustRoughness：框小就降档 */
function adjustRoughness(el: InkElementLike): number {
  const roughness = el.roughness;
  const w = el.width ?? 0;
  const h = el.height ?? 0;
  const maxSize = Math.max(w, h);
  const minSize = Math.min(w, h);
  // 前两条对应形状；linear 元素（arrow/line）只要够长就走第三条
  if ((minSize >= 20 && maxSize >= 50) || (isLinear(el) && maxSize >= 50)) return roughness;
  return Math.min(roughness / (maxSize < 10 ? 3 : 2), 2.5);
}

function isLinear(el: InkElementLike): boolean {
  return el.type === "arrow" || el.type === "line";
}

/** vendor generateRoughOptions（只保留折线相关的分支） */
function roughOptions(el: InkElementLike, continuousPath: boolean): Record<string, unknown> {
  const sw = el.strokeWidth;
  const style = el.strokeStyle;
  return {
    seed: el.seed,
    strokeLineDash: style === "dashed" ? [8, 8 + sw] : style === "dotted" ? [1.5, 6 + sw] : undefined,
    disableMultiStroke: style !== undefined && style !== "solid",
    strokeWidth: style !== undefined && style !== "solid" ? sw + 0.5 : sw,
    fillWeight: sw / 2,
    hachureGap: sw * 4,
    roughness: adjustRoughness(el),
    stroke: el.strokeColor,
    preserveVertices: continuousPath || el.roughness < ROUGHNESS_CARTOONIST,
  };
}

/**
 * 某条箭头/连线终态的覆盖面。返回 null = 这条留旧描线（有填充面的 line
 * 终态走 polygon/curve 填充，覆盖层不复刻）。
 */
export function inkShapeOf(el: InkElementLike): InkShape | null {
  if (!isLinear(el)) return null;
  // 覆盖层不做元素旋转：线的点集本来就能表达方向（vendor 里线性元素的 angle 恒为 0），
  // 真遇到旋转过的旧数据就回落几何重渲染，别错位
  if (el.angle && Math.abs(el.angle) > 1e-4) return null;
  const pts = (el.points ?? []).map((p): [number, number] => [p[0], p[1]]);
  if (pts.length < 2) return null;
  // vendor 对 arrow 从不填色；line 闭合且有底色时才填——那种走旧口径
  if (el.type === "line" && el.backgroundColor && el.backgroundColor !== "transparent") return null;

  const elbow = el.type === "arrow" && el.elbowed === true;
  const options = roughOptions(el, elbow);
  let drawable;
  if (elbow) {
    drawable = generator.path(elbowPathData(pts), options);
  } else if (!el.roundness) {
    drawable = generator.linearPath(pts, options);
  } else {
    drawable = generator.curve(pts, options);
  }

  const resolved = drawable.options;
  const strokes: InkStroke[] = [];
  for (const set of drawable.sets) {
    if (set.type !== "path") continue;
    const d = generator.opsToPath(set);
    if (!d) continue;
    strokes.push({
      d,
      stroke: String(resolved.stroke),
      width: Number(resolved.strokeWidth),
      dash: resolved.strokeLineDash ? resolved.strokeLineDash.join(" ") : undefined,
    });
  }
  if (strokes.length === 0) return null;
  return {
    strokes,
    // 抖动最大 ±2.4px（第二遍），边线再宽半个笔身；遮罩带宽一点，收口才不漏边
    band: Math.max(6, el.strokeWidth / 2 + 6),
  };
}

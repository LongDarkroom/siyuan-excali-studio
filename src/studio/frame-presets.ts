/**
 * 第八十一轮：**标准画框**——「新建页」按固定比例插一页，不用手画。
 *
 * 为什么要有：手画的画框宽高全凭手感，两页之间差几个像素看不出来，一放映就是
 * 「这页大那页小」；而且演示只认画框，用户还得先学「先框一页」。这里给四个常用
 * 比例，一次点击就得到尺寸正确、位置在片单末尾的画框。
 *
 * 尺寸口径：板子上已经有页时，**按最后一页的对角线缩放**——比例是新页自己选的，
 * 体量跟现有页对齐，抽屉里的缩略图不会一页大一圈。没有页（空板）就用预设原始尺寸，
 * 落点交给宿主放到视口中心。
 *
 * 本模块不 import React / 思源 / vendor：node 侧直接跑单测。
 */

export type FrameRatio = "16:9" | "4:3" | "16:10" | "3:4";

export type FramePreset = {
  ratio: FrameRatio;
  /** 预设原始尺寸（场景坐标 px） */
  width: number;
  height: number;
};

/** 面板里的固定顺序：横版宽屏 → 经典 → 近宽屏 → 竖版 */
export const FRAME_RATIOS: readonly FramePreset[] = [
  { ratio: "16:9", width: 1280, height: 720 },
  { ratio: "4:3", width: 1200, height: 900 },
  { ratio: "16:10", width: 1280, height: 800 },
  { ratio: "3:4", width: 900, height: 1200 },
];

/** 新页与右侧邻居的留白（场景坐标 px） */
export const FRAME_GAP = 80;

/** 「同一行」的垂直容差，口径对齐 presentation-plan 的 DECK_ROW_TOLERANCE */
export const FRAME_ROW_TOLERANCE = 60;

/** 按最后一页缩放时允许的倍率范围：太小看不清、太大一页顶满屏 */
const SCALE_MIN = 0.5;
const SCALE_MAX = 2;

export type Size = { width: number; height: number };
export type Box = { x: number; y: number; width: number; height: number };

export function presetOf(ratio: FrameRatio): FramePreset {
  const preset = FRAME_RATIOS.find((p) => p.ratio === ratio);
  // 类型上穷尽了四种，这里只是运行时兜底（宿主 API 传进来的字符串不可全信）
  return preset ?? FRAME_RATIOS[0];
}

export function isFrameRatio(value: unknown): value is FrameRatio {
  return typeof value === "string" && FRAME_RATIOS.some((p) => p.ratio === value);
}

/**
 * 新页尺寸：选定比例 + 最后一页的对角线。
 * 没有可参照的页（空板/尺寸为 0）时退回预设原始尺寸。
 */
export function frameSizeFor(ratio: FrameRatio, base?: { width?: number; height?: number } | null): Size {
  const preset = presetOf(ratio);
  const bw = base?.width ?? 0;
  const bh = base?.height ?? 0;
  if (!(bw > 0) || !(bh > 0)) return { width: preset.width, height: preset.height };
  const raw = Math.hypot(bw, bh) / Math.hypot(preset.width, preset.height);
  const scale = Math.min(SCALE_MAX, Math.max(SCALE_MIN, raw));
  return { width: Math.round(preset.width * scale), height: Math.round(preset.height * scale) };
}

/**
 * 新页落点：贴在**末页所在行**的最右边，再留一段白。
 * 为什么不是全板最右：末页若在第二行，插到第一行最右会让阅读顺序把它排到末页前面，
 * 「新建在末尾」就名不副实；按行取右缘则无论如何都排在末页之后。
 */
export function nextFrameSpot(frames: readonly Box[], anchor?: Box | null): { x: number; y: number } | null {
  if (frames.length === 0 || !anchor) return null;
  const anchorCy = anchor.y + anchor.height / 2;
  const rowTol = Math.max(FRAME_ROW_TOLERANCE, anchor.height / 2);
  let right = anchor.x + anchor.width;
  for (const f of frames) {
    if (Math.abs(f.y + f.height / 2 - anchorCy) > rowTol) continue;
    right = Math.max(right, f.x + f.width);
  }
  return { x: Math.round(right + FRAME_GAP), y: Math.round(anchor.y) };
}

/**
 * 第八十轮：演示缩略图的**缓存键**（纯逻辑，node 侧能直接跑）。
 *
 * 生成缩略图要调 vendor 的 `exportToCanvas`（异步、有字体加载成本），不能在
 * onChange 里每帧重来。这里只回答一个问题：**这一页的预览什么时候过期？**
 *
 * 口径：
 * - 画框的宽高/角度变了 → 裁切区域变了，过期；
 * - 画框成员的 `version:versionNonce` 变了（增删改、挪动、改色）→ 过期；
 * - 画布底色变了（明暗主题切换、用户改背景）→ 过期，否则预览和实际观感不一致；
 * - 画框改名**不算**（名字不画进预览——`exportingFrame` 会关掉画框名）。
 */

/** 缩略图最长边的目标像素。112px 高的卡片在 2x 屏上要 300~400 才不糊 */
export const THUMB_MAX = 480;

/**
 * 本页预览（编排画布）最长边：左栏约 660px 宽，2x 屏需要 1200+ 才不糊。
 * 只给当前选中页画一张，签名口径与缩略图完全相同。
 */
export const STAGE_MAX = 1280;

/** 缩略图签名只需要元素里这几样（结构兼容 vendor 的 ExcalidrawElement） */
export type ThumbElement = {
  id: string;
  type?: string;
  isDeleted?: boolean;
  frameId?: string | null;
  version?: number;
  versionNonce?: number;
  width?: number;
  height?: number;
  angle?: number;
};

/**
 * 一页预览的签名。拿不到画框（被删了）返回空串——调用方据此跳过这一页，
 * 不要拿旧图顶替一张已经不存在的内容。
 */
export function thumbSignature(
  all: readonly ThumbElement[],
  frameId: string,
  background: string,
): string {
  const frame = all.find((e) => e.id === frameId && !e.isDeleted);
  if (!frame) return "";
  // 成员按场景顺序拼：顺序就是 z 序，重排也要过期
  const members = all
    .filter((e) => !e.isDeleted && e.type !== "frame" && (e.frameId ?? null) === frameId)
    .map((e) => `${e.id}@${e.version ?? 0}:${e.versionNonce ?? 0}`);
  return [
    frameId,
    Math.round(frame.width ?? 0),
    Math.round(frame.height ?? 0),
    Math.round((frame.angle ?? 0) * 100) / 100,
    background,
    members.join(","),
  ].join("|");
}

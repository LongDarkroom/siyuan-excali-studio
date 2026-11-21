/**
 * 第二十六轮 T1（图片外置）：scene 载荷里的图片引用工具——纯逻辑，Node 可单测。
 *
 * 存盘格式：scene JSON 的 files 条目不再塞 dataURL（会把文件膨胀 2.1 倍，
 * 见 scripts/bench-large-scene-baseline.json），改成
 *   { id, mimeType, created, path: "assets/excali-media/<sha1前16hex>.<ext>" }
 * 二进制本体落在工作空间 assets/excali-media/（内容寻址：同图天然去重）。
 * 运行时画布依旧吃 dataURL（vendor 的 addFiles 不认识别的形态），打开时由宿主
 * 把 path 读回字节再拼成 dataURL 注水（hydrate）——"存引用、用快照"。
 */

/** 图片二进制的落盘目录（相对工作空间 /data；2026-11-21 从 assets/excali-media 搬到
 *  storage/excali-studio/media，避免污染思源「未引用资源」；与保存目录设置解耦）。
 *  存量白板 SVG 里写死旧路径，读取时由宿主 hydrateSceneFiles 做旧→新兜底。 */
export const MEDIA_DIR = "storage/excali-studio/media";
/** 旧目录（仅迁移/读时兜底用） */
export const LEGACY_MEDIA_DIR = "assets/excali-media";

/**
 * img 的 data-src / src 原文 → 资产引用（assets/…svg|png）。
 *
 * 不走 `new URL(src, location.href)`：思源的 app 页面不在站点根（/stage/build/…），
 * 相对写法 "assets/x.svg" 会被解析到 /stage/build/assets/ 下，判定直接失效
 * ——2026-11-18 图片右键菜单项一直加不进去，这是其中一环。属性原文里本来就带
 * 完整的 assets/ 段，按后缀截取即可；绝对地址、?t= 破缓存参数、URL 编码都能兜住。
 */
export function assetRefFromSrc(src: string): string | null {
  const raw = String(src ?? "").trim();
  if (raw === "") return null;
  const cut = raw.split(/[?#]/)[0] ?? "";
  let decoded = cut;
  try {
    decoded = decodeURIComponent(cut);
  } catch {
    // 非法编码保持原文
  }
  const m = /(?:^|\/)(assets\/[^/][^\s"'<>]*?\.(?:svg|png))$/i.exec(decoded);
  return m ? (m[1] as string) : null;
}

/** data:image/png;base64,xxxx → { mime, bytes }；解析不了返回 null */
export function parseDataUrl(dataURL: string): { mime: string; bytes: Uint8Array } | null {
  const m = /^data:([^;,]+)(?:;charset=[^;,]+)?;base64,([\s\S]+)$/.exec(dataURL.trim());
  if (!m) return null;
  const bin = atob(m[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) & 0xff;
  return { mime: m[1] || "application/octet-stream", bytes };
}

/** mime → 扩展名（内容寻址文件名的尾巴） */
export function mediaExtOf(mime: string): string {
  const table: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "image/bmp": "bmp",
    "image/avif": "avif",
  };
  return table[mime] || "bin";
}

/** 内容寻址文件名：<sha1 前 16 hex>.<ext>——同图天然去重，改名/重开不产生副本 */
export async function mediaFileName(bytes: Uint8Array, mime: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-1", bytes as unknown as ArrayBuffer);
  const hex = Array.from(new Uint8Array(digest.slice(0, 8)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${hex}.${mediaExtOf(mime)}`;
}

/** 字节 → dataURL（打开白板时的注水通道；btoa 一次喂大串会栈溢出，分块走） */
export function bytesToDataURL(bytes: Uint8Array, mime: string): string {
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return `data:${mime};base64,${btoa(bin)}`;
}

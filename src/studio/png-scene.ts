/**
 * PNG 内嵌 scene（tEXt 块）的读写。
 *
 * Excalidraw 导出 PNG 时把载荷写进一个关键字为
 * `application/vnd.excalidraw+json` 的 tEXt 块：值为 `关键字\0 + 包装 JSON`，
 * 包装 JSON 与 SVG 侧同构（`{version:"1", encoding:"bstring", compressed:true,
 * encoded:<latin1 deflate 字节串>}`），只是这里**不套 base64**——tEXt 本身就是
 * Latin-1 文本，二进制字节直接按 latin1 塞进去（与 vendor 的 encodePngMetadata
 * 一致，2026-11-18 对 3 张 Embed Excalidraw 的 PNG 实测过）。
 *
 * 本模块只做 PNG 容器的拆装（分块遍历 / tEXt 替换 / CRC32），scene 的编解码在
 * scene-codec.ts。图片本体（IHDR/IDAT/IEND 等）原字节搬运，不重新编码像素。
 */

export const PNG_SCENE_KEYWORD = "application/vnd.excalidraw+json";

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;

export function isPngBytes(bytes: Uint8Array): boolean {
  if (bytes.length < PNG_SIG.length) return false;
  for (let i = 0; i < PNG_SIG.length; i++) if (bytes[i] !== PNG_SIG[i]) return false;
  return true;
}

function latin1ToString(bytes: Uint8Array): string {
  let out = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    out += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return out;
}

function stringToLatin1(s: string): Uint8Array {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff;
  return out;
}

type PngChunk = {
  type: string;
  /** 块头（长度+类型）在文件里的偏移 */
  start: number;
  dataStart: number;
  dataEnd: number;
  /** 整块（含 CRC）之后的下一个偏移 */
  end: number;
};

function readChunks(bytes: Uint8Array): PngChunk[] | null {
  if (!isPngBytes(bytes)) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out: PngChunk[] = [];
  let i: number = PNG_SIG.length;
  while (i + 12 <= bytes.length) {
    const length = view.getUint32(i);
    const dataStart = i + 8;
    const dataEnd = dataStart + length;
    const end = dataEnd + 4;
    if (dataEnd > bytes.length || end > bytes.length) return null;
    out.push({ type: String.fromCharCode(bytes[i + 4]!, bytes[i + 5]!, bytes[i + 6]!, bytes[i + 7]!), start: i, dataStart, dataEnd, end });
    i = end;
  }
  return out;
}

/** tEXt 块里的关键字（NUL 之前那段） */
function textKeyword(bytes: Uint8Array, chunk: PngChunk): string | null {
  if (chunk.type !== "tEXt") return null;
  for (let i = chunk.dataStart; i < chunk.dataEnd; i++) {
    if (bytes[i] === 0) return latin1ToString(bytes.subarray(chunk.dataStart, i));
  }
  return null;
}

/** 从 PNG 里读出内嵌 scene 的包装 JSON；没有返回 null（不解压、不校验 scene） */
export function pngSceneJson(bytes: Uint8Array): string | null {
  const chunks = readChunks(bytes);
  if (!chunks) return null;
  for (const chunk of chunks) {
    const kw = textKeyword(bytes, chunk);
    if (kw !== PNG_SCENE_KEYWORD) continue;
    const valueStart = chunk.dataStart + kw.length + 1;
    return latin1ToString(bytes.subarray(valueStart, chunk.dataEnd));
  }
  return null;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]!) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function buildTextChunk(json: string): Uint8Array {
  const keyword = stringToLatin1(PNG_SCENE_KEYWORD);
  const value = stringToLatin1(json);
  const dataLen = keyword.length + 1 + value.length;
  const out = new Uint8Array(8 + dataLen + 4);
  new DataView(out.buffer).setUint32(0, dataLen);
  out.set([0x74, 0x45, 0x58, 0x74], 4); // "tEXt"
  out.set(keyword, 8);
  out[8 + keyword.length] = 0;
  out.set(value, 8 + keyword.length + 1);
  const crc = crc32(out.subarray(4, 8 + dataLen));
  new DataView(out.buffer).setUint32(8 + dataLen, crc);
  return out;
}

/**
 * 把新载荷写进 PNG：删掉旧的同名 tEXt，新的紧跟 IHDR（PNG 规范建议 tEXt 在
 * IDAT 之前）。其它块原样搬运，像素不受影响。
 */
export function pngWithScene(bytes: Uint8Array, json: string): Uint8Array {
  const chunks = readChunks(bytes);
  if (!chunks || chunks.length === 0 || chunks[0]!.type !== "IHDR") {
    throw new Error("不是合法的 PNG（缺 IHDR）");
  }
  const piece = buildTextChunk(json);
  const parts: Uint8Array[] = [bytes.subarray(0, PNG_SIG.length)];
  let inserted = false;
  for (const chunk of chunks) {
    if (textKeyword(bytes, chunk) === PNG_SCENE_KEYWORD) continue;
    parts.push(bytes.subarray(chunk.start, chunk.end));
    if (chunk.type === "IHDR" && !inserted) {
      parts.push(piece);
      inserted = true;
    }
  }
  if (!inserted) parts.splice(1, 0, piece);
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}
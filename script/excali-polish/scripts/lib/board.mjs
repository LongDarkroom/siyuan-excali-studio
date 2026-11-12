/**
 * 白板文件的最小只读工具层：解 scene、几何、字体口径。
 * 不依赖插件 src / node_modules——集市版与本地仓库版都能直接用。
 */
import { inflateSync } from "node:zlib";

const PAYLOAD_TYPE = "application/vnd.excalidraw+json";
const PAYLOAD_START = /<!-- payload-start -->\s*([\s\S]+?)\s*<!-- payload-end -->/;
const PAYLOAD_VERSION = /<!-- payload-version:(\d+) -->/;

export function decodeBoard(svgText) {
  if (!svgText.includes(PAYLOAD_TYPE)) throw new Error("不是 Excali 白板：缺 payload-type 标记");
  const match = PAYLOAD_START.exec(svgText);
  if (!match) throw new Error("不是 Excali 白板：缺 payload-start/end 标记");
  const version = Number((PAYLOAD_VERSION.exec(svgText) ?? [0, 1])[1]);
  const raw = Buffer.from(match[1], "base64");

  // version ≥2 的外层 JSON 里 encoded 是 latin1 字节串（可能含裸高位字节），必须按 latin1 读；
  // 按 UTF-8 读会把非法序列换成 U+FFFD，解压时直接 “incorrect header check”。
  let outer;
  try {
    outer = JSON.parse(raw.toString(version < 2 ? "utf8" : "latin1"));
  } catch (e) {
    throw new Error("载荷不是合法 JSON：" + (e instanceof Error ? e.message : String(e)));
  }
  if (version < 2) return normalize(outer);

  if (!outer || typeof outer !== "object") throw new Error("载荷不是对象");
  if (!("encoded" in outer)) return normalize(outer);
  if (outer.encoding !== "bstring") throw new Error("不支持的编码：" + String(outer.encoding));
  const bytes = Buffer.from(String(outer.encoded), "latin1");
  const text = outer.compressed === true ? inflateSync(bytes).toString("utf8") : bytes.toString("utf8");
  let inner;
  try {
    inner = JSON.parse(text);
  } catch (e) {
    throw new Error("scene JSON 解析失败：" + (e instanceof Error ? e.message : String(e)));
  }
  return normalize(inner);
}

function normalize(scene) {
  if (!scene || typeof scene !== "object" || !Array.isArray(scene.elements)) {
    throw new Error("scene 缺 elements 数组（type=" + String(scene?.type) + "）");
  }
  return {
    elements: scene.elements,
    appState: scene.appState && typeof scene.appState === "object" ? scene.appState : {},
    files: scene.files && typeof scene.files === "object" ? scene.files : {},
  };
}

/** Excalidraw 只给首尾相距 ≤8px 的折线填色（LINE_CONFIRM_THRESHOLD） */
export function isClosed(points, threshold = 8) {
  if (!Array.isArray(points) || points.length < 3) return false;
  const a = points[0];
  const b = points[points.length - 1];
  return Math.hypot(a[0] - b[0], a[1] - b[1]) <= threshold;
}

export function hasFill(e) {
  return Boolean(e.backgroundColor && e.backgroundColor !== "transparent");
}

/** 轴对齐包围盒（旋转元素按未旋转的盒子算，够体检用） */
export function absBox(e) {
  if ((e.type === "line" || e.type === "arrow" || e.type === "freedraw") && Array.isArray(e.points)) {
    const xs = e.points.map((p) => e.x + p[0]);
    const ys = e.points.map((p) => e.y + p[1]);
    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      w: Math.max(...xs) - Math.min(...xs),
      h: Math.max(...ys) - Math.min(...ys),
    };
  }
  return { x: Number(e.x ?? 0), y: Number(e.y ?? 0), w: Number(e.width ?? 0), h: Number(e.height ?? 0) };
}

/** 画框名字在编辑器里画在框上方：FRAME_STYLE nameFontSize 14 / offsetY 3 / lineHeight 1.25 */
export function frameLabelBox(frame) {
  const text = String(frame.name ?? "");
  let w = 0;
  for (const ch of text) w += CJK.test(ch) ? 14 : 14 * 0.56;
  return { x: frame.x, y: frame.y - 20.5, w, h: 17.5, text };
}

export const CJK = /[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef\u3000-\u303f]/;

export const FONT_NAMES = {
  1: "Virgil",
  2: "Helvetica",
  3: "Cascadia",
  5: "Excalifont",
  6: "Nunito",
  7: "Lilita One",
  8: "Comic Shanns",
  9: "Liberation Sans",
  100: "Xiaolai",
  101: "LXGW WenKai Lite",
  102: "Smiley Sans",
  103: "Caveat",
  104: "Patrick Hand",
  105: "Yusei Magic",
  106: "Zen Kurenaido",
};

/** 只给「哪类字体适合什么角色」的口径，不替用户做审美决定 */
export const FONT_ROLES = {
  5: "标题 / 手绘大字",
  101: "正文 / 说明（中文友好）",
  8: "英文 kicker / 页脚 / 等宽小字",
  6: "编号 / 数字",
  7: "重磅数字",
  3: "代码",
};

/** 中英混排的宽度估算：中文整宽，拉丁按字体给经验系数（Excalidraw 的测量是字体相关的） */
export function estimateWidth(text, fontSize, fontId) {
  const latin = { 5: 0.56, 101: 0.52, 8: 0.6, 6: 0.52, 102: 0.5, 1: 0.56, 2: 0.52, 9: 0.5, 3: 0.6, 7: 0.5 }[fontId] ?? 0.56;
  let max = 0;
  for (const line of String(text).split("\n")) {
    let units = 0;
    for (const ch of line) units += CJK.test(ch) ? 1 : latin;
    max = Math.max(max, units * fontSize);
  }
  return Math.ceil(max);
}

export function overlaps(a, b, pad = 0) {
  return a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;
}

/** 元素是否完全落在画框内（画框会裁掉超出的部分） */
export function inside(box, frame, slack = 2) {
  return (
    box.x >= frame.x - slack &&
    box.y >= frame.y - slack &&
    box.x + box.w <= frame.x + frame.width + slack &&
    box.y + box.h <= frame.y + frame.height + slack
  );
}

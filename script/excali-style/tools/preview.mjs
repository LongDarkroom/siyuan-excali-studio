#!/usr/bin/env node
/**
 * 画完看一眼：把 Excali 白板文件渲染成 PNG（用 roughjs，和画布同一套手绘笔触引擎）。
 *
 *   node tools/preview.mjs <白板.svg> [输出.png] [--scale 2] [--font hand]
 *
 * 输入是 excali-studio 的白板文件（data/assets/excali/*.svg），场景数据内嵌在
 * <metadata> 里；这里只解码场景，不写回任何文件。插件自带的 SVG 预览只画规整矩形，
 * roughness / 排线 / 虚线全都看不出来——所以自检必须走这个工具，不能看插件的预览。
 *
 * 依赖：roughjs（npm install，或复用插件目录里的 node_modules）。
 * 出图：macOS 上的 Google Chrome 无头模式。
 */
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { inflateSync, inflateRawSync } from "node:zlib";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { createRequire } from "node:module";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith("--"));
const flag = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : dflt;
};

const boardPath = positional[0];
if (!boardPath) {
  console.error("用法：node tools/preview.mjs <白板.svg> [输出.png] [--scale 2] [--font hand|sans|mono]");
  process.exit(1);
}

// roughjs 解析顺序：本仓库 → 相邻的 excali-studio 插件目录 → 全局
const require = createRequire(import.meta.url);
let rough;
for (const from of [
  import.meta.url,
  ...process.env.EXCALI_PLUGIN ? [`${process.env.EXCALI_PLUGIN}/package.json`] : [],
  "/Users/xieyue/Downloads/思源笔记/data/plugins/siyuan-excali-studio/package.json",
]) {
  try {
    rough = createRequire(from)("roughjs");
    break;
  } catch {
    /* 换下一个候选 */
  }
}
if (!rough) {
  console.error("找不到 roughjs：在本仓库跑 npm install，或设 EXCALI_PLUGIN 指向插件目录");
  process.exit(1);
}

/** 白板 SVG → scene（对齐 excali-studio 的 scene-codec：注释包裹的 base64 + deflate） */
function decodeScene(svgText) {
  const start = /<!-- payload-start -->\s*([\s\S]+?)\s*<!-- payload-end -->/.exec(svgText);
  if (!start) throw new Error("这个 SVG 里没有内嵌场景数据（不是 Excali 白板文件？）");
  const json = JSON.parse(Buffer.from(start[1].trim(), "base64").toString("latin1"));
  if (json.type === "excalidraw" && Array.isArray(json.elements)) return json;
  if (typeof json.encoded !== "string") throw new Error("场景载荷格式不认识");
  const bytes = Buffer.from(json.encoded, "latin1");
  const text = json.compressed === false ? bytes.toString("utf8") : unzip(bytes);
  return JSON.parse(text);
}

function unzip(bytes) {
  for (const fn of [inflateSync, inflateRawSync]) {
    try {
      return fn(bytes).toString("utf8");
    } catch {
      /* 换一种 deflate 头 */
    }
  }
  throw new Error("场景解压失败");
}

const FONTS = {
  hand: "'Marker Felt','Noteworthy','Comic Sans MS','Kaiti SC','PingFang SC',sans-serif",
  sans: "'Helvetica Neue','PingFang SC',sans-serif",
  mono: "'Menlo','PingFang SC',monospace",
};
const fontMode = flag("font", "hand");
const scale = Number(flag("scale", 2));

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? String(Math.round(n * 100) / 100) : "0";
};
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
const luminance = (hex) => {
  const m = /^#?([\da-f]{6})$/i.exec(String(hex ?? ""));
  if (!m) return 1;
  const v = parseInt(m[1], 16);
  const ch = (n) => {
    const c = ((v >> n) & 255) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(16) + 0.7152 * ch(8) + 0.0722 * ch(0);
};

const rc = rough.generator();
let seed = 20261109;
const nextSeed = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return Math.floor((seed / 4294967296) * 2 ** 31) + 1;
};

function roughOptions(el) {
  const stroke = el.strokeColor === "transparent" ? "" : String(el.strokeColor ?? "#1e1e1e");
  const fill = el.backgroundColor && el.backgroundColor !== "transparent" ? String(el.backgroundColor) : undefined;
  const opts = {
    seed: nextSeed(),
    roughness: Number(el.roughness ?? 1),
    strokeWidth: Number(el.strokeWidth ?? 2),
    stroke,
    strokeLineStyle: ["dashed", "dotted"].includes(el.strokeStyle) ? el.strokeStyle : "solid",
  };
  if (fill) {
    opts.fill = fill;
    opts.fillStyle = el.fillStyle === "cross-hatch" ? "cross-hatch" : el.fillStyle === "hachure" ? "hachure" : "solid";
  }
  return opts;
}

const setPath = (drawable, type) =>
  (drawable.sets ?? [])
    .filter((s) => s.type === type)
    .flatMap((s) => s.ops)
    .map((op) => (op.op === "move" ? `M${op.data.map(num).join(" ")}` : op.op === "bcurveTo" ? `C${op.data.map(num).join(" ")}` : ""))
    .join(" ");

/** 每个排线 set 单独成段，否则不同线条之间会被连上多余的一段 */
const sketchPath = (drawable) =>
  (drawable.sets ?? [])
    .filter((s) => s.type === "fillSketch")
    .map((s) =>
      s.ops
        .map((op) => (op.op === "move" ? `M${op.data.map(num).join(" ")}` : op.op === "bcurveTo" ? `C${op.data.map(num).join(" ")}` : ""))
        .join(""),
    )
    .filter(Boolean)
    .join(" ");

function shapeSvg(el, background) {
  const x = Number(el.x ?? 0);
  const y = Number(el.y ?? 0);
  const w = Number(el.width ?? 0);
  const h = Number(el.height ?? 0);
  const o = roughOptions(el);

  if (el.type === "text") {
    const align = String(el.textAlign ?? "left");
    const anchor = align === "center" ? "middle" : align === "right" ? "end" : "start";
    const tx = align === "center" ? x + w / 2 : align === "right" ? x + w : x;
    const fontSize = Number(el.fontSize ?? 20);
    const lineHeight = fontSize * Number(el.lineHeight ?? 1.25);
    const color = el.strokeColor === "transparent" ? "#1e1e1e" : String(el.strokeColor ?? "#1e1e1e");
    const spans = String(el.text ?? "")
      .split("\n")
      .map((line, i) => `<tspan x="${num(tx)}" y="${num(y + fontSize * 0.95 + lineHeight * i)}">${esc(line) || " "}</tspan>`)
      .join("");
    return `<text font-family="${esc(FONTS[fontMode] ?? FONTS.hand)}" font-size="${num(fontSize)}" fill="${esc(color)}" text-anchor="${anchor}">${spans}</text>`;
  }

  let drawable = null;
  if (el.type === "rectangle") {
    const round = el.roundness && typeof el.roundness === "object" ? Math.min(24, Math.min(w, h) / 4) : 0;
    drawable = rc.rectangle(x, y, w, h, { ...o, ...(round ? { roundness: round } : {}) });
  } else if (el.type === "ellipse") {
    drawable = rc.ellipse(x + w / 2, y + h / 2, w, h, o);
  } else if (el.type === "diamond") {
    drawable = rc.polygon(
      [
        [x + w / 2, y],
        [x + w, y + h / 2],
        [x + w / 2, y + h],
        [x, y + h / 2],
      ],
      o,
    );
  } else if (el.type === "arrow" || el.type === "line") {
    const pts = (Array.isArray(el.points) ? el.points : []).map((p) => [x + Number(p[0] ?? 0), y + Number(p[1] ?? 0)]);
    if (pts.length < 2) return "";
    drawable = rc.linearPath(pts, o);
    const head = el.endArrowhead ? ' marker-end="url(#rk-arrow)"' : "";
    const tail = el.startArrowhead ? ' marker-start="url(#rk-arrow)"' : "";
    return `<path d="${setPath(drawable, "path")}" fill="none" stroke="${esc(o.stroke)}" stroke-width="${num(el.strokeWidth ?? 2)}" stroke-linecap="round"${head}${tail}/>`;
  } else if (el.type === "image") {
    const href = String(el.src ?? "");
    return href ? `<image href="${esc(href)}" x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}" preserveAspectRatio="none"/>` : "";
  } else {
    return "";
  }

  const solid = setPath(drawable, "fillPath");
  const hatch = sketchPath(drawable);
  const stroke = setPath(drawable, "path");
  let out = "";
  // 白卡贴白纸：排线/填充都看不见，加一层纸片投影把卡片从背景里拎出来
  if (o.fill && o.fillStyle === "solid" && luminance(o.fill) > 0.88 && luminance(background) > 0.88 && solid) {
    out += `<path d="${solid}" fill="#000000" stroke="none" opacity="0.09" transform="translate(4,6)"/>`;
  } else if (solid && o.fill) {
    out += `<path d="${solid}" fill="${esc(o.fill)}" stroke="none"/>`;
  }
  if (hatch && o.fill) {
    out += `<path d="${hatch}" fill="none" stroke="${esc(o.fill)}" stroke-width="${num(Number(el.strokeWidth ?? 2) * 0.7)}" opacity="0.9"/>`;
  }
  if (stroke && o.stroke) {
    out += `<path d="${stroke}" fill="none" stroke="${esc(o.stroke)}" stroke-width="${num(el.strokeWidth ?? 2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return out;
}

const svgText = readFileSync(resolve(boardPath), "utf8");
const scene = decodeScene(svgText);
const background = String(scene.appState?.viewBackgroundColor ?? "#ffffff");
const els = (scene.elements ?? []).filter((el) => el && el.isDeleted !== true);
if (!els.length) {
  console.error("白板是空的");
  process.exit(1);
}

const pad = 32;
/**
 * 中文按整宽、拉丁按 0.62 估一行多宽。场景里的 text.width 是写入时的估值，
 * 对 CJK 偏小，直接用它做包围盒会把右侧文字切掉。
 */
const WIDE = /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6]/;

function estimatedTextWidth(el) {
  const fontSize = Number(el.fontSize ?? 20);
  let max = 0;
  for (const line of String(el.text ?? "").split("\n")) {
    let w = 0;
    for (const ch of line) w += WIDE.test(ch) ? fontSize : fontSize * 0.62;
    max = Math.max(max, w);
  }
  return max;
}

let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;
for (const el of els) {
  const x = Number(el.x ?? 0);
  const y = Number(el.y ?? 0);
  const w = Number(el.width ?? 0);
  const h = Number(el.height ?? 0);
  const pts = Array.isArray(el.points) ? el.points : [];
  let xs = [x, x + w, ...pts.map((p) => x + Number(p[0] ?? 0))];
  const ys = [y, y + h, ...pts.map((p) => y + Number(p[1] ?? 0))];
  if (el.type === "text") {
    const est = estimatedTextWidth(el);
    const align = String(el.textAlign ?? "left");
    const left = align === "center" ? x + w / 2 - est / 2 : align === "right" ? x + w - est : x;
    xs = [...xs, left, left + est];
    ys.push(y + String(el.text ?? "").split("\n").length * Number(el.fontSize ?? 20) * 1.35);
  }
  minX = Math.min(minX, ...xs);
  minY = Math.min(minY, ...ys);
  maxX = Math.max(maxX, ...xs);
  maxY = Math.max(maxY, ...ys);
}
const vw = Math.max(1, maxX - minX + pad * 2);
const vh = Math.max(1, maxY - minY + pad * 2);

const target = positional[1];
const outDir = mkdtempSync(join(tmpdir(), "excali-preview-"));
const base = basename(target || `excali-preview-${Date.now()}`).replace(/\.(svg|png)$/i, "");
const outSvg = target?.endsWith(".svg") ? resolve(target) : join(outDir, `${base}.svg`);
const outPng = target && !target.endsWith(".svg") ? resolve(target.endsWith(".png") ? target : `${target}.png`) : `${outSvg.replace(/\.svg$/, "")}.png`;
writeFileSync(
  outSvg,
  `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="${num(minX - pad)} ${num(minY - pad)} ${num(vw)} ${num(vh)}" width="${num(vw)}" height="${num(vh)}">` +
    `<rect x="${num(minX - pad)}" y="${num(minY - pad)}" width="${num(vw)}" height="${num(vh)}" fill="${esc(background)}"/>` +
    `<defs><marker id="rk-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs>` +
    els.map((el) => shapeSvg(el, background)).join("") +
    `</svg>`,
  "utf8",
);

execFileSync(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--force-device-scale-factor=${scale}`,
    `--window-size=${Math.round(vw)},${Math.round(vh)}`,
    `--screenshot=${outPng}`,
    `file://${resolve(outSvg)}`,
  ],
  { stdio: ["ignore", "ignore", "pipe"] },
);

console.log(JSON.stringify({ ok: true, elements: els.length, svg: outSvg, png: outPng, w: Math.round(vw), h: Math.round(vh) }));

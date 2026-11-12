#!/usr/bin/env node
/**
 * 白板验收渲染：把 scene 还原成 SVG，用 Chrome 截成 PNG。
 *
 *   node scripts/render.mjs <board.svg> [--out 目录] [--scale 2] [--only 关键词]
 *
 * 补齐插件自带预览缺的三件事（不补就看不出「有没有缺」）：
 *   ① 闭合折线的填充；② 元素角度；③ 画框名（画在框上方）
 * 字体直接从插件 engine.js / fonts 里读，Excalifont + Xiaolai 按 unicode-range 分片
 * 加载，所见接近画布真字形。
 *
 * 输出：board.png（全景）+ frame-NN.png（逐页）
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { absBox, decodeBoard, hasFill, isClosed } from "./lib/board.mjs";
import { buildFontCss, fontStackOf } from "./lib/fonts.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
if (!args.length || args.includes("--help") || args.includes("-h")) {
  console.log(`用法：node scripts/render.mjs <board.svg> [选项]

  --out <dir>      输出目录（默认 ./excali-qa）
  --scale <n>      devicePixelRatio（默认 2）
  --only <text>    只渲染名字/id 含这段文字的画框
  --plugin <dir>   插件目录（默认从脚本位置向上找含 fonts/ 与 engine.js 的目录）
  --chrome <path>  指定 Chrome/Chromium`);
  process.exit(args.length ? 0 : 1);
}

const boardPath = resolve(args[0]);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const outDir = resolve(opt("--out") ?? "excali-qa");
const scale = Number(opt("--scale") ?? 2);
const only = opt("--only");

const pluginRoot = resolvePlugin(opt("--plugin"));
const scene = decodeBoard(readFileSync(boardPath, "utf8"));
const els = scene.elements.filter((e) => !e.isDeleted);
const frames = els.filter((e) => e.type === "frame");
const fontInfo = buildFontCss(pluginRoot);

const bg = scene.appState?.viewBackgroundColor ?? "#ffffff";
const boxes = els.map(absBox);
const bounds = {
  x: Math.min(...boxes.map((b) => b.x)) - 24,
  y: Math.min(...boxes.map((b) => b.y)) - 24,
  right: Math.max(...boxes.map((b) => b.x + b.w)) + 24,
  bottom: Math.max(...boxes.map((b) => b.y + b.h)) + 24,
};
bounds.w = bounds.right - bounds.x;
bounds.h = bounds.bottom - bounds.y;

const note = { images: 0, hatch: 0, freedraw: 0 };
const colors = new Set();
for (const e of els) {
  if (e.type === "image") note.images++;
  if (e.type === "freedraw") note.freedraw++;
  if (hasFill(e) && e.fillStyle && e.fillStyle !== "solid") note.hatch++;
  if ((e.type === "line" || e.type === "arrow") && (e.startArrowhead || e.endArrowhead) && e.strokeColor !== "transparent") {
    colors.add(e.strokeColor ?? "#1e1e1e");
  }
}

const markers = [...colors]
  .map((color, i) => {
    const id = `qa-arrow-${i}`;
    return `<marker id="${id}" data-color="${esc(color)}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${esc(color)}"/></marker>`;
  })
  .join("");
const markerId = (color) => `qa-arrow-${[...colors].indexOf(color ?? "#1e1e1e")}`;

const svgBody = els
  .filter((e) => e.type !== "frame")
  .map((e) => renderElement(e))
  .join("");
const labels = frames
  .map(
    (f) =>
      `<text x="${n(f.x)}" y="${n(f.y - 6)}" font-family="'Avenir Next','Helvetica Neue',sans-serif" font-size="14" fill="#999">${esc(f.name)}</text>`,
  )
  .join("");

mkdirSync(outDir, { recursive: true });
const chrome = findChrome(opt("--chrome"));
const written = [];

const views = [{ name: "board", title: "全景", box: bounds }];
frames.forEach((f, i) => {
  if (only && !String(f.name).includes(only) && !String(f.id).includes(only)) return;
  views.push({
    name: `frame-${String(i + 1).padStart(2, "0")}`,
    title: f.name,
    box: { x: f.x - 20, y: f.y - 30, w: f.width + 40, h: f.height + 54 },
  });
});

for (const view of views) {
  const htmlPath = join(outDir, view.name + ".html");
  const pngPath = join(outDir, view.name + ".png");
  const b = view.box;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${n(b.x)} ${n(b.y)} ${n(b.w)} ${n(b.h)}" width="${n(b.w)}" height="${n(b.h)}">` +
    `<defs>${markers}</defs>` +
    `<rect x="${n(b.x)}" y="${n(b.y)}" width="${n(b.w)}" height="${n(b.h)}" fill="${esc(bg)}"/>` +
    svgBody +
    labels +
    `</svg>`;
  const html =
    `<!doctype html><meta charset="utf-8"><title>${esc(view.title)}</title><style>` +
    fontInfo.css +
    `html,body{margin:0;background:${esc(bg)}}svg{display:block}</style>` +
    svg;
  writeFileSync(htmlPath, html);
  if (!chrome) continue;
  try {
    execFileSync(
      chrome,
      [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--allow-file-access-from-files",
        `--force-device-scale-factor=${scale}`,
        `--window-size=${Math.round(b.w)},${Math.round(b.h)}`,
        `--screenshot=${pngPath}`,
        pathToFileURL(htmlPath).href,
      ],
      { stdio: "pipe" },
    );
    written.push(pngPath);
  } catch (e) {
    console.error(`截图失败（${view.name}）：${e instanceof Error ? e.message : String(e)}`);
  }
}

console.log(`已渲染：${boardPath}`);
console.log(`元素 ${els.length} · 画框 ${frames.length} · 输出 ${outDir}`);
console.log(`字体分片 ${fontInfo.faces} 条${fontInfo.missing.length ? " · " + fontInfo.missing.join("；") : ""}`);
if (note.images) console.log(`注意：${note.images} 张图片只画占位框（scene 内嵌资源不还原）`);
if (note.freedraw) console.log(`注意：${note.freedraw} 条自由笔按折线近似（无压感）`);
if (note.hatch) console.log(`注意：${note.hatch} 个形状是排线/网格填充，这里按纯色近似`);
if (!chrome) {
  console.log("没找到 Chrome：只生成了 HTML，可用浏览器打开后自行截图，或加 --chrome <路径>");
} else {
  for (const p of written) console.log("PNG  " + p);
}

/* ---------------- 元素渲染 ---------------- */

function renderElement(e) {
  const [open, close] = rotation(e);
  switch (e.type) {
    case "rectangle": {
      const r = e.roundness ? Math.min(20, Math.min(e.width, e.height) / 4) : 0;
      return `${open}<rect x="${n(e.x)}" y="${n(e.y)}" width="${n(e.width)}" height="${n(e.height)}" rx="${n(r)}" fill="${fill(e)}" ${stroke(e)}/>${close}`;
    }
    case "ellipse":
      return `${open}<ellipse cx="${n(e.x + e.width / 2)}" cy="${n(e.y + e.height / 2)}" rx="${n(e.width / 2)}" ry="${n(e.height / 2)}" fill="${fill(e)}" ${stroke(e)}/>${close}`;
    case "diamond":
      return `${open}<polygon points="${n(e.x + e.width / 2)},${n(e.y)} ${n(e.x + e.width)},${n(e.y + e.height / 2)} ${n(e.x + e.width / 2)},${n(e.y + e.height)} ${n(e.x)},${n(e.y + e.height / 2)}" fill="${fill(e)}" ${stroke(e)}/>${close}`;
    case "line":
    case "arrow":
    case "freedraw": {
      const pts = (e.points ?? []).map(([px, py]) => [e.x + px, e.y + py]);
      if (pts.length < 2) return "";
      const closed = isClosed(e.points ?? []);
      const coords = pts.map(([x, y]) => `${n(x)},${n(y)}`).join(" ");
      const poly = closed && hasFill(e) ? "polygon" : "polyline";
      const ink = poly === "polyline" ? ' fill="none"' : ` fill="${fill(e)}"`;
      const ms = e.startArrowhead ? ` marker-start="url(#${markerId(e.strokeColor)})"` : "";
      const me = e.endArrowhead ? ` marker-end="url(#${markerId(e.strokeColor)})"` : "";
      return `<${poly} points="${coords}"${ink} ${stroke(e)}${ms}${me}/>`;
    }
    case "text":
      return `${open}${renderText(e)}${close}`;
    case "image": {
      return `${open}<rect x="${n(e.x)}" y="${n(e.y)}" width="${n(e.width)}" height="${n(e.height)}" fill="#f4f1ea" stroke="${esc(e.strokeColor ?? "#999")}" stroke-dasharray="6 4"/><text x="${n(e.x + 8)}" y="${n(e.y + 18)}" font-family="monospace" font-size="12" fill="#999">IMAGE</text>${close}`;
    }
    default:
      return "";
  }
}

function renderText(e) {
  const fs2 = Number(e.fontSize ?? 20);
  const lh = fs2 * Number(e.lineHeight ?? 1.25);
  const anchor = e.textAlign === "center" ? "middle" : e.textAlign === "right" ? "end" : "start";
  const tx = e.textAlign === "center" ? e.x + e.width / 2 : e.textAlign === "right" ? e.x + e.width : e.x;
  const lines = String(e.text ?? "").split("\n");
  const spans = lines
    .map((line, i) => `<tspan x="${n(tx)}" y="${n(e.y + fs2 * 0.95 + lh * i)}">${esc(line) || " "}</tspan>`)
    .join("");
  const color = e.strokeColor === "transparent" ? "#1e1e1e" : e.strokeColor;
  const op = Number(e.opacity ?? 100) < 100 ? ` opacity="${n(Number(e.opacity) / 100)}"` : "";
  return `<text font-family='${fontStackOf(e.fontFamily)}' font-size="${n(fs2)}" fill="${esc(color)}" text-anchor="${anchor}" style="white-space:pre"${op}>${spans}</text>`;
}

function rotation(e) {
  const a = Number(e.angle ?? 0);
  if (!a) return ["", ""];
  const cx = e.x + e.width / 2;
  const cy = e.y + e.height / 2;
  return [`<g transform="rotate(${n((a * 180) / Math.PI)} ${n(cx)} ${n(cy)})">`, "</g>"];
}

function stroke(e) {
  const color = e.strokeColor === "transparent" ? "none" : e.strokeColor ?? "#1e1e1e";
  const dash =
    e.strokeStyle === "dashed" ? ' stroke-dasharray="9 6"' : e.strokeStyle === "dotted" ? ' stroke-dasharray="2 4"' : "";
  const op = Number(e.opacity ?? 100) < 100 ? ` opacity="${n(Number(e.opacity) / 100)}"` : "";
  return `stroke="${esc(color)}" stroke-width="${n(e.strokeWidth ?? 2)}"${dash} stroke-linecap="round" stroke-linejoin="round"${op}`;
}

function fill(e) {
  return hasFill(e) ? esc(e.backgroundColor) : "none";
}

/* ---------------- 环境 ---------------- */

function resolvePlugin(explicit) {
  const candidates = [];
  if (explicit) candidates.push(resolve(explicit));
  if (process.env.EXCALI_PLUGIN_DIR) candidates.push(resolve(process.env.EXCALI_PLUGIN_DIR));
  let dir = HERE;
  for (let i = 0; i < 6; i++) {
    candidates.push(dir);
    dir = dirname(dir);
  }
  for (const c of candidates) {
    if (existsSync(join(c, "fonts")) && (existsSync(join(c, "engine.js")) || existsSync(join(c, "scripts", "excali-board.mjs")))) {
      return realpathSync(c);
    }
  }
  throw new Error(
    "找不到插件目录（要含 fonts/ 与 engine.js）。用 --plugin 指定，或把技能放回 <插件>/script/excali-polish 下运行。",
  );
}

function findChrome(explicit) {
  if (explicit) return explicit;
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const list =
    process.platform === "darwin"
      ? [
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "/Applications/Chromium.app/Contents/MacOS/Chromium",
          "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
        ]
      : process.platform === "win32"
        ? [
            "C:/Program Files/Google/Chrome/Application/chrome.exe",
            "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
            "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
          ]
        : ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/microsoft-edge"];
  return list.find((p) => existsSync(p)) ?? null;
}

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function n(v) {
  const x = Number(v);
  return Number.isFinite(x) ? String(Math.round(x * 100) / 100) : "0";
}

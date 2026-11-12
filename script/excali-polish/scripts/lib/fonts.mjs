/**
 * 从插件的 engine.js 里还原画布真实的 @font-face 表：
 * Excalifont / Xiaolai / Comic Shanns / Nunito / Lilita 都是按 unicode-range 拆片的，
 * 逐片声明后浏览器会像画布一样按字符挑字体——这是验收渲染能看清「真字形」的关键。
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const FAMILY_BY_DIR = {
  Excalifont: "Excalifont",
  Xiaolai: "Xiaolai",
  ComicShanns: "Comic Shanns",
  Nunito: "Nunito",
  Lilita: "Lilita One",
  Cascadia: "Cascadia",
  Virgil: "Virgil",
  Liberation: "Liberation Sans",
  Assistant: "Assistant",
};

const EXTRA_FAMILY_BY_FILE = {
  "LXGWWenKaiLite-Regular.woff2": "LXGW WenKai Lite",
  "SmileySans-Oblique.woff2": "Smiley Sans",
  "Caveat.woff2": "Caveat",
  "PatrickHand-Regular.woff2": "Patrick Hand",
  "YuseiMagic-Regular.woff2": "Yusei Magic",
  "ZenKurenaido-Regular.woff2": "Zen Kurenaido",
};

/** 与画布一致的回退链：Excalifont 的 CJK 由 Xiaolai 接住（见 vendor 的 CFA()） */
export const FONT_STACK = {
  1: '"Virgil"',
  2: '"Helvetica Neue",Helvetica,Arial,sans-serif',
  3: '"Cascadia"',
  5: '"Excalifont","Xiaolai","Segoe UI Emoji",sans-serif',
  6: '"Nunito"',
  7: '"Lilita One"',
  8: '"Comic Shanns"',
  9: '"Liberation Sans"',
  101: '"LXGW WenKai Lite"',
  102: '"Smiley Sans"',
  103: '"Caveat"',
  104: '"Patrick Hand"',
  105: '"Yusei Magic"',
  106: '"Zen Kurenaido"',
};

export function fontStackOf(id) {
  return FONT_STACK[id] ?? FONT_STACK[101];
}

/**
 * @returns {{ css: string, faces: number, missing: string[] }}
 */
export function buildFontCss(pluginRoot) {
  const fontsDir = join(pluginRoot, "fonts");
  if (!existsSync(fontsDir)) throw new Error(`找不到字体目录：${fontsDir}（技能要放在插件目录下运行）`);

  const enginePath = join(pluginRoot, "engine.js");
  const ruled = [];
  const missing = [];
  if (existsSync(enginePath)) {
    const engine = readFileSync(enginePath, "utf8");
    const vars = new Map();
    for (const m of engine.matchAll(/([A-Za-z_$][\w$]*)="(\.\/fonts\/[^"]+\.woff2)"/g)) vars.set(m[1], m[2]);
    for (const m of engine.matchAll(/uri:([A-Za-z_$][\w$]*),descriptors:\{unicodeRange:"([^"]+)"([^}]*)\}/g)) {
      const rel = vars.get(m[1]);
      if (!rel) continue;
      ruled.push({ rel, range: m[2], extra: m[3] });
    }
    if (ruled.length < 5) {
      missing.push("engine.js 里的 @font-face 锚点没解析到足够分片，字体可能不是画布真实字形");
    }
  } else {
    missing.push("缺 engine.js（先 npm run build），手写/中文可能按近似字体渲染");
  }

  const faces = [];
  const seen = new Set();
  for (const r of ruled) {
    const abs = join(pluginRoot, r.rel.replace(/^\.\//, ""));
    const family = familyOf(r.rel);
    if (!family || !existsSync(abs)) continue;
    seen.add(abs);
    const weight = /weight:"(\d+)"/.exec(r.extra ?? "")?.[1];
    faces.push(face(family, abs, r.range, weight));
  }

  // 单文件字体（Cascadia/Virgil/Liberation/extra）没有 unicode-range，按目录/文件名认族
  for (const abs of walkWoff2(fontsDir)) {
    if (seen.has(abs)) continue;
    const family = familyOfFile(abs);
    if (!family) continue;
    faces.push(face(family, abs));
  }

  return { css: faces.join("\n"), faces: faces.length, missing };
}

function familyOf(rel) {
  const dir = rel.split("/")[2];
  return FAMILY_BY_DIR[dir];
}

function familyOfFile(abs) {
  const parts = abs.split(/[\\/]/);
  const dir = parts[parts.length - 2];
  const file = parts[parts.length - 1];
  return EXTRA_FAMILY_BY_FILE[file] ?? FAMILY_BY_DIR[dir] ?? null;
}

function face(family, abs, range, weight) {
  const src = pathToFileURL(abs).href;
  return (
    `@font-face{font-family:"${family}";src:url("${src}") format("woff2");` +
    (weight ? `font-weight:${weight};` : "") +
    (range ? `unicode-range:${range};` : "") +
    `font-display:block}`
  );
}

function walkWoff2(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkWoff2(p));
    else if (entry.name.endsWith(".woff2")) out.push(p);
  }
  return out;
}

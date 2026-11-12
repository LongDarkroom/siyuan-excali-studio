#!/usr/bin/env node
/**
 * 白板打磨体检：只读，不改文件。
 *
 *   node scripts/audit.mjs <board.svg> [--json report.json] [--dump scene.json]
 *
 * 找的是「看起来有缺」的几类真问题：
 *   开口折线却设了填充（Excalidraw 只给闭合折线填色）→ blocker
 *   元素被画框裁切 / 跑进别的画框 / 画框名压字 → warn
 *   文字按当前字体测量会溢出自身盒子 → warn
 *   全板只有一种字体 → warn（字体单调）
 *   文字里用字形箭头（↑ ↗ ⤢）→ info（换字体可能缺字）
 *   演示顺序 / 步骤 / id / frameId 结构错 → blocker / warn
 *
 * 退出码：有 blocker 为 1，否则 0（便于流程门禁）。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import {
  CJK,
  FONT_NAMES,
  absBox,
  decodeBoard,
  estimateWidth,
  frameLabelBox,
  hasFill,
  inside,
  isClosed,
  overlaps,
} from "./lib/board.mjs";

const args = process.argv.slice(2);
if (!args.length || args.includes("--help") || args.includes("-h")) {
  console.log(`用法：node scripts/audit.mjs <board.svg> [--json report.json] [--dump scene.json]

  --json <file>   把完整问题清单与统计写到 JSON
  --dump <file>   导出解码后的 scene，便于对照/写修复脚本`);
  process.exit(args.length ? 0 : 1);
}

const boardPath = args[0];
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const scene = decodeBoard(readFileSync(boardPath, "utf8"));
const els = scene.elements.filter((e) => !e.isDeleted);
const deleted = scene.elements.length - els.length;
const issues = [];
const add = (severity, code, message, ids = []) => issues.push({ severity, code, message, ids });

const frames = els.filter((e) => e.type === "frame");
const frameById = new Map(frames.map((f) => [f.id, f]));
const texts = els.filter((e) => e.type === "text");
const lines = els.filter((e) => e.type === "line" || e.type === "arrow");

/* ---------------- 结构 ---------------- */

const idCount = new Map();
for (const e of els) idCount.set(e.id, (idCount.get(e.id) ?? 0) + 1);
const dupIds = [...idCount].filter(([, n]) => n > 1).map(([id]) => id);
if (dupIds.length) add("blocker", "duplicate-id", "元素 id 重复：" + dupIds.join(", "), dupIds);

for (const e of els) {
  if (!e.id) add("blocker", "missing-id", `缺 id 的元素（type=${e.type}）`);
  if (!Number.isFinite(e.x) || !Number.isFinite(e.y)) add("blocker", "bad-geometry", `坐标不是数字：${e.id}`, [e.id]);
  if (e.frameId && !frameById.has(e.frameId)) add("blocker", "orphan-frame", `frameId 指向不存在的画框：${e.id}`, [e.id]);
}

const indexOf = new Map(els.map((e, i) => [e.id, i]));
for (const e of els) {
  if (!e.frameId) continue;
  const fi = indexOf.get(e.frameId);
  if (fi !== undefined && fi > indexOf.get(e.id)) {
    // 编辑器自己保存后也会出现这种次序（实测），归属看 frameId，不按数组位置判定；
    // 但生成器应把画框排前面，导出/缩略图的 z 序才稳定。
    add("info", "frame-order", `子元素排在画框之前（编辑器重排后可能出现，不影响归属）：${e.id}`, [e.id]);
  }
}

/* ---------------- 填充：Excalidraw 只填闭合折线 ---------------- */

const filled = lines.filter(hasFill);
const openFilled = filled.filter((e) => !isClosed(e.points ?? []));
if (openFilled.length) {
  add(
    "blocker",
    "fill-open-line",
    `${openFilled.length} 条折线设了填充但首尾没闭合 → 画布上不会填色（书本/色块像没画完）`,
    openFilled.map((e) => e.id),
  );
}
const closedEmpty = lines.filter((e) => isClosed(e.points ?? []) && !hasFill(e) && !e.endArrowhead);
void closedEmpty;

/* ---------------- 画框：裁切 / 串框 / 名字压字 ---------------- */

for (const f of frames) {
  const kids = els.filter((e) => e.frameId === f.id);
  const clipped = kids.filter((k) => !inside(absBox(k), f, 2));
  if (clipped.length) {
    add(
      "warn",
      "clipped-by-frame",
      `画框「${f.name}」裁切了 ${clipped.length} 个元素（部分或全部在框外）`,
      clipped.map((e) => e.id),
    );
  }
  if (!kids.length) add("info", "empty-frame", `画框「${f.name}」是空的`, [f.id]);

  for (const k of kids) {
    const box = absBox(k);
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    const other = frames.find(
      (g) => g.id !== f.id && cx >= g.x && cx <= g.x + g.width && cy >= g.y && cy <= g.y + g.height,
    );
    if (other) add("warn", "cross-frame", `元素 ${k.id} 属于「${f.name}」但落在「${other.name}」里`, [k.id, other.id]);
  }
}

for (const f of frames) {
  const label = frameLabelBox(f);
  const hitters = els.filter((e) => {
    if (e === f || e.frameId === f.id || e.type === "frame") return false;
    const box = absBox(e);
    // 背景/外边框这类「包住名字」的元素不算压字（整板底板会命中所有标签）
    if (box.x <= label.x && box.y <= label.y && box.x + box.w >= label.x + label.w && box.y + box.h >= label.y + label.h) {
      return false;
    }
    return overlaps(label, box, 4);
  });
  if (hitters.length) {
    add(
      "warn",
      "label-collision",
      `画框名「${label.text}」压住了框外元素（编辑器把名字画在框上方 20px）`,
      [f.id, ...hitters.map((e) => e.id)],
    );
  }
}
for (let i = 0; i < frames.length; i++) {
  for (let j = i + 1; j < frames.length; j++) {
    const a = frameLabelBox(frames[i]);
    const b = frameLabelBox(frames[j]);
    if (overlaps(a, b, 6)) add("warn", "label-overlap", `两个画框名重叠：${a.text} / ${b.text}`, [frames[i].id, frames[j].id]);
    const fa = frames[i];
    const fb = frames[j];
    if (overlaps({ x: fa.x, y: fa.y, w: fa.width, h: fa.height }, { x: fb.x, y: fb.y, w: fb.width, h: fb.height })) {
      add("warn", "frame-overlap", `画框互相重叠：${fa.name} / ${fb.name}`, [fa.id, fb.id]);
    }
  }
}

/* ---------------- 文字：字体单调 / 测量溢出 ---------------- */

const fontCount = new Map();
for (const t of texts) fontCount.set(t.fontFamily ?? 1, (fontCount.get(t.fontFamily ?? 1) ?? 0) + 1);
const fontRows = [...fontCount].sort((a, b) => b[1] - a[1]);
for (const [id] of fontRows) {
  if (!FONT_NAMES[id]) add("warn", "unknown-font", `未知字体 id ${id}，画布会回落系统字体`);
}
if (texts.length >= 20 && fontRows.length && fontRows[0][1] / texts.length >= 0.85) {
  add(
    "warn",
    "font-monotony",
    `${fontRows[0][1]}/${texts.length} 条文字都用 ${FONT_NAMES[fontRows[0][0]] ?? fontRows[0][0]}（字体单一）`,
  );
}

for (const t of texts) {
  const fs = Number(t.fontSize ?? 20);
  const est = estimateWidth(t.text ?? "", fs, t.fontFamily ?? 1);
  if (t.width > 0 && est > t.width * 1.08 && est - t.width > 4) {
    add(
      "warn",
      "text-overflow",
      `文字估计宽 ${est}px > 盒子 ${Math.round(t.width)}px（换字体后未重新测量？）：${JSON.stringify(String(t.text).slice(0, 24))}`,
      [t.id],
    );
  }
  if (/[↑↓←→↗↘↙↖⇧⇩⤢➜➝]/.test(String(t.text ?? ""))) {
    add(
      "info",
      "glyph-arrow",
      `文字里有字形箭头（换字体可能缺字，建议画两笔代替）：${JSON.stringify(String(t.text).slice(0, 24))}`,
      [t.id],
    );
  }
  if ([3, 6, 7, 8, 9].includes(t.fontFamily) && CJK.test(String(t.text ?? ""))) {
    add("info", "cjk-in-latin-font", `拉丁/等宽字体里混了中文（会回落到系统字体）：${JSON.stringify(String(t.text).slice(0, 24))}`, [t.id]);
  }
}

/* ---------------- 演示：顺序 / 步骤 ---------------- */

const ordered = frames.filter((f) => f.customData?.presentation?.order !== undefined);
if (!ordered.length) {
  add("info", "no-presentation", "没有演示顺序（customData.presentation.order），整块板当作一页");
} else {
  const orders = ordered.map((f) => f.customData.presentation.order);
  if (new Set(orders).size !== orders.length) {
    add("blocker", "dup-presentation-order", "多个画框共用一个演示 order：" + orders.join(", "));
  }
  for (const f of ordered) {
    const kids = els.filter((e) => e.frameId === f.id);
    const steps = kids
      .map((e) => e.customData?.presentation?.step)
      .filter((v) => v !== undefined)
      .sort((a, b) => a - b);
    const uniq = [...new Set(steps)];
    if (uniq.length && (uniq[0] !== 1 || uniq.some((v, i) => v !== i + 1))) {
      add("info", "step-gap", `画框「${f.name}」步骤号不连续：${uniq.join(", ")}`, [f.id]);
    }
  }
}
for (const e of els) {
  if (e.frameId) continue;
  if (e.customData?.presentation?.step != null) {
    add("info", "step-outside-frame", `有步骤号但不属于任何画框（演示时可能不按步骤出现）：${e.id}`, [e.id]);
  }
}

/* ---------------- 资源 ---------------- */

const missingFiles = els
  .filter((e) => e.type === "image" && e.fileId && !scene.files?.[e.fileId])
  .map((e) => e.id);
if (missingFiles.length) add("warn", "missing-image", `${missingFiles.length} 张图片的内嵌文件缺失`, missingFiles);

/* ---------------- 汇总 ---------------- */

const boxes = els.map(absBox);
const bounds = boxes.length
  ? {
      x: Math.min(...boxes.map((b) => b.x)),
      y: Math.min(...boxes.map((b) => b.y)),
      right: Math.max(...boxes.map((b) => b.x + b.w)),
      bottom: Math.max(...boxes.map((b) => b.y + b.h)),
    }
  : { x: 0, y: 0, right: 0, bottom: 0 };

const blockers = issues.filter((i) => i.severity === "blocker");
const warns = issues.filter((i) => i.severity === "warn");
const infos = issues.filter((i) => i.severity === "info");

console.log(`Excali 白板体检：${basename(boardPath)}`);
console.log(
  `元素 ${els.length} · 画框 ${frames.length} · 文字 ${texts.length} · 折线 ${lines.length}` +
    (deleted ? ` · 已删除 ${deleted}` : ""),
);
console.log(
  "字体：" +
    (fontRows.length
      ? fontRows.map(([id, n]) => `${id} ${FONT_NAMES[id] ?? "?"} ×${n}`).join(" · ")
      : "无文字"),
);
console.log(`填充：${filled.length} 条折线带填充，其中 ${openFilled.length} 条开口（开口=不会上色）`);
for (const f of frames) {
  const kids = els.filter((e) => e.frameId === f.id);
  const order = f.customData?.presentation?.order;
  console.log(
    `画框 ${order !== undefined ? `[${order}] ` : ""}${f.name} ${Math.round(f.width)}x${Math.round(f.height)} · ${kids.length} 个元素`,
  );
}
console.log(
  `范围 ${Math.round(bounds.x)},${Math.round(bounds.y)} → ${Math.round(bounds.right)},${Math.round(bounds.bottom)}`,
);
console.log(`BLOCKER ${blockers.length} · WARN ${warns.length} · INFO ${infos.length}`);
for (const i of [...blockers, ...warns, ...infos]) {
  const mark = i.severity === "blocker" ? "✗" : i.severity === "warn" ? "!" : "·";
  console.log(`${mark} [${i.severity}] ${i.code} — ${i.message}`);
}

const jsonPath = opt("--json");
if (jsonPath) {
  const report = {
    board: boardPath,
    stats: {
      elements: els.length,
      deleted,
      frames: frames.length,
      texts: texts.length,
      lines: lines.length,
      filledClosed: filled.length - openFilled.length,
      filledOpen: openFilled.length,
      fonts: Object.fromEntries(fontRows.map(([id, n]) => [FONT_NAMES[id] ?? id, n])),
      bounds,
    },
    issues,
  };
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`\nJSON 已写入：${jsonPath}`);
}

const dumpPath = opt("--dump");
if (dumpPath) {
  writeFileSync(dumpPath, JSON.stringify(scene, null, 2));
  console.log(`scene 已导出：${dumpPath}`);
}

if (blockers.length) process.exitCode = 1;

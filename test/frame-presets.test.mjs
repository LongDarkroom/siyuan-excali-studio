/**
 * 第八十一轮：标准画框（新建页）的纯逻辑。
 *
 * 这里全是**真数值断言**：比例、缩放、落点都是用户一眼能看出错的几何；
 * 尺寸算错只表现为「新页比别人大一圈」，不报错、不崩，最容易漏。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FRAME_GAP,
  FRAME_RATIOS,
  frameSizeFor,
  isFrameRatio,
  nextFrameSpot,
  presetOf,
} from "../src/studio/frame-presets.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("四个固定比例：顺序与原始尺寸是面板的对外契约", () => {
  assert.deepEqual(
    FRAME_RATIOS.map((p) => [p.ratio, p.width, p.height]),
    [
      ["16:9", 1280, 720],
      ["4:3", 1200, 900],
      ["16:10", 1280, 800],
      ["3:4", 900, 1200],
    ],
  );
  for (const p of FRAME_RATIOS) {
    const [a, b] = p.ratio.split(":").map(Number);
    assert.equal(p.width / p.height, a / b, `${p.ratio} 的宽高比必须对得上`);
    assert.equal(presetOf(p.ratio), p, "presetOf 命中自己");
    assert.equal(isFrameRatio(p.ratio), true);
  }
  assert.equal(isFrameRatio("21:9"), false, "不在清单里的比例不认");
  assert.equal(isFrameRatio(null), false);
  assert.equal(presetOf("21:9").ratio, "16:9", "未知比例兜底成第一个，不炸");
});

test("空板：直接给预设原始尺寸", () => {
  assert.deepEqual(frameSizeFor("16:9"), { width: 1280, height: 720 });
  assert.deepEqual(frameSizeFor("3:4", null), { width: 900, height: 1200 });
  assert.deepEqual(frameSizeFor("16:10", { width: 0, height: 0 }), { width: 1280, height: 800 });
});

test("有页时按最后一页的对角线缩放：同体量、不同比例", () => {
  const size = frameSizeFor("16:9", { width: 1920, height: 1080 });
  assert.deepEqual(size, { width: 1920, height: 1080 }, "同比例同尺寸：倍率正好 1");

  const classic = frameSizeFor("4:3", { width: 1920, height: 1080 });
  assert.equal(classic.width, 1762);
  assert.equal(classic.height, 1322);
  assert.ok(Math.abs(Math.hypot(classic.width, classic.height) - Math.hypot(1920, 1080)) < 1, "对角线对齐（±1px）");

  const tall = frameSizeFor("3:4", { width: 1920, height: 1080 });
  assert.ok(tall.height > tall.width, "竖版保持竖版");
  assert.ok(Math.abs(Math.hypot(tall.width, tall.height) - Math.hypot(1920, 1080)) < 1);
});

test("缩放有上下限：小页不缩成邮票，大页不铺满屏", () => {
  const tiny = frameSizeFor("16:9", { width: 200, height: 150 });
  assert.deepEqual(tiny, { width: 640, height: 360 }, "最小 0.5 倍");

  const huge = frameSizeFor("16:9", { width: 4800, height: 2700 });
  assert.deepEqual(huge, { width: 2560, height: 1440 }, "最大 2 倍");
});

test("落点：末页所在行的最右边 + 白，且不会压住同行邻居", () => {
  const a = { x: 0, y: 0, width: 1280, height: 720 };
  const b = { x: 1400, y: 20, width: 1280, height: 720 };
  const c = { x: 0, y: 900, width: 1280, height: 720 };

  assert.equal(nextFrameSpot([], a), null, "空板交给宿主放到视口中心");
  assert.equal(nextFrameSpot([a, b], null), null, "没有末页无从锚定");

  assert.deepEqual(nextFrameSpot([a], a), { x: 1280 + FRAME_GAP, y: 0 });
  assert.deepEqual(nextFrameSpot([a, b], a), { x: 2680 + FRAME_GAP, y: 0 }, "同行最右缘");
  assert.deepEqual(nextFrameSpot([a, b, c], c), { x: 1280 + FRAME_GAP, y: 900 }, "按末页所在行取右缘");
});

test("落点的行容差：轻微错位仍算同一行", () => {
  const anchor = { x: 0, y: 900, width: 1280, height: 720 };
  const mate = { x: 1600, y: 940, width: 1000, height: 720 };
  const other = { x: 3000, y: 0, width: 1280, height: 720 };
  assert.deepEqual(nextFrameSpot([mate, other], anchor), { x: 2600 + FRAME_GAP, y: 900 });
});

test("分层红线：纯逻辑模块不许依赖 React / 思源 / vendor", () => {
  const code = readFileSync(resolve(ROOT, "src/studio/frame-presets.ts"), "utf8");
  assert.equal(/from "react"|from "siyuan"|@excalidraw/.test(code), false);
});

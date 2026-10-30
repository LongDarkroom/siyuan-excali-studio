/**
 * S3：ea 元素工厂（纯函数）——默认值、按类型的特有字段、id 自增。
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { __resetIdSeq, estimateTextWidth, makeElement } from "../src/studio/ea-element.ts";

test("矩形：默认样式与圆角 {type:3}", () => {
  const el = makeElement({ type: "rectangle", x: 10, y: 20, width: 100, height: 50 });
  assert.equal(el.type, "rectangle");
  assert.equal(el.x, 10);
  assert.equal(el.width, 100);
  assert.deepEqual(el.roundness, { type: 3 });
  assert.equal(el.strokeStyle, "solid");
  assert.equal(el.opacity, 100);
  assert.equal(el.isDeleted, false);
});

test("椭圆/菱形：roundness {type:2}", () => {
  assert.deepEqual(makeElement({ type: "ellipse", x: 0, y: 0 }).roundness, { type: 2 });
  assert.deepEqual(makeElement({ type: "diamond", x: 0, y: 0 }).roundness, { type: 2 });
});

test("文本：宽高按文字估算，特有字段齐全", () => {
  const el = makeElement({ type: "text", x: 0, y: 0, text: "你好abc", fontSize: 20 });
  assert.equal(el.text, "你好abc");
  assert.equal(el.fontSize, 20);
  assert.equal(el.lineHeight, 1.25);
  assert.ok(el.width > 0);
  assert.equal(el.height, 25);
});

test("箭头：默认 points 收敛到 width/height，endArrowhead=arrow", () => {
  const el = makeElement({ type: "arrow", x: 5, y: 5, width: 100, height: 40 });
  assert.deepEqual(el.points, [[0, 0], [100, 40]]);
  assert.equal(el.endArrowhead, "arrow");
  assert.equal(el.startArrowhead, null);
});

test("frame/image：特有字段", () => {
  const frame = makeElement({ type: "frame", x: 0, y: 0, width: 200, height: 100, name: "第 1 页" });
  assert.equal(frame.name, "第 1 页");
  const img = makeElement({ type: "image", x: 0, y: 0, fileId: "f1" });
  assert.equal(img.fileId, "f1");
  assert.deepEqual(img.scale, [1, 1]);
});

test("estimateTextWidth：中文按 1、英文按 0.56 估", () => {
  const wCjk = estimateTextWidth("中文中文", 20);
  const wLat = estimateTextWidth("abcd", 20);
  assert.ok(wCjk > wLat);
  assert.equal(estimateTextWidth("", 20), 0);
});

test("id 自增不重复", () => {
  __resetIdSeq();
  const a = makeElement({ type: "rectangle", x: 0, y: 0 });
  const b = makeElement({ type: "rectangle", x: 0, y: 0 });
  assert.notEqual(a.id, b.id);
});

test("makeElement：frameId 透传（frame-collapse 展开归框），缺省 null", () => {
  assert.equal(makeElement({ type: "rectangle", x: 0, y: 0, frameId: "f1" }).frameId, "f1", "显式给的 frameId 原样进元素");
  assert.equal(makeElement({ type: "rectangle", x: 0, y: 0 }).frameId, null, "普通 add* 不进框");
  assert.equal(makeElement({ type: "text", x: 0, y: 0, frameId: null }).frameId, null, "显式 null 也认");
});

test("makeElement：折叠还原保真——绑定关系/排版/箭头绑定都透传，缺省行为不变", () => {
  // 容器挂绑定文字（还原后不该散架成浮空文本）
  const box = makeElement({ type: "rectangle", x: 0, y: 0, boundElements: [{ id: "t1", type: "text" }] });
  assert.deepEqual(box.boundElements, [{ id: "t1", type: "text" }], "容器保留 boundElements");
  assert.equal(makeElement({ type: "rectangle", x: 0, y: 0 }).boundElements, null, "缺省仍是 null（旧行为不变）");
  // 文字回指容器 + 真实行高/竖向对齐/是否随内容改宽
  const t = makeElement({
    type: "text",
    x: 0,
    y: 0,
    text: "行一\n行二",
    containerId: "box1",
    lineHeight: 1.5,
    verticalAlign: "middle",
    autoResize: false,
  });
  assert.equal(t.containerId, "box1", "文字保留 containerId");
  assert.equal(t.lineHeight, 1.5, "保留真实行高");
  assert.equal(t.verticalAlign, "middle", "保留竖向对齐");
  assert.equal(t.autoResize, false, "保留自动改宽开关");
  // 缺省仍是旧值
  const plain = makeElement({ type: "text", x: 0, y: 0, text: "x" });
  assert.equal(plain.containerId, null);
  assert.equal(plain.lineHeight, 1.25);
  assert.equal(plain.verticalAlign, "top");
  assert.equal(plain.autoResize, true);
  // 箭头绑定（还原后仍绑在原元素上）
  const ar = makeElement({ type: "arrow", x: 0, y: 0, startBinding: { elementId: "a1" }, endBinding: { elementId: "b1" } });
  assert.deepEqual(ar.startBinding, { elementId: "a1" });
  assert.deepEqual(ar.endBinding, { elementId: "b1" });
  assert.equal(makeElement({ type: "arrow", x: 0, y: 0 }).startBinding, null, "缺省仍是 null");
});

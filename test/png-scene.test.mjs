// PNG 内嵌 scene（Excalidraw tEXt 载荷）的读写：
//   - 包装 JSON 与 SVG 侧同构，但**不套 base64**（tEXt 是 Latin-1 文本）
//   - 写入只动 tEXt，像素块原样搬运
// 载荷编码借 scene-codec 的 encodePngPayloadJson（与落盘同一份实现），
// 解码用 decodePngPayload 往返；容器层另用「手工拼的最小 PNG」验证块顺序。
import { test } from "node:test";
import assert from "node:assert/strict";
import { isPngBytes, pngSceneJson, pngWithScene } from "../src/studio/png-scene.ts";
import { SceneError, decodePngPayload, encodePngPayloadJson, hasSceneInImage } from "../src/studio/scene-codec.ts";
import { assetRefFromSrc } from "../src/studio/media-ref.ts";

const SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** 最小 PNG：签名 + IHDR(13B) + IEND（CRC 用 0，读取侧不校验） */
function basePng() {
  const ihdr = [0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52, ...new Array(13).fill(0), 0, 0, 0, 0];
  const iend = [0, 0, 0, 0, 0x49, 0x45, 0x4e, 0x44, 0, 0, 0, 0];
  return new Uint8Array([...SIG, ...ihdr, ...iend]);
}

const SCENE = {
  elements: [
    { id: "rect-1", type: "rectangle", x: 0, y: 0, width: 100, height: 60 },
    { id: "text-1", type: "text", x: 10, y: 10, text: "PNG 载荷 ✓" },
  ],
  appState: { viewBackgroundColor: "#ffffff", zoom: { value: 3 } },
  files: {},
};

test("PNG 载荷往返：写 tEXt → 读回 → 解出 scene", () => {
  const json = encodePngPayloadJson(SCENE);
  const png = pngWithScene(basePng(), json);
  assert.ok(isPngBytes(png), "产物仍是 PNG");
  assert.equal(pngSceneJson(png), json, "tEXt 原文与写入一致（latin1 无损）");
  const scene = decodePngPayload(png);
  assert.equal(scene.elements.length, 2);
  assert.equal(scene.appState.viewBackgroundColor, "#ffffff");
});

test("PNG 像素块原样搬运：IHDR 紧邻新 tEXt，旧 tEXt 被替换", () => {
  const first = pngWithScene(basePng(), encodePngPayloadJson(SCENE));
  const second = pngWithScene(first, encodePngPayloadJson({ ...SCENE, elements: [] }));
  const view = new DataView(second.buffer, second.byteOffset, second.byteLength);
  const types = [];
  for (let i = 8; i + 8 <= second.length; ) {
    const len = view.getUint32(i);
    types.push(String.fromCharCode(second[i + 4], second[i + 5], second[i + 6], second[i + 7]));
    i += 12 + len;
  }
  assert.deepEqual(types, ["IHDR", "tEXt", "IEND"], "只保留一个 tEXt，且排在 IHDR 之后");
  assert.equal(decodePngPayload(second).elements.length, 0, "第二次写入的载荷生效");
});

test("PNG 无载荷 / 坏 JSON：no-payload 与 bad-payload 分开报", () => {
  assert.throws(() => decodePngPayload(basePng()), (e) => e instanceof SceneError && e.reason === "no-payload");
  assert.equal(pngSceneJson(basePng()), null);
  assert.equal(hasSceneInImage(basePng()), false);

  // 手工放一个坏的 tEXt（关键字对、内容不是 JSON）
  const bad = pngWithScene(basePng(), "{not json");
  assert.throws(() => decodePngPayload(bad), (e) => e instanceof SceneError);
});

test("hasSceneInImage：SVG / PNG 都认，普通图片为 false", () => {
  const png = pngWithScene(basePng(), encodePngPayloadJson(SCENE));
  assert.equal(hasSceneInImage(png), true);
  const svg = `<svg><!-- svg-source:excalidraw --><metadata><!-- payload-type:application/vnd.excalidraw+json --><!-- payload-version:2 --><!-- payload-start -->${btoa(
    JSON.stringify({ version: "1", encoding: "bstring", compressed: false, encoded: JSON.stringify({ type: "excalidraw", elements: [] }) }),
  )}<!-- payload-end --></metadata></svg>`;
  assert.equal(hasSceneInImage(new TextEncoder().encode(svg)), true);
  assert.equal(hasSceneInImage(new TextEncoder().encode("<svg><rect/></svg>")), false);
});

test("assetRefFromSrc：不看页面基址，按后缀截 assets 段", () => {
  assert.equal(assetRefFromSrc("assets/excalidraw-image-1.svg"), "assets/excalidraw-image-1.svg");
  assert.equal(assetRefFromSrc("/assets/sub/x.png?t=123"), "assets/sub/x.png");
  assert.equal(assetRefFromSrc("http://127.0.0.1:6806/assets/x.SVG"), "assets/x.SVG");
  assert.equal(assetRefFromSrc("assets/excali/%E7%99%BD%E6%9D%BF.svg"), "assets/excali/白板.svg");
  assert.equal(assetRefFromSrc("blob:http://127.0.0.1:6806/0a1b"), null, "blob 地址不是资产");
  assert.equal(assetRefFromSrc("assets/photo.jpg"), null, "只认 svg/png");
  assert.equal(assetRefFromSrc(""), null);
});
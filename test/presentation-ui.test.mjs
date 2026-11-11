/**
 * 第八十九轮：演示面板的两处「记忆」。
 *
 * ① 保存：抽屉写的元数据只动 customData，vendor 的脏指纹只哈希 versionNonce——
 *    不换 nonce 就等于没改过，效果/页序/入片/改名都进不了自动保存。
 *    这里钉住 applyDeckPatches / renameDeckSlide 必须 bump 版本，且同值不写。
 * ② 视图：本页/页单与选中页按白板记住，重开抽屉按画框 id 找回并把镜头开过去。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readPresentUi, writePresentUi } from "../src/studio/presentation-ui.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = (rel) => readFileSync(resolve(ROOT, "src/" + rel), "utf8");
const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'\\])\/\/[^\n]*/g, "$1");
const APP = stripComments(src("studio/StudioApp.tsx"));
const DRAWER = stripComments(src("studio/PresentationDrawer.tsx"));

/** 最小 localStorage 替身：node 默认没有，且要能模拟隐私模式抛错 */
function fakeStorage() {
  const map = new Map();
  return {
    map,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
  };
}

/* ------------------------------ ① 保存链路 ------------------------------ */

test("元数据写入必须换版本号：只改 customData 也要进脏指纹", () => {
  const at = APP.indexOf("const applyDeckPatches = useCallback");
  assert.ok(at > -1, "找得到 applyDeckPatches");
  const body = APP.slice(at, APP.indexOf("const moveDeckSlide", at));
  assert.match(body, /version: \(e\.version \?\? 1\) \+ 1, versionNonce: freshNonce\(\)/, "真正变化的元素要 +1 version 并换 nonce");
  assert.match(body, /if \(!changed\) return;/, "同值补丁不写，避免白落一次盘");
  assert.match(body, /sameJson\(custom, before\)/, "按合并后的 customData 判断有没有真变化");
});

test("改名同样要换版本号", () => {
  const at = APP.indexOf("const renameDeckSlide = useCallback");
  assert.ok(at > -1, "找得到 renameDeckSlide");
  const body = APP.slice(at, APP.indexOf("const readPresentSettings", at));
  assert.match(body, /version: \(e\.version \?\? 1\) \+ 1, versionNonce: freshNonce\(\)/, "改名也要 bump，否则同样不落盘");
  assert.match(body, /if \(!changed\) return;/, "同名不写");
});

/* ------------------------------ ② 视图记忆 ------------------------------ */

test("视图记忆：按白板分开存，局部写不覆盖另一项", () => {
  globalThis.localStorage = fakeStorage();
  writePresentUi("/data/assets/excali/A.svg", { selId: "frame-a" });
  writePresentUi("/data/assets/excali/A.svg", { view: "list" });
  assert.deepEqual(readPresentUi("/data/assets/excali/A.svg"), { view: "list", selId: "frame-a" });
  assert.equal(readPresentUi("/data/assets/excali/B.svg"), null, "另一块板不串记忆");
});

test("视图记忆：坏数据/缺键降级成默认，不抛错", () => {
  const s = fakeStorage();
  globalThis.localStorage = s;
  s.setItem("excali-present-ui:bad", "{oops");
  assert.equal(readPresentUi("bad"), null);
  s.setItem("excali-present-ui:odd", JSON.stringify({ view: "weird", selId: 42 }));
  assert.deepEqual(readPresentUi("odd"), { view: "page", selId: null });
});

test("视图记忆：localStorage 抛错时静默（隐私模式）", () => {
  globalThis.localStorage = {
    getItem: () => {
      throw new Error("denied");
    },
    setItem: () => {
      throw new Error("denied");
    },
  };
  assert.equal(readPresentUi("x"), null);
  assert.doesNotThrow(() => writePresentUi("x", { view: "list" }));
});

test("抽屉：视图初值读记忆，切换时写回", () => {
  assert.match(DRAWER, /useState<PresentView>\(\(\) => readPresentUi\(props\.boardKey\)\?\.view \?\? "page"\)/);
  assert.match(DRAWER, /writePresentUi\(props\.boardKey, \{ view: next \}\)/);
  assert.match(DRAWER, /boardKey: string;/, "抽屉要拿到按白板分组的键");
});

test("开抽屉：按画框 id 找回上次那页并把镜头开过去", () => {
  const at = APP.indexOf("const openPresentDrawer = useCallback");
  assert.ok(at > -1);
  const body = APP.slice(at, APP.indexOf("const changePresentSetting", at));
  assert.match(body, /readPresentUi\(presentBoardKey\)/);
  assert.match(body, /findIndex\(\(s\) => s\.id === ui\.selId\)/, "按 id 找回，页序变了也不怕");
  assert.match(body, /focusFrameRef\.current\(s\.id, presentSettings\.fit\)/, "恢复时镜头跟过去");
  assert.match(APP, /boardKey=\{presentBoardKey\}/, "宿主把白板键递给抽屉");
});

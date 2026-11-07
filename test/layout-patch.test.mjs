// 2026-11-07：窄面板重复底栏修复——Excalidraw 断点补丁（scripts/excalidraw-layout-patch.mjs）。
//
// vendor 0.18.1 按容器宽度 < 730px 切手机布局，思源窄页签会同时渲染 vendor 手机底栏
// 与自家底栏（两套删除/撤销/重做）。补丁复刻 Obsidian 的宿主规则：桌面宿主永远桌面布局，
// 只有思源移动端保持原断点行为。这里锁住补丁行为与构建产物契约。
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  LAYOUT_ANCHOR,
  buildLayoutPatch,
  checkLayoutVendor,
} from "../scripts/excalidraw-layout-patch.mjs";

// 从真 vendor index.js 抠出的类字段上下文（压缩局部名与真产物一致）
const VENDOR_SNIPPET =
  'C(this,"isMobileBreakpoint",(t,r)=>t<Ch||r<Sh&&t<Ih);C(this,"refreshViewportBreakpoints",()=>{if(!this.excalidrawContainerRef.current)return});';

test("布局补丁：断点前加思源移动端闸门，constants 与其余代码不动", () => {
  const out = buildLayoutPatch(VENDOR_SNIPPET);
  assert.ok(out.includes(LAYOUT_ANCHOR), "未注入思源移动端闸门");
  assert.ok(out.includes("t<Ch||r<Sh&&t<Ih"), "原断点语义应保留");
  assert.ok(out.includes('refreshViewportBreakpoints",()=>'), "后续类字段被误改");
  assert.equal(buildLayoutPatch(out), out, "重复打补丁应幂等");
});

test("布局补丁：锚点缺失/重复都 throw（宁可构建失败，不要静默留两套底栏）", () => {
  assert.throws(() => buildLayoutPatch("no anchor here"), /命中 0 处/);
  assert.throws(() => buildLayoutPatch(VENDOR_SNIPPET + VENDOR_SNIPPET), /命中 2 处/);
});

test("布局补丁：--check 对原始与已补丁代码都零问题，缺失时报一条", () => {
  assert.deepEqual(checkLayoutVendor(VENDOR_SNIPPET), []);
  assert.deepEqual(checkLayoutVendor(buildLayoutPatch(VENDOR_SNIPPET)), []);
  assert.equal(checkLayoutVendor("no anchor here").length, 1);
});

test("布局补丁：真 vendor 主包锚点唯一命中", () => {
  const vendor = new URL(
    "../node_modules/@excalidraw/excalidraw/dist/prod/index.js",
    import.meta.url,
  );
  if (!existsSync(vendor)) return; // 未安装依赖时跳过
  assert.deepEqual(checkLayoutVendor(readFileSync(vendor, "utf8")), []);
});

test("布局补丁：构建产物契约——engine.js 断点带 siyuan 闸门且仍保留手机布局代码", () => {
  const engine = new URL("../dist-engine/engine.js", import.meta.url);
  if (!existsSync(engine)) return; // 未构建时跳过（构建后由 run-all 复验）
  const code = readFileSync(engine, "utf8");
  // 压缩后的局部名会变，只认稳定的宿主判据
  assert.ok(code.includes("globalThis.siyuan?.mobile"), "engine.js 缺思源移动端闸门（窄面板仍会切手机布局）");
  assert.ok(code.includes("excalidraw--mobile"), "手机布局开关被整段删掉了（移动端会失去适配）");
});

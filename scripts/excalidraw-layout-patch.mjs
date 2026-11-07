// Excalidraw 窄面板布局补丁（构建期 vite 插件）。
//
// 背景（2026-11-07 用户截图）：思源里把白板页签拖窄到 730px 以下时，vendor 会切到
// 手机布局——根节点加 `excalidraw--mobile`，桌面 footer 与左侧属性面板整棵不渲染，
// 换成 `.App-bottom-bar`，里面自带 Edit / Duplicate / Delete / Undo / Redo。
// 我们的底栏（☰ + 🎨 + ⧉ + 🗑 + ↶↷ + 缩放）是无条件渲染的，于是出现两套删除/撤销/重做。
//
// 上游 0.18.1 的判定是**按画布容器宽高**：
//   isMobileBreakpoint(width, height) = width < 730 || (height < 500 && width < 1000)
// 而 Obsidian 的 fork（@zsviczian/excalidraw@0.18.146）改成**按宿主设备类型**：
//   getFormFactor() 里 host.isDesktop 直接返回 "desktop"，宽度再窄也不进手机布局；
//   只有手机/平板宿主才按 599px + 触摸能力进 mobile/tablet。
// 所以 Obsidian 桌面端窄面板仍是桌面/tray 布局，不会出现第二套底栏。
//
// 只靠 CSS 藏手机底栏走不通：窄宽度下 vendor 根本不渲染 `.App-menu__left`
// （属性面板本体），openPopup 置了也不出颜色弹层。必须让 vendor 继续走桌面布局。
//
// 补丁只改 dist/prod/index.js 里唯一一处断点表达式，复刻 Obsidian 的宿主规则：
//   (t,r)=>t<Ch||r<Sh&&t<Ih
//   (t,r)=>!!globalThis.siyuan?.mobile&&(t<Ch||r<Sh&&t<Ih)
// 思源桌面（window.siyuan.mobile 为假/缺省）永远桌面布局；思源移动端保持原行为。
//
// 维护：升级 @excalidraw/excalidraw 之后跑
//   node scripts/excalidraw-layout-patch.mjs --check
// 核对断点锚点仍唯一命中（压缩变量名变了没关系，锚点用稳定字面量）。
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VENDOR_FILE = resolve(ROOT, "node_modules/@excalidraw/excalidraw/dist/prod/index.js");

// 原始断点：vendor 里以类字段形式出现（`isMobileBreakpoint",(t,r)=>…` 前缀保证
// 不会误伤别处同名标识符）。Ch/Sh/Ih 是 common chunk 导出的 730/500/1000。
const ORIGINAL_ANCHOR = 'isMobileBreakpoint",(t,r)=>t<Ch||r<Sh&&t<Ih';
// 补丁后的形态；同时作为幂等标记。
export const LAYOUT_ANCHOR =
  'isMobileBreakpoint",(t,r)=>!!globalThis.siyuan?.mobile&&(t<Ch||r<Sh&&t<Ih)';

function countOccurrences(code, needle) {
  return code.split(needle).length - 1;
}

/**
 * 给 vendor 主包源码打布局补丁，返回新代码。
 * 幂等：已打过的原样返回；锚点缺失或重复 throw——宁可构建失败，不要静默留两套底栏。
 */
export function buildLayoutPatch(code) {
  if (code.includes(LAYOUT_ANCHOR)) return code;
  const hits = countOccurrences(code, ORIGINAL_ANCHOR);
  if (hits !== 1) {
    throw new Error(
      `布局补丁：isMobileBreakpoint 锚点命中 ${hits} 处（期望 1 处），vendor 升级后结构变了，核对 scripts/excalidraw-layout-patch.mjs`,
    );
  }
  return code.replace(ORIGINAL_ANCHOR, LAYOUT_ANCHOR);
}

/** --check：给定 vendor index.js 源码，断点锚点必须恰好一处（原始或已补丁） */
export function checkLayoutVendor(code) {
  const problems = [];
  const original = countOccurrences(code, ORIGINAL_ANCHOR);
  const patched = countOccurrences(code, LAYOUT_ANCHOR);
  if (original + patched !== 1) {
    problems.push(
      `isMobileBreakpoint 锚点命中 ${original + patched} 处（期望 1 处；原始 ${original}、已补丁 ${patched}）`,
    );
  }
  return problems;
}

// ---------------------------------------------------------------------------
// vite 插件：只命中 vendor 主包 index.js
// ---------------------------------------------------------------------------

const VENDOR_INDEX_RE = /[\\/]@excalidraw[\\/]excalidraw[\\/]dist[\\/]prod[\\/]index\.js$/;

export function excalidrawLayoutPatch() {
  return {
    name: "excalidraw-layout-patch",
    enforce: "pre",
    load(id) {
      const file = id.split("?")[0];
      if (!VENDOR_INDEX_RE.test(file) || !existsSync(file)) return null;
      return buildLayoutPatch(readFileSync(file, "utf8"));
    },
  };
}

// ---------------------------------------------------------------------------
// --check CLI
// ---------------------------------------------------------------------------

if (process.argv.includes("--check")) {
  if (!existsSync(VENDOR_FILE)) {
    console.error(`未找到 vendor 主包：${VENDOR_FILE}`);
    process.exitCode = 1;
  } else {
    const problems = checkLayoutVendor(readFileSync(VENDOR_FILE, "utf8"));
    if (problems.length) {
      for (const p of problems) console.error("  - " + p);
      process.exitCode = 1;
    } else {
      console.log("OK：isMobileBreakpoint 锚点唯一命中，可注入桌面端固定桌面布局补丁");
    }
  }
}

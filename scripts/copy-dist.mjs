// 把 vite 产物 + Excalidraw 的样式与字体落到插件根目录（思源只加载根目录的 index.js / index.css）。
// 用法：node scripts/copy-dist.mjs
//
// 全脚本不执行任何删除：批量删除会触发保护使构建中断，覆盖写一律用 force:true。
import { copyFileSync, cpSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const VENDOR = resolve(ROOT, "node_modules/@excalidraw/excalidraw/dist/prod");

let ok = true;

/** 读文本，缺失即记错并返回 null（让所有拷贝步骤都跑完再统一退出，便于一次看全问题） */
function readIf(path) {
  if (!existsSync(path)) {
    console.error(`[copy-dist] 未找到 ${path.replace(ROOT + "/", "")}`);
    ok = false;
    return null;
  }
  return readFileSync(path, "utf8");
}

/** 本插件样式 + Excalidraw 样式 → 根 index.css（思源只加载这一个样式文件） */
function buildIndexCss() {
  const own =
    readFileSync(existsSync(resolve(ROOT, "dist/index.css"))
      ? resolve(ROOT, "dist/index.css")
      : resolve(ROOT, "dist/style.css"), "utf8");
  const vendor = readIf(resolve(VENDOR, "index.css"));
  if (vendor === null) return;
  writeFileSync(resolve(ROOT, "index.css"), `${own}\n/* ===== @excalidraw/excalidraw dist/prod/index.css ===== */\n${vendor}`);
  console.log("[copy-dist] dist/style.css + vendor/index.css -> index.css");
}

if (existsSync(resolve(ROOT, "dist/style.css")) || existsSync(resolve(ROOT, "dist/index.css"))) {
  buildIndexCss();
} else {
  console.error("[copy-dist] 未找到 dist/style.css 或 dist/index.css，请先运行 vite build");
  ok = false;
}

copyFileSync(resolve(ROOT, "dist/index.js"), resolve(ROOT, "index.js"));
console.log("[copy-dist] dist/index.js -> index.js");

// 第二十六轮 T3：引擎单文件（scripts/build.mjs 第二趟产物）也搬到插件根目录，
// index.ts 的 lazyMod 在首次开画板页签时 require("./engine.js")
copyFileSync(resolve(ROOT, resolve("dist-engine", "engine.js")), resolve(ROOT, "engine.js"));
console.log("[copy-dist] dist-engine/engine.js -> engine.js");

// 2026-10-24 移动端：再落一份「同源静态脚本」形态 engine.boot.js。
// 引擎是 CJS（顶层 Object.defineProperty(exports…) + exports.xxx=），不能直接当全局脚本
// 加载两次（顶层 const 会重复声明，第二次 SyntaxError），所以构建期就包成
//   window.__exsEngineFactory=function(require,module,exports){ … };
// 运行时用同源 <script src> 拉起——这条路与思源自己加载 index.js 完全同机制，
// 不碰 fetch / eval / blob / inline 任一环节（移动端 WebView 上这四种都可能被拦）。
//
// 工厂函数体首行注入 process 兜底：vendor（React 等）里有若干**无 typeof 守卫**的
// process.env.NODE_ENV / process.argv 引用。桌面 Electron 有全局 process 所以不炸；
// 手机浏览器没有 ⇒ 引擎一执行就 "process is not defined"（真机截图实测）。
// 构建期 define 已把 NODE_ENV 替换掉，这里再兜一层：桌面沿用真 process，
// 浏览器（globalThis.process 缺失）才注入最小 stub，绝不覆盖桌面行为。
const PROCESS_STUB = [
  'var process=typeof globalThis<"u"&&globalThis.process?globalThis.process:{',
  'env:{NODE_ENV:"production"},browser:true,platform:"browser",version:"",',
  'argv:[],argv0:"",versions:{},pid:1,',
  'cwd:function(){return"/"},',
  'nextTick:function(f){Promise.resolve().then(f)},',
  'emit:function(){return false},on:function(){},once:function(){},',
  'removeListener:function(){},off:function(){},exit:function(){}};',
].join("");
{
  const engineCode = readFileSync(resolve(ROOT, "dist-engine", "engine.js"), "utf8");
  writeFileSync(
    resolve(ROOT, "engine.boot.js"),
    `window.__exsEngineFactory=function(require,module,exports){\n${PROCESS_STUB}\n${engineCode}\n};\n`,
  );
  console.log("[copy-dist] dist-engine/engine.js -> engine.boot.js（factory 包装 + process 兜底，供 <script src> 加载）");
}

// 2026-10-18 C：goja 内核脚本（plugin.json 的 kernels 字段加载插件根 kernel.js）
copyFileSync(resolve(ROOT, resolve("dist-kernel", "kernel.js")), resolve(ROOT, "kernel.js"));
console.log("[copy-dist] dist-kernel/kernel.js -> kernel.js");

// 2026-10-18 B'：素材库「Add to Excalidraw」落地页（浏览器独立页）。
// libraryReturnUrl 指向 /plugins/<本插件>/library-import.html；页面是静态壳
// （src-import/，零依赖零构建），引导脚本是第四趟 vite 产物（ES 单文件）。
if (!existsSync(resolve(ROOT, "dist-lib", "lib-import.js"))) {
  console.error("[copy-dist] 未找到 dist-lib/lib-import.js，请先运行 vite build");
  ok = false;
} else {
  copyFileSync(resolve(ROOT, "dist-lib", "lib-import.js"), resolve(ROOT, "lib-import.js"));
  console.log("[copy-dist] dist-lib/lib-import.js -> lib-import.js");
}
const importSrc = resolve(ROOT, "src-import", "library-import.html");
if (!existsSync(importSrc)) {
  console.error("[copy-dist] 未找到 src-import/library-import.html");
  ok = false;
} else {
  copyFileSync(importSrc, resolve(ROOT, "library-import.html"));
  console.log("[copy-dist] src-import/library-import.html -> library-import.html");
}

// 第三十一轮：画布内嵌思源块的 Embeddable 渲染页（纯静态、零依赖、零构建），
// 源在 src-embed/siyuan/，产品落插件根 embed/siyuan/ —— Embeddable 元素 link 的
// 根相对路径 /plugins/<本插件>/embed/siyuan/index.html 直接指到这里。
const embedSrc = resolve(ROOT, "src-embed", "siyuan");
if (!existsSync(resolve(embedSrc, "index.html"))) {
  console.error("[copy-dist] 未找到 src-embed/siyuan/index.html");
  ok = false;
} else {
  cpSync(embedSrc, resolve(ROOT, "embed", "siyuan"), { recursive: true, force: true });
  console.log("[copy-dist] src-embed/siyuan/ -> embed/siyuan/");
}

// Excalidraw 运行时按 window.EXCALIDRAW_ASSET_PATH + "./fonts/<家族>/<文件>.woff2" 取字体，
// 基址落在插件根目录 ⇒ 字体必须在 <插件根>/fonts/ 下，否则回落 esm.sh CDN（离线不可用）。
const fontsSrc = resolve(VENDOR, "fonts");
if (!existsSync(fontsSrc)) {
  console.error("[copy-dist] 未找到 @excalidraw/excalidraw 的 dist/prod/fonts");
  ok = false;
} else {
  cpSync(fontsSrc, resolve(ROOT, "fonts"), { recursive: true, force: true });
  console.log("[copy-dist] dist/prod/fonts/ -> fonts/");
}

if (!ok) process.exit(1);

/**
 * 2026-10-28 拖拽链接的类型图标（纯逻辑，零依赖，node 单测直跑）。
 *
 * 来源与版权口径（调研 doc《拖拽链接类型图标与字体跟随-调研-2026-10-28》第二节）：
 * 图标 path 逐枚提取自思源图标主题 litheness
 * （/Applications/Siyuan.app/Contents/Resources/appearance/icons/litheness/icon.js），
 * 绝大多数与 Lucide 同形（Lucide 为 ISC 许可，可随 MIT 项目分发）。
 * 两枚例外是 Material fill 系（listItem / html5，思源官方菜单原样在用），
 * 渲染时按 fill 模式 + 原生 viewBox，不与 Lucide stroke 系混排笔形。
 * `block`（通用回退）是自绘的 Lucide 风格方框，不来自任何主题。
 */

export type BlockIconDef = {
  /** symbol 内层元素串（<path/> 等，不含 <svg> 壳） */
  body: string;
  /** 原生 viewBox（Lucide 系 0 0 24 24；Material 系自带原值） */
  viewBox: string;
  /** stroke = Lucide 系（fill:none + stroke 着色）；fill = Material 系（fill 着色） */
  mode: "stroke" | "fill";
};

const ICONS = {
  file: { viewBox: "0 0 24 24", mode: "stroke", body: '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/>' },
  paragraph: { viewBox: "0 0 24 24", mode: "stroke", body: '<path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>' },
  headings: { viewBox: "0 0 24 24", mode: "stroke", body: '<path d="M6 12h12"/><path d="M6 20V4"/><path d="M18 20V4"/>' },
  h1: { viewBox: "0 0 24 24", mode: "stroke", body: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="m17 12 3-2v8"/>' },
  h2: { viewBox: "0 0 24 24", mode: "stroke", body: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/>' },
  h3: { viewBox: "0 0 24 24", mode: "stroke", body: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2"/>' },
  h4: { viewBox: "0 0 24 24", mode: "stroke", body: '<path d="M12 18V6"/><path d="M17 10v3a1 1 0 0 0 1 1h3"/><path d="M21 10v8"/><path d="M4 12h8"/><path d="M4 18V6"/>' },
  h5: { viewBox: "0 0 24 24", mode: "stroke", body: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17 13v-3h4"/><path d="M17 17.7c.4.2.8.3 1.3.3 1.5 0 2.7-1.1 2.7-2.5S19.8 13 18.3 13H17"/>' },
  h6: { viewBox: "0 0 24 24", mode: "stroke", body: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><circle cx="19" cy="16" r="2"/><path d="M20 10c-2 2-3 3.5-3 6"/>' },
  list: { viewBox: "0 0 24 24", mode: "stroke", body: '<path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/><path d="M8 5h13"/><path d="M8 12h13"/><path d="M8 19h13"/>' },
  orderedList: { viewBox: "0 0 24 24", mode: "stroke", body: '<path d="M11 5h10"/><path d="M11 12h10"/><path d="M11 19h10"/><path d="M4 4h1v5"/><path d="M4 9h2"/><path d="M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02"/>' },
  check: { viewBox: "0 0 24 24", mode: "stroke", body: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/>' },
  listItem: { viewBox: "30 -930 900 900", mode: "fill", body: '<path d="M360-440v-80h480v80H360ZM200-400q-33 0-56.5-23.5T120-480q0-33 23.5-56.5T200-560q33 0 56.5 23.5T280-480q0 33-23.5 56.5T200-400Z"></path>' },
  code: { viewBox: "0 0 24 24", mode: "stroke", body: '<path d="m10 9-3 3 3 3"/><path d="m14 15 3-3-3-3"/><rect x="3" y="3" width="18" height="18" rx="2"/>' },
  math: { viewBox: "0 0 24 24", mode: "stroke", body: '<path d="M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2"/>' },
  table: { viewBox: "0 0 24 24", mode: "stroke", body: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>' },
  quote: { viewBox: "0 0 24 24", mode: "stroke", body: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>' },
  super: { viewBox: "0 0 24 24", mode: "stroke", body: '<rect width="18" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/>' },
  html5: { viewBox: "-3 -3 38 38", mode: "fill", body: '<path d="M24.52 9.38l0.32-3.5h-17.68l0.94 10.68h12.24l-0.44 4.56-3.94 1.060-3.92-1.060-0.26-2.8h-3.5l0.44 5.56 7.24 2h0.080v-0.020l7.18-1.98 1-10.88h-12.88l-0.3-3.62h13.48zM1.92 0h28.16l-2.56 28.76-11.56 3.24-11.48-3.24z"></path>' },
  sql: { viewBox: "0 0 24 24", mode: "stroke", body: '<path d="M14 21h1"/><path d="M14 3h1"/><path d="M19 3a2 2 0 0 1 2 2"/><path d="M21 14v1"/><path d="M21 19a2 2 0 0 1-2 2"/><path d="M21 9v1"/><path d="M3 14v1"/><path d="M3 9v1"/><path d="M5 21a2 2 0 0 1-2-2"/><path d="M5 3a2 2 0 0 0-2 2"/><path d="M7 12h10"/><path d="M7 16h6"/><path d="M7 8h8"/><path d="M9 21h1"/><path d="M9 3h1"/>' },
  database: { viewBox: "0 0 24 24", mode: "stroke", body: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>' },
  globe: { viewBox: "0 0 24 24", mode: "stroke", body: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>' },
  both: { viewBox: "0 0 24 24", mode: "stroke", body: '<path d="M19.5 7a24 24 0 0 1 0 10"/><path d="M4.5 7a24 24 0 0 0 0 10"/><path d="M7 19.5a24 24 0 0 0 10 0"/><path d="M7 4.5a24 24 0 0 1 10 0"/><rect x="17" y="17" width="5" height="5" rx="1"/><rect x="17" y="2" width="5" height="5" rx="1"/><rect x="2" y="17" width="5" height="5" rx="1"/><rect x="2" y="2" width="5" height="5" rx="1"/>' },
  video: { viewBox: "0 0 24 24", mode: "stroke", body: '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>' },
  record: { viewBox: "0 0 24 24", mode: "stroke", body: '<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>' },
  plugin: { viewBox: "0 0 24 24", mode: "stroke", body: '<path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"/>' },
  /* 通用回退（自绘，Lucide 风格方框 + 横线）：数据库行/视图页签这类
     blocks 表查不到的 id、以及未知 type 都落这里 */
  block: { viewBox: "0 0 24 24", mode: "stroke", body: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 12h6"/>' },
} satisfies Record<string, BlockIconDef>;

export type BlockIconKey = keyof typeof ICONS;

/**
 * blocks.type/subtype → 图标键。口径对齐思源官方「搜索类型过滤」菜单
 * （调研 doc 第二节映射表）；长尾/未知类型一律回退 block 通用图标。
 * 列表与列表项共用一套 subtype 细分（o=有序 / t=任务，其余按无序）。
 */
export function blockIconKeyOf(type: unknown, subtype?: unknown): BlockIconKey {
  const t = typeof type === "string" ? type.trim() : "";
  const s = typeof subtype === "string" ? subtype.trim().toLowerCase() : "";
  switch (t) {
    case "d":
      return "file";
    case "p":
      return "paragraph";
    case "h":
      return /^h[1-6]$/.test(s) ? (s as "h1" | "h2" | "h3" | "h4" | "h5" | "h6") : "headings";
    case "l":
      return s === "o" ? "orderedList" : s === "t" ? "check" : "list";
    case "i":
      return s === "o" ? "orderedList" : s === "t" ? "check" : "listItem";
    case "c":
      return "code";
    case "m":
      return "math";
    case "t":
      return "table";
    case "b":
      return "quote";
    case "s":
      return "super";
    case "av":
      return "database";
    case "query_embed":
      return "sql";
    case "html":
      return "html5";
    case "iframe":
      return "globe";
    case "widget":
      return "both";
    case "video":
      return "video";
    case "audio":
      return "record";
    case "custom":
      return "plugin";
    default:
      return "block";
  }
}

/**
 * 图标键 + 颜色 → SVG dataURL（**base64 形态**：落盘外置通道的 parseDataUrl
 * 只认 `;base64,`）。stroke 系按 Lucide 口径描边着色；fill 系整体裁切填充。
 * 颜色来自插件内部的 --exs-accent 两态常量，仍做引号防御。
 */
export function svgIconDataUrl(key: string, color: string): string {
  const def: BlockIconDef = (ICONS as Record<string, BlockIconDef>)[key] ?? ICONS.block;
  const paint =
    def.mode === "fill"
      ? `fill="${color}" stroke="none"`
      : `fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${def.viewBox}" ${paint}>${def.body}</svg>`;
  // btoa 吃 Latin1；body/颜色都是 ASCII，仍走 TextEncoder 防御非 ASCII 颜色串
  const bytes = new TextEncoder().encode(svg);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return `data:image/svg+xml;base64,${btoa(bin)}`;
}

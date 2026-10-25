/**
 * 第三十一轮（方向 A）：画布内嵌思源块/文档。
 *
 * 机制与 Obsidian Excalidraw 的 transclusion、siyuan-embed-excalidraw 的 embed 页同路：
 * vendor 0.18.1 原生 Embeddable 元素，iframe 指向本插件 embed/siyuan 渲染页，
 * 页面与内核同源、直接 fetch /api/block/getBlockDOM 拿思源原生渲染的块 HTML
 * （渲染交给内核 Lute，本插件零渲染依赖、零第三方打包——比对标插件
 * 「exportMdContent + Vditor 自渲染」少 4MB 级静态资产）。
 *
 * 关于 newEmbeddableElement：vendor 的该工厂只从内部路径导出（子路径有 types
 * 条件、运行时不可 import），root 也没再导出——与 makeImageElement 同一局面，
 * 按字段形状手工构造（embeddable = 基础字段 + type + link；updateScene 时 vendor
 * 的 restore 分支明确支持 "embeddable"，会补齐缺省、重排 seed/index）。
 */

/** vendor 内部工厂不可用，embeddable 元素按类型形状手工构造（见文件头说明） */
export function makeEmbeddableElement(opts: {
  id: string;
  link: string;
  x: number;
  y: number;
  width: number;
  height: number;
  index: string;
  seed: number;
}): Record<string, unknown> {
  const now = Date.now();
  return {
    id: opts.id,
    type: "embeddable",
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    angle: 0,
    strokeColor: "transparent",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: opts.seed,
    version: 1,
    versionNonce: opts.seed,
    index: opts.index,
    isDeleted: false,
    boundElements: null,
    updated: now,
    link: opts.link,
    locked: false,
  };
}

/** 新嵌入元素的默认落位尺寸（600×420：足够读到一段正文，又不至于一屏塞不下两块） */
export const EMBED_DEFAULT_WIDTH = 600;
export const EMBED_DEFAULT_HEIGHT = 420;

/**
 * 渲染页链接（根相对路径；白板页签与内核同源 http://127.0.0.1:6806，浏览器按
 * origin 解析成 /plugins/…）。theme 带创建当时画布的明暗，iframe 按它选配色。
 */
export const PLUGIN_EMBED_PREFIX = "/plugins/siyuan-excali-studio/embed/";

export function embedPageLink(blockId: string, theme: string): string {
  const qs = new URLSearchParams({ blockId, theme });
  return `${PLUGIN_EMBED_PREFIX}siyuan/index.html?${qs.toString()}`;
}

/**
 * 2026-10-25 大修：这个前缀的链接需要**自渲染 iframe**（StudioApp 的 renderEmbeddable）。
 * vendor 0.18.1 给 embeddable iframe 强制 sandbox，且 allow-same-origin 只对九个合作域名
 * （youtube/vimeo/figma/…，产物内 ydA 白名单）开放；generic 链接的 sandbox 不含
 * allow-same-origin → iframe 是 opaque origin → 渲染页 fetch /api/block/getBlockDOM
 * 带不上内核会话 cookie → 必然 Auth failed，画布上嵌入框永远显示「读取块失败」。
 * 自渲染的 iframe 对自己的同源渲染页显式给 allow-same-origin。
 */
export function isPluginEmbedLink(link: unknown): boolean {
  return typeof link === "string" && link.startsWith(PLUGIN_EMBED_PREFIX);
}

/**
 * 嵌入元素的 link 白名单（ExcalidrawProps.validateEmbeddable）：
 * ① 本插件 embed 目录（思源块渲染页）一律放行；
 * ② 普通 http(s) 网页照常可嵌（Embeddable 的标准用法，vendor 默认语义）；
 * 其余（javascript:、data: 等）拒绝。
 */
export function isEmbeddableAllowed(link: unknown): boolean {
  if (typeof link !== "string") return false;
  if (isPluginEmbedLink(link)) return true;
  return /^https?:\/\//i.test(link);
}

/* ---------------- 2026-10-25 交互框：思源拖拽协议解析 ----------------
 * 三种来源（app/src/layout/dock/Files.ts、app/src/protyle/gutter/index.ts、constants.ts）：
 * ① 文档树纯文档多选：application/siyuan-documents = JSON({ids:[...]})
 * ② 文档树混选：application/siyuan-file = 逗号拼接 nodeId/path（path 形态 = 笔记本，按形状过滤）
 * ③ 正文块条：动态 MIME application/siyuan-gutter<type>\u200b<subtype>\u200b<ids>\u200b<workspaceDir>，
 *    块 ids 在第三段（零宽空格分隔）
 * 全是思源内部协议（无兼容承诺），解析必须防御式：脏数据一律当没拖。
 */

export const SIYUAN_DROP_DOCUMENTS = "application/siyuan-documents";
export const SIYUAN_DROP_FILE = "application/siyuan-file";
export const SIYUAN_DROP_GUTTER_PREFIX = "application/siyuan-gutter";
/** 零宽空格：gutter 动态 MIME 的字段分隔符 */
const ZWSP = "\u200b";

/** 思源块/文档 ID 的精确形状（14 位时间戳 + - + 7 位字母数字） */
const SIYUAN_ID_EXACT = /^[0-9]{14}-[0-9a-zA-Z]{7}$/;

/** dataTransfer 的最小形状（纯函数可测：测试喂假对象，不用真浏览器） */
export type DropDataLike = { types: readonly string[]; getData(type: string): string };

/** types 里是否带思源拖拽标记（dragover 阶段用——此时 getData 处于保护模式读不到内容，只能看 types） */
export function hasSiYuanDrag(types: readonly string[]): boolean {
  return (
    Array.isArray(types) &&
    types.some(
      (t) => t === SIYUAN_DROP_DOCUMENTS || t === SIYUAN_DROP_FILE || t.startsWith(SIYUAN_DROP_GUTTER_PREFIX),
    )
  );
}

/** 从思源拖拽里解出块/文档 ID（drop 阶段用）。非思源拖拽 / 全是笔记本 / 脏数据 → []，绝不抛错 */
export function siYuanDropIds(dt: DropDataLike): string[] {
  // 显式标注：Array.isArray 对 readonly string[] 的收窄会落到 any[]，污染下游推断
  const types: readonly string[] = Array.isArray(dt?.types) ? dt.types : [];
  const read = (t: string): string => {
    try {
      return dt.getData(t) ?? "";
    } catch {
      return "";
    }
  };

  if (types.includes(SIYUAN_DROP_DOCUMENTS)) {
    try {
      const ids = (JSON.parse(read(SIYUAN_DROP_DOCUMENTS)) as { ids?: unknown })?.ids;
      if (Array.isArray(ids)) {
        const hit = ids.filter((v): v is string => typeof v === "string" && SIYUAN_ID_EXACT.test(v));
        if (hit.length > 0) return hit;
      }
    } catch {
      /* 脏 JSON 当没拖 */
    }
  }

  if (types.includes(SIYUAN_DROP_FILE)) {
    const hit = read(SIYUAN_DROP_FILE)
      .split(",")
      .map((s) => s.trim())
      .filter((s) => SIYUAN_ID_EXACT.test(s));
    if (hit.length > 0) return hit;
  }

  const gutter = types.find((t) => t.startsWith(SIYUAN_DROP_GUTTER_PREFIX));
  if (gutter) {
    const hit = (gutter.split(ZWSP)[2] ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => SIYUAN_ID_EXACT.test(s));
    if (hit.length > 0) return hit;
  }

  return [];
}

/** 嵌入渲染页链接 → 块 ID（embedPageLink 的反向；链接不合法返回 null） */
export function blockIdOfEmbedLink(link: unknown): string | null {
  if (typeof link !== "string" || !isPluginEmbedLink(link)) return null;
  const id = new URLSearchParams(link.split("?")[1] ?? "").get("blockId");
  return typeof id === "string" && SIYUAN_ID_EXACT.test(id) ? id : null;
}

/**
 * 场景坐标下最上层的思源嵌入元素（⌘/Ctrl+点击跳文档的命中测试）。
 * 场景数组顺序即绘制顺序，后面的在上——倒序找第一个命中的。
 */
export function pluginEmbeddableAt(
  elements: readonly { type?: unknown; x?: unknown; y?: unknown; width?: unknown; height?: unknown; link?: unknown }[],
  at: { x: number; y: number },
): { link: string } | null {
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (el?.type !== "embeddable" || !isPluginEmbedLink(el.link)) continue;
    const x = typeof el.x === "number" ? el.x : 0;
    const y = typeof el.y === "number" ? el.y : 0;
    const w = typeof el.width === "number" ? el.width : 0;
    const h = typeof el.height === "number" ? el.height : 0;
    if (at.x >= x && at.x <= x + w && at.y >= y && at.y <= y + h) return { link: el.link as string };
  }
  return null;
}

/**
 * 思源块 ID 的形状：14 位日期时间 + 连字符 + 7 位字母数字
 * （如 20240101120000-abcdefg；文档/块同理）。按这个形状从任意输入里提取，
 * 兼容「siyuan://blocks/<id>」整链、裸 id、以及复制时带上的中文标注。
 */
const SIYUAN_BLOCK_ID_RE = /[0-9]{14}-[0-9a-zA-Z]{7}/;

export function parseSiYuanBlockRef(input: string): string | null {
  const m = SIYUAN_BLOCK_ID_RE.exec(input.trim());
  return m ? m[0] : null;
}

/* ---------------- 2026-10-25 紧凑文档链接（拖拽默认形态） ----------------
 * Obsidian 同款语义：拖 = 引用（一行「名字 + 链接」的文字），嵌入大框留给
 * ☰「嵌入思源块…」。这里只出 **text skeleton**（vendor convertToExcalidrawElements
 * 的入参形状）；量宽高/补默认字段由画布侧在浏览器里调 vendor 完成——本模块保持
 * 零 vendor 依赖，node 单测直接跑。
 */

/** 链接文字的默认字号与标题截断上限 */
export const BLOCK_LINK_FONT_SIZE = 20;
export const BLOCK_LINK_MAX_CHARS = 32;

/** 标题清洗 + 截断：压空白、超长加省略号；空标题返回空串（调用方回退块号） */
export function truncateBlockTitle(title: unknown): string {
  const clean = String(title ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= BLOCK_LINK_MAX_CHARS) return clean;
  return clean.slice(0, BLOCK_LINK_MAX_CHARS - 1) + "…";
}

export type BlockLinkSkeleton = {
  type: "text";
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  textAlign: "left";
  verticalAlign: "top";
  strokeColor: string;
  link: string;
};

/**
 * 块 ID + 标题 → 紧凑链接文字骨架。strokeColor 由调用方按明暗主题给
 * （StudioApp 传 --exs-accent 两态值）；link 用 siyuan:block/ 形态，单击由
 * vendor 原生 onLinkOpen 触发（StudioApp 已拦截 siyuan: 前缀 → 右侧分屏）。
 */
export function blockLinkTextSkeleton(opts: {
  blockId: string;
  title: unknown;
  x: number;
  y: number;
  accent: string;
  fontSize?: number;
}): BlockLinkSkeleton {
  const text = truncateBlockTitle(opts.title) || `块 ${opts.blockId.slice(-6)}`;
  return {
    type: "text",
    x: opts.x,
    y: opts.y,
    text,
    fontSize: opts.fontSize ?? BLOCK_LINK_FONT_SIZE,
    fontFamily: "1",
    textAlign: "left",
    verticalAlign: "top",
    strokeColor: opts.accent,
    link: `siyuan:block/${opts.blockId}`,
  };
}

/**
 * 批量取块标题的 SQL（纯函数，node 可测；IO 在 siyuan/doc.ts 的 fetchBlockTitles）。
 * ids 已过形状校验，这里仍双保险：形状再验一遍 + 单引号转义（防注入）。
 */
export function blockTitlesSqlOf(ids: string[]): string {
  const safe = ids
    .filter((id) => /^[0-9]{14}-[0-9a-zA-Z]{7}$/.test(id))
    .map((id) => `'${id.replace(/'/g, "''")}'`);
  if (safe.length === 0) return "";
  return `select id, content from blocks where id in (${safe.join(",")})`;
}

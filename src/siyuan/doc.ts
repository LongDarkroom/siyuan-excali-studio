/**
 * 与编辑器打交道的一段：找出「当前正在写的文档」、给预览图破缓存、
 * 刷新已显示的图。
 *
 * 为什么不能直接用 getAllEditor() 的最后一个：
 * 思源可以开多个页签，getAllEditor() 的顺序不保证等于「用户最后停留的那个」，
 * 所以以 switch-protyle / click-editorcontent 事件记录下来的为准，
 * 事件里的 IProtyle 断连（页签关闭）后再退回 getAllEditor()。
 * 2026-10-27：建档/白板↔文档绑定移除后，本模块不再有文档写入类 API。
 */

import { getAllEditor, type IProtyle, type Plugin } from "siyuan";
import { blockMetasSqlOf } from "../studio/embeddable";
import { docHitOf, docSearchSql, type DocSearchHit } from "../studio/doc-search.ts";
import { t } from "../i18n";
import { assetWebPath, fromAssetRef } from "../studio/storage.ts";

let lastProtyle: IProtyle | null = null;

export function trackEditor(plugin: Plugin): void {
  plugin.eventBus.on("switch-protyle", ({ detail }) => {
    lastProtyle = detail.protyle;
  });
  plugin.eventBus.on("click-editorcontent", ({ detail }) => {
    lastProtyle = detail.protyle;
  });
}

export function activeProtyle(): IProtyle | null {
  if (lastProtyle?.wysiwyg?.element?.isConnected) return lastProtyle;
  const editors = getAllEditor();
  for (let i = editors.length - 1; i >= 0; i--) {
    const p = editors[i].protyle;
    if (p?.wysiwyg?.element?.isConnected) return p;
  }
  return null;
}

/** 思源内核 JSON API（HTTP 200 + code!==0 也算失败，必须自己判） */
async function kernelJson(path: string, body: unknown): Promise<{ msg?: string; data?: unknown }> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => null)) as { code?: number; msg?: string; data?: unknown } | null;
  if (!res.ok || !json || json.code !== 0) throw new Error(json?.msg || `${path} HTTP ${res.status}`);
  return json;
}

/** /api/query/sql；stmt 里的用户输入由调用方自行转义 */
export async function querySql<T = Record<string, unknown>>(stmt: string): Promise<T[]> {
  const json = await kernelJson("/api/query/sql", { stmt });
  return Array.isArray(json.data) ? (json.data as T[]) : [];
}

/**
 * 2026-10-25 紧凑文档链接：批量取块标题（IO 侧）。
 * SQL 拼接的纯函数在 studio/embeddable.ts 的 blockTitlesSqlOf（node 可测）；
 * 文档块的 content 就是标题，段落块的 content 是正文文本（画布侧截断显示）。
 * 任何失败返回空映射——标题拿不到只影响显示文字（回退块号），绝不挡拖拽。
 */
/**
 * 2026-10-25 斜杠插入：从斜杠回调拿到的 Protyle 里解出 Lute。
 * 层级实战勘误：斜杠回调参数是 Protyle **包装类**（public protyle: IProtyle），
 * lute 挂在 IProtyle 上（思源自家 insertHTML 也走 protyle.lute.*）——
 * 包装层、IProtyle、window（网页端 bundle）三级回落，哪层有算哪层。
 */
export function resolveLute(protyle: unknown): { Md2BlockDOM?: (md: string) => string } | null {
  type LuteLike = { Md2BlockDOM?: (md: string) => string };
  const p = protyle as { protyle?: { lute?: LuteLike }; lute?: LuteLike } | null;
  return p?.protyle?.lute ?? p?.lute ?? (window as unknown as { Lute?: LuteLike }).Lute ?? null;
}

/**
 * 2026-10-25 紧凑文档链接：批量取块元数据（IO 侧）。
 * SQL 拼接的纯函数在 studio/embeddable.ts 的 blockMetasSqlOf（node 可测）；
 * 文档块的 content 就是标题，段落块的 content 是正文文本（画布侧截断显示）。
 * 2026-10-28 起连 type/subtype 一起取（拖入图标的类型分层用）。
 * 任何失败返回空映射——元数据拿不到只影响显示文字与图标（回退块号 + 通用图标），
 * 绝不挡拖拽。
 */
export type SiyuanBlockMeta = { title: string; type: string; subtype: string };

export async function fetchBlockMetas(ids: string[]): Promise<Record<string, SiyuanBlockMeta>> {
  const stmt = blockMetasSqlOf(ids);
  if (!stmt) return {};
  try {
    const rows = await querySql<{ id?: string; content?: string; type?: string; subtype?: string }>(stmt);
    const out: Record<string, SiyuanBlockMeta> = {};
    for (const r of rows) {
      if (typeof r.id !== "string") continue;
      out[r.id] = {
        title: typeof r.content === "string" ? r.content : "",
        type: typeof r.type === "string" ? r.type : "",
        subtype: typeof r.subtype === "string" ? r.subtype : "",
      };
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * 覆盖保存之后，把页面上已经在显示的同一张图重新拉一次。
 *
 * 思源给 /assets/* 发的是长缓存（immutable），文件内容变了但 URL 没变，
 * 浏览器会继续用旧图 —— 所以给 img.src 挂上 `?t=` 破缓存，**只改 DOM 不改 markdown**：
 * 文档里存的仍是干净的 assets/xxx.svg，下次重新打开自然拿到新内容。
 */
export function refreshAssetImages(dataPath: string): number {
  const want = assetWebPath(dataPath);
  let count = 0;
  document.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
    let url: URL;
    try {
      url = new URL(img.src, location.href);
    } catch {
      return;
    }
    if (decodeURIComponent(url.pathname) !== want) return;
    url.searchParams.set("t", String(Date.now()));
    img.src = url.href;
    count++;
  });
  return count;
}

/** img 的 src → 工作空间 /data 路径；不是 /assets/ 下的资源返回 null */
export function assetPathFromSrc(src: string): string | null {
  let url: URL;
  try {
    url = new URL(src, location.href);
  } catch {
    return null;
  }
  const path = decodeURIComponent(url.pathname);
  if (!path.startsWith("/assets/")) return null;
  return fromAssetRef(path.replace(/^\/+/, ""));
}

/** 块元素里第一张 assets/*.svg 图片 → /data 路径；没有就返回 null（块图标菜单判定用） */
export function svgAssetPathOf(blockElements: HTMLElement[]): string | null {
  for (const block of blockElements) {
    const img = block.tagName === "IMG" ? (block as HTMLImageElement) : block.querySelector("img");
    if (!img) continue;
    const path = assetPathFromSrc(img.getAttribute("src") || img.dataset.src || "");
    if (path && /\.svg$/i.test(path)) return path;
  }
  return null;
}

/**
 * 2026-10-30：搜思源文档（「新建思源链接」对话框的第二个入口）。
 *
 * 只搜文档块（type='d'）——链接的语义是「指向一篇文档」；段落级引用用
 * 块超链接（siyuan://blocks/…）更精确。SQL 拼装在 studio/doc-search.ts
 * （纯函数，node 可测）；这里只做 IO 与失败兜底。
 *
 * 任何失败返回空数组：搜不到只是「没结果」，绝不该把对话框搞崩。
 */
export async function searchSiyuanDocs(keyword: string): Promise<DocSearchHit[]> {
  const kw = String(keyword ?? "").trim();
  if (kw === "") return [];
  try {
    const rows = await querySql<unknown>(docSearchSql(kw));
    const out: DocSearchHit[] = [];
    for (const r of rows) {
      const hit = docHitOf(r);
      if (hit) out.push(hit);
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * 2026-10-17 第十八轮：白板库的纯逻辑（零依赖，node 测试直接 import 跑真断言）。
 *
 * 形态：白板的第一性身份是「文件」——库列表按 assets 里的 .svg 列，
 * 文档树零痕迹（2026-10-27 起建档/白板↔文档绑定整个移除，白板回归纯文件）。
 *
 * 单独成模块的口径照 board-list.ts / dock-state.ts：宿主 index.ts 带全部思源依赖，
 * 在测试里只能被文本扫描；「删除会碰到什么、显示名取谁」这些判错都是无声 bug，
 * 必须能真断言。
 */

// 相对导入带 .ts 后缀（node --experimental-strip-types 不认无后缀相对路径；Vite 两边都认）
import { backupChainOf, fileNameOf, isBackupPath, toAssetRef, toDataPath, type BoardFileEntry } from "./storage.ts";

/* ---------------- 第十八轮：文件形态的库列表 ---------------- */

/**
 * 库列表的一项 = assets 里的一个 .svg 工程文件（白板 = 图片资源，文档树零痕迹）。
 */
export type BoardFileItem = {
  /** /data/assets/x.svg */
  dataPath: string;
  /** 文件名（展示用，带 .svg） */
  name: string;
  updated: number;
};

/**
 * 文件条目 → 库列表项；保持 entries 的新→旧序。
 */
export function toBoardFileItems(entries: BoardFileEntry[]): BoardFileItem[] {
  return entries.map((e) => ({
    dataPath: toDataPath(e.path),
    name: fileNameOf(e.path),
    updated: e.updated,
  }));
}

/** 列表行显示名：剥掉 .svg 的文件名 */
export function boardDisplayName(item: BoardFileItem): string {
  return item.name.replace(/\.svg$/i, "");
}

/**
 * dock 文件库的同值跳过指纹：列表内容 + 打开态拼串，同值整段跳过 DOM 写。
 * 控制字符做分隔符，正文里的 | # 不会撞车。
 */
export function fileLibViewKey(items: BoardFileItem[], opened: ReadonlySet<string>): string {
  return items
    .map(
      (x) =>
        `${x.dataPath}\u0000${x.name}\u0000${x.updated}\u0000${opened.has(x.dataPath) ? 1 : 0}`,
    )
    .join("\u0001");
}

/**
 * 删除一项白板会碰到的东西（确认框列单用；纯函数可断言）。
 * 思源的 removeFile 是真实删除、没有回收站，所以删前列全。
 */
export type DeletePlan = {
  /** 工程文件 /data 路径 */
  svgPath: string;
  /** 备份链全部槽位 /data 路径（第十九轮滚动三份；不一定都存在，删除逐档 best-effort） */
  bakPaths: string[];
};

export function deletePlanOf(item: BoardFileItem): DeletePlan {
  return {
    svgPath: item.dataPath,
    bakPaths: backupChainOf(item.dataPath),
  };
}

/* ---------------- 第二十六轮 T6：图形点击跳文档 ---------------- */

/**
 * 解析图形元素 link 字段里的思源文档引用。约定写法 `siyuan:doc/<文档ID>`
 * （也容忍 `siyuan://doc/<id>`），命中返回文档 ID，否则 null——非思源链接
 * （http/https 等）一律放行给 vendor 自己的打开行为。
 */
export function docIdFromLink(link: unknown): string | null {
  if (typeof link !== "string") return null;
  const m = /^siyuan:(?:\/\/)?doc\/([A-Za-z0-9-]{10,})$/.exec(link.trim());
  return m ? (m[1] ?? null) : null;
}

/**
 * 2026-10-25 交互框：`siyuan:block/<块ID>` —— 画布嵌入框的跳转链接形态。
 * 与 doc 形态分开：块 ID 精确校验（14-7 形状），openTab 收到子块 ID 会打开其所在文档。
 */
export function blockIdFromLink(link: unknown): string | null {
  if (typeof link !== "string") return null;
  const m = /^siyuan:(?:\/\/)?block\/([0-9]{14}-[0-9a-zA-Z]{7})$/.exec(link.trim());
  return m ? (m[1] ?? null) : null;
}

/* ---------------- 第四十轮：白板链接（画布上的卡片） ----------------
 * 一条链接 = 一块白板的引用。三种形态各管一段路：
 *   ref   `assets/excali/x.svg`——人读、写进拖拽载荷、卡片副标题显示；
 *   link  `siyuan:excali/assets/excali/x.svg`——塞进元素 link 字段随 SVG 存盘；
 *   path  `/data/assets/excali/x.svg`——宿主读写盘用。
 * 链接沿用 `siyuan:` 前缀（第二十六轮 T6 的 doc 链接同一族），vendor 的
 * normalizeLink/sanitize-url 自定义协议原样通过，不用改内核。
 */

/** 拖拽载荷的 MIME（dock → 画布；思源/Electron 不给自定义 dataTransfer 之外的通道） */
export const BOARD_DRAG_MIME = "application/x-siyuan-excali-board";

/** 元素 link 字段里白板链接的前缀 */
export const BOARD_LINK_PREFIX = "siyuan:excali/";

/** 逐段转义再拼 `/`：路径分隔符保持可读，空格/中文/# 这些交给 encodeURIComponent */
function encodeRef(ref: string): string {
  return ref.split("/").map(encodeURIComponent).join("/");
}

function decodeRef(s: string): string {
  return s
    .split("/")
    .map((p) => {
      try {
        return decodeURIComponent(p);
      } catch {
        return p;
      }
    })
    .join("/");
}

/** 设置里的目录（可能写成 assets/excali、/data/assets/excali/）归一成引用形式 */
export function dirRef(dir: string): string {
  const s = toAssetRef(toDataPath(String(dir ?? "").trim().replace(/\\/g, "/")));
  return s.replace(/^\/+/, "").replace(/\/+$/, "");
}

/** 白板路径（任一种形态）→ 元素 link 字段值；不做校验，写方自己保证是白板 */
export function boardLinkOf(dataPath: string): string {
  return `${BOARD_LINK_PREFIX}${encodeRef(toAssetRef(toDataPath(dataPath)))}`;
}

/**
 * 任意写法的路径 → 库内引用（assets/x.svg），不合规则 null。
 * 判据即「能不能当白板打开」：必须 .svg、不是备份档（.bak1.svg 会灌满卡片）、
 * 不含 ..（防手改 SVG 里的 link 越界读别的文件）。
 */
export function boardRefOf(raw: string): string | null {
  const s = String(raw ?? "").trim().replace(/\\/g, "/");
  if (s === "") return null;
  const ref = toAssetRef(toDataPath(s));
  if (!/\.svg$/i.test(ref)) return null;
  if (isBackupPath(ref)) return null;
  if (ref.split("/").some((seg) => seg === ".." || seg === "")) return null;
  return ref;
}

/** 元素 link → 库内引用；非白板链接（http、siyuan:doc/…）一律 null 交回上游 */
export function boardRefFromLink(link: unknown): string | null {
  if (typeof link !== "string") return null;
  const s = link.trim();
  const m = /^siyuan:(?:\/\/)?excali\/(.+)$/.exec(s);
  if (!m) return null;
  return boardRefOf(decodeRef(m[1] ?? ""));
}

/** ref 是否落在目录 dir 下（dir 空 = 不限制） */
export function refInDir(ref: string, dir: string): boolean {
  const d = dirRef(dir);
  if (d === "") return true;
  return ref.startsWith(`${d}/`);
}

/** 白板链接 → /data 路径（存在性交给宿主 fileExists；这里只管语法） */
export function boardPathFromLink(link: unknown): string | null {
  const ref = boardRefFromLink(link);
  return ref ? toDataPath(ref) : null;
}

/**
 * 纯文本 → 库内白板引用。用于「把路径粘进画布自动变卡片」：
 * 支持思源的路径写法（assets/…）、/data/… 绝对写法，以及 [[…]] 包起来的写法。
 * 多行文本一律不认——粘的是段落就不是路径。
 */
export function boardRefFromText(text: unknown, dir: string): string | null {
  if (typeof text !== "string") return null;
  const s = text.trim();
  if (s === "" || s.includes("\n")) return null;
  const bare = /^\[\[(.+)\]\]$/.exec(s)?.[1] ?? s;
  const ref = boardRefOf(bare);
  if (!ref || !refInDir(ref, dir)) return null;
  return ref;
}

/** 拖拽载荷：ref + 卡片标题（dock 行上的显示名 = 剥 .svg 的文件名） */
export type BoardDragPayload = { ref: string; title: string };

/**
 * 解拖拽载荷。正常是 dock 写的 JSON，也容忍裸路径（从别处拖来的、或载荷被
 * 中间层改写过）——解不出白板 ref 就回 null，让 drop 走原有分支。
 */
export function decodeBoardDrag(raw: unknown): BoardDragPayload | null {
  if (typeof raw !== "string" || raw === "") return null;
  let ref: string | null = null;
  let title = "";
  if (raw.startsWith("{")) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
    const o = parsed as { ref?: unknown; title?: unknown };
    ref = typeof o.ref === "string" ? boardRefOf(o.ref) : null;
    title = typeof o.title === "string" ? o.title.trim() : "";
  } else {
    ref = boardRefOf(raw);
  }
  if (!ref) return null;
  // 标题缺省用文件名（与 boardDisplayName 的口径一致）
  return { ref, title: title || fileNameOf(ref).replace(/\.svg$/i, "") };
}

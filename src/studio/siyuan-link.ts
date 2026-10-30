/**
 * 2026-10-30：思源链接统一解析与归一化。
 *
 * 问题背景（用户实测撞墙）：思源里复制出来的链接有好几种形态，而画布元素只认
 * 插件自造的两种（`siyuan:doc/<id>` / `siyuan:block/<id>`），于是粘贴思源原生
 * 链接后点不开，宿主只弹一句「无法识别的文档链接」。
 *
 * 思源实际会产出的形态（本模块要认全的）：
 *   ① 块超链接        `siyuan://blocks/<块ID>`
 *   ② 文档超链接      `siyuan://doc/<文档ID>`
 *   ③ 双链（两级）    `siyuan://<文档ID>/<块ID>`
 *   ④ Markdown 块引用 `((20230101-xxxxxxx '标题'))`
 *   ⑤ Markdown 链接   `[标题](siyuan://blocks/xxx)`
 *   ⑥ 插件自造        `siyuan:doc/<id>` / `siyuan:block/<id>`（旧口径，单数）
 *   ⑦ Markdown 包住自造形态 `[标题](siyuan:block/xxx)`
 *
 * 归一化目标（元素 link 字段里存什么）：
 *   块 → `siyuan:block/<块ID>`
 *   文档 → `siyuan:doc/<文档ID>`
 * 这两种是宿主 `openBoardDocLink` 已经认得的（第四十轮起的既有约定），
 * 归一化后所有形态走同一条通道，宿主只改「认不出的引导」不用改跳转逻辑。
 *
 * 纯函数、零依赖：node 测试直接 import 跑真断言（链接判错都是无声 bug）。
 */

/** 思源块 ID：14 位时间戳 + 7 位短码 */
const BLOCK_ID_RE = /^\d{14}-[0-9a-zA-Z]{7}$/;

/** 思源文档 ID：与块 ID 同形状（14 位时间戳 + 7 位短码） */
const DOC_ID_RE = /^\d{14}-[0-9a-zA-Z]{7}$/;

/** 归一化后的块链接前缀 */
export const CANON_BLOCK_PREFIX = "siyuan:block/";

/** 归一化后的文档链接前缀 */
export const CANON_DOC_PREFIX = "siyuan:doc/";

/**
 * 识别结果的两种目标：块（精确到块）或文档（整篇）。
 * 「块」优先——思源双链 `siyuan://<doc>/<block>` 的语义就是定位到块。
 */
export type SiyuanLinkTarget =
  | { kind: "block"; id: string }
  | { kind: "doc"; id: string };

/** 剥掉 Markdown 链接包装：`[标题](目标)` → `目标` */
function unwrapMarkdownLink(raw: string): string {
  const s = raw.trim();
  // [标题](目标) —— 目标里可能带空格括号，用首个 ) 收尾（思源标题不会带 ')'）
  const m = /^\[[^\]]*\]\(([^)]*)\)$/.exec(s);
  return m ? (m[1] ?? "").trim() : s;
}

/** 剥掉块引用包装：`((20230101-xxxxxxx '标题'))` → `20230101-xxxxxxx` */
function unwrapBlockRef(raw: string): string | null {
  const s = raw.trim();
  // ((id)) 或 ((id '标题')) 或 ((id "标题"))
  const m = /^\(\(\s*([0-9A-Za-z-]+)\s*(?:['"][^'"]*['"])?\s*\)\)$/.exec(s);
  return m ? (m[1] ?? null) : null;
}

/**
 * 从任意形态里提出思源链接目标。
 *
 * 返回 null 表示「不是我们能认的思源链接」——http(s)、白板链接、纯文本等
 * 都返回 null，交给上游按各自规则处理（vendor 自己的打开行为等）。
 */
export function parseSiyuanLink(input: unknown): SiyuanLinkTarget | null {
  if (typeof input !== "string") return null;
  let s = input.trim();
  if (s === "") return null;

  // ① Markdown 块引用：((id '标题'))
  const refId = unwrapBlockRef(s);
  if (refId) {
    return BLOCK_ID_RE.test(refId) ? { kind: "block", id: refId } : null;
  }

  // ② Markdown 链接包装：[标题](目标)
  s = unwrapMarkdownLink(s);
  if (s === "") return null;

  // ③ 双链：siyuan://<文档ID>/<块ID>
  //    语义就是「在文档里定位到某个块」⇒ 第二段恒为块；两段形状相同（都是
  //    14-7），无法靠形状区分，所以**只认第二段是块**，不退化成文档。
  //    段名（doc/blocks/block）不是双链——交给下一条分支处理，别在这里吞掉。
  const dual = /^siyuan:\/\/([0-9A-Za-z-]+)\/([0-9A-Za-z-]+)$/.exec(s);
  if (dual) {
    const first = dual[1] ?? "";
    const block = dual[2] ?? "";
    const isSegmentName = first === "doc" || first === "blocks" || first === "block";
    if (!isSegmentName && BLOCK_ID_RE.test(block)) {
      return { kind: "block", id: block };
    }
    if (!isSegmentName) return null;
  }

  // ④ 思源原生超链：siyuan://blocks/<id> / siyuan://doc/<id>
  //    （blocks 是复数——这正是旧口径漏掉的那个字母）
  const native = /^siyuan:\/\/(blocks|doc|block)\/([0-9A-Za-z-]+)$/.exec(s);
  if (native) {
    const kind = native[1] ?? "";
    const id = native[2] ?? "";
    if (kind === "doc") return DOC_ID_RE.test(id) ? { kind: "doc", id } : null;
    return BLOCK_ID_RE.test(id) ? { kind: "block", id } : null;
  }

  // ⑤ 插件自造形态（单数，第四十轮的既有约定）：siyuan:block/<id> / siyuan:doc/<id>
  const own = /^siyuan:(block|doc)\/([0-9A-Za-z-]+)$/.exec(s);
  if (own) {
    const kind = own[1] ?? "";
    const id = own[2] ?? "";
    if (kind === "doc") return DOC_ID_RE.test(id) ? { kind: "doc", id } : null;
    return BLOCK_ID_RE.test(id) ? { kind: "block", id } : null;
  }

  return null;
}

/**
 * 任意形态 → 元素 link 字段该存的规范形态。
 * 不是思源链接则返回 null（调用方保持原值，别乱改用户的 http 链接）。
 */
export function normalizeSiyuanLink(input: unknown): string | null {
  const t = parseSiyuanLink(input);
  if (!t) return null;
  return t.kind === "block" ? `${CANON_BLOCK_PREFIX}${t.id}` : `${CANON_DOC_PREFIX}${t.id}`;
}

/**
 * 「这条链接指向什么」的展示文案（给提示条用）。
 * 认得出就给明确说法；认不出返回 null，由调用方给引导。
 */
export function describeSiyuanLink(input: unknown): string | null {
  const t = parseSiyuanLink(input);
  if (!t) return null;
  return t.kind === "block" ? `块引用 ${t.id}` : `文档 ${t.id}`;
}

/**
 * 输入框里的内容 → 可用的链接。
 * 三种结果：空、可用（带说明）、不可用（带该填什么的引导）。
 *
 * 放在这里（纯 .ts）而不是对话框组件里：node 的 --experimental-strip-types
 * 不认 .tsx，判错逻辑必须能在 node 里真断言。
 */
export function classifyLinkInput(raw: string): {
  state: "empty" | "ok" | "bad";
  canonical: string | null;
  hint: string;
} {
  const s = raw.trim();
  if (s === "") return { state: "empty", canonical: null, hint: "" };
  const target = parseSiyuanLink(s);
  if (target) {
    const canon = normalizeSiyuanLink(s) as string;
    const what = describeSiyuanLink(s) as string;
    return {
      state: "ok",
      canonical: canon,
      hint: `已识别：${what}，确认后点链接即可跳转`,
    };
  }
  // 认不出：分「像思源链接但格式不对」与「完全不是链接」两种说法
  const looksSiyuan = /siyuan:/i.test(s) || /^\(\(/.test(s) || /^\[[^\]]*\]\(/.test(s);
  if (looksSiyuan) {
    return {
      state: "bad",
      canonical: null,
      hint: "这个链接格式认不出。支持：块超链接 siyuan://blocks/…、文档超链接 siyuan://doc/…、块引用 ((id '标题'))",
    };
  }
  return {
    state: "bad",
    canonical: null,
    hint: "请粘贴思源链接（块超链接或块引用），或用下面的搜索找一篇文档",
  };
}

/**
 * 该不该把这条输入当成「用户想填链接」——
 * 用于在图形界面里给出主动引导（而不是等点了才知道不识别）。
 *
 * 判据：含思源协议前缀、或长得像思源块/文档 ID、或是块引用写法。
 * 纯文本（标题、路径）不算——那是别的场景（拖路径进画布走 boardRefFromText）。
 */
export function looksLikeSiyuanLink(input: unknown): boolean {
  if (typeof input !== "string") return false;
  const s = input.trim();
  if (s === "") return false;
  if (/^siyuan:/i.test(s)) return true;
  if (/^\(\(/.test(s)) return true;
  if (/^\[[^\]]*\]\(/.test(s)) return true;
  return DOC_ID_RE.test(s);
}

/**
 * 场景里哪些元素的 link 字段该被归一化（2026-10-30「粘贴即转换」）。
 *
 * 为什么不 hook vendor 的属性栏输入框：那是 vendor 私有的 React 组件，
 * 没有稳定的 DOM 锚点（它的 input 在 portal 容器里，class 随版本变）。
 * 改在**场景层**做——任何入口写进来的 link（属性栏粘贴、脚本 setLink、
 * 拖入带链接的文字）都会经过 onChange，在这里统一改写成规范形态，
 * 一次覆盖所有入口，且不依赖 vendor 内部结构。
 *
 * 返回要改的补丁列表（空数组 = 无需动）。只改「认得出但不是规范形态」的，
 * 认不出的（http 链接、白板链接、用户手写的怪东西）一律不动——不擅自改用户的东西。
 */
export function linkNormalizations(
  elements: ReadonlyArray<{ id?: unknown; link?: unknown }>,
): Array<{ id: string; link: string }> {
  const out: Array<{ id: string; link: string }> = [];
  for (const el of elements) {
    const id = typeof el?.id === "string" ? el.id : "";
    const raw = el?.link;
    if (!id || typeof raw !== "string") continue;
    const trimmed = raw.trim();
    if (trimmed === "") continue;
    const canon = normalizeSiyuanLink(trimmed);
    if (canon && canon !== trimmed) out.push({ id, link: canon });
  }
  return out;
}


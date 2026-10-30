/**
 * 2026-10-30：思源文档搜索（「新建思源链接」对话框的第二个入口）。
 *
 * 分两段（沿用本仓库口径）：
 *   ① SQL 拼装是纯函数，node 里真断言——引号转义这类判错是**无声**的：
 *      拼错不会报错，只会「搜不到」或「搜出别人」，用户完全不知道发生了什么。
 *   ② IO 走思源内核 /api/query/sql（doc.ts 的 querySql）。
 *
 * 只搜文档块（type='d'），不搜段落——链接的语义是「指向一篇文档」，
 * 段落级的引用用块超链接（siyuan://blocks/…）更精确。
 */

/** 搜索命中项 */
export type DocSearchHit = {
  id: string;
  title: string;
  /** 文档路径（人类可读的位置） */
  path: string;
};

/** SQL 字符串字面量的转义：单引号 → 两个单引号 */
export function escapeSqlString(s: string): string {
  return String(s ?? "").replace(/'/g, "''");
}

/** 去掉 LIKE 通配符（用户搜的 % 应当当普通字符） */
function escapeLikeWildcards(s: string): string {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/**
 * 拼搜索 SQL。
 *
 * - 关键词用 LIKE 匹配 content（文档块的 content 就是标题）；
 * - 命中后按 id 排序（同分页序稳定）；
 * - 限量 30 条（对话框里够用，也不给内核压力）。
 */
export function docSearchSql(keyword: string): string {
  const kw = escapeSqlString(escapeLikeWildcards(String(keyword ?? "").trim()));
  return `SELECT id, content, hpath FROM blocks WHERE type='d' AND content LIKE '%${kw}%' ESCAPE '\\' ORDER BY id LIMIT 30`;
}

/**
 * 行 → 命中项（纯函数，可断言）。
 * 标题里的换行压成空格（文档标题不该有换行，但 SQL 不保证）。
 */
export function docHitOf(row: unknown): DocSearchHit | null {
  const r = row as { id?: unknown; content?: unknown; hpath?: unknown } | null;
  if (!r || typeof r.id !== "string" || r.id === "") return null;
  const title = String(r.content ?? "").replace(/\s+/g, " ").trim();
  const path = String(r.hpath ?? "").replace(/\s+/g, " ").trim();
  return { id: r.id, title: title === "" ? r.id : title, path };
}

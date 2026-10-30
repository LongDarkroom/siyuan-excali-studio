/**
 * 2026-10-30：思源链接统一解析（P0-A）。
 *
 * 用户实测撞的墙：思源里复制出来的链接有好几种形态，画布只认插件自造的两种
 * （`siyuan:doc/<id>` / `siyuan:block/<id>`，单数），粘贴思源原生的
 * `siyuan://blocks/<id>`（复数）一律「无法识别的文档链接」。
 *
 * 本文件锁住：
 *   ① 六种思源形态都能提出目标（块/文档分清）；
 *   ② 归一化产出的是宿主 openBoardDocLink 认得的规范形态；
 *   ③ 认不出的（http、白板链接、裸文本）一律 null——不擅自改用户的东西；
 *   ④ 场景层归一化（粘贴即转换）只改「认得出但不是规范形态」的；
 *   ⑤ 文档搜索的 SQL 转义（引号/通配符）——拼错是**无声** bug。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CANON_BLOCK_PREFIX,
  CANON_DOC_PREFIX,
  describeSiyuanLink,
  linkNormalizations,
  looksLikeSiyuanLink,
  normalizeSiyuanLink,
  parseSiyuanLink,
} from "../src/studio/siyuan-link.ts";
import {
  docHitOf,
  docSearchSql,
  escapeSqlString,
} from "../src/studio/doc-search.ts";
import { classifyLinkInput } from "../src/studio/siyuan-link.ts";

/** 真实形状的思源 ID */
const BLOCK_ID = "20230101120000-abcdefg";
const DOC_ID = "20240115093000-zyxwvut";

test("parseSiyuanLink：思源原生块超链接（blocks 是复数——旧口径漏的就是这个字母）", () => {
  assert.deepEqual(parseSiyuanLink(`siyuan://blocks/${BLOCK_ID}`), { kind: "block", id: BLOCK_ID });
  // 单数形态也要认（旧口径）
  assert.deepEqual(parseSiyuanLink(`siyuan:block/${BLOCK_ID}`), { kind: "block", id: BLOCK_ID });
  // 带斜杠的协议头也要认
  assert.deepEqual(parseSiyuanLink(`siyuan://block/${BLOCK_ID}`), { kind: "block", id: BLOCK_ID });
});

test("parseSiyuanLink：文档超链接 / 双链", () => {
  assert.deepEqual(parseSiyuanLink(`siyuan://doc/${DOC_ID}`), { kind: "doc", id: DOC_ID });
  assert.deepEqual(parseSiyuanLink(`siyuan:doc/${DOC_ID}`), { kind: "doc", id: DOC_ID });
  // 双链 siyuan://<文档ID>/<块ID> → 定位到块
  assert.deepEqual(parseSiyuanLink(`siyuan://${DOC_ID}/${BLOCK_ID}`), { kind: "block", id: BLOCK_ID });
  // 双链的两段形状相同（都是 14-7）⇒ 第二段恒按块处理，不退化成文档
  assert.deepEqual(parseSiyuanLink(`siyuan://${DOC_ID}/${DOC_ID}`), { kind: "block", id: DOC_ID });
});

test("parseSiyuanLink：块引用与 Markdown 包装", () => {
  // ((id '标题'))
  assert.deepEqual(parseSiyuanLink(`((${BLOCK_ID} '标题'))`), { kind: "block", id: BLOCK_ID });
  // ((id))
  assert.deepEqual(parseSiyuanLink(`((${BLOCK_ID}))`), { kind: "block", id: BLOCK_ID });
  // ((id "标题"))
  assert.deepEqual(parseSiyuanLink(`((${BLOCK_ID} "标题"))`), { kind: "block", id: BLOCK_ID });
  // [标题](siyuan://blocks/xxx)
  assert.deepEqual(parseSiyuanLink(`[标题](siyuan://blocks/${BLOCK_ID})`), { kind: "block", id: BLOCK_ID });
  // [标题](siyuan:block/xxx) —— Markdown 包住自造形态
  assert.deepEqual(parseSiyuanLink(`[标题](siyuan:block/${BLOCK_ID})`), { kind: "block", id: BLOCK_ID });
});

test("parseSiyuanLink：认不出的都返回 null（不擅自改用户的东西）", () => {
  for (const bad of [
    "",
    "   ",
    "https://example.com",
    "siyuan://excali/assets/excali/x.svg",
    "标题文字",
    "siyuan://blocks/太短",
    "siyuan://blocks/",
    "siyuan:unknown/20230101120000-abcdefg",
    "(20230101120000-abcdefg)",
  ]) {
    assert.equal(parseSiyuanLink(bad), null, `不该认出来：${bad}`);
  }
  // 非字符串
  assert.equal(parseSiyuanLink(null), null);
  assert.equal(parseSiyuanLink(123), null);
});

test("normalizeSiyuanLink：产出宿主认得的规范形态", () => {
  assert.equal(normalizeSiyuanLink(`siyuan://blocks/${BLOCK_ID}`), `${CANON_BLOCK_PREFIX}${BLOCK_ID}`);
  assert.equal(normalizeSiyuanLink(`siyuan://doc/${DOC_ID}`), `${CANON_DOC_PREFIX}${DOC_ID}`);
  assert.equal(normalizeSiyuanLink(`((${BLOCK_ID} '标题'))`), `${CANON_BLOCK_PREFIX}${BLOCK_ID}`);
  assert.equal(normalizeSiyuanLink(`[标题](siyuan://blocks/${BLOCK_ID})`), `${CANON_BLOCK_PREFIX}${BLOCK_ID}`);
  // 已经是规范形态 → 原样
  assert.equal(normalizeSiyuanLink(`${CANON_BLOCK_PREFIX}${BLOCK_ID}`), `${CANON_BLOCK_PREFIX}${BLOCK_ID}`);
  // 认不出 → null
  assert.equal(normalizeSiyuanLink("https://example.com"), null);
});

test("describeSiyuanLink：认得出就说清是什么", () => {
  assert.equal(describeSiyuanLink(`siyuan://blocks/${BLOCK_ID}`), `块引用 ${BLOCK_ID}`);
  assert.equal(describeSiyuanLink(`siyuan://doc/${DOC_ID}`), `文档 ${DOC_ID}`);
  assert.equal(describeSiyuanLink("https://example.com"), null);
});

test("looksLikeSiyuanLink：区分「像思源链接」与「普通文本」", () => {
  assert.equal(looksLikeSiyuanLink(`siyuan://blocks/${BLOCK_ID}`), true);
  assert.equal(looksLikeSiyuanLink(`((${BLOCK_ID} '标题'))`), true);
  assert.equal(looksLikeSiyuanLink(`[标题](siyuan://blocks/${BLOCK_ID})`), true);
  assert.equal(looksLikeSiyuanLink(BLOCK_ID), true);
  assert.equal(looksLikeSiyuanLink("普通标题"), false);
  assert.equal(looksLikeSiyuanLink("https://example.com"), false);
  assert.equal(looksLikeSiyuanLink(""), false);
});

test("linkNormalizations：只改「认得出但不是规范形态」的（粘贴即转换）", () => {
  const out = linkNormalizations([
    { id: "a", link: `siyuan://blocks/${BLOCK_ID}` },
    { id: "b", link: `${CANON_BLOCK_PREFIX}${BLOCK_ID}` },
    { id: "c", link: "https://example.com" },
    { id: "d", link: "" },
    { id: "e" },
    { id: "f", link: `(( ${BLOCK_ID} '标题' ))` },
  ]);
  assert.deepEqual(out, [
    { id: "a", link: `${CANON_BLOCK_PREFIX}${BLOCK_ID}` },
    { id: "f", link: `${CANON_BLOCK_PREFIX}${BLOCK_ID}` },
  ]);
});

test("classifyInput：对话框的三态（空 / 可用 / 不可用）+ 引导文案", () => {
  const empty = classifyLinkInput("");
  assert.equal(empty.state, "empty");
  assert.equal(empty.canonical, null);

  const ok = classifyLinkInput(`siyuan://blocks/${BLOCK_ID}`);
  assert.equal(ok.state, "ok");
  assert.equal(ok.canonical, `${CANON_BLOCK_PREFIX}${BLOCK_ID}`);
  assert.ok(ok.hint.includes("已识别"), "可用时要说清识别成了什么");

  // 像思源链接但格式不对 → 明确说该填什么
  const bad = classifyLinkInput("siyuan://blocks/abc");
  assert.equal(bad.state, "bad");
  assert.equal(bad.canonical, null);
  assert.ok(bad.hint.includes("siyuan://blocks"), "引导里要给出可用的形态");

  // 完全不是链接 → 也给引导（去搜文档）
  const plain = classifyLinkInput("随便一段文字");
  assert.equal(plain.state, "bad");
  assert.ok(plain.hint.length > 0);
});

test("docSearchSql：引号与通配符都转义（拼错是无声 bug）", () => {
  // 单引号 → 两个单引号
  assert.equal(escapeSqlString("O'Brien"), "O''Brien");
  const sql = docSearchSql("O'Brien");
  assert.ok(sql.includes("O''Brien"), "引号必须转义，否则 SQL 语法错");
  assert.ok(sql.includes("type='d'"), "只搜文档块");
  assert.ok(sql.includes("LIMIT 30"), "限量");

  // 通配符当普通字符（用户搜 % 不该变成「匹配全部」）
  const pct = docSearchSql("100%");
  assert.ok(pct.includes("100\\%"), "% 必须转义");
  const under = docSearchSql("a_b");
  assert.ok(under.includes("a\\_b"), "_ 必须转义");
});

test("docHitOf：行 → 命中项（标题空时回退 id）", () => {
  assert.deepEqual(docHitOf({ id: "x", content: "  标题  ", hpath: "/a/b" }), {
    id: "x",
    title: "标题",
    path: "/a/b",
  });
  // 标题里的换行压成空格
  assert.equal(docHitOf({ id: "x", content: "a\nb" }).title, "a b");
  // 标题空 → 回退 id
  assert.equal(docHitOf({ id: "x", content: "" }).title, "x");
  // 无效行 → null
  assert.equal(docHitOf(null), null);
  assert.equal(docHitOf({}), null);
});

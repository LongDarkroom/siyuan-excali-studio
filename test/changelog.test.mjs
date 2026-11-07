/**
 * 第五十二轮：版本更新弹窗。
 *
 * 这轮的风险全在「每次重启都弹」和「弹窗挡住启动」上，所以断言分四段：
 * ① 判定与切片真跑（首装不弹、版本前缀不误伤、段边界与段尾分隔线）；
 * ② 取文件与渲染真跑（思源读不到文件回的是 HTTP 200 + JSON 错误体；Lute 拿不到要回落纯文本，
 *    且回落必须先转义——日志正文永远不能当 HTML 拼）；
 * ③ 接线：版本号构建期注入、先回写再弹、静默失败、scope 类挂 Dialog；
 * ④ 文案双语 + CSS 口径（容器圆角 / 内容边距定死 / 正文自己滚动）。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PLUGIN_VERSION,
  VERSION_SLOT,
  changelogDecision,
  changelogPath,
  fetchPluginFile,
  renderChangelogHtml,
  sliceVersionSection,
  parseChangelogVersions,
  buildChangelogDialogHtml,
  wireChangelogDialog,
} from "../src/siyuan/changelog.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function src(rel) {
  return readFileSync(resolve(ROOT, "src", rel), "utf8");
}
function json(rel) {
  return JSON.parse(readFileSync(resolve(ROOT, rel), "utf8"));
}

const MD = `# 更新日志

前言不算段。

---

## v0.2.0（2026-10-21）

### 新增：甲

正文甲。

### 改进：乙

正文乙。

---

## v0.1.0（2026-10-20）

首次公开发布。
`;

/* ------------------------------ ① 判定与切片 ------------------------------ */

test("判定：首装静默记版本、同版本不弹不回写、只有版本号变了才弹", () => {
  // 版本号取不到（构建配置漏了 / node 环境）→ 整条静默，且绝不回写空版本
  assert.equal(changelogDecision("", ""), "unknown-version");
  assert.equal(changelogDecision(undefined, "  "), "unknown-version");
  assert.equal(changelogDecision("0.1.0", ""), "unknown-version");
  // 首装：槽里没记录 = 第一次装（或从没有本功能的旧版升上来），不弹，只记版本
  assert.equal(changelogDecision("", "0.2.0"), "first-install");
  assert.equal(changelogDecision(null, "0.2.0"), "first-install");
  assert.equal(changelogDecision("   ", "0.2.0"), "first-install");
  // 看过当前版本 → 不动盘、不弹窗
  assert.equal(changelogDecision("0.2.0", "0.2.0"), "up-to-date");
  // 升级 → 弹
  assert.equal(changelogDecision("0.1.0", "0.2.0"), "show");
});

test("切片：含标题整行（日期是有用信息）、### 小节留在段内、段尾 --- 剥净", () => {
  const s = sliceVersionSection(MD, "0.2.0");
  assert.ok(s.startsWith("## v0.2.0（2026-10-21）"), "从标题行本身开始");
  assert.ok(s.includes("### 改进：乙"), "三级小节属于本段");
  assert.ok(!s.includes("v0.1.0"), "不能漏进下一版");
  assert.ok(!s.includes("首次公开发布"), "下一版正文一个字都不能带过来");
  assert.ok(!s.includes("前言不算段"), "本段之前的内容不带");
  assert.equal(s.endsWith("---"), false, "段尾分隔线要剥掉");
  assert.equal(/\s$/.test(s), false, "尾部空白也要剥掉");
});

test("切片：版本前缀不误伤（0.2 不能认领 v0.2.0 那行）；没写日志回空串", () => {
  assert.equal(sliceVersionSection(MD, "0.2"), "");
  assert.equal(sliceVersionSection(MD, "9.9.9"), "");
  assert.equal(sliceVersionSection(MD, ""), "");
  // 最后一段（后面没有下一个 ## 了）要一直切到文件末尾
  const last = sliceVersionSection(MD, "0.1.0");
  assert.ok(last.startsWith("## v0.1.0") && last.includes("首次公开发布"), "末段切到结尾");
});

test("切片：真实 CHANGELOG.md 里当前发布版本那一段切得出来", () => {
  const real = readFileSync(resolve(ROOT, "CHANGELOG.md"), "utf8");
  // 版本号只有 plugin.json 一处真源，日志段必须跟着它走（漏写一段 = 升级弹窗是空的）
  const version = json("plugin.json").version;
  const s = sliceVersionSection(real, version);
  assert.ok(s.startsWith(`## v${version}`), `v${version} 段要从自己的标题行开始`);
  assert.ok(s.length > 200, `v${version} 段不该是空的`);
  assert.ok(!s.includes("首次公开发布"), "更早版本的内容不许混进来");
});

/* ------------------------------ ② 取文件与渲染 ------------------------------ */

test("取文件：路径拼 /data/plugins/<包名>/CHANGELOG.md；读不到必须抛，不能把错误 JSON 当日志", async () => {
  const calls = [];
  const real = globalThis.fetch;
  try {
    globalThis.fetch = async (url, init) => {
      calls.push({ url, body: JSON.parse(init.body) });
      return {
        ok: true,
        status: 200,
        headers: { get: () => "text/markdown; charset=utf-8" },
        text: async () => "# 更新日志\n",
      };
    };
    assert.equal(await fetchPluginFile(changelogPath("siyuan-excali-studio")), "# 更新日志\n");
    assert.deepEqual(calls[0], {
      url: "/api/file/getFile",
      body: { path: "/data/plugins/siyuan-excali-studio/CHANGELOG.md" },
    });

    // 思源读不到文件时 HTTP 仍是 200，错误体是 JSON——两道判据各来一次
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      text: async () => '{"code":-1,"msg":"File not exists"}',
    });
    await assert.rejects(() => fetchPluginFile("/data/plugins/x/CHANGELOG.md"));

    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      headers: { get: () => "application/json; charset=utf-8" },
      text: async () => '{"code":404,"msg":"File not exists"}',
    });
    await assert.rejects(() => fetchPluginFile("/data/plugins/x/CHANGELOG.md"));

    globalThis.fetch = async () => ({ ok: false, status: 500, headers: { get: () => "" }, text: async () => "" });
    await assert.rejects(() => fetchPluginFile("/data/plugins/x/CHANGELOG.md"), /HTTP 500/);
  } finally {
    globalThis.fetch = real;
  }
});

test("渲染：有 Lute 就用它（跟内置插件同一个渲染器）；拿不到回落 <pre> 且必须转义", () => {
  const g = globalThis;
  const realLute = g.Lute;
  try {
    g.Lute = { New: () => ({ Md2HTML: (md) => `<p>${md}</p>` }) };
    assert.equal(renderChangelogHtml("甲 **乙**"), "<p>甲 **乙**</p>");
    // Lute 在但抛错 / 返回空 → 一样回落，不出现空白弹窗
    g.Lute = { New: () => ({ Md2HTML: () => "" }) };
    assert.match(renderChangelogHtml("甲"), /exs-changelog__plain/);
    g.Lute = { New: () => ({ Md2HTML: () => { throw new Error("boom"); } }) };
    assert.match(renderChangelogHtml("乙"), /exs-changelog__plain/);
  } finally {
    if (realLute === undefined) delete g.Lute;
    else g.Lute = realLute;
  }
  delete g.Lute;
  const html = renderChangelogHtml('<script>alert("x")</script> 甲');
  assert.equal(html.includes("<script>"), false, "回落分支不能把正文当 HTML 拼");
  assert.ok(html.includes("&lt;script&gt;"), "转义后再塞");
});

/* ------------------------------ ③ 接线 ------------------------------ */

test("版本号来自构建期注入：node 里（未 define）就是空串，判定自动走静默分支", () => {
  assert.equal(PLUGIN_VERSION, "", "typeof 守卫：测试环境没有 define，必须是空串而不是 ReferenceError");
  assert.equal(changelogDecision("0.1.0", PLUGIN_VERSION), "unknown-version");
  const BUILD = readFileSync(resolve(ROOT, "scripts/build.mjs"), "utf8");
  assert.match(BUILD, /import \{ readFileSync \} from "node:fs";/, "构建脚本得能读 plugin.json");
  assert.match(BUILD, /const PLUGIN_VERSION = JSON\.parse\(readFileSync\(resolve\(ROOT, "plugin\.json"\), "utf8"\)\)\.version;/, "唯一真源 = plugin.json");
  assert.match(BUILD, /__EXCALI_PLUGIN_VERSION__: JSON\.stringify\(PLUGIN_VERSION\)/, "vite define 注入");
  assert.match(BUILD, /define: \{[\s\S]{0,120}__EXCALI_PLUGIN_VERSION__/, "define 挂在主包/引擎共用的 config() 上");
});

test("接线：挂在 onload 末尾、先回写版本再弹、脏版本绝不落盘", () => {
  const INDEX = src("index.ts");
  assert.match(INDEX, /from "\.\/siyuan\/changelog";/, "宿主层引纯逻辑");
  assert.match(INDEX, /void this\.maybeShowChangelog\(\);/, "不 await——弹窗不该挡启动");
  assert.match(INDEX, /const action = changelogDecision\(await this\.loadData\(VERSION_SLOT\), PLUGIN_VERSION\);/, "读独立槽");
  assert.match(INDEX, /if \(action === "unknown-version" \|\| action === "up-to-date"\) return;\n\s*\/\/[^\n]*\n\s*await this\.saveData\(VERSION_SLOT, PLUGIN_VERSION\);/, "脏版本先挡掉，才回写");
  assert.match(INDEX, /await this\.saveData\(VERSION_SLOT, PLUGIN_VERSION\);\n\s*if \(action !== "show"\) return;/, "回写在弹窗之前（首装也要记上）");
  assert.match(INDEX, /buildChangelogDialogHtml\(await fetchPluginFile\(changelogPath\(this\.name\)\), PLUGIN_VERSION, \{/, "单一真源：运行时读包内 CHANGELOG.md，构建双栏全历史");
  assert.match(INDEX, /if \(!html\) return;/, "这个版本没写日志就静默");
  assert.match(INDEX, /width: "min\(860px, calc\(100vw - 56px\)\)"/, "双栏弹窗要留出窗口边距");
  assert.match(INDEX, /height: "min\(68vh, 620px\)"/, "弹窗高度必须收在窗口内");
  assert.match(INDEX, /hideCloseIcon: true/, "原生关闭图标让位给自绘 hero 的 ×");
  assert.match(INDEX, /dialog\.element\.classList\.add\("exs-changelog-dialog"\)/, "样式挂 scope 类，不裸改全局");
  assert.match(INDEX, /wireChangelogDialog\(dialog\.element, \(\) => dialog\.destroy\(\)\)/, "版本切换与关闭走根节点委托");
  assert.match(INDEX, /console\.warn\("\[excali-studio\] 更新日志读取失败", e\)/, "全程静默失败，只留一条 warn");
  // 存储槽必须独立：persist() 整对象覆写 excali-studio.json，塞进去迟早被漏掉
  assert.match(src("siyuan/changelog.ts"), /VERSION_SLOT = "excali-studio-version"/, "槽名单独一个，不塞 settings");
  assert.equal(INDEX.includes("saveData(STORAGE_KEY"), true, "顺手确认宿主 settings 槽没被牵连");
});

/* ------------------------------ ④ 样式与文案 ------------------------------ */

test("CSS：双栏布局 + 卡片 + 深色对调 + 窄屏横排", () => {
  const CSS = src("index.css");
  assert.match(CSS, /\.exs-changelog-dialog \.b3-dialog__container \{[\s\S]{0,200}border-radius: 18px;/, "与命名/拓展功能对话框同口径");
  assert.match(CSS, /\.exs-changelog-dialog \.b3-dialog__header \{\n  display: none;\n\}/, "原生标题栏退场");
  assert.match(CSS, /\.exs-changelog-dialog \.b3-dialog__body,/, "内容挂在 __body（思源现行 DOM）");
  assert.match(CSS, /\.exs-changelog-dialog \.b3-dialog__content \{\n  flex: 1;\n  min-height: 0;\n  display: flex;/, "content 边距必须定死，双栏才能铺满");
  assert.match(CSS, /max-height: calc\(100dvh - 48px\)/, "弹窗必须有窗口高度兜底");
  assert.match(CSS, /--cl-brand: #6965db;/, "品牌紫（浅色档）");
  assert.match(CSS, /html\[data-theme-mode="dark"\] \.exs-changelog-dialog \{[\s\S]{0,120}--cl-brand: #a8a5ff;/, "深色档换亮紫");
  assert.match(CSS, /\.exs-changelog-dialog \.cl-rail \{/, "缺左侧版本时间线");
  assert.match(CSS, /\.exs-changelog-dialog \.cl-group \{/, "缺分组白卡片");
  assert.match(CSS, /\.exs-changelog-dialog \.cl-ver\.is-active \{/, "缺当前版本选中态");
  assert.match(CSS, /@media \(max-width: 760px\)[\s\S]{0,1600}\.cl-rail \{/, "窄屏版本列必须横过来");
  assert.match(CSS, /\.exs-changelog-dialog \.exs-changelog__plain \{[\s\S]{0,80}white-space: pre-wrap;/, "纯文本回落不丢换行");
});

/* ------------------------------ ⑤ 全历史解析 ------------------------------ */

const HISTORY = `# 更新日志

文档前言，不算版本。

## v0.2.0 (2026-10-26)

首段引导语。

### 甲组
- **重点**：甲。
- 甲二。

### 乙组
正文乙。

---

## v0.1.0（2026-10-20）

首次发布。

### 修复
- 只有一条。
`;

const LABELS = {
  title: "版本更新",
  subtitle: "每一次更新优化了什么、解决了什么问题，都记在这里。",
  history: "历史版本",
  latest: "最新",
  current: "当前已是最新版本",
  archived: "历史版本记录",
  ok: "知道了",
  close: "关闭",
};

test("解析：半角 / 全角日期括号都认，前言跳过，`###` 切组", () => {
  const versions = parseChangelogVersions(HISTORY);
  assert.equal(versions.length, 2);
  assert.equal(versions[0].version, "0.2.0");
  assert.equal(versions[0].date, "2026-10-26");
  assert.equal(versions[1].version, "0.1.0");
  assert.equal(versions[1].date, "2026-10-20");
  assert.equal(versions[0].lead, "首段引导语。");
  assert.deepEqual(versions[0].groups.map((g) => g.title), ["甲组", "乙组"]);
  assert.ok(versions[0].groups[0].markdown.includes("**重点**"));
  assert.ok(!versions[0].groups[0].markdown.includes("### 乙组"), "组正文不能串到下一组");
  assert.ok(!versions[0].groups[1].markdown.includes("---"), "段尾分隔线要剥掉");
  assert.deepEqual(parseChangelogVersions("# 更新日志\n\n没有二级标题"), []);
});

test("构建：全版本进左栏，默认选中当前版本；缺失时回落最新一版", () => {
  const html = buildChangelogDialogHtml(HISTORY, "0.1.0", LABELS);
  assert.equal((html.match(/data-cl-ver="/g) || []).length, 2, "两个版本都要进左栏");
  assert.equal((html.match(/data-cl-page="/g) || []).length, 2, "每一版都要有详情页");
  assert.match(html, /class="cl-ver is-active" data-cl-ver="1" aria-current="true"/);
  assert.match(html, /<section class="cl-page" data-cl-page="0" hidden>/);
  assert.match(html, /<section class="cl-page" data-cl-page="1" data-cl-current="true">/);
  assert.ok(html.includes("历史版本记录"), "非当前版本页脚是历史记录");

  const fallback = buildChangelogDialogHtml(HISTORY, "9.9.9", LABELS);
  assert.match(fallback, /class="cl-ver is-active" data-cl-ver="0"/);
  assert.ok(!fallback.includes('data-cl-current="true"'), "版本对不上时不能自己认领「当前」");
  assert.ok(
    fallback.includes('<span class="cl-foot-status">历史版本记录</span>'),
    "版本对不上时页脚只能说「历史版本记录」"
  );
});

test("构建：标题/徽标/按钮齐备，且所有动态文本转义", () => {
  const md = `## v1.0.0 (2026-01-01)\n\n### <img src=x onerror=alert(1)>\n- <script>alert(1)</script>\n`;
  const html = buildChangelogDialogHtml(md, "1.0.0", LABELS);
  assert.ok(html.includes("What's new"));
  assert.ok(html.includes('<span class="cl-new">最新</span>'));
  assert.ok(html.includes("data-cl-ok>知道了</button>"));
  assert.ok(html.includes('aria-label="关闭"'));
  assert.ok(html.includes("<pre class=\"exs-changelog__plain\">"), "没有 Lute 时回落 <pre>");
  assert.ok(!html.includes("<script>"), "正文不能被当 HTML 拼");
  assert.ok(html.includes("&lt;script&gt;"), "尖括号要转义");
  assert.ok(!html.includes("<img src=x"), "小节标题也要转义");
});

test("构建：页脚只有一份、在滚动区之外，且带切换用的状态文案", () => {
  const html = buildChangelogDialogHtml(HISTORY, "0.2.0", LABELS);
  assert.equal((html.match(/<footer class="cl-foot">/g) || []).length, 1, "页脚不能每页各来一份");
  assert.ok(html.indexOf('<footer class="cl-foot">') > html.indexOf("</main>"), "页脚必须在滚动容器后面");
  assert.ok(html.includes('class="cl-foot-status"'));
  assert.ok(html.includes('data-cl-text-current="当前已是最新版本"'));
  assert.ok(html.includes('data-cl-text-archived="历史版本记录"'));
  assert.equal((html.match(/data-cl-current="true"/g) || []).length, 1, "只有当前版本页打标");
});

test("交互接线：根节点事件委托、hidden 切页、关闭回调", () => {
  const fn = wireChangelogDialog.toString();
  assert.match(fn, /addEventListener\("click"/, "必须用根节点委托");
  assert.ok(fn.includes("data-cl-ver"), "版本切换走 data 属性");
  assert.ok(fn.includes("data-cl-close"), "自绘 × 走 data 属性");
  assert.ok(fn.includes("data-cl-ok"), "「知道了」走 data 属性");
  assert.ok(fn.includes(".hidden ="), "切页用 hidden 显隐");
  assert.ok(fn.includes("cl-foot-status"), "切页时要同步底部状态文案");
  assert.ok(fn.includes("data-cl-current"), "当前版本页靠 data 属性识别");
  assert.ok(fn.includes("scrollTop = 0"), "换版本要回到页首，不能停在上一版滚到的位置");
});

test("i18n：「更新日志」双语齐备，中文原文即 key", () => {
  const zh = json("i18n/zh_CN.json");
  const en = json("i18n/en_US.json");
  assert.equal(zh["更新日志"], "更新日志");
  assert.ok(en["更新日志"] && en["更新日志"] !== "更新日志", "en_US 该是真英文");
  assert.match(src("index.ts"), /t\("更新日志"\)/, "标题用词条 + 版本号");
});

/**
 * 第八十三轮：技能分发。
 *
 * ① 纯函数真跑：占位符必须被绝对路径填满，两种安装形态的话术必须按事实切换；
 * ② 与 SKILL.md / 打包口径对齐：版本、目录、CLI 位置不能各说各话；
 * ③ 接线与文案：面板一节、宿主窄接口、双语齐备、样式类名一字不差。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  POLISH_SKILL_NAME,
  SKILL_NAME,
  SKILL_VERSION,
  STYLE_SKILL_NAME,
  agentSkillLink,
  channelNote,
  cliPath,
  drawRequestText,
  drawSkillDir,
  indexLine,
  installCommand,
  polishSkillDir,
  promptText,
  styleCall,
  styleSkillDir,
} from "../src/studio/ai/skill-dispatch.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function src(rel) {
  return readFileSync(resolve(ROOT, "src", rel), "utf8");
}
function file(rel) {
  return readFileSync(resolve(ROOT, rel), "utf8");
}
function stripComments(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'\\])\/\/[^\n]*/g, "$1");
}

const APP = stripComments(src("studio/StudioApp.tsx"));
const TAB = stripComments(src("studio/tab.tsx"));
const PANEL = stripComments(src("studio/AiChannelsPanel.tsx"));
const INDEX = stripComments(src("index.ts"));
const CSS = src("index.css");
const PACK = stripComments(file("scripts/pack.mjs"));
const SKILL_MD = file("script/excali-draw/SKILL.md");
const STYLE_MD = file("script/excali-style/SKILL.md");
const POLISH_MD = file("script/excali-polish/SKILL.md");

const LOCAL = { pluginDir: "/ws/data/plugins/siyuan-excali-studio", hasCli: true };
const MARKET = { pluginDir: "/ws/data/plugins/siyuan-excali-studio", hasCli: false };

/* ---------------- ① 纯函数 ---------------- */

test("路径：三段绝对路径都从插件目录长出来，正斜杠无尾斜杠", () => {
  assert.equal(drawSkillDir(LOCAL), "/ws/data/plugins/siyuan-excali-studio/script/" + SKILL_NAME);
  assert.equal(styleSkillDir(LOCAL), "/ws/data/plugins/siyuan-excali-studio/script/" + STYLE_SKILL_NAME);
  assert.equal(polishSkillDir(LOCAL), "/ws/data/plugins/siyuan-excali-studio/script/" + POLISH_SKILL_NAME);
  assert.equal(cliPath(LOCAL), "/ws/data/plugins/siyuan-excali-studio/scripts/excali-board.mjs");
  assert.equal(
    drawSkillDir({ pluginDir: "/ws/data/plugins/p/", hasCli: true }),
    "/ws/data/plugins/p/script/excali-draw",
    "尾斜杠要吃掉，别拼出 //",
  );
  assert.equal(agentSkillLink(), "~/.agents/skills/excali-draw");
});

const WIN = { pluginDir: "C:/SiYuan/data/plugins/siyuan-excali-studio", hasCli: false, platform: "windows" };

test("Windows：安装命令换 Junction，链接位置与路径分隔符跟着变", () => {
  const cmd = installCommand(WIN);
  assert.equal(cmd.includes("ln -sfn"), false, "Windows 没有 ln -sfn");
  assert.ok(cmd.includes("New-Item -ItemType Junction"), "目录联接不需要管理员/开发者模式");
  assert.ok(cmd.includes('$HOME\\.agents\\skills\\excali-draw'), "home 用 PowerShell 的 $HOME");
  assert.ok(
    cmd.includes("C:\\SiYuan\\data\\plugins\\siyuan-excali-studio\\script\\excali-draw"),
    "链接目标换成反斜杠",
  );
  assert.equal(cmd.includes("/script/"), false, "Windows 命令里不许混正斜杠");
  assert.equal(agentSkillLink(WIN), "~\\.agents\\skills\\excali-draw");
  assert.equal(agentSkillLink(), "~/.agents/skills/excali-draw", "缺省仍按 POSIX");
});

test("拿不到宿主路径：回落占位符，不吐出 /script/ 这种半截路径", () => {
  const p = promptText({ pluginDir: "", hasCli: false });
  assert.ok(p.includes("<思源工作空间>/data/plugins/siyuan-excali-studio/script/excali-draw/SKILL.md"));
  assert.equal(p.includes("//SKILL.md"), false);
});

test("提示词：绝对路径当场填满，占位符一个不留；顺序是「读什么 → 用什么跑 → 怎么统一风格 → 怎么打磨」", () => {
  const p = promptText(LOCAL);
  assert.ok(p.includes(drawSkillDir(LOCAL) + "/SKILL.md"), "技能文件绝对路径");
  assert.ok(p.includes(styleSkillDir(LOCAL) + "/SKILL.md"), "风格技能绝对路径");
  assert.ok(p.includes(polishSkillDir(LOCAL) + "/SKILL.md"), "打磨技能绝对路径");
  assert.ok(p.indexOf(drawSkillDir(LOCAL)) < p.indexOf(styleSkillDir(LOCAL)), "先绘画后风格");
  assert.ok(p.indexOf(styleSkillDir(LOCAL)) < p.indexOf(polishSkillDir(LOCAL)), "打磨放最后：先会画再谈改");
  assert.equal(/<[^>]+>/.test(p), false, "不许把尖括号占位符复制给 Agent");
  assert.match(p, /不要自己手写 SVG|不要自己配色/);
});

test("提示词的风格段只点名真实已安装的包（第八十四轮）", () => {
  const known = promptText({ ...LOCAL, styles: ["manga-ink", "doodle-marker"] });
  assert.ok(known.includes("已安装的风格包：manga-ink / doodle-marker"), "已装包名要给全");
  assert.ok(known.includes("内建 pencil / marker / blueprint"), "内置预设永远可用，别让用户在两者间猜");
  assert.ok(known.includes("只传这些名字"), "别让 Agent 自己编包名");

  const empty = promptText({ ...LOCAL, styles: [] });
  assert.ok(empty.includes("还没有安装风格包"), "一个没装就说清");
  assert.ok(empty.includes("pencil / marker / blueprint"), "内置基线仍可用");
  assert.equal(empty.includes("manga-ink"), false, "没装不许点名");

  // 列表还没读到时用中性话术：不说「已安装」，也不点名
  const unknown = promptText(LOCAL);
  assert.ok(unknown.includes("见插件面板的风格包列表"));
  assert.equal(unknown.includes("manga-ink"), false);
});

test("通道口径按事实切换：有 CLI 才提命令，没 CLI 让跳过", () => {
  const local = promptText(LOCAL);
  assert.ok(local.includes("scripts/excali-board.mjs"));
  assert.ok(local.includes("excali_draw_board"), "内置工具始终是首选");
  assert.ok(local.includes("excali_file_draw_board"), "外部 Agent 走 MCP 时工具名带 excali_file_ 前缀");
  const market = promptText(MARKET);
  assert.equal(market.includes("node "), false, "没 CLI 时不许让 Agent 去跑 node");
  assert.ok(market.includes("全部跳过"), "SKILL.md 里跑命令的步骤要明说跳过");
  assert.ok(market.includes("tools/preview.mjs 自检步骤也跳过"), "风格自检同样跑不了");
  assert.ok(market.includes("打磨 skill 的体检/渲染脚本同理跑不了"), "打磨的体检脚本也别让 Agent 硬跑");
  assert.ok(market.includes("excali_draw_board"));
  assert.ok(market.includes("不要伪造工具调用"), "两种工具都没有时只产出计划，别装能调");
  assert.notEqual(channelNote(LOCAL), channelNote(MARKET));
});

test("一句话需求：空着不写完全保持旧行为；写了才加需求与验收要求", () => {
  assert.equal(drawRequestText(LOCAL, ""), promptText(LOCAL), "空输入不许改变旧提示词");
  assert.equal(drawRequestText(LOCAL, "   \n "), promptText(LOCAL));

  const p = drawRequestText(LOCAL, "  帮我画一张英语语法讲解图\n  —— 时态总览 ");
  assert.ok(p.startsWith(promptText(LOCAL)), "需求接在通用提示词后面，前面的路径与通道不变");
  assert.ok(p.includes("我的需求：帮我画一张英语语法讲解图 —— 时态总览"), "换行压平，别把一句话截成半句");
  assert.ok(p.includes("先列出 3–6 个要点的大纲"), "先大纲，后画图");
  assert.ok(p.includes("按内容选版面"), "别把所有主题都塞成流程");
  assert.ok(p.includes("按打磨技能的清单自检"), "画完要自检再交付");
  assert.ok(p.indexOf("我的需求") < p.indexOf("出图要求"), "先需求后验收");
  assert.equal(p.includes("style 传"), false, "没选风格就不许点名");
});

test("一句话需求：选了风格才附 style 行；只有风格没有需求也生效", () => {
  const s = drawRequestText(LOCAL, "英语语法讲解图", "marker");
  assert.ok(s.includes('style 传 "marker"'));
  assert.ok(s.indexOf('style 传 "marker"') < s.indexOf("出图要求"), "风格先于验收要求");
  assert.equal(drawRequestText(LOCAL, "英语语法讲解图", "   ").includes("style 传"), false, "空白风格等于自动");

  const only = drawRequestText(LOCAL, "", "marker");
  assert.equal(only, promptText(LOCAL) + '\n风格：style 传 "marker"，配色、线宽、字号都交给它，不要自己调。');
});

test("索引行 / 安装命令：一行能贴、一条能跑", () => {
  const line = indexLine(LOCAL);
  assert.ok(line.startsWith("- "), "AGENTS.md 里得是一条列表项");
  assert.equal(line.split("\n").length, 1, "一行，不然贴进去会破坏列表");
  assert.ok(line.includes(drawSkillDir(LOCAL) + "/SKILL.md"));
  assert.ok(line.includes(polishSkillDir(LOCAL) + "/SKILL.md"), "索引行也要指向打磨技能");
  const cmd = installCommand(LOCAL);
  assert.match(cmd, /^mkdir -p ~\/\.agents\/skills && ln -sfn "/);
  assert.ok(cmd.includes('"' + drawSkillDir(LOCAL) + '"'), "链接目标带引号（路径里有中文/空格）");
  assert.ok(cmd.endsWith("~/.agents/skills/excali-draw"));
});

test("风格包：调用指令按通道给收尾，卡片自带 prompt 时整段替换", () => {
  const call = styleCall("manga-ink", LOCAL);
  assert.ok(call.includes('style 传 "manga-ink"'));
  assert.ok(call.includes("preview.mjs"), "有 CLI 时给自检闭环");
  assert.equal(styleCall("manga-ink", MARKET).includes("preview.mjs"), false);
  assert.ok(styleCall("manga-ink", MARKET).includes("excali_file_read_board"));

  const custom = styleCall("my-pack", LOCAL, "照我仓库 README 的画法排版");
  assert.ok(custom.startsWith("照我仓库 README 的画法排版"), "卡片 prompt 整段接管开头");
  assert.equal(custom.includes("style 传"), false, "默认话术不叠加");
  assert.ok(custom.includes("preview.mjs"), "收尾仍按本机通道给");
});

/* ---------------- ② 与磁盘 / 打包对齐 ---------------- */

test("版本握手：SKILL.md 的 metadata.version 必须与 SKILL_VERSION 一致", () => {
  const m = SKILL_MD.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(m, "SKILL.md 要有 frontmatter");
  const v = m[1].match(/^\s*version:\s*"?([\w.]+)"?\s*$/m);
  assert.ok(v, "frontmatter 里要有 metadata.version");
  assert.equal(v[1], SKILL_VERSION, "改版本要两边一起改（面板写的就是这个数）");
  assert.ok(STYLE_MD.includes('SKILL="<本文件所在目录>"'), "风格 skill 的占位符要能被 Agent 直接代入");
});

test("内置风格包：卡片元数据与磁盘文件对得上（别给出死路径）", () => {
  for (const id of ["manga-ink", "doodle-marker"]) {
    const json = JSON.parse(file(`script/excali-style/styles/${id}.json`));
    assert.equal(json.name, id);
    assert.ok(typeof json.description === "string" && json.description.length > 0, "缺 description：" + id);
    assert.ok(typeof json.version === "string" && /^\d+\.\d+\.\d+$/.test(json.version), "缺版本号：" + id);
    assert.match(json.preview, /^[A-Za-z0-9][A-Za-z0-9._-]*\.png$/, "preview 只许文件名：" + id);
    assert.ok(
      existsSync(resolve(ROOT, "script/excali-style/previews", json.preview)),
      "缺效果图：" + json.preview,
    );
  }
  assert.ok(existsSync(resolve(ROOT, "script/excali-style/samples/manga-ink-arch.json")));
  assert.ok(existsSync(resolve(ROOT, "script/excali-style/samples/doodle-visual.json")));
  assert.ok(existsSync(resolve(ROOT, "script/excali-draw/SKILL.md")));
  assert.ok(existsSync(resolve(ROOT, "script/excali-style/SKILL.md")));
});

test("打磨技能：frontmatter 合规，体检 / 渲染脚本随包，且不依赖插件源码", () => {
  const m = POLISH_MD.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(m, "打磨 SKILL.md 要有 frontmatter");
  assert.match(m[1], /^\s*name:\s*excali-polish\s*$/m, "name 必须与目录名一致");
  const desc = m[1].match(/^\s*description:\s*(.+)$/m);
  assert.ok(desc, "缺 description，Agent 不会知道何时读它");
  assert.ok(desc[1].trim().length >= 20, "description 要写清触发场景");
  assert.ok(m[1].split("\n").filter((l) => l.startsWith("description:"))[1] === undefined, "description 必须单行");

  for (const rel of ["scripts/audit.mjs", "scripts/render.mjs", "scripts/lib/board.mjs", "scripts/lib/fonts.mjs"]) {
    assert.ok(existsSync(resolve(ROOT, "script/excali-polish", rel)), "缺：" + rel);
  }
  assert.ok(POLISH_MD.includes("audit.mjs"), "工作流第一步就是体检，SKILL.md 要写清怎么跑");
  assert.ok(POLISH_MD.includes("render.mjs"), "改完必须渲染目检");
  const boardLib = file("script/excali-polish/scripts/lib/board.mjs");
  assert.equal(/from\s+["'][^"']*src\//.test(boardLib), false, "集市版没有 src/，脚本不能反向依赖插件源码");
  assert.equal(/from\s+["']@?excalidraw/.test(boardLib), false, "脚本要零依赖，别引 vendor");
});

test("打包：excali-draw 必须进包，scripts/（CLI 源码）不进包", () => {
  const m = PACK.match(/const DIRS = \[([^\]]+)\]/);
  assert.ok(m, "pack.mjs 的 DIRS 锚点失效");
  const dirs = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  assert.ok(dirs.includes("script/excali-draw"), "集市用户也要拿到绘画技能，哪怕没有 CLI");
  assert.ok(dirs.includes("script/excali-style"));
  assert.ok(dirs.includes("script/excali-polish"), "打磨技能也要随包，面板给的路径才不落空");
  assert.equal(dirs.some((d) => d === "scripts" || d.startsWith("scripts/")), false, "CLI 源码不进包");
});

test("提示词里的 CLI 路径与仓库里的真实文件对得上", () => {
  const dir = LOCAL.pluginDir.replace("/ws/data/plugins/siyuan-excali-studio", ROOT);
  assert.ok(existsSync(cliPath({ pluginDir: dir, hasCli: true })), "拼出来的 CLI 路径在仓库里得真存在");
});

/* ---------------- ③ 接线与文案 ---------------- */

test("接线：宿主给路径 + 探针 + 平台，页签透传，面板吃 skill 快照", () => {
  assert.match(INDEX, /getSkillLayout: \(\) => \{[\s\S]{0,300}workspaceDataDir\(\)\.replace\(\/\\\\\/g, "\/"\)/, "Windows 反斜杠先归一");
  assert.match(INDEX, /pluginDir: dataDir \? joinPosix\(dataDir, `plugins\/\$\{plugin\.name\}`\) : ""/);
  assert.match(INDEX, /platform: hostPlatform\(\)/, "安装命令要按宿主系统切");
  assert.match(INDEX, /probeCliSkill: \(\) => fileExists\(`\$\{plugin\.name\}\/scripts\/excali-board\.mjs`\)/);
  assert.match(TAB, /getSkillLayout=\{host\.getSkillLayout\}/);
  assert.match(TAB, /probeCliSkill=\{host\.probeCliSkill\}/);
  assert.match(APP, /void probeCliSkill\(\)[\s\S]{0,120}setCliSkill\(has\)/, "打开面板时探一次");
  assert.match(APP, /skill=\{\{ \.\.\.getSkillLayout\(\), hasCli: cliSkill \}\}/);
});

test("面板：一节「技能分发」，一句话需求与风格选择都走纯函数", () => {
  assert.match(PANEL, /from "\.\/ai\/skill-dispatch"/, "文案全部来自纯模块");
  assert.match(PANEL, /drawRequestText\(promptSkill, need, drawStyle\)/, "复制键把需求、风格、路径一起算进去");
  assert.match(PANEL, /t\("想画什么？例：帮我画一张英语语法讲解图"\)/);
  assert.match(PANEL, /<textarea/, "需求输入框要能多行");
  assert.match(PANEL, /exs-ai-skill__examples/, "例子按钮给用户可抄的写法");
  assert.match(PANEL, /t\("复制完整指令"\)/, "有需求时按钮说清复制的是完整指令");
  assert.match(PANEL, /installed\.filter/, "风格下拉只追加真实已装的包");
  assert.match(PANEL, /installCommand\(skill\)/);
  assert.match(PANEL, /agentSkillLink\(skill\)/);
  assert.match(PANEL, /skill\.platform === "windows" \? t\("PowerShell 命令"\)/, "Windows 上告诉用户粘哪儿");
  assert.match(PANEL, /indexLine\(skill\)/);
  assert.match(PANEL, /polishSkillDir\(skill\)/, "打磨技能要在面板里给出路径");
  assert.match(PANEL, /t\("打磨技能"\)/);
  assert.match(PANEL, /<StyleLibrarySection/, "风格包一节走列表组件");
  assert.match(PANEL, /styleLibrary\.list\(\)/, "列表读磁盘，不在组件里写死");
  assert.match(PANEL, /api=\{styleLibrary\}/);
  assert.equal(PANEL.includes("STYLE_PACKS"), false, "旧硬编码已退役");
  assert.match(PANEL, /t\("技能分发"\)/);
  assert.equal(PANEL.includes("navigator.clipboard"), true);
});

test("样式：组件用到的每个 exs-ai-skill 类都有规则", () => {
  const used = new Set(PANEL.match(/exs-ai-skill[a-z_-]*/g) ?? []);
  assert.ok(used.size >= 10, "这一节类名不少，别把样式丢了");
  for (const cls of used) assert.ok(CSS.includes("." + cls), "样式缺：." + cls);
});

/**
 * 第八十三轮：技能分发（把「怎么用本插件画图」变成 Agent 读得懂的一段话）。
 *
 * 纯函数模块——不 import React / siyuan / vendor，node 单测直接跑。
 *
 * 分工：SKILL.md 负责「怎么做」，这里只负责「在哪儿」。
 * 三份 SKILL.md 里写的是 `<思源工作空间>` / `<本仓库目录>` 这类占位符，
 * 插件知道真实绝对路径，复制出去的提示词必须当场把它填好——否则 Agent 拿到
 * 一段带尖括号的模板，只会到处找文件。
 *
 * 通道口径：集市版（package.zip）不带 scripts/，命令行根本不存在，
 * 这时提示词必须改成「只用思源内置工具；SKILL.md 里跑命令的步骤全部跳过」。
 * 两种文案的区别不是措辞偏好，是事实（见 scripts/pack.mjs 的 DIRS）。
 */

/** 与 script/excali-draw/SKILL.md 的 frontmatter metadata.version 必须一致（测试盯着） */
export const SKILL_VERSION = "1.0.0";

export const SKILL_NAME = "excali-draw";
export const STYLE_SKILL_NAME = "excali-style";
export const POLISH_SKILL_NAME = "excali-polish";

/** Agent 规范里跨客户端共享的落点（思源 3.8.1 / Cursor / Copilot / Codex 都读这里） */
export const AGENT_SKILLS_DIR = "~/.agents/skills";

/** 拿不到宿主路径时的占位（非思源宿主，理论上不会走到） */
const PLUGIN_FALLBACK = "<思源工作空间>/data/plugins/siyuan-excali-studio";

export interface SkillLayout {
  /** 插件目录绝对路径（正斜杠，无尾斜杠）；空串 = 拿不到宿主路径 */
  pluginDir: string;
  /** 插件目录下 scripts/excali-board.mjs 是否存在（本地仓库版才有） */
  hasCli: boolean;
  /**
   * 宿主操作系统。Windows 没有 ln -sfn，安装命令与 home 写法都得换；
   * 缺省按 POSIX 处理（纯函数测试与老调用不传也能跑）。
   */
  platform?: "posix" | "windows";
  /**
   * 工作区里真正装着的风格包名（面板现扫目录得到）。
   * undefined = 还没读到列表，提示词不许点名任何包——旧版硬编码两套包，
   * 结果集市用户一条都没装，Agent 照着传 style 直接 `style:unknown-style`。
   */
  styles?: string[];
}

function root(layout: SkillLayout): string {
  const dir = layout.pluginDir.trim().replace(/\/+$/, "");
  return dir || PLUGIN_FALLBACK;
}

/** 技能根目录（SKILL.md 就在这一层） */
export function drawSkillDir(layout: SkillLayout): string {
  return root(layout) + "/script/" + SKILL_NAME;
}

export function styleSkillDir(layout: SkillLayout): string {
  return root(layout) + "/script/" + STYLE_SKILL_NAME;
}

/** 打磨已有白板：体检 + 真字形验收 + 回真源修 */
export function polishSkillDir(layout: SkillLayout): string {
  return root(layout) + "/script/" + POLISH_SKILL_NAME;
}

/** 无头 CLI 的绝对路径（集市版这个文件不存在，别让 Agent 白跑） */
export function cliPath(layout: SkillLayout): string {
  return root(layout) + "/scripts/excali-board.mjs";
}

/** 装到全局后的链接位置（只是显示与命令里的目标，插件读不到 home 目录，无法自检） */
export function agentSkillLink(layout?: SkillLayout): string {
  return layout?.platform === "windows"
    ? "~\\.agents\\skills\\" + SKILL_NAME
    : AGENT_SKILLS_DIR + "/" + SKILL_NAME;
}

/**
 * 一次性粘贴的安装命令：符号链接指回插件目录，插件升级技能就跟着升级。
 * 前端没有 home 目录写权限，这一步只能由用户粘进终端跑。
 *
 * Windows 没有 ln -sfn：用 PowerShell 的 Junction（目录联接不需要管理员/开发者模式，
 * 也不跟随删除目标），先删旧链接再建，重跑即同步。
 */
export function installCommand(layout: SkillLayout): string {
  const target = drawSkillDir(layout);
  if (layout.platform === "windows") {
    const winTarget = target.replace(/\//g, "\\");
    return [
      `$l="$HOME\\.agents\\skills\\${SKILL_NAME}"`,
      `New-Item -ItemType Directory -Force "$HOME\\.agents\\skills" | Out-Null`,
      `if (Test-Path $l) { try { (Get-Item $l).Delete() } catch {} }`,
      `New-Item -ItemType Junction -Path $l -Target "${winTarget}" | Out-Null`,
    ].join("; ");
  }
  return `mkdir -p ${AGENT_SKILLS_DIR} && ln -sfn "${target}" ${agentSkillLink(layout)}`;
}

const BUILTIN_TOOLS = "excali_list_boards / excali_open_board / excali_draw_board / excali_generate_image";
const MCP_TOOLS =
  "excali_file_list_boards / excali_file_open_board / excali_file_draw_board / excali_file_generate_image";

/**
 * 主提示词：贴给任意 Agent，它会顺着绝对路径去读 SKILL.md。
 * 先给路径、再给通道、最后给风格 skill——顺序是「读什么 → 用什么跑 → 怎么统一风格」。
 */
export function promptText(layout: SkillLayout): string {
  const draw = drawSkillDir(layout);
  const style = styleSkillDir(layout);
  const polish = polishSkillDir(layout);
  const lines = [
    "我在用思源笔记的白板插件 Excali Studio 画图。先读这个技能文件，再按它说的做：",
    draw + "/SKILL.md",
    "",
    "这个文件所在目录就是技能根目录：" + draw,
    "它里面的工具脚本、示例、参考资料都在这个目录下，相对路径以它为根。",
    "",
  ];
  if (layout.hasCli) {
    lines.push(
      "本机可用通道（按你实际拿到的工具名选）：",
      "· 思源内置智能体：" + BUILTIN_TOOLS,
      "· 外部智能体经思源内核 MCP（/mcp）连接后：" +
        MCP_TOOLS +
        "（完整名通常带 plugin__siyuan-excali-studio__ 前缀）",
      "· 命令行：node " + cliPath(layout) + "（有工具就优先用工具）",
    );
  } else {
    lines.push(
      "本机可用通道（按你实际拿到的工具名选）：",
      "· 思源内置智能体：" + BUILTIN_TOOLS,
      "· 外部智能体经思源内核 MCP（/mcp）连接后：" +
        MCP_TOOLS +
        "（完整名通常带 plugin__siyuan-excali-studio__ 前缀）",
      "本机没有命令行（集市安装版不带 scripts/）：SKILL.md 里让跑 scripts/excali-board.mjs 的步骤全部跳过，改用上面的工具。",
      "风格 skill 里的 tools/preview.mjs 自检步骤也跳过，改用 excali_file_read_board 回读元素数量与文字。",
      "打磨 skill 的体检/渲染脚本同理跑不了：只按列出的问题清单回读核对，不要伪造运行结果。",
    );
  }
  lines.push("如果上面的工具你一个都没有：只按 SKILL.md 产出计划 JSON，不要伪造工具调用。");
  lines.push("先读完再动手；不要自己手写 SVG。");
  lines.push("");
  lines.push("要统一风格或批量出图，再读：" + style + "/SKILL.md");
  lines.push("要打磨已有白板（缺色块、字体单一、被裁切/遮挡、演示顺序乱），再读：" + polish + "/SKILL.md");
  // 只列真正可用的名字：内置预设永远在，风格包没装就不点名（没装却点名 = style:unknown-style）
  const styles = layout.styles ?? [];
  if (layout.styles === undefined) {
    lines.push("风格用 style 参数传已安装的包名（内建 pencil / marker / blueprint 也可用；见插件面板的风格包列表），不要自己配色。");
  } else if (styles.length === 0) {
    lines.push("还没有安装风格包：先用内建基线 pencil / marker / blueprint；不要自己配色。");
  } else {
    lines.push(
      "可用风格：内建 pencil / marker / blueprint；已安装的风格包：" +
        styles.join(" / ") +
        "。style 参数只传这些名字，不要自己配色。",
    );
  }
  return lines.join("\n");
}

/** 贴进 AGENTS.md 的一行：常驻声明，之后每个新会话都知道去哪儿读 */
export function indexLine(layout: SkillLayout): string {
  return (
    "- 画图 / 白板 / 流程图 / 思维导图：本机装有思源插件 Excali Studio，先读 " +
    drawSkillDir(layout) +
    "/SKILL.md 再动手（要统一风格再读 " +
    styleSkillDir(layout) +
    "/SKILL.md，风格用 style 包名传；要打磨已有白板读 " +
    polishSkillDir(layout) +
    "/SKILL.md）。"
  );
}

/**
 * 一句话需求：把「画什么」接在通用提示词后面，需求为空时完全保持旧行为。
 *
 * 需求不是命令参数，写法千差万别——这里只做两件事：把换行压平，避免复制出去
 * 被聊天框截成半句；再补一段固定的验收要求，让 Agent 先列大纲、按内容选版面、
 * 画完自检，而不是直接堆形状。
 */
export function drawRequestText(layout: SkillLayout, need: string, style = ""): string {
  const base = promptText(layout);
  const text = need.replace(/\s+/g, " ").trim();
  const pack = style.trim();
  const styleLine = pack
    ? '风格：style 传 "' + pack + '"，配色、线宽、字号都交给它，不要自己调。'
    : "";
  if (!text) return styleLine ? base + "\n" + styleLine : base;
  const lines = [base, "", "我的需求：" + text];
  if (styleLine) lines.push(styleLine);
  lines.push(
    "",
    "出图要求：",
    "· 先列出 3–6 个要点的大纲再动手；一张图只讲一个主题。",
    "· 按内容选版面：流程用 lr/tb，并列用 grid，脑图用 radial；不要硬塞成一条流程。",
    "· 标题、正文、注释至少三层字号；配色只用风格包，不要自己调。",
    "· 画完按打磨技能的清单自检（填充闭合、无裁切遮挡、文字不溢出），再交付。",
    "· 交付时告诉我白板路径，不要只说「已完成」。",
  );
  return lines.join("\n");
}

/** 单个风格包的调用指令：把「长什么样」整体外包给风格包 */
export function styleCall(name: string, layout: SkillLayout, custom?: string): string {
  const head =
    custom && custom.trim()
      ? custom.trim()
      : '用 Excali Studio 画，style 传 "' + name + '"：配色、线宽、圆角、字号一律交给风格包，不要自己调。';
  return layout.hasCli
    ? head + "画完用 " + styleSkillDir(layout) + "/tools/preview.mjs 导一张 PNG 看一眼再交。"
    : head + "画完调 excali_file_read_board 回读确认元素数量和文字。";
}

/** 面板底注：把「本机到底能不能跑命令」如实说清 */
export function channelNote(layout: SkillLayout): string {
  return layout.hasCli
    ? "本机有命令行：提示词会带上 scripts/excali-board.mjs，并保留「内置工具优先」。"
    : "本机没有命令行（集市安装版）：提示词改用内置工具或内核 MCP，并跳过 SKILL.md 里跑命令的步骤。";
}

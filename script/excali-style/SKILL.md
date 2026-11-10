---
name: excali-style
description: 给 Excali Studio（思源白板）固定两套已调好的手绘风格，并用强制「画完看一眼」闭环保证每次出图都好看。当用户要求画流程图/架构图/讲解图/一页讲清一件事，且提到「好看」「统一风格」「手绘感」，或需要批量出图时使用。依赖 excali-draw。
---

# Excali 绘画风格

你负责**说什么**（节点、连线、分组），风格包负责**长什么样**（配色、笔触、字号、间距）。
不要写坐标，不要手写 SVG，不要在计划里塞颜色——那些都会破坏风格一致性。

前置：本机装有思源 + Excali Studio 插件，且会用它自带的无头 CLI 落白板（见 `excali-draw`）。
对话里若已经给了绝对路径（插件的「技能分发」面板复制的提示词就带全套绝对路径），**一律以对话为准**。

```bash
WS="<思源工作空间根目录>"                       # 含 data/ 的目录
CLI="$WS/data/plugins/siyuan-excali-studio/scripts/excali-board.mjs"
SKILL="<本文件所在目录>"                         # 插件里是 <插件目录>/script/excali-style
```

## 0. 装风格包（只做一次）

```bash
mkdir -p "$WS/data/assets/excali-styles"
cp "$SKILL"/styles/*.json "$WS/data/assets/excali-styles/"
node "$CLI" list --workspace "$WS" --list-styles    # 应列出 manga-ink / doodle-marker
```

不想污染工作空间，可以每次临时指目录：`--style-dir "$SKILL/styles"`。

## 1. 选风格

| 风格 | 什么时候用 | 视觉特征 |
| --- | --- | --- |
| `manga-ink` 漫画墨线 | 讲机制、讲流程、文档配图、要「一眼专业」 | 宣纸底 + 纯黑墨线 + 只有一两个琥珀黄重点；方框直角感、字距紧 |
| `doodle-marker` 涂鸦马克笔 | 讲观点、演示页、头脑风暴、要「有人味」 | 冷白底 + 抖得厉害的墨线 + **排线涂抹**的语义色 + 紫色箭头 + 手写体 |

拿不准就用 `manga-ink`——它对文字最友好、放大缩小都不糊。

## 2. 画

```bash
node "$CLI" create --workspace "$WS" \
  --plan "$SKILL/samples/manga-ink-loop.json" \
  --style manga-ink \
  --title "习惯回路"
```

返回 JSON 里的 `path` 就是白板文件（磁盘上是 `$WS/data/assets/excali/<标题>.svg`）。

## 3. 排版守则（这些决定「好不好看」，比配色重要）

1. **一张图只讲一件事**：节点 ≤ 8，连线 ≤ 8。超了就拆第二张，别硬塞。
2. **标签 ≤ 12 字**，动词开头。长解释放 `caption` 或拆成下一节点，不要塞进框里。
3. **颜色给语义不给分组**：只有「重点 / 提醒」这类角色才上色，正文节点留白。
   上色节点占比 ≤ 1/3——全上色等于没上色。
4. **`groups` 的名字要避开风格包里的 `roles` 键**。group 同时决定「画不画外框」和「取什么色」，
   所以把外框叫「进来的是什么 / 怎么处理」这种不在 `roles` 里的名字 → 只出框、不上色；
   颜色留给 `重点 / 提醒` 这类不声明外框、只用来取色的 group 名。
5. **布局按关系形状选**：有先后 → `lr`；有层级 → `tb`；平铺对比 → `grid`；
   一个中心发散 → `radial`。别一律 `lr`。
6. **菱形只放是/否问题**，椭圆只放「结果 / 状态」，普通步骤用默认方框。
7. **箭头必须有方向感**：跨阶段的连线补 `label`（两三个字），但别每条都标。
8. **标题写成结论**，不写成主题：「少即是多：一页只留一个重点」优于「设计原则」。
9. `caption` 只放一行小字（口径、出处、英文 tag），没有就不写。
10. 追加绘制（`append`）时同一块板只用一个 `--style`，混风格必丑。

## 4. 强制闭环：画完必须看一眼

插件自带的 SVG 预览**只画规整矩形**，`roughness`、排线、虚线全都看不出来——
所以**不能**凭插件预览或计划 JSON 判断好坏，必须用本仓库的渲染器（roughjs，和画布同一套笔触引擎）。

```bash
node "$SKILL/tools/preview.mjs" "$WS/data/assets/excali/习惯回路.svg" /tmp/check.png
# 然后打开 /tmp/check.png 看
```

渲染器依赖 Node 22+、roughjs 与 Chrome（当前脚本按 macOS 的 Chrome 路径写）。
**没有这套环境的机器**（例如集市安装版、Windows、没装 Node 的环境）：跳过渲染，
改用你所在通道的回读工具（MCP 为 `excali_file_read_board`）确认元素数量与文字，再按下表逐条检查。

看完按这张清单体检，任何一条不过就改计划重画（最多 3 轮，3 轮还不过就换风格或拆图）：

- [ ] 文字没被切掉、没溢出框外（右侧最容易被切）
- [ ] 没有线穿过文字；箭头都落在框边上，不是戳进框里
- [ ] 上色节点 ≤ 1/3，且上色的确实是重点
- [ ] 一眼能看出从哪读到哪（起点在左上，终点在右下或高亮）
- [ ] 标题是结论不是主题
- [ ] 画面不挤：框与框之间留得下箭头标签

**不许**跳过验收直接交付。有渲染器就出 PNG 看；没有渲染器就回读确认。批量出图时，每张都要验一次。

## 5. 常见失败

| 报错 | 原因 |
| --- | --- |
| `style:unknown-style (xxx)` | 风格包没进 `data/assets/excali-styles/`，或名字拼错（用 `--list-styles` 确认） |
| `plan:bad-shape` | `shape` 只认 `rounded/rectangle/ellipse/diamond/text/group/rank/order` |
| 节点全变成同一种 pastel | 计划里写了 `preset: marker`，风格被覆盖；只该传 `--style` |
| preview 里字被切 | 不是画布的问题，是预览包围盒；已按 CJK 整宽修正，若仍切说明标签过长，按守则 2 拆短 |
| 白板正开着时 CLI 写入被覆盖 | 先关页签，或改走思源内置智能体的 `excali_draw_board` |

## 6. 想加第三套风格

风格包只写「和基线不一样的字段」，基线用 `pencil`（无循环色，最可控）。
可写的 token 见 `references/tokens.md`；改完必须跑第 4 步闭环验证。

# excali-style-skill

给 [Excali Studio](https://github.com/LongDarkroom/siyuan-excali-studio)（思源的白板插件）用的绘画风格 skill。
目的很简单：**让 AI 画出来的白板好看、而且每次一样好看**——风格固定在两套调好的风格包里，
排版写成硬守则，画完必须渲染出来看一眼再交付。

## 两套风格

**漫画墨线 `manga-ink`** — 宣纸底、纯黑墨线、只留一两个琥珀黄重点。讲机制、文档配图首选。

![manga-ink](https://github.com/LongDarkroom/excali-style-skill/raw/main/previews/manga-ink-loop.png)

**涂鸦马克笔 `doodle-marker`** — 冷白底、抖得厉害的手绘线、排线涂抹的语义色、紫色箭头。演示页首选。

![doodle-marker](https://github.com/LongDarkroom/excali-style-skill/raw/main/previews/doodle-less-is-more.png)

## 怎么用

把仓库地址给支持 skill 的 AI agent，让它先读 [`SKILL.md`](SKILL.md)。人工上手就三行：

```bash
mkdir -p "$WS/data/assets/excali-styles"
cp styles/*.json "$WS/data/assets/excali-styles/"
node "$CLI" create --workspace "$WS" --plan samples/manga-ink-loop.json --style manga-ink --title 习惯回路
```

## 发布你自己的风格包

一份 JSON 就够：它既是插件加载器吃的风格包，也是插件面板里的卡片。仓库根目录放两个文件：

```
excali-style.json     # 从 template/excali-style.json 复制改名
preview.png           # 效果图（可选；JSON 里 preview 写 preview.png）
```

- 字段规则见 [`schema/excali-style.schema.json`](schema/excali-style.schema.json)：JSON 里 `"$schema"` 填它的地址，编辑器会实时校验。
- `name` 全小写，绘图时作为 `style` 参数；`extends` 写 `pencil` / `marker` / `blueprint` 或目录里已有的包，只写与基线不同的字段。
- `preview` 只能是 `<文件名>.png`（不许带路径）；导入时插件会把它改写成 `<name>.png` 并放进 `previews/`。
- `label` / `description` / `version` / `prompt` 只影响面板展示与「调用指令」，加载器忽略。

导入：思源 ☰ →「AI 通道…」→ 展开「一次性设置与风格包」→「＋ 导入」。
填 GitHub 页面链接会自动换成 raw 地址；raw 打不开就改用「粘贴 JSON」或「让 Agent 代装」。

## 为什么需要「画完看一眼」

插件自带的 SVG 预览只画规整矩形，`roughness`、排线、虚线一律看不出来。
`tools/preview.mjs` 直接读白板文件里的场景数据，用 roughjs（和画布同一套笔触引擎）重绘成 PNG，
所以它给出的样子就是思源里打开的样子。不跑这一步，风格包调得再准也是瞎画。

## 目录

```
SKILL.md               给 agent 读的：选风格、排版守则、强制自检闭环、失败码
styles/*.json          两套风格包
samples/*.json         四份样例计划
tools/preview.mjs      真笔触预览（白板 .svg → PNG）
references/            配色语义表、风格包可写字段
previews/              效果图
template/              新包模板（excali-style.json）
schema/                字段规则（JSON Schema draft 2020-12）
```

## 依赖

- Node 22.6+、思源 + Excali Studio 插件
- `npm install`（只有 roughjs 一个依赖）
- 出图用 macOS 的 Google Chrome 无头模式

## 许可

AGPL-3.0-or-later，见 [LICENSE](LICENSE) 与 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)。

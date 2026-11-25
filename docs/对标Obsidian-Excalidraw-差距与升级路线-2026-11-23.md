# 对标 Obsidian Excalidraw 2.29.4：Excali 白板差距清单与升级路线

> 日期：2026-11-23 · 对标对象：`/Users/xieyue/Desktop/obsidian-excalidraw-plugin-2.29.4`（下称 OE）
> 本文只做差距研判与路线设计，不改码。所有 OE 结论都来自源码核对，标了 `file:line`。

---

## 0. 结论先行

1. **两边的强项根本不在同一条轴上。**
   OE 强在「**白板是知识网络里的一个节点**」：文本内链、反向链接、元素级引用、Markdown 嵌入、脚本生态。
   Excali 强在「**白板是演示与生成的工作台**」：画框即页、逐条出场、AI 计划管线、图片转笔画。
   所以不该按"功能条数"补，该补的只有一段：**引用闭环**——这是 OE 最厚、我们最空的地方，也是"卖点"最容易被讲清楚的地方。

2. **必须补的只有 5 条（P0），其余都是加分项。**
   被引用处反查 · 元素级深链接 · 局部引用导出 · 文本内链自动成链 · 新建板模板。

3. **演示、AI 计划、图片转笔画、文本折叠这四项我们已经领先 OE，不要为了"对齐"把它们改薄。**

---

## 1. 两侧体量与定位

| 维度 | Obsidian Excalidraw 2.29.4 | Excali 白板 0.11.0 |
|---|---|---|
| 源码规模 | `src/` 337 文件 / 111,818 行 | `src/` 111 文件 / 34,078 行 |
| 宿主容器 | Obsidian `ItemView` + Markdown 文件 | 思源原生页签 + `assets/**/*.svg`（内嵌 scene） |
| 数据形态 | `.md`（frontmatter + JSON + 文本元素），可打标签、进图谱、有反链 | SVG 单文件，内嵌 payload，与 excalidraw.com / `siyuan-embed-excalidraw` 互认 |
| 入口数量 | 78 条命令 + 命令面板 + 文件浏览器 + Ribbon | 顶栏 / dock 白板库 / 文档右键 / `/白板` 斜杠 / 移动端浮层 |
| 对外能力 | ExcalidrawAutomate（171 成员）+ CLI（13 命令）+ 89 个脚本 + AI | `ea` API（64 成员）+ CLI（3 命令）+ 19 个内置脚本 + 4 条 AI 通道 |
| 设置项 | ~150 项（10 个分组） | 18 项 |

---

## 2. 能力矩阵

### 2.1 链接 / 引用 / 嵌入 —— 差距最大的一组

| 能力 | OE | Excali | 判定 |
|---|---|---|---|
| 文本里 `http(s)` / `[x](url)` / `[[wiki]]` 自动成链 | 正则统一解析后写 `element.link`（`ExcalidrawData.ts:208-213`、`:1042`） | 有 `parseSiyuanLink`，但只在"设置链接"对话框用；文本内手打 `((id '标题'))` 不会成链 | **缺** |
| 链接在反向链接里出现 | 板是 `.md`，`^elementId` 与 `[[..]]` 明文写盘，Obsidian 索引即生反链（`ExcalidrawData.ts:1631-1713`） | 无（SVG 资源不进思源引用索引） | **缺**（但可用 `assets` 表补，见 P0-1） |
| 元素级引用 `[[file#^elementID]]` | 有，打开即 `zoomToElementId`（`ExcalidrawView.ts:2775`） | 只有板级 `siyuan:excali/<ref>`（`board-lib.ts:111`），无元素锚 | **缺** |
| `group=` / `area=` / `frame=` / `clippedframe=` / `,padding=N` | 有，按元素盒裁 `viewBox`（`embeddedFilenameParts.ts:3-68`、`excalidrawAutomateUtils.ts:301-441`） | 无（导出对话框有"仅导出选中"，但不回链、不插文档） | **缺** |
| Transclusion（`![[file#^block]]`、`{40}` 换行） | 有（`ExcalidrawData.ts:1481-1500`、`:2489`） | 用 iframe Embeddable 实时渲染思源块替代（`embeddable.ts:1-16`） | **不同路线，够用** |
| Markdown 文件转 SVG 快照嵌画布 | 有（`EmbeddedFileLoader.ts:2397`，离屏 iframe 内联样式） | 无（不必要：Embeddable 已能实时渲染） | **不补** |
| 拖文档/图片/网页/YouTube 进画布 | 5 类拖拽 + modifier 矩阵（`DropManager.ts:216`） | 拖文档生成简洁链接、拖图片导入；无"网页链接→卡片"、无 YouTube 缩略图 | **部分缺**（低优先） |
| 嵌入正文的尺寸 / 对齐语法（`\|100x100`、`\|left`、`right-wrap`） | 有（`embedDimensions.ts:23-49`、`styles.css:33-63`） | 依赖思源图片块自身能力，未做专用控制 | **待核对**（低优先） |
| PDF 导入 / 图片裁剪批注成新文件 | PDF 596 行弹窗；crop/annotate 各 ~300 行（`CommandManager.ts:1624-2253`） | 无 PDF；图片裁剪用 vendor 原生（0.18.1 有 `cropStart`），不做"另存新文件" | **缺**（P1） |

### 2.2 输入与转换

| 能力 | OE | Excali |
|---|---|---|
| SVG → 可编辑图元 | 有，16 文件 2442 行（`src/shared/svgToExcalidraw/`） | 无（只有 vendor 的 Mermaid 转图元） |
| LaTeX 公式 | 有（`latexBoilerplate`，`excalidrawViewHelpers.ts:16-60`） | 无 |
| OCR | 有（Taskbone，`OCR/Taskbone.ts`，只写 frontmatter + 剪贴板） | 无 |
| Lucide 图标插入 | 有（`lucideIcons.ts:26-80`，转原生描边元素） | 无 |
| 图片 URL 粘贴 / oEmbed 卡片 | 有 | 无（只吃 File 对象，`image-import.ts:103`） |
| 图片转可编辑笔画 | 无 | **有，且更强**（`ink-trace.ts` / `ink-outline.ts` / `image-to-material.ts`） |
| 文本元素转 Markdown 卡片 | 有（`convert-text2MD`） | 无 |

### 2.3 输出与发布

| 能力 | OE | Excali |
|---|---|---|
| PNG / SVG / JPEG / WebP | 有 | 有（含倍率、透明、暗色、仅选中、内嵌 scene） |
| PDF 导出（多页/页边距） | 有（`createPDF` + `pdfSettings`） | **无** |
| 自动导 PNG/SVG 并 keep-in-sync | 有（`AutoexportCoordinator` 475 行） | 不需要（板本身就是 SVG） |
| 复制局部/元素引用到文档 | 有（5 条命令） | **无**（只有整板引用） |
| 发布后仍可看 | 需先导 PNG（Publish 不显示 excalidraw） | 天然支持（SVG 即图片） |

### 2.4 脚本与自动化

| 能力 | OE | Excali |
|---|---|---|
| 脚本执行内核 | `AsyncFunction(ea, utils)` + mtime 失效缓存（`Scripts.ts:195-279`） | 有，`new Function` + 顶层 await + console 收集 |
| 脚本数量 | 89 个（10 类）+ 在线商店 + 更新全部 | 19 个内置 + 快照哈希自动升级 |
| 每脚本变一条命令 | 有（`(Script) name`，`Scripts.ts:757`） | 无命令面板，走脚本选择器 / 右缘竖条 |
| 自动运行 | `@excalidraw-onload` + autostart 三态授权 | 支持 `@excalidraw-onload` |
| API 表面 | 171 成员（21 add / 9 create / 48 get / …） | 64 成员（add*/get*/set*/export*） |
| CLI | 13 命令：read/open/create/apply/export/selection/script/icons/schema… | 3 命令：list / create / append |
| 侧栏脚本页签 | 右侧 ItemView，可多页签 | 右缘竖条 ScriptRail（等价但更轻） |

### 2.5 AI

| 能力 | OE | Excali |
|---|---|---|
| 文本 → 图 | 内置 TTDDialog + `generateAIText` | **更强**：plan DSL → 布局 → 走线避障 → 元素（`ai/plan.ts`、`layout.ts`、`route.ts`） |
| 文生图 | `generateAIImage` | 有（`ai/imagegen.ts`） |
| 识图 / 图生图 / 蒙版重绘 | 三个都有（`AIUtils.ts:2532-2608`） | **无** |
| 多轮会话 | `createAIChatSession` | 无（不需要：走思源内置智能体） |
| 风格包 / 提示词分发 | 无 | **有**（`style-pack.ts` + `skill-dispatch.ts`） |
| 多供应商差异（OpenAI/Anthropic/Google/xAI） | 有 | 只做 OpenAI 兼容 images API |

### 2.6 设置与交互细节

| 能力 | OE | Excali |
|---|---|---|
| 新建板模板（描边/填充/字体/调色板/背景） | 有，模板 appState 16 项逐条并入（`ExcalidrawAutomate.ts:1616-1672`） | **无**（只有强调色 / 字体 / 网格） |
| 自定义画笔预设 | 4 种笔型 + 手感参数 + 弹窗 909 行 | 只有荧光笔 + vendor 原生铅笔 |
| 左手模式 | 有（一个 CSS 类） | 无 |
| 滚轮/捏合缩放开关、打开即 fit | 有 | 打开即 `scrollToContent` 硬编码 true（`StudioApp.tsx:2668`） |
| 画布文本搜索 / 画框导航 | 有 | 无（演示抽屉可翻页，但搜不到文字） |
| 移动端 UI 模式 / 安全区 | 有（phone/tablet 模式 + safeArea padding） | 有全屏浮层（`mobile-studio.ts`），细节未对标 |
| 多语言 | 24 种（`src/lang/locale`） | 中 / 英 |
| 使用统计、缩略图、页签布局记忆 | 有 | 有（README 明示） |

### 2.7 演示 —— 我们领先，不需要对标

OE 本体的"放映"只有 `fullscreen` + 只读视图，真正的幻灯片要靠 `ea-scripts/Slideshow.md` 这个脚本（脚本级，不是产品级）；Excali 有画框即页、按箭头走、9 种出场效果、步号分组、从这步起播、打字机、自动前进、全屏、方向键沿边、缩略图抽屉。**这项不要动。**

---

## 3. 值得做的项（按价值 ÷ 成本排序）

### P0-1 白板「被引用处」反查　★最高性价比

- **OE 怎么做**：板是 `.md`，链接以明文存在文件里，Obsidian 自动索引成反链，零成本。
- **我们为什么没有**：板是 assets 里的 SVG，思源不索引图片内部的链接。
- **思源有替代路径，且已实测可用**（2026-11-23 用内核 SQL 验过）：
  ```sql
  SELECT a.path, a.block_id, b.root_id, b.type
  FROM assets a LEFT JOIN blocks b ON a.block_id = b.id
  WHERE a.path = 'assets/excali/x.svg'
  ```
  `root_id` 就是引用它的文档 ID。同一块板被插入多篇文档 → 返回多行。
- **落到产品**：白板库卡片 / 页签右键 →「被 N 篇文档引用」→ 列出文档并可点击打开；删除板前提示"正被 N 篇引用"；文档里右键白板图 →「查看这块板的其它引用」。
- **成本**：小（一个查询模块 + 两个菜单项 + 缓存 60s）。
- **落点**：新增 `src/siyuan/asset-refs.ts`；接线 `src/index.ts`（菜单）、`src/studio/board-list.ts`（卡片副标题）。
- **注意**：未被插入文档的新板查不到行，要区分「0 篇引用」与「查询失败」，不能一律显示 0。

### P0-2 元素级深链接

- **OE**：`[[file#^elementID]]` → `zoomToElementId`（`ExcalidrawView.ts:2775`），还支持 `group=` 展开同组。
- **我们**：`siyuan:excali/<ref>`（`board-lib.ts:111`）只有整板，没有锚点。
- **做法**：扩展为 `siyuan:excali/<ref>#<elementId>`。打开时 `scrollToElement(elId)` + 800ms 临时高亮；元素右键加「复制元素链接」；Embeddable / 白板卡片也认这个锚。
- **实现坑（已核对）**：`boardRefFromLink` 的正则是 `^siyuan:(?:\/\/)?excali\/(.+)$` 再 `decodeRef` + `boardRefOf`，而 `boardRefOf` 要求 `.svg$` —— **必须先在最后一个 `#` 处切开**，否则 `.svg#id` 过不了扩展名校验。
- **成本**：小。

### P0-3 局部引用（框选 → 独立 SVG + 回链）

- **OE**：`area=`/`group=` 在导出时按 padding 扩盒裁 `viewBox`，不产生新文件（`excalidrawAutomateUtils.ts:403-421`）。
- **我们**：`export.ts` 已支持 `exportSelection`，但导出的东西不回链、不进文档。
- **做法**：选中元素 → 右键/☰「复制局部引用」→ 导出为 `assets/excali/crops/<板名>-<hash>.svg`（**照样内嵌 scene**，可再编辑）→ 剪贴板给图片语法；同时把该图的 `link` 写回 `siyuan:excali/<板>#<元素>`。可选「直接插入到当前文档光标处」。
- **注意**：`crops/` 子目录要在白板库列表里排除（`board-list.ts` 只列保存目录的直接子级，天然排除子目录——核对确认）。
- **成本**：中。

### P0-4 文本里的思源链接自动成链

- **OE**：一个正则同时认 `![[..]]`、`[[..|alias]]`、`[x](url)`、`{n}`，命中就写 `textEl.link`（`ExcalidrawData.ts:208-213`）。
- **我们**：`siyuan-link.ts` 已经认全 7 种思源链接形态，但只在"设置链接"时触发。
- **做法**：在已有的 onChange 归一化链路里（`StudioApp.tsx:2820` 附近已在做 `linkNormalizations`）加一步 `linksInText()`：扫文本元素里的 `((id '标题'))` 与 `siyuan://...`，单链接直接设 `el.link`，多链接转成 Excalidraw 行内链接 `[标题](siyuan:block/id)`。
- **红线**：只处理**明确形态**，不碰普通文字；改写必须可撤销；纯函数进单测。
- **成本**：小-中。

### P0-5 新建白板模板 + 默认样式

- **OE**：`templateFilePath`，把模板 appState 的 16 项（描边色/宽/线型/粗糙度/填充/字体/字号/对齐/箭头/圆角/网格/调色板/背景）逐条并入新图（`ExcalidrawAutomate.ts:1616-1672`）。
- **我们**：只有「强调色 / 默认字体 / 网格」三项（`studio/settings.ts`）。
- **做法**：设置页加「模板白板」（从白板库选一块），`initialData` 构造时把模板的 appState **白名单字段**并入（不并 elements），并做归一化兜底。
- **落点**：`StudioApp.tsx:2647` 的 `initialData` useMemo；`settings.ts` 加 `templateRef` 与白名单归一。
- **成本**：小。

### P1-6 SVG 导入转可编辑图元

- 价值：图标库、设计稿、其它软件导出的矢量图都能变成可改的元素，而不是一张死图。
- OE 实现：`src/shared/svgToExcalidraw/`（16 文件 2442 行），支持 rect/circle/ellipse/path/line/polyline/polygon、evenodd、`<use>`、局部 CSS，透明挖洞用"零宽双桥"；文本转原生 text；渐变/滤镜/marker/图片一律诊断后省略；失败**不发布半成品**。
- 建议：**先做子集**（几何 + 文本，其余降级为图片并提示"已简化"），别一上来追平 2442 行。
- 成本：大。

### P1-7 脚本生态（在线目录 + 补 API + 移植高频脚本）

- OE：89 脚本 + 安装器（`ScriptInstallPrompt.ts`）+ 「更新全部」+ 每脚本一条命令。
- 我们：19 内置 + 快照哈希自动升级 + 右缘竖条固定。
- 建议两步：① EA API 从 64 补到 ~100（`addSticky` / `addMermaid` / `addIFrame` / `getViewElements` / `createSVG` / `getViewSVG` / `addElementsToView` / `registerAutostart`…）；② 移植 10~15 个高频脚本（Box Selected、Fixed spacing、Text to Sticky、Connect elements、Reverse arrows、Select by type、Layer Manager）。
- 成本：中-大（脚本逐个要按我们 API 改，不能直接拷）。

### P1-8 PDF 导入

- OE：596 行弹窗，页码区间 `1,3-5,7`、黑框、可选画框、行列布局、导入后锁定。
- 建议：先做"选页 → 每页一张图 + 可选画框 + 纵向排列"，不做行列矩阵与 PDF 裁剪矩形。
- 成本：中（需要 pdfjs 渲染，建议动态 import 避免常驻包体）。

### P1-9 导出 PDF / 讲义

- 按**演示页序**（画框）导出多页 PDF，支持横竖版、页边距、是否带背景。
- 成本：小-中（`pdf-lib` 类库 ~200KB，或浏览器打印通道）。

### P1-10 AI 视觉三件套

- OE：`analyzeAIImage` / `generateAIImage` / `transformAIImage` / `maskEditAIImage`（`AIUtils.ts:2532-2608`）。
- 我们：只有文生图 + 计划绘图，`ai/proxy.ts` 通道已就绪。
- 建议：①「识图成文」（选中图片 → 文字/结构，OCR 就是它的特例）②「图生图风格化」③「局部重绘」。
- 成本：小（协议层不用动，只加 UI 与结果落元素）。

### P2-11 LaTeX 公式

渲染成 SVG 图片元素，源码存 `customData` 便于再编辑；尺寸复用"上一个公式的宽高比"（OE 这个细节很讨巧）。

### P2-12 画布文本搜索 + 画框导航

`Ctrl+F` 搜文字/画框名并直接选中定位。成本小，日常很实用。

---

## 4. 我们已经领先、不要为了"对标"改薄的 6 项

1. **演示体系**：画框即页、按箭头走、9 种出场、步号分组、从这步起播、打字机、自动前进、沿边导航 —— OE 本体只有全屏只读 + 一个 Slideshow 脚本。
2. **AI 计划管线**：模型只写结构、布局与走线由算法兜底（`ai/layout.ts`、`ai/route.ts`）—— 比"让模型直接吐元素"稳定得多。
3. **图片转可编辑笔画 / 轮廓**：OE 完全没有。
4. **Notion 式文本折叠**（`text-fold.ts`）：OE 没有。
5. **思源块 iframe 嵌入**：复用内核 Lute 渲染，零第三方资产；比 OE 的"md 转 SVG 快照"路线更轻。
6. **中文字体与字体记忆**：14 款（含霞鹜文楷/得意黑等 6 款自带），OE 是 8 款 + 1 个自定义位。**上一版刚把字体语义收敛成单向，别回退。**

---

## 5. 不建议照搬的 5 项

| 项 | 理由 |
|---|---|
| 板存 `.md`（frontmatter + 标签 + 图谱 + 块引用） | OE 靠 Obsidian 的 Markdown 容器白拿反链与图谱。我们改成 md 会丢掉"SVG 即图片、粘进正文就能看、与 excalidraw.com 互认"这个最大优势，**改用 assets 表 + 自建索引补反链**。 |
| 171 个 EA API 全量 | 大量成员服务于 Obsidian API（`ea.obsidian`、`FloatingModal`、`registerCliHandler`）。按需补到 ~100 即可。 |
| Obsidian 专有 UI 依赖 | `workspace.trigger("hover-link")`、`metadataCache`、`registerMarkdownPostProcessor`、`.internal-embed` DOM 契约 —— 思源没有对等物，照搬等于重写。 |
| 「第四个自定义字体」 | 我们已经 6 个额外字体，反超。 |
| 150 项设置全量照搬 | 设置越多，集市审核与支持成本越高。挑 10 项以内加（模板、笔预设、导出、缩放、左手）。 |

**许可证**：OE 仓库 `LICENSE` 是 AGPL-3.0（`package.json` 标 MIT，二者不一致，以 LICENSE 为准）。Excali 是 AGPL-3.0-or-later，**代码层可借鉴**；但 `ea-scripts/` 脚本、`fonts/`、`engine.js`（Excalidraw fork）要逐项确认授权后再搬。

---

## 6. 建议路线图

### v0.12「引用闭环」（P0 五条）——推荐作为下一版主题

一句话卖点：**白板不再是孤立的图，而是思源知识网络里的一个节点。**

| 条 | 可测验收口径 |
|---|---|
| 被引用处反查 | 把板插入 2 篇文档 → 白板库卡片显示「被 2 篇引用」；点开列表可跳转；删除前出现引用提示 |
| 元素深链接 | 复制元素链接 → 粘进画布元素 link / 文档 → 打开白板落在该元素并高亮 |
| 局部引用 | 框选 3 个元素 → 复制局部引用 → 正文粘贴出图；图上带回到原板的 link；`crops/` 不进白板库列表 |
| 文本内链 | 文本里写 `((id '标题'))` → 保存重开仍是可点链接；点开跳对应块；撤销可回退 |
| 模板 | 设模板板（背景 A + 线宽 4）→ 新建板背景与线宽随模板；模板元素不被复制 |

### v0.13「输入 / 输出扩容」
SVG 导入（子集）· PDF 导入 · 导出 PDF · AI 识图/图生图 · LaTeX

### v0.14「生态与个性化」
脚本商店 + API 补到 ~100 + 移植 10 个脚本 · 画笔预设 · 画布搜索 · 移动端细节（安全区、长按、手机 UI 模式）

---

## 7. 关键实现索引（OE → 我们的移植要点）

| 能力 | OE 位置 | 我们该动哪 |
|---|---|---|
| 文本内联解析 | `src/shared/ExcalidrawData.ts:208-254`、`:1459` | `studio/siyuan-link.ts` 加 `linksInText()`；`StudioApp.tsx:2820` 归一化链路 |
| 反链生成 | `ExcalidrawData.ts:1631-1713` | 新增 `siyuan/asset-refs.ts`（走 SQL `assets` 表） |
| 元素级引用解析 | `src/utils/embeddedFilenameParts.ts:3-68` | `studio/board-lib.ts` 增加锚点段（先切 `#` 再 decode） |
| area/group 裁图 | `src/utils/excalidrawAutomateUtils.ts:301-441`、`:767-815` | `studio/export.ts`（已有 exportSelection）+ 新增 crops 落盘 |
| 模板并入 | `src/shared/ExcalidrawAutomate.ts:1616-1672` | `StudioApp.tsx:2647` initialData useMemo |
| SVG 转换 | `src/shared/svgToExcalidraw/` | 新增 `studio/svg-import/` |
| PDF 导入 | `src/shared/Dialogs/InsertPDFModal.ts` | 新增导入弹窗 + pdfjs 动态 import |
| 脚本商店 | `src/shared/Dialogs/ScriptInstallPrompt.ts`、`scriptLibraryUtils.ts:470-560` | `siyuan/script-store.ts` 已有安装框架，加"远程目录"来源 |
| AI 视觉 | `src/utils/AIUtils.ts:2532-2608` | `studio/ai/proxy.ts` + 新 `vision.ts` |
| 文本搜索 | `src/utils/excalidrawAutomateUtils.ts:840-876` | 新 `studio/search.ts` + 快捷键 |

---

## 8. 风险

1. **`assets` 表不是公开契约**：字段名可能随思源版本变。查询失败必须静默降级为"不显示引用数"，不能挡住白板库。
2. **`.svg#id` 锚点会击穿现有 regex**：`boardRefFromLink` → `boardRefOf` 的 `.svg$` 校验必须前置切分，且 `#` 在 `encodeRef` 里会被编码，两处要一起改，否则老板卡片全失效（有 `board-link.test.mjs` 兜底）。
3. **文本内链改写用户内容**：只认 `((id '..'))` 与 `siyuan://`，且必须一步一撤销；否则会被当成"乱改我的字"。
4. **PDF/SVG 导入会显著加包体**：`package.zip` 已 27MB，pdfjs + 转换器要动态 import，别进主包。
5. **别在 0.12 里混入演示改动**：演示是我们最强的部分，混在一起回归成本高，`test/` 67 个文件全绿才算过门。

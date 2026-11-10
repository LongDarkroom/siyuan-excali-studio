# 风格包能写哪些字段

放在 `$WS/data/assets/excali-styles/<名字>.json`，三通道（CLI / 思源内置智能体 / MCP）都能用同名引用。
**只写和基线不一样的字段**，其余继承 `extends`。

```json
{ "name": "my-style", "label": "我的风格", "extends": "pencil", "...": "..." }
```

| token | 取值 | 说明 |
| --- | --- | --- |
| `extends` | `pencil` / `marker` / `blueprint` / 其它包名 | 基线。固定配色请从 `pencil` 继承 |
| `background` | 十六进制 | 画布底色 |
| `ink` | 十六进制 | 所有框线 + 正文文字的颜色（**全局一个**，做不到逐节点换描边色） |
| `fill` | 十六进制 | 没命中 `roles` 时的底色 |
| `palette` | 十六进制数组，**必须非空** | 循环色；一旦写了它，没上 group 的节点会按序号哈希取色 → 每次画都会漂移 |
| `edge` | 十六进制 | 箭头颜色 |
| `muted` | 十六进制 | 分组框、边标签、caption 的颜色 |
| `strokeWidth` | 1 / 2 / 3 | 线宽 |
| `roughness` | 0 / 1 / 2 | 手抖程度。0=工程图，1=铅笔，2=马克笔 |
| `fillStyle` | `solid` / `hachure` / `cross-hatch` | 填充画法。`hachure` 才有涂鸦涂抹感 |
| `strokeStyle` | `solid` / `dashed` / `dotted` | 线型，**框和箭头共用**（想虚线箭头只能连框一起虚） |
| `fontFamily` | 数字 | 见下表 |
| `fontSizes` | `{title,node,edge,caption}` | 可只写子集 |
| `nodeRoundness` | `{type:3}` 或 `null` | 圆角策略 |
| `space` | 13 个间距键 | `minW/minH/padX/padY/gapX/gapY/gridGapX/gridGapY/radialMinRadius/radialGap/maxGridCols/textWrap` |
| `groupColor` | `{mode:"roles", roles:{...}}` | `roles` = group 名 → 固定色，批量出图零漂移；`hash` = 按 group 名哈希取 `palette` |

## fontFamily 对照

| 值 | 画布字体 | 备注 |
| --- | --- | --- |
| 1 | Virgil | Excalidraw 手写 |
| 3 | Cascadia | 等宽，工程图 |
| 5 | Excalifont + 晓赖 | 手写，**中文好看**（涂鸦风用这个） |
| 6 | Nunito | 圆体无衬线，中英都稳（墨线风用这个） |
| 8 | Comic Shanns | 手写 |
| 100 / 101 / 102 | 晓赖 / 霞鹜文楷 / 得意黑 | 中文向 |

## 三条坑

1. `palette: []` 会被解析器拒掉（要求非空数组）。想要「固定不漂移」就 `extends: pencil`——它本来没有循环色。
2. `fontFamily` 在 CLI 预览里只区分 3 和 6，其它一律走 Excalifont；**判断字体好不好看必须用 `tools/preview.mjs`**，它按 `--font` 显式指定近似字体。
3. 分组框的线型写死是虚线、线宽写死 1，不受 `strokeStyle` / `strokeWidth` 控制。

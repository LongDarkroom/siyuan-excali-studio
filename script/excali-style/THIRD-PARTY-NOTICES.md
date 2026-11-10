# 第三方许可声明

本仓库以 AGPL-3.0-or-later 分发，随包附下列第三方材料的说明。

## roughjs

- 用途：`tools/preview.mjs` 用它生成手绘笔触路径，让自检图接近画布实际效果。
- 许可：MIT License
- 版权：Copyright (c) 2019 Preet Shihn
- 上游：https://github.com/pshihn/rough
- 获取方式：`npm install` 拉取，不随本仓库分发源码副本。

## Excalidraw 字体（仅引用名称，不随本仓库分发）

风格包里的 `fontFamily` 是数字编号，实际字体由 Excali Studio 插件随包提供并在画布中加载：
Excalifont、Xiaolai、Cascadia Code、Nunito、Virgil 等，各自遵循其原始许可证（多为 SIL OFL 1.1）。
本仓库不含这些字体文件；许可说明见
[siyuan-excali-studio/fonts/COPYRIGHTS.md](https://github.com/LongDarkroom/siyuan-excali-studio/blob/main/fonts/COPYRIGHTS.md)。

## Google Chrome

`tools/preview.mjs` 调用本机已安装的 Google Chrome 无头模式截图。Chrome 是外部程序，
不在本仓库分发范围内，也不受本仓库许可证影响。

## 本仓库自有材料

`styles/*.json`、`samples/*.json`、`references/*.md`、`SKILL.md`、`README.md`、`tools/preview.mjs`
为原创，采用 AGPL-3.0-or-later。

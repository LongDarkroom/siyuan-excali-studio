# 第三方组件声明

Excali 白板（siyuan-excali-studio）源码以 **AGPL-3.0-or-later** 发布（见 `LICENSE`）。
本插件打包分发了下列第三方组件，它们仍按各自许可证授权；这些许可证均与 AGPLv3
兼容（MIT / BSD / Apache-2.0 可单向并入 AGPL）。本文件随发布包一起分发。

| 组件 | 用途 | 许可 | 上游 |
|---|---|---|---|
| Excalidraw 0.18.1 | Canvas 内核（`engine.js` 为其定制构建，含中文文案补丁与扩展字体注册） | MIT | https://github.com/excalidraw/excalidraw |
| React / React DOM 19 | UI 运行时（构建进 `engine.js` / `index.js`） | MIT | https://github.com/facebook/react |
| pako 2 | 压缩（场景存取） | MIT AND Zlib | https://github.com/nodeca/pako |
| 字体（`fonts/`） | 手写体与 UI 字体 | OFL-1.1 / MIT，逐族版权声明见 `fonts/COPYRIGHTS.md` | 见该文件 |

说明：

- `engine.js` 是 Excalidraw 官方 dist 构建的定制版本，其中还包含 Excalidraw 自身的
  依赖（roughjs、perfect-freehand 等，均为 MIT/BSD 类兼容许可）。完整依赖清单见
  上游仓库与 `package-lock.json`；Excalidraw 的 MIT 全文附于下方。
- 构建期工具（TypeScript Apache-2.0、Vite MIT 等）不随插件分发，不在本声明范围内。
- 思源笔记（宿主）本身为 AGPL-3.0；本插件通过其公开插件 API 接入。

---

## Excalidraw — MIT

```
MIT License

Copyright (c) 2020 Excalidraw

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## React / React DOM — MIT

```
MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## pako — MIT AND Zlib

```
(The MIT License)

Copyright (C) 2014-2017 by Vitaly Puzrin and Andrei Tuputcyn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

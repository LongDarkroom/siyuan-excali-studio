/**
 * 2026-10-25 交互框（B2）：给文档里的白板图片块（![](assets/excali/*.svg)）装饰两条入口。
 *
 * ① 块头悬停 ↗：点击打开画板。手法对齐 siyuan-embed-excalidraw 的 ✏️（DOM 注入
 *    .protyle-action，protyle 这层结构长期稳定，参照插件同样依赖它）；样式复用思源
 *    自己的 .protyle-icon / .ariaLabel，视觉与内置按钮一致、随主题。
 * ② 块属性区「Excali」徽标：让交互框在正文里可辨识。
 *
 * 纪律与 library-menu-inject.ts 相同：注入可整体失败（找不到锚点就跳过，绝不抛错）、
 * 按标记去重（编辑器重渲染不会叠按钮）、宿主在 switch-protyle / click-editorcontent
 * 时重扫——扫描是幂等的，多扫无副作用。
 *
 * 「是不是库内白板」与「怎么打开」都由宿主注入（isBoardAsset / openBoard）：
 * 本模块只管 DOM，不碰设置与页签，纯函数式可测。
 */
import { t } from "../i18n";

export type BoardDecorateActions = {
  /** 资产引用（img 的 data-src / src 原文）是否是白板库内的 .svg */
  isBoardAsset: (ref: string) => boolean;
  /** 打开画板（ref 形如 assets/excali/x.svg，或带 origin 的绝对地址） */
  openBoard: (ref: string) => void;
};

const OPEN_FLAG = "data-exs-board-open";
const BADGE_FLAG = "data-exs-board-badge";

/** 外链箭头（线性、currentColor，跟 .protyle-icon 的内置图标同风格） */
const OPEN_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M9 5h10v10"/><path d="M19 5 8 16"/><path d="M18 14v5H5V6h5"/></svg>';

export function decorateBoardBlocks(container: ParentNode, actions: BoardDecorateActions): void {
  let imgs: NodeListOf<HTMLImageElement>;
  try {
    imgs = container.querySelectorAll<HTMLImageElement>("img[data-src], img[src]");
  } catch {
    return;
  }
  for (const img of imgs) {
    const ref = img.getAttribute("data-src") || img.getAttribute("src") || "";
    if (!ref || !actions.isBoardAsset(ref)) continue;
    const node = img.closest<HTMLElement>("[data-node-id]");
    if (!node || !node.isConnected) continue;

    const action = node.querySelector<HTMLElement>(".protyle-action");
    if (action && !action.querySelector(`[${OPEN_FLAG}]`)) {
      const btn = document.createElement("span");
      btn.className = "protyle-icon ariaLabel";
      btn.setAttribute("aria-label", t("用 Excali 白板打开"));
      btn.setAttribute("data-position", "4north");
      btn.setAttribute(OPEN_FLAG, "");
      btn.innerHTML = OPEN_SVG;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        actions.openBoard(ref);
      });
      action.insertAdjacentElement("beforeend", btn);
    }

    const attr = node.querySelector<HTMLElement>(".protyle-attr");
    if (attr && !attr.querySelector(`[${BADGE_FLAG}]`)) {
      const badge = document.createElement("span");
      badge.className = "exs-board-badge";
      badge.setAttribute(BADGE_FLAG, "");
      badge.textContent = "Excali";
      attr.prepend(badge);
    }
  }

  sweepBoardDecorations(container, actions);
}

/**
 * 2026-10-27 清扫腿（修「删图后 Excali 徽标残留」）：↗/徽标是注入的外来 DOM，
 * 思源删块/清空内容只管自己渲染的节点，注入物成了孤儿挂在空块上。这里把容器里
 * 所有已注入装饰反查一遍——所在块里已没有白板图（或块已脱离文档）就摘除。
 * 与加腿同一次扫描里跑，重扫天然幂等：加腿补缺、扫腿清孤儿。
 */
export function sweepBoardDecorations(container: ParentNode, actions: BoardDecorateActions): void {
  let decorated: NodeListOf<HTMLElement>;
  try {
    decorated = container.querySelectorAll<HTMLElement>(`[${OPEN_FLAG}], [${BADGE_FLAG}]`);
  } catch {
    return;
  }
  for (const el of decorated) {
    if (!el.isConnected) continue;
    const node = el.closest<HTMLElement>("[data-node-id]");
    if (node && node.isConnected && blockHasBoardImg(node, actions)) continue;
    el.remove();
  }
}

/** 块内是否还挂着白板图（清扫判据：与加腿同一套 ref 归一） */
function blockHasBoardImg(node: HTMLElement, actions: BoardDecorateActions): boolean {
  for (const img of node.querySelectorAll<HTMLImageElement>("img[data-src], img[src]")) {
    const ref = img.getAttribute("data-src") || img.getAttribute("src") || "";
    if (ref && actions.isBoardAsset(ref)) return true;
  }
  return false;
}

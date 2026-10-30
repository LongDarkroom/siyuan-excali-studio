/**
 * 2026-10-30：画布元素右键菜单（「思源动作」）。
 *
 * 为什么自己画而不复用 vendor 的：vendor 的 `getContextMenuItems` 是**硬编码列表**
 * （Excalidraw 0.18.1），`api.registerAction` 只进快捷键通道、进不了右键菜单，
 * 想加菜单项只能自绘。
 *
 * 做法：监听画布的 contextmenu（捕获阶段，早于 vendor 的 handler），记下鼠标位置；
 * vendor 随后打开自己的 `.context-menu`（在 LayerUI 内，DOM 上是 `ul.context-menu`），
 * 我们在它出现后把「思源动作」这一组**插到菜单顶部**——用户第一眼看到的就是
 * 插件自己的能力，vendor 原生项（复制/删除/层级…）原样保留在下面。
 *
 * 菜单项（对标 Obsidian Excalidraw 的元素右键菜单）：
 *   新建思源链接…      打开链接对话框（粘贴链接 / 搜文档）
 *   复制块超链接       把元素 link 复制成思源超链接形态
 *   复制块 Markdown 链接  同上，Markdown 形态
 *   折叠为列表 / 解除编组 / 一键列表排版  —— 折叠三件套（折叠头才出现）
 */

import { useEffect, useRef, useState } from "react";
import { t } from "../i18n";
import { toggleOf } from "./text-fold";

/** 菜单项的载荷（点击时才知道当时选中了谁） */
export type CanvasMenuItem =
  | { id: "new-link"; label: string }
  | { id: "copy-block-link"; label: string }
  | { id: "copy-md-link"; label: string }
  | { id: "fold"; label: string }
  | { id: "unfold-group"; label: string }
  | { id: "arrange"; label: string };

export type CanvasMenuState = {
  /** 菜单左上角（视口坐标） */
  x: number;
  y: number;
  /** 命中的元素 id（右键点到的那个） */
  targetId: string;
  /** 菜单项 */
  items: CanvasMenuItem[];
};

/** 元素面上我们只摸这几个字段 */
type MenuElement = {
  id?: unknown;
  type?: unknown;
  link?: unknown;
  excaliToggle?: unknown;
};

/**
 * 该给哪些菜单项（纯函数，可断言）。
 *
 * 折叠三项只在「命中的是折叠头」时出现（折叠头的判定口径与 text-fold 一致：
 * 元素带 excaliToggle.collapsed 布尔）。
 */
export function menuItemsFor(el: MenuElement | null, selected: ReadonlyArray<MenuElement>): CanvasMenuItem[] {
  const items: CanvasMenuItem[] = [];
  items.push({ id: "new-link", label: t("新建思源链接…") });
  const link = typeof el?.link === "string" ? el.link : "";
  if (link !== "") {
    items.push({ id: "copy-block-link", label: t("复制块超链接") });
    items.push({ id: "copy-md-link", label: t("复制块 Markdown 链接") });
  }
  const tog = toggleOf(el as never);
  if (tog && typeof tog.collapsed === "boolean") {
    if (tog.collapsed) {
      items.push({ id: "unfold-group", label: t("展开这个折叠") });
    } else {
      items.push({ id: "fold", label: t("折叠这个组") });
      items.push({ id: "arrange", label: t("一键列表排版（统一间距）") });
    }
  }
  void selected;
  return items;
}

/**
 * 把「思源动作」插进 vendor 的右键菜单顶部。
 *
 * vendor 的菜单是 React 渲染的 `ul.context-menu`，我们不能改它的 React 树，
 * 只能直接操作 DOM：找到它 → 在最前面插一组 `li`。
 * 每次菜单重开都是新节点，所以每次都重新插（用标记位避免重复插）。
 */
export function injectMenuItems(menu: HTMLElement, items: CanvasMenuItem[]): void {
  if (menu.dataset.exsInjected === "1") return;
  menu.dataset.exsInjected = "1";
  const frag = document.createDocumentFragment();
  for (const it of items) {
    const li = document.createElement("li");
    li.dataset.exsAction = it.id;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "context-menu-item";
    const label = document.createElement("div");
    label.className = "context-menu-item__label";
    label.textContent = it.label;
    btn.appendChild(label);
    li.appendChild(btn);
    frag.appendChild(li);
  }
  const sep = document.createElement("hr");
  sep.className = "context-menu-item-separator";
  frag.appendChild(sep);
  menu.insertBefore(frag, menu.firstChild);
}

export type CanvasContextMenuProps = {
  /** 场景元素（读 link / excaliToggle） */
  getElements: () => ReadonlyArray<MenuElement>;
  /** 当前选中的元素 id */
  getSelectedIds: () => ReadonlySet<string>;
  /** 菜单项被点击 */
  onAction: (id: CanvasMenuItem["id"], targetId: string) => void;
  /** 画布容器（监听 contextmenu 的挂点） */
  containerRef: React.RefObject<HTMLElement | null>;
};

export function CanvasContextMenu(props: CanvasContextMenuProps): React.JSX.Element | null {
  const { getElements, getSelectedIds, onAction, containerRef } = props;
  const [pending, setPending] = useState<{ x: number; y: number } | null>(null);
  const targetRef = useRef<string>("");

  // 捕获阶段的 contextmenu：记位置（vendor 的 handler 在冒泡阶段，我们先跑）
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const onCtx = (e: MouseEvent): void => {
      // 只在画布上（不是 UI 面板）响应
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.closest(".excalidraw")) return;
      setPending({ x: e.clientX, y: e.clientY });
    };
    root.addEventListener("contextmenu", onCtx, true);
    return () => root.removeEventListener("contextmenu", onCtx, true);
  }, [containerRef]);

  // vendor 菜单出现后 → 注入我们的动作
  useEffect(() => {
    if (!pending) return;
    let raf = 0;
    let tries = 0;
    const tryInject = (): void => {
      const menu = document.querySelector<HTMLElement>("ul.context-menu");
      if (menu) {
        const els = getElements();
        const sel = getSelectedIds();
        // 命中的元素：vendor 右键时已把命中的元素选中了 ⇒ 取选中集里第一个
        const target = els.find((e) => typeof e.id === "string" && sel.has(e.id)) ?? null;
        if (target && typeof target.id === "string") {
          targetRef.current = target.id;
          injectMenuItems(menu, menuItemsFor(target, els.filter((e) => typeof e.id === "string" && sel.has(e.id))));
        }
        setPending(null);
        return;
      }
      // 菜单还没渲染出来（vendor 是 setState 后异步渲染）→ 下一帧再试，最多 ~20 帧
      tries += 1;
      if (tries > 20) {
        setPending(null);
        return;
      }
      raf = window.requestAnimationFrame(tryInject);
    };
    raf = window.requestAnimationFrame(tryInject);
    return () => window.cancelAnimationFrame(raf);
  }, [pending, getElements, getSelectedIds]);

  // 菜单项点击（事件委托：注入的节点不在 React 树里）
  useEffect(() => {
    const onClick = (e: MouseEvent): void => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const li = t.closest<HTMLElement>("li[data-exs-action]");
      if (!li) return;
      const id = li.dataset.exsAction as CanvasMenuItem["id"] | undefined;
      if (!id) return;
      e.preventDefault();
      e.stopPropagation();
      onAction(id, targetRef.current);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [onAction]);

  return null;
}

/**
 * 属性面板收起时的样式弹层键门（复刻 Obsidian 的「面板不在就不出弹层」）。
 *
 * Obsidian tray 关着时样式面板整棵子树不挂载，vendor 的纯 S/G 即使把
 * openPopup 置成 elementStroke/elementBackground，也没有 trigger 可渲染。
 * 我们只能用 CSS 收起 vendor 面板，而 Radix 弹层挂在 .excalidraw 下，照样会浮出来，
 * 所以在这两个键上做等价的门。
 */
export type StylesPopupKeyInput = {
  key: string;
  panelVisible: boolean;
  inRoot: boolean;
  editableTarget: boolean;
  shiftKey: boolean;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  isComposing?: boolean;
};

export function swallowsStylesPopupKey(input: StylesPopupKeyInput): boolean {
  if (input.panelVisible) return false;
  if (input.metaKey || input.ctrlKey || input.altKey) return false;
  if (input.isComposing || !input.inRoot || input.editableTarget) return false;
  // Shift+S / Shift+G 是 vendor 的吸管，不属于样式面板，放行
  if (input.shiftKey) return false;
  const key = input.key.toLowerCase();
  return key === "s" || key === "g";
}

/** vendor 的 Co()：输入框 / 文本域 / 下拉 / contentEditable 里的键一律不接管 */
export function isTextEntryTarget(target: EventTarget | null): boolean {
  if (typeof HTMLElement === "undefined" || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

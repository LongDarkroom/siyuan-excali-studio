/**
 * 演示面板的本地视图记忆（按白板分开存）。
 *
 * 为什么进 localStorage 而不是 PresentationSettings：那是「放映偏好」语义
 * （改一次所有白板共用、面板里可见可调）；「上次停在页单还是本页、选中哪一页」
 * 是纯本地视图状态，口径同抽屉的停靠位置/列数。
 *
 * 为什么记画框 id 而不是下标：页序可拖动，下标会漂；重开抽屉时按 id 找回那一页。
 */

export type PresentView = "page" | "list";

export type PresentUiMemory = {
  view: PresentView;
  /** 上次选中的画框 id；找不到（删了/换了板）就当没有记忆 */
  selId: string | null;
};

const KEY_PREFIX = "excali-present-ui:";

function keyOf(boardKey: string): string {
  return `${KEY_PREFIX}${boardKey}`;
}

export function readPresentUi(boardKey: string): PresentUiMemory | null {
  try {
    const raw = localStorage.getItem(keyOf(boardKey));
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<PresentUiMemory> | null;
    if (!o || typeof o !== "object") return null;
    return {
      view: o.view === "list" ? "list" : "page",
      selId: typeof o.selId === "string" && o.selId !== "" ? o.selId : null,
    };
  } catch {
    return null;
  }
}

/** 局部写：只改给到的键，另一项沿用上次的记忆 */
export function writePresentUi(boardKey: string, patch: Partial<PresentUiMemory>): void {
  try {
    const prev = readPresentUi(boardKey) ?? { view: "page", selId: null };
    localStorage.setItem(keyOf(boardKey), JSON.stringify({ ...prev, ...patch }));
  } catch {
    /* 隐私模式/配额满：记不住只在本次会话内生效，不报错 */
  }
}

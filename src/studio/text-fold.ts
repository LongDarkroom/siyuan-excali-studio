/**
 * 2026-10-22：文本折叠（Notion 式 toggle list）——纯数据逻辑层。
 *
 * 形态：画布上一组垂直排列的元素，最上的当「折叠头」，其余收进它的自定义
 * 字段 `excaliToggle`；折叠头左侧由 TextFoldOverlay 画一个圆点控制钮
 * （对标 Obsidian Canvas Folding 的 − 控制点），点击 = 收起/展开。
 *
 * 与 frame-collapse（画框折叠）的分工：frame 折叠面向「整块场景收放」，
 * 本模块面向「列表收放」——容器是普通元素（通常是文本），不占画布结构。
 *
 * 数据形状（挂在头元素上的自定义字段，引擎 restore 的 `...element` 展开保证往返）：
 * - 折叠态：{ collapsed: true,  elements: [成员深快照…] }
 * - 展开态：{ collapsed: false, memberIds: [成员 id…] }   // 再折叠按 id 收
 *
 * 已知边界（演示版，与 frame-collapse 一致）：
 * - 快照成员回传走 makeElement 重建（ElementSpec 已知字段）——成员自带的
 *   自定义字段（如 excaliRecipe 配方）不保留；文本/位置/字号/字体无损。
 * - 还原成员的 index 重置 ⇒ z 序被推到最上层（列表场景元素不重叠，无感）。
 */

import { estimateTextWidth } from "./ea-element.ts";

/** 元素上的折叠状态字段（窄型，只读本模块关心的两个键） */
export interface ExcaliToggle {
  collapsed: boolean;
  /** 折叠态：成员深快照（绝对坐标，回传时直接当 ElementSpec 用） */
  elements?: Array<Record<string, unknown>>;
  /** 展开态：成员 id 备忘（再次折叠按 id 收集现存成员） */
  memberIds?: string[];
  /** 折叠时记下的全场 z 序（id 列表）；还原后按它排回去，成员不被甩到最上层 */
  order?: string[];
  /**
   * 原生编组 id（v2）：折叠头与成员同属这个组 ⇒ 展开态拖头，vendor 原生带着
   * 整组一起动（撤销也正确），不用插件自己同步位移。
   */
  groupId?: string;
  /**
   * 成员相对头的偏移（v2）：折叠态下成员不在场，头移了之后展开要按
   * 「头的当前位置 + 偏移」归位 ⇒ 成员跟着头走。
   * 原生编组保证「相对偏移」在拖动中不变，所以这个值一直是有效的。
   */
  offsets?: Array<{ id: string; dx: number; dy: number }>;
  /** 列表排版的行距（记住，下次「一键列表排版」沿用） */
  gap?: number;
}

/** 折叠头/成员的最小元素面（脚本与 overlay 都只摸这几个字段） */
export interface FoldCandidate {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  /** 文本内容（首行左缘修正用：居中/右对齐时包围盒左边 ≠ 文字左缘） */
  text?: string;
  /** 文本对齐（左/中/右） */
  textAlign?: "left" | "center" | "right";
  /** 行高（首行中线用；vendor 不保证是 1.25） */
  lineHeight?: number;
}

/** 从场景里安全读 excaliToggle（脏数据一律当没有） */
export function toggleOf(el: unknown): ExcaliToggle | null {
  const raw = (el as { excaliToggle?: unknown } | null | undefined)?.excaliToggle;
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Partial<ExcaliToggle>;
  if (typeof t.collapsed !== "boolean") return null;
  return t as ExcaliToggle;
}

/** 折叠/展开产生的场景操作三元组（调用方落给 handle 的 add/patch/delete） */
export interface FoldOps {
  /** 头部补丁（excaliToggle 新值） */
  headPatch: Record<string, unknown>;
  /** 待删成员 id（折叠时用） */
  deleteIds: string[];
  /** 待还原成员 spec（展开时用；保快照里的 id） */
  specs: Array<Record<string, unknown>>;
  /** 折叠时记下的 z 序（还原后按它排回去） */
  order?: string[];
  /** 需要给别的元素打的补丁（并入时给新成员补 groupIds） */
  patches?: Array<{ id: string; patch: Record<string, unknown> }>;
  /** 本组用的原生编组 id（调用方据此给成员打 groupIds） */
  groupId?: string;
}

/**
 * 从选区挑折叠头：按 y 升序（y 同按 x）取最上的一个，优先文本；
 * 其余全部是成员。不足 2 个返回 null（一个当头 + 至少一个下属）。
 */
export function pickFoldHead(
  els: FoldCandidate[],
): { head: FoldCandidate; members: FoldCandidate[] } | null {
  if (els.length < 2) return null;
  const sorted = [...els].sort((a, b) => a.y - b.y || a.x - b.x);
  const firstText = sorted.find((e) => e.type === "text");
  const head = firstText ?? sorted[0];
  const members = sorted.filter((e) => e.id !== head.id);
  return members.length > 0 ? { head, members } : null;
}

/**
 * 元素的 z 序（vendor 的 index 字段：场景更新后是数字，早期版本是 "a3" 这类串）。
 * 折叠快照里存的就是这个值 ⇒ 还原时可以按原层序排回去。
 */
function zIndexOf(el: unknown): number {
  const raw = (el as { index?: unknown } | null)?.index;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const m = /^\D*(\d+)/.exec(raw);
    if (m) return Number(m[1]);
  }
  return Number.MAX_SAFE_INTEGER;
}

/**
 * 展开态的「收集框」：头与全部成员的包围盒（场景坐标）。
 *
 * 框只存在于编辑态（展开时可见，折叠时消失）——它是**视觉与交互的容器**，
 * 不进场景、不承担数据职责（成员归属仍由 toggle 的名单 + 原生编组管）。
 */
export function groupBounds(
  head: FoldCandidate,
  members: ReadonlyArray<FoldCandidate>,
): { x: number; y: number; w: number; h: number } | null {
  const all = [head, ...members];
  if (all.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const e of all) {
    const x = e.x ?? 0;
    const y = e.y ?? 0;
    const w = e.width ?? 0;
    const h = e.height ?? 0;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + w > maxX) maxX = x + w;
    if (y + h > maxY) maxY = y + h;
  }
  if (!Number.isFinite(minX)) return null;
  return { x: minX, y: minY, w: Math.max(0, maxX - minX), h: Math.max(0, maxY - minY) };
}

/**
 * 一键列表排版：成员按当前上下顺序**垂直均分**，排在头下面。
 *
 * 间距：没给就取「标题底 → 第一个成员顶」的留白（列表的行距就等于标题与首行的
 * 间距，最符合直觉），并夹在 8..48 之间；这样一次排版真能把用户拖乱的列表拉齐。
 * 之后排版沿用记住的那个值（存在 toggle.gap 里），改一次就一直生效。
 * 只动 y，x 保持原样（保留用户的缩进层次）。
 */
export function arrangeMembers(
  head: FoldCandidate,
  members: ReadonlyArray<FoldCandidate>,
  gap?: number,
): { gap: number; positions: Array<{ id: string; x: number; y: number }> } {
  if (members.length === 0) return { gap: gap ?? 0, positions: [] };
  const sorted = [...members].sort((a, b) => (a.y ?? 0) - (b.y ?? 0) || (a.x ?? 0) - (b.x ?? 0));
  let g = typeof gap === "number" && gap > 0 ? gap : 0;
  if (g === 0) {
    const headBottom = (head.y ?? 0) + (head.height ?? 0);
    const firstTop = sorted[0].y ?? 0;
    g = Math.min(48, Math.max(8, Math.round(firstTop - headBottom)));
  }
  const headBottom = (head.y ?? 0) + (head.height ?? 0);
  let cursor = headBottom + g;
  const positions: Array<{ id: string; x: number; y: number }> = [];
  for (const m of sorted) {
    positions.push({ id: m.id, x: m.x ?? 0, y: cursor });
    cursor += (m.height ?? 0) + g;
  }
  return { gap: g, positions };
}

/** 成员相对头的偏移 */
export interface FoldOffset {
  id: string;
  dx: number;
  dy: number;
}

/**
 * 折叠组的原生编组 id（v2）：由头 id 派生 ⇒ 稳定可重现，展开/再折叠用同一个。
 * 头与成员同属这个组 ⇒ 展开态拖头时 vendor 原生带着整组一起动。
 */
export function groupIdFor(headId: string): string {
  return `g-${headId}`;
}

/** 成员相对头的偏移（头动 → 成员跟着走的依据） */
export function offsetsOf(head: FoldCandidate, members: FoldCandidate[]): FoldOffset[] {
  const hx = head.x ?? 0;
  const hy = head.y ?? 0;
  return members.map((m) => ({ id: m.id, dx: (m.x ?? 0) - hx, dy: (m.y ?? 0) - hy }));
}

/**
 * 折叠：先存快照再删成员（反了中途失败就是数据丢失）。
 *
 * v2：顺带记下「原生编组 id」与「成员相对头的偏移」——
 * - 编组：头与成员同组 ⇒ 展开态拖头整组跟随（vendor 原生，撤销正确）；
 * - 偏移：折叠态头被拖走后，展开时按「头的当前位置 + 偏移」归位 ⇒ 成员跟着走。
 *
 * 调用方需**先把 groupIds 打好再调本函数**（快照要带上编组关系）。
 */
export function planFold(head: FoldCandidate, members: FoldCandidate[], order?: string[]): FoldOps {
  const gid = groupIdFor(head.id);
  return {
    headPatch: {
      excaliToggle: {
        collapsed: true,
        groupId: gid,
        offsets: offsetsOf(head, members),
        elements: members.map((m) => JSON.parse(JSON.stringify(m))),
        ...(order && order.length > 0 ? { order: [...order] } : {}),
      },
    },
    deleteIds: members.map((m) => m.id),
    specs: [],
    groupId: gid,
  };
}

/**
 * 展开：快照成员当 spec 回传（makeElement 保 id）+ 头转展开态（记 memberIds，
 * 下次点头上的 − 按 id 收集）。快照为空/损坏返回 null。
 *
 * aliveIds（可选）：传了就把**已在画布上**的成员从 specs 里剔掉——用户折叠后
 * ⌘Z 撤回过删除时会留下「头标记折叠态、成员却还在场」的不一致态，不剔就会
 * 拿快照 id 重复进场（场景里两个同 id 元素，vendor 直接乱）。
 * memberIds 仍然记全部快照 id（再折叠时按现存收集，在场的正好收）。
 */
export function planUnfold(
  head: FoldCandidate & { excaliToggle?: unknown },
  aliveIds?: ReadonlySet<string>,
): FoldOps | null {
  const snap = toggleOf(head);
  if (!snap || snap.collapsed !== true || !Array.isArray(snap.elements) || snap.elements.length === 0) {
    return null;
  }
  // 按原 z 序排（快照数组是选区顺序，不是层序）——还原后成员之间的前后关系不变
  const members = [...snap.elements].sort((a, b) => zIndexOf(a) - zIndexOf(b));
  const gid = snap.groupId ?? groupIdFor(head.id);
  return {
    headPatch: {
      excaliToggle: {
        collapsed: false,
        memberIds: members.map((e) => String(e.id ?? "")),
        groupId: gid,
        offsets: snap.offsets ?? [],
      },
    },
    deleteIds: [],
    specs: placeByOffsets(members, head, snap.offsets, aliveIds),
    order: Array.isArray(snap.order) ? [...snap.order] : undefined,
    groupId: gid,
  };
}

/**
 * 快照成员按「头的当前位置 + 相对偏移」定位置。
 *
 * v2 的关键：折叠态下成员不在场，头被拖走后再展开，成员要回到它**相对于头**
 * 该在的位置（而不是快照里的旧绝对坐标）——这就是「头动、成员跟着走」。
 */
export function placeByOffsets(
  members: ReadonlyArray<Record<string, unknown>>,
  head: FoldCandidate,
  offsets: ReadonlyArray<FoldOffset> | undefined,
  aliveIds?: ReadonlySet<string>,
): Array<Record<string, unknown>> {
  const map = new Map((offsets ?? []).map((o) => [o.id, o]));
  const hx = head.x ?? 0;
  const hy = head.y ?? 0;
  return members
    .filter((e) => !aliveIds || !aliveIds.has(String((e as { id?: unknown }).id ?? "")))
    .map((e) => {
      const spec = { ...(e as Record<string, unknown>) };
      const off = map.get(String((e as { id?: unknown }).id ?? ""));
      if (off) {
        spec.x = hx + off.dx;
        spec.y = hy + off.dy;
      }
      return spec;
    });
}

/**
 * 并入：把新元素加进已有的折叠组（不用解散重建）。
 *
 * 折叠态：新成员进快照并被删掉（一起藏起来）。
 * 展开态：新成员留在画布上（只补编组关系 + 记进 memberIds）。
 * 调用方需**先给新成员打好 groupIds 再调本函数**（折叠态的快照要带上编组关系）。
 */
export function planMerge(
  head: FoldCandidate & { excaliToggle?: unknown },
  newcomers: ReadonlyArray<FoldCandidate>,
): FoldOps | null {
  const snap = toggleOf(head);
  if (!snap) return null;
  if (!Array.isArray(newcomers) || newcomers.length === 0) return null;
  const gid = snap.groupId ?? groupIdFor(head.id);
  const offsets = [...(snap.offsets ?? [])];
  const known = new Set(offsets.map((o) => o.id));
  const elements = snap.collapsed ? [...(snap.elements ?? [])] : [];
  const memberIds = snap.collapsed ? [] : [...(snap.memberIds ?? [])];
  const patches: Array<{ id: string; patch: Record<string, unknown> }> = [];
  const hx = head.x ?? 0;
  const hy = head.y ?? 0;
  for (const n of newcomers) {
    const id = String(n.id);
    if (!id || known.has(id)) continue; // 已在组里
    known.add(id);
    offsets.push({ id, dx: (n.x ?? 0) - hx, dy: (n.y ?? 0) - hy });
    patches.push({ id, patch: { groupIds: [gid] } });
    if (snap.collapsed) {
      elements.push(JSON.parse(JSON.stringify(n)));
    } else {
      memberIds.push(id);
    }
  }
  if (patches.length === 0) return null;
  return {
    headPatch: {
      excaliToggle: {
        collapsed: snap.collapsed,
        groupId: gid,
        offsets,
        ...(snap.collapsed ? { elements } : { memberIds }),
        ...(Array.isArray(snap.order) ? { order: [...snap.order] } : {}),
      },
    },
    // 折叠态：新成员一起藏起来（删掉，位置记在快照里）
    deleteIds: snap.collapsed ? patches.map((p) => p.id) : [],
    specs: [],
    patches,
    order: Array.isArray(snap.order) ? [...snap.order] : undefined,
    groupId: gid,
  };
}

/**
 * 解散：彻底拆掉这个折叠组——成员按「头当前位置 + 偏移」回场，头上的折叠字段
 * 与编组关系一并清掉（回到「从没折叠过」的样子）。
 *
 * 与 planUnfold 的区别：unfold 是「展开」（字段留着，还能再折叠）；
 * dissolve 是「恢复原样」（字段清掉 = 拆组）。
 */
export function planDissolve(
  head: FoldCandidate & { excaliToggle?: unknown },
  aliveIds?: ReadonlySet<string>,
): FoldOps | null {
  const snap = toggleOf(head);
  if (!snap) return null;
  const elements = Array.isArray(snap.elements) ? snap.elements : [];
  const members = [...elements].sort((a, b) => zIndexOf(a) - zIndexOf(b));
  const ids = members.map((m) => String((m as { id?: unknown }).id ?? "")).filter(Boolean);
  return {
    // undefined：内存里即时失效，存盘时 JSON.stringify 直接丢掉这个键——完全无痕
    headPatch: { excaliToggle: undefined },
    deleteIds: [],
    specs: placeByOffsets(members, head, snap.offsets, aliveIds),
    // 拆组：头与回场的成员都退出编组（否则还留着半个空组）
    patches: [{ id: head.id, patch: { groupIds: [] } }, ...ids.map((id) => ({ id, patch: { groupIds: [] } }))],
    order: Array.isArray(snap.order) ? [...snap.order] : undefined,
  };
}

/**
 * 再折叠（点头上的 −）：收集**现存**成员。
 * 成员被用户删光的返回 null（调用方提示）；部分被删的只收剩下的。
 *
 * 两种头形态都收：展开态走 memberIds；折叠态走快照 id——后者覆盖「折叠后
 * ⌘Z 撤回过删除」的不一致态（成员还在场，点头 = 把在场的收干净）。
 */
export function planRefold(
  head: FoldCandidate & { excaliToggle?: unknown },
  elements: ReadonlyArray<FoldCandidate>,
  order?: string[],
): FoldOps | null {
  const snap = toggleOf(head);
  if (!snap) return null;
  const alive = new Set(elements.map((e) => e.id));
  const ids =
    snap.collapsed === true && Array.isArray(snap.elements)
      ? snap.elements.map((e) => String((e as { id?: unknown }).id ?? ""))
      : Array.isArray(snap.memberIds)
        ? snap.memberIds.map((id) => String(id))
        : [];
  const members = ids
    .map((id) => elements.find((e) => e.id === id))
    .filter((e): e is FoldCandidate => !!e && alive.has(e.id));
  if (members.length === 0) return null;
  return planFold(head, members, order);
}

/** 场景里所有带 excaliToggle 的头元素（overlay 轮询用；折叠态+展开态都要） */
export function foldHeadsOf(
  elements: ReadonlyArray<unknown>,
): Array<{ el: FoldCandidate; toggle: ExcaliToggle }> {
  const out: Array<{ el: FoldCandidate; toggle: ExcaliToggle }> = [];
  for (const el of elements) {
    const t = toggleOf(el);
    if (!t) continue;
    const e = el as FoldCandidate;
    if (typeof e.id !== "string" || typeof e.x !== "number" || typeof e.y !== "number") continue;
    out.push({ el: e, toggle: t });
  }
  return out;
}

/** 视口面（overlay 定位用；字段名与 vendor AppState 对齐） */
export interface FoldViewport {
  zoom: number;
  scrollX: number;
  scrollY: number;
  /** vendor 画布容器在**视口**中的原点（appState.offsetLeft/offsetTop） */
  offsetLeft: number;
  offsetTop: number;
}

/**
 * 圆点层自身在**视口**中的原点（.exs-canvas 内容盒左上）。
 *
 * 2026-10-30：这是「圆点会莫名移动」的根因。vendor 的 sceneCoordsToViewportCoords
 * 给的是**视口坐标**（含容器视口原点），而圆点层是 `.exs-canvas` 里的
 * position:absolute 层，坐标是**容器相对**的——两者差一个容器视口原点。
 * 容器一动（开合 Dock / 拖面板 / 改窗口大小 / 切页签）圆点就跟着跳。
 * 正确的层内坐标 = 视口坐标 − 层原点。
 */
export interface FoldLayerOrigin {
  left: number;
  top: number;
}

/** 圆点半径（CSS px，与 .exs-fold-badge 的 18px 宽高对齐） */
export const BADGE_R = 9;
/**
 * 圆点与文本左缘的视觉留白（CSS px，屏幕上恒定——跟着缩放走才算真「贴前面」）。
 * 2026-10-30：6 → 10。三角的右缘因此落在「头左缘 − 10px」，收集框的左边线
 * （头左缘 − 6px）就在它右边 4px 处——两者不再叠在一起（用户实机报「边框跟三角
 * 嵌合在一起了」）。
 */
const BADGE_GAP = 10;
/** 无字号也无高度时的兜底首行半高（场景单位），等价于旧口径的 20 号字 */
const FALLBACK_LINE_HALF = (20 * 1.25) / 2;
/** vendor 默认行高（元素没带 lineHeight 时的兜底） */
const DEFAULT_LINE_HEIGHT = 1.25;

/** 圆点随缩放的比例（钉住上下限：缩到 0.3 时圆点比字还大，放到 4 倍时又成针尖） */
export function badgeScale(zoom: number): number {
  const z = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
  return Math.min(1.8, Math.max(0.65, z));
}

/**
 * 首行文字的真实左缘（场景坐标）。
 *
 * 折叠头是文本时，圆点要贴在**文字**左缘（像无序列表的项目符号），不是元素包围盒
 * 的左边——居中/右对齐的多行文本两者不等（包围盒按最宽行算）。
 * 首行宽度用 estimateTextWidth 粗估（与脚本侧同一口径），居中对齐时误差几个像素。
 */
export function firstLineLeft(head: FoldCandidate): number {
  const boxLeft = typeof head.x === "number" ? head.x : 0;
  const align = head.textAlign ?? "left";
  if (align === "left") return boxLeft;
  const raw = typeof head.text === "string" ? head.text : "";
  const first = raw.split("\n")[0] ?? "";
  if (!first) return boxLeft;
  const fs = typeof head.fontSize === "number" && head.fontSize > 0 ? head.fontSize : 20;
  const lineW = estimateTextWidth(first, fs);
  const boxW = typeof head.width === "number" ? head.width : lineW;
  if (align === "center") return boxLeft + (boxW - lineW) / 2;
  return boxLeft + (boxW - lineW);
}

/**
 * 圆点圆心相对折叠头顶边的场景偏移。
 *
 * 文本头 = 首行中线（`fontSize × lineHeight / 2`，行高取元素真实值，vendor 不保证 1.25）；
 * 矩形/容器/箭头这类**没有 fontSize** 的头 = 元素几何中线（`height / 2`）。
 */
export function headLineOffset(head: FoldCandidate): number {
  const fs = head.fontSize;
  const lh = typeof head.lineHeight === "number" && head.lineHeight > 0 ? head.lineHeight : DEFAULT_LINE_HEIGHT;
  if (typeof fs === "number" && fs > 0) return (fs * lh) / 2;
  const h = head.height;
  if (typeof h === "number" && h > 0) return h / 2;
  return FALLBACK_LINE_HALF;
}

/**
 * 圆点控制钮的锚点：**层内**坐标（.exs-fold-layer 的左上为原点）。
 *
 * 场景 → 视口：viewport = (scene + scroll) × zoom + 容器视口原点
 * 视口 → 层内：再减掉圆点层自身的视口原点
 * 水平：贴**首行文字左缘**外侧（半径×缩放 + 留白），缩放时始终贴着文字
 * 竖直：首行中线
 *
 * 2026-10-30：不再因「折叠头被选中」而左让 10px——那是「点一下跳一下」的第二个来源；
 * 选中只影响样式（FoldBadge.selected），位置一律不动。
 */
export function badgeAnchor(
  head: FoldCandidate,
  view: FoldViewport,
  origin: FoldLayerOrigin,
): { left: number; top: number } {
  const zoom = view.zoom || 1;
  const dx = view.offsetLeft - origin.left;
  const dy = view.offsetTop - origin.top;
  const textLeft = (firstLineLeft(head) + view.scrollX) * zoom + dx;
  const textTop = (head.y + view.scrollY) * zoom + dy;
  return {
    left: textLeft - (BADGE_R * badgeScale(zoom) + BADGE_GAP),
    top: textTop + headLineOffset(head) * zoom,
  };
}

/** 折叠态徽章上显示的隐藏成员数：快照里**已不在画布上**的个数。
 *  传 aliveIds（场景现存 id 集）——折叠后 ⌘Z 撤回过删除时成员还在场，
 *  此时返回 0，overlay 会把徽章改显成展开态（−），点头即把在场的收干净。 */
export function hiddenCount(toggle: ExcaliToggle, aliveIds: ReadonlySet<string>): number {
  if (!toggle.collapsed || !Array.isArray(toggle.elements)) return 0;
  return toggle.elements.filter((e) => !aliveIds.has(String((e as { id?: unknown }).id ?? ""))).length;
}

/** overlay 的渲染项（组件只负责画，不算数） */
export interface FoldBadge {
  id: string;
  collapsed: boolean;
  count: number;
  left: number;
  top: number;
  /** 圆点随缩放的比例（CSS 用 --exs-fold-scale 吃） */
  scale: number;
  /** 头正被选中（只影响样式，2026-10-30 起**不影响位置**——选中不再让位） */
  selected: boolean;
}

/**
 * 一帧的徽章快照：场景元素 + 视口 (+ 选中 id 集) → 每个折叠头一个渲染项。
 *
 * 位置随元素走（head.x/y 直接进算），所以**拖动折叠头 / 编辑文本改变宽高时
 * 徽章必须重算**——组件侧的签名里要带上 x/y/width/height，否则 rAF 轮询会
 * 认为「什么都没变」而把旧坐标留着（2026-10-22 用户报的「圆点不跟着
 * strategy 走」就是这个：签名只有 id + collapsed + 视口）。
 */
export function foldBadgesOf(
  elements: ReadonlyArray<unknown>,
  view: FoldViewport,
  origin: FoldLayerOrigin,
  selectedIds?: ReadonlySet<string>,
): FoldBadge[] {
  const aliveIds = new Set(elements.map((e) => (e as { id?: unknown }).id).filter((id): id is string => typeof id === "string"));
  const scale = badgeScale(view.zoom || 1);
  return foldHeadsOf(elements).map(({ el, toggle }) => {
    const selected = !!selectedIds?.has(el.id);
    const a = badgeAnchor(el, view, origin);
    const missing = hiddenCount(toggle, aliveIds);
    return {
      id: el.id,
      // 折叠态但成员都还在场（⌘Z 撤消过删除的不一致态）→ 显展开态 −，
      // 点头把在场的收干净；其余照 collapsed 走
      collapsed: toggle.collapsed && missing > 0,
      count: missing,
      left: a.left,
      top: a.top,
      scale,
      selected,
    };
  });
}

/**
 * 徽章快照的签名（rAF 轮询去重用）：位置随元素/视口变，所以几何必须进签名。
 * 计数用 count 而不是 aliveIds：成员增删已经体现在 count 上，无关元素变动
 * 不必触发重渲染。selected 单独进签名——让位量已经折进 left，但「选中」这个
 * 事实还决定样式，不该只靠一个数值差来传递。
 */
export function foldBadgesSig(badges: ReadonlyArray<FoldBadge>): string {
  return badges
    .map((b) => `${b.id}:${b.collapsed ? 1 : 0}:${b.count}:${b.selected ? 1 : 0}:${b.left.toFixed(1)},${b.top.toFixed(1)}@${b.scale.toFixed(2)}`)
    .join("|");
}

/**
 * 2026-10-22：文本折叠的圆点控制钮层（对标 Obsidian Canvas Folding 的 − 控制点）。
 *
 * 形态：折叠态 = 实心圆 + ▶ + 右上角隐藏计数徽章；展开态 = 空心圆 + −。
 * 点击 = 收起 / 展开，带 8 帧淡入淡出 + 轻微上滑的伪动画。
 *
 * 挂点：`.exs-canvas`（已 position:relative）内的绝对定位层，pointer-events
 * 只开在按钮上——不挡画布任何交互。定位口径与 vendor sceneCoordsToViewportCoords
 * 一致：x = (sceneX + scrollX) * zoom.value + offsetLeft。
 *
 * 选中让位：折叠头正被选中时，vendor 会在包围盒左缘中点画选区把手，圆点按
 * SELECT_NUDGE 再往左让一截（见 text-fold.ts 的 badgeAnchor）——不隐藏开关。
 *
 * 位置同步：vendor 的 onChange 只在场景/appState 变化时回调，而本层要跟平移/缩放
 * 走——用 rAF 轮询 + 签名去重（元素 id 集 + 各头 collapsed 态 + 视口五元组），
 * 签名不变不 setState。frameNameBoundsCache 也是这个模式（vendor 自己就这么干）。
 *
 * 撤销栈：动画中间帧一律 CaptureUpdateAction.NEVER，只在首（加回成员/提交折叠态）
 * 尾（删成员/展开态补丁）用 IMMEDIATELY ⇒ ⌘Z 一步回到动画前。
 */

import { useEffect, useRef, useState } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { CaptureUpdateAction } from "@excalidraw/excalidraw";
import type { EaBoardHandle } from "./ea-api";
import {
  arrangeMembers,
  foldBadgesOf,
  foldBadgesSig,
  groupBounds,
  groupIdFor,
  planDissolve,
  planMerge,
  planRefold,
  planUnfold,
  toggleOf,
  type FoldBadge,
  type FoldCandidate,
} from "./text-fold";
import { t } from "../i18n";
import { ICON_FOLD_DOWN, ICON_FOLD_DOWN_SKETCH, ICON_FOLD_RIGHT, ICON_FOLD_RIGHT_SKETCH } from "./menu-icons";
import { mergeIntoFold } from "./fold-actions";

/** 动画帧数 / 单帧间隔（ms）——总时长 ≈ 130ms，够感知又不拖沓 */
const FRAMES = 8;
const FRAME_MS = 16;
/** 收起/展开时成员的滑动距离（scene 单位） */
const SLIDE = 8;

const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

const nextFrame = (): Promise<void> =>
  new Promise((resolve) => window.setTimeout(resolve, FRAME_MS));

/** 收集框（层内坐标）：展开态的组，头与成员包一个框 */
interface FoldBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** 该显示吗（选中 / 鼠标靠近）——平时隐形，画布与其它元素无缝 */
  visible: boolean;
}

/** 框相对成员包围盒的外扩（屏幕像素） */
const BOX_PAD = 14;
/**
 * 框的**左侧**外扩比别处小：那一侧要让开折叠头的三角控制钮
 * （三角右缘在「头左缘 − 10px」，这里留 6px ⇒ 三角在框外、不叠线）。
 */
const BOX_PAD_LEFT = 6;
/** 鼠标靠近多少像素内算「靠近这个组」（框淡入的触发范围） */
const HOVER_NEAR = 28;

/** 位置相关的小元素面（收集框与「拖入即并入」判定只要这几个字段） */
type PosElement = {
  id?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  [k: string]: unknown;
};

/**
 * 算各展开态组的收集框（层内坐标）。
 * 只给**展开态**的组画框——折叠态框就该消失（这正是「编辑态才看得见收集区」）。
 */
function computeFoldBoxes(
  els: ReadonlyArray<PosElement>,
  view: { zoom: number; scrollX: number; scrollY: number; offsetLeft: number; offsetTop: number },
  origin: { left: number; top: number },
  selectedIds: ReadonlySet<string>,
  mouse: { x: number; y: number } | null,
): FoldBox[] {
  const zoom = view.zoom || 1;
  const dx = view.offsetLeft - origin.left;
  const dy = view.offsetTop - origin.top;
  const byId = new Map(els.map((e) => [String(e.id ?? ""), e]));
  const out: FoldBox[] = [];
  for (const e of els) {
    const t = toggleOf(e);
    if (!t || t.collapsed) continue;
    const members = (t.memberIds ?? []).map((id) => byId.get(id)).filter(Boolean);
    const b = groupBounds(e as never, members as never);
    if (!b) continue;
    const id = String(e.id ?? "");
    const x = (b.x + view.scrollX) * zoom + dx - BOX_PAD_LEFT;
    const y = (b.y + view.scrollY) * zoom + dy - BOX_PAD;
    const w = b.w * zoom + BOX_PAD_LEFT + BOX_PAD;
    const h = b.h * zoom + BOX_PAD * 2;
    // 三态显现：平时隐形、鼠标靠近淡入、选中常显
    const selected = selectedIds.has(id);
    const near =
      !!mouse &&
      mouse.x >= x - HOVER_NEAR &&
      mouse.x <= x + w + HOVER_NEAR &&
      mouse.y >= y - HOVER_NEAR &&
      mouse.y <= y + h + HOVER_NEAR;
    out.push({ id, x, y, w, h, visible: selected || near });
  }
  return out;
}

/** 收集框签名（变了才重渲染） */
function foldBoxesSig(boxes: ReadonlyArray<FoldBox>): string {
  return boxes
    .map((b) => `${b.id}:${b.x.toFixed(1)},${b.y.toFixed(1)},${b.w.toFixed(1)},${b.h.toFixed(1)},${b.visible ? 1 : 0}`)
    .join("|");
}

/** 这个元素是不是已经是某个折叠组的成员（是就别再往别的组并） */
function isMemberOfAny(id: string, els: ReadonlyArray<Record<string, unknown>>): boolean {
  for (const e of els) {
    const t = toggleOf(e);
    if (!t) continue;
    if ((t.memberIds ?? []).includes(id)) return true;
    if ((t.offsets ?? []).some((o) => o.id === id)) return true;
    if ((t.elements ?? []).some((m) => String((m as { id?: unknown }).id ?? "") === id)) return true;
  }
  return false;
}

export interface TextFoldOverlayProps {
  api: ExcalidrawImperativeAPI | null;
  getHandle: () => EaBoardHandle | null;
  notify?: (msg: string) => void;
}

/**
 * 把若干元素并进某个折叠组（返回并入数量）。
 * 右键菜单的「并入」与「拖入即并入」共用这一条路径。
 *
 * 折叠态：新成员进快照并一起藏起来；展开态：新成员留在画布上，只补编组关系。
 * 先打 groupIds 再重读——折叠态的快照要带上编组关系（否则展开后成员不跟头走）。
 *
 * 2026-10-30：实现搬到 fold-actions.ts（画布右键菜单共用同一套，避免两条链路漂）。
 */
const mergeInto = mergeIntoFold;

export function TextFoldOverlay({ api, getHandle, notify }: TextFoldOverlayProps): React.JSX.Element | null {
  const [badges, setBadges] = useState<FoldBadge[]>([]);
  /** 收集框（展开态的组才有框；折叠态框消失——「编辑态才看得见收集区」） */
  const [boxes, setBoxes] = useState<FoldBox[]>([]);
  /** 圆点层自身（2026-10-30：取它的视口原点，把 vendor 的视口坐标换算成层内坐标） */
  const layerRef = useRef<HTMLDivElement | null>(null);
  /**
   * 2026-10-30：折叠钮右键菜单（对标 Canvas Folding 的右键分支菜单）。
   * 左键 = 折叠/展开（单一语义）；右键 = 「并入 / 排版 / 移出 / 解散」这类改结构的动作。
   */
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  /** 右键菜单 DOM（点外面关闭时判包含） */
  const menuRef = useRef<HTMLDivElement | null>(null);
  /** 收集框签名（变了才重渲染） */
  const boxSigRef = useRef("");
  /** 位置指纹：判断「刚刚被拖动过」（拖入即并入的判定之一） */
  const posRef = useRef<Map<string, { x: number; y: number; movedAt: number }>>(new Map());
  /** 帧计数（判断「刚刚」用） */
  const frameNo = useRef(0);
  /** 本次拖动已自动并入过的元素（同一次拖动只并一次） */
  const mergedRef = useRef<Set<string>>(new Set());
  /** 鼠标位置（视口坐标）：用于「鼠标靠近该组 → 框淡入」 */
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  /** 动画进行中的头 id（防重点；null = 空闲） */
  const animating = useRef<string | null>(null);
  /** 卸载标记：动画中途关页签要能停 */
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  /* 位置/状态轮询：签名不变不渲染
   *
   * 签名必须覆盖**一切影响渲染的东西**：徽章位置由 head.x/y + 视口算出，
   * 所以几何进签名——只写 id + collapsed + 视口的话，拖动折叠头（或编辑文本
   * 改变宽高）不改变其中任何一项，rAF 会认定「无事发生」把旧坐标留着，
   * 圆点就掉在原来的位置不跟元素走（2026-10-22 用户报的问题）。 */
  /**
   * 鼠标位置追踪：框的「靠近淡入」靠它。
   * **不用透明 hit 层**——那会挡住画布上的选中和拖拽（框是纯视觉层）。
   */
  useEffect(() => {
    const onMove = (e: MouseEvent): void => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = (): void => {
      mouseRef.current = null;
    };
    window.addEventListener("mousemove", onMove, true);
    window.addEventListener("mouseleave", onLeave, true);
    document.addEventListener("mouseleave", onLeave, true);
    return () => {
      window.removeEventListener("mousemove", onMove, true);
      window.removeEventListener("mouseleave", onLeave, true);
      document.removeEventListener("mouseleave", onLeave, true);
    };
  }, []);

  /**
   * 拖入即并入（2026-10-30）：把元素拖进某个组的收集框 → 自动并入那个组。
   *
   * 三重判定（少一个都会误判）：
   * ① 它**刚刚移动过**（且已经停下）——不是一直就放在框里的元素；
   * ② 它的中心落在某个展开组的框内；
   * ③ 它不是任何组的头/成员。
   * 同一次拖动只并一次（mergedRef）；误并入是一步撤销可回退。
   */
  const maybeMergeDropped = (
    els: ReadonlyArray<PosElement>,
    view: { zoom: number; scrollX: number; scrollY: number; offsetLeft: number; offsetTop: number },
    origin: { left: number; top: number },
    boxes: ReadonlyArray<FoldBox>,
  ): void => {
    frameNo.current += 1;
    const now = frameNo.current;
    const prev = posRef.current;
    const nextPos = new Map<string, { x: number; y: number; movedAt: number }>();
    for (const e of els) {
      const id = String(e.id ?? "");
      const p = prev.get(id);
      const moved = !p || p.x !== e.x || p.y !== e.y;
      if (moved) mergedRef.current.delete(id);
      nextPos.set(id, { x: e.x, y: e.y, movedAt: moved ? now : (p?.movedAt ?? now) });
    }
    posRef.current = nextPos;
    if (boxes.length === 0) return;
    const handle = getHandle();
    if (!handle) return;
    const zoom = view.zoom || 1;
    const dx = view.offsetLeft - origin.left;
    const dy = view.offsetTop - origin.top;
    for (const e of els) {
      const id = String(e.id ?? "");
      if (!id) continue;
      if (toggleOf(e)) continue; // 是头 → 不并入
      if (isMemberOfAny(id, els)) continue; // 已经是某组成员 → 不并入
      const p = nextPos.get(id);
      if (!p || p.movedAt === now) continue; // 还在拖 → 等它停下
      if (now - p.movedAt > 12) continue; // 不是「刚刚动过」→ 不管
      if (mergedRef.current.has(id)) continue; // 同一次拖动只并一次
      const cx = (e.x + (e.width ?? 0) / 2 + view.scrollX) * zoom + dx;
      const cy = (e.y + (e.height ?? 0) / 2 + view.scrollY) * zoom + dy;
      const hit = boxes.find((b) => cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h);
      if (!hit) continue;
      mergedRef.current.add(id);
      const n = mergeInto(handle, hit.id, [id]);
      if (n > 0) notify?.(t("已并入 {n} 个元素到这个折叠", { n }));
    }
  };

  useEffect(() => {
    if (!api) return;
    let raf = 0;
    let sig = "";
    const tick = (): void => {
      const els = api.getSceneElements();
      const st = api.getAppState();
      /*
       * 2026-10-30：坐标系换算——vendor 的 sceneCoordsToViewportCoords 给的是
       * **视口**坐标（含容器视口原点），而本层是 .exs-canvas 里的 absolute 层，
       * 坐标是**容器相对**的。差一个「层自身的视口原点」，不补就整体偏移，
       * 而且容器一动（开合 Dock / 拖面板 / 改窗口 / 切页签）圆点就跟着跳。
       */
      const lr = layerRef.current?.getBoundingClientRect();
      const origin = { left: lr?.left ?? 0, top: lr?.top ?? 0 };
      const selectedIds = new Set(Object.keys(st.selectedElementIds ?? {}));
      const view = {
        zoom: st.zoom?.value ?? 1,
        scrollX: st.scrollX,
        scrollY: st.scrollY,
        offsetLeft: st.offsetLeft,
        offsetTop: st.offsetTop,
      };
      const next = foldBadgesOf(
        els,
        view,
        origin,
        selectedIds,
      );
      const sigNext = foldBadgesSig(next);
      if (sigNext !== sig) {
        sig = sigNext;
        setBadges(next);
      }
      // 收集框：只给展开态的组画框（折叠态框就该消失）
      const mouseRaw = mouseRef.current;
      const mouse = mouseRaw && lr ? { x: mouseRaw.x - lr.left, y: mouseRaw.y - lr.top } : null;
      const nextBoxes = computeFoldBoxes(els as never, view, origin, selectedIds, mouse);
      const boxSig = foldBoxesSig(nextBoxes);
      if (boxSig !== boxSigRef.current) {
        boxSigRef.current = boxSig;
        setBoxes(nextBoxes);
      }
      // 拖入即并入：刚停下、落点在某个框内的陌生元素 → 并进那个组
      maybeMergeDropped(els as never, view, origin, nextBoxes);
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [api]);

  /** 右键菜单：点外面 / Escape 关掉 */
  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent): void => {
      const el = menuRef.current;
      if (el && e.target instanceof Node && el.contains(e.target)) return;
      setMenu(null);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setMenu(null);
    };
    window.addEventListener("mousedown", close, true);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("mousedown", close, true);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [menu]);

  /** 展开：快照成员以 opacity 0 加回（NEVER，已在场的跳过防重复 id）→ 提交展开态补丁（IMMEDIATELY）→ 淡入 */
  const runUnfold = async (handle: EaBoardHandle, headId: string): Promise<void> => {
    const head = handle.getElements().find((e) => e.id === headId);
    if (!head) return;
    const presentIds = new Set(handle.getElements().map((e) => e.id));
    const ops = planUnfold(head as FoldCandidate & { excaliToggle?: unknown }, presentIds);
    if (!ops) return;
    animating.current = headId;
    try {
      const specs = ops.specs.map((s) => ({ ...s, opacity: 0 }));
      const ids = handle.addElements(specs as never, CaptureUpdateAction.NEVER);
      // 还原 z 序：addElements 是追加（= 甩到最上层），按折叠时记下的顺序排回去
      if (ops.order && ops.order.length > 0) handle.reorderElements(ops.order, CaptureUpdateAction.NEVER);
      handle.patchElements([headId], ops.headPatch, CaptureUpdateAction.IMMEDIATELY);
      const y0 = new Map(ops.specs.map((s) => [String(s.id), Number(s.y ?? 0)]));
      for (let i = 1; i <= FRAMES; i++) {
        if (!alive.current) return;
        const e = easeOutCubic(i / FRAMES);
        for (const id of ids) {
          handle.patchElements([id], { opacity: Math.round(e * 100), y: (y0.get(id) ?? 0) + (1 - e) * SLIDE } as never, CaptureUpdateAction.NEVER);
        }
        await nextFrame();
      }
    } finally {
      animating.current = null;
    }
  };

  /** 收起：成员淡出 + 下滑（NEVER）→ 末帧删成员 + 提交折叠态补丁（IMMEDIATELY） */
  const runRefold = async (handle: EaBoardHandle, headId: string): Promise<void> => {
    const head0 = handle.getElements().find((e) => e.id === headId);
    if (!head0) return;
    /*
     * 编组：头与成员同属一个原生组 ⇒ 展开态拖头，vendor 原生带着整组一起动
     * （撤销也正确）。NEVER 捕获——不额外占撤销步，折叠本身才是那一步。
     */
    const gid = toggleOf(head0)?.groupId ?? groupIdFor(headId);
    const snap0 = toggleOf(head0);
    const memberIds = Array.from(
      new Set(
        [
          ...(snap0?.memberIds ?? []),
          ...(snap0?.elements ?? []).map((e) => String((e as { id?: unknown }).id ?? "")),
        ].filter(Boolean),
      ),
    );
    if (memberIds.length > 0) {
      handle.patchElements([headId, ...memberIds], { groupIds: [gid] }, CaptureUpdateAction.NEVER);
    }
    const head = handle.getElements().find((e) => e.id === headId);
    if (!head) return;
    const ops = planRefold(
      head as FoldCandidate & { excaliToggle?: unknown },
      handle.getElements() as never,
      // 再折叠时记下当前全场 z 序（成员还在场，删掉后还原能排回原位）
      handle.getElements().map((e) => e.id),
    );
    if (!ops) {
      notify?.(t("折叠头里的成员已不在画布上：重新框选后再折叠"));
      return;
    }
    animating.current = headId;
    try {
      const y0 = new Map(ops.deleteIds.map((id) => [id, handle.getElements().find((e) => e.id === id)?.y ?? 0]));
      for (let i = 1; i <= FRAMES; i++) {
        if (!alive.current) return;
        const e = easeOutCubic(i / FRAMES);
        for (const id of ops.deleteIds) {
          handle.patchElements([id], { opacity: Math.round((1 - e) * 100), y: (y0.get(id) ?? 0) + e * SLIDE } as never, CaptureUpdateAction.NEVER);
        }
        await nextFrame();
      }
      if (!alive.current) return;
      handle.deleteElements(ops.deleteIds, CaptureUpdateAction.IMMEDIATELY);
      handle.patchElements([headId], ops.headPatch, CaptureUpdateAction.IMMEDIATELY);
    } finally {
      animating.current = null;
    }
  };

  /**
   * 并入：把当前选中的其它元素并进这个折叠组（不用解散重建）。
   *
   * 折叠态：新成员进快照并一起藏起来；展开态：新成员留在画布上，只补编组关系。
   * 先打 groupIds 再重读——折叠态的快照要带上编组关系（否则展开后成员不跟头走）。
   */
  /** 右键菜单「并入选中的元素」：把选区里除头以外的元素并进这个组 */
  const runMerge = (handle: EaBoardHandle, headId: string): void => {
    const st = handle.getAppState();
    const selected = Object.keys(st.selectedElementIds ?? {}).filter((id) => id !== headId);
    if (selected.length === 0) {
      notify?.(t("先选中要并入这个折叠的元素（Shift 多选）"));
      return;
    }
    const n = mergeInto(handle, headId, selected);
    if (n === 0) {
      notify?.(t("先选中要并入这个折叠的元素（Shift 多选）"));
      return;
    }
    notify?.(t("已并入 {n} 个元素到这个折叠", { n }));
  };

  /** 一键列表排版：框内成员垂直均分（间距沿用记住的值，没有就取现有相邻间距的平均） */
  const runArrange = (handle: EaBoardHandle, headId: string): void => {
    const head = handle.getElements().find((e) => e.id === headId);
    if (!head) return;
    const tg = toggleOf(head);
    const memberIds = tg?.memberIds ?? [];
    const members = handle.getElements().filter((e) => memberIds.includes(e.id));
    if (members.length === 0) {
      notify?.(t("这个折叠里还没有成员"));
      return;
    }
    const plan = arrangeMembers(
      head as never,
      members as never,
      typeof tg?.gap === "number" ? tg.gap : undefined,
    );
    // 一次落所有成员的位置 ⇒ 只占一步撤销
    handle.patchElementsMany(
      plan.positions.map((p) => ({ id: p.id, patch: { x: p.x, y: p.y } })),
      CaptureUpdateAction.IMMEDIATELY,
    );
    handle.patchElements(
      [headId],
      { excaliToggle: { ...(tg ?? {}), gap: plan.gap } },
      CaptureUpdateAction.IMMEDIATELY,
    );
    notify?.(t("已按列表排版：{n} 个成员", { n: plan.positions.length }));
  };

  /** 右键菜单「移出选中的成员」：把选区里除头以外的成员移出这个组 */
  const runRemove = (handle: EaBoardHandle, headId: string): void => {
    const head = handle.getElements().find((e) => e.id === headId);
    if (!head) return;
    const tg = toggleOf(head);
    const st = handle.getAppState();
    const selected = Object.keys(st.selectedElementIds ?? {}).filter((id) => id !== headId);
    const memberIds = (tg?.memberIds ?? []).filter((id) => selected.includes(id));
    if (memberIds.length === 0) {
      notify?.(t("先选中要移出这个折叠的成员"));
      return;
    }
    // 退出编组 + 从成员表里摘掉（成员仍在画布上，只是不再属于这个折叠）
    handle.patchElementsMany(
      memberIds.map((id) => ({ id, patch: { groupIds: [] } })),
      CaptureUpdateAction.IMMEDIATELY,
    );
    const next = {
      ...(tg ?? {}),
      memberIds: (tg?.memberIds ?? []).filter((id) => !memberIds.includes(id)),
      offsets: (tg?.offsets ?? []).filter((o) => !memberIds.includes(o.id)),
    };
    handle.patchElements([headId], { excaliToggle: next }, CaptureUpdateAction.IMMEDIATELY);
    notify?.(t("已移出 {n} 个成员", { n: memberIds.length }));
  };

  /**
   * 解散：彻底拆掉这个折叠组——成员按「头当前位置 + 偏移」回场，头的折叠字段与
   * 编组关系一并清掉（回到「从没折叠过」的样子）。
   */
  const runDissolve = (handle: EaBoardHandle, headId: string): void => {
    const head = handle.getElements().find((e) => e.id === headId);
    if (!head) return;
    const presentIds = new Set(handle.getElements().map((e) => e.id));
    const ops = planDissolve(head as FoldCandidate & { excaliToggle?: unknown }, presentIds);
    if (!ops) return;
    if (ops.specs.length > 0) handle.addElements(ops.specs as never, CaptureUpdateAction.IMMEDIATELY);
    if (ops.order && ops.order.length > 0) handle.reorderElements(ops.order, CaptureUpdateAction.NEVER);
    // 拆组：头与回场的成员都退出编组
    for (const p of ops.patches ?? []) handle.patchElements([p.id], p.patch, CaptureUpdateAction.NEVER);
    handle.patchElements([headId], ops.headPatch, CaptureUpdateAction.IMMEDIATELY);
    notify?.(t("已解散这个折叠：成员已回到画布"));
  };

  const onBadgeClick = (item: FoldBadge): void => {
    if (animating.current) return;
    const handle = getHandle();
    if (!handle) return;
    if (item.collapsed) void runUnfold(handle, item.id);
    else void runRefold(handle, item.id);
  };

  return (
    <>
      <div
        ref={layerRef}
        className="exs-fold-layer"
        style={{ "--exs-fold-scale": String(badges[0]?.scale ?? 1) } as React.CSSProperties}
      >
      {/* 收集框：只有展开态的组才有（编辑态的容器；折叠态框消失） */}
      {boxes.map((b) => (
        <div
          key={b.id}
          className={"exs-fold-box" + (b.visible ? " exs-fold-box--on" : "")}
          style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
          aria-hidden="true"
        />
      ))}
      {badges.map((b) => (
        <button
          key={b.id}
          type="button"
          className={`exs-fold-badge${b.collapsed ? " exs-fold-badge--folded" : ""}${b.selected ? " exs-fold-badge--selected" : ""}`}
          style={{ left: b.left, top: b.top }}
          title={b.collapsed ? t("展开隐藏的 {n} 个元素", { n: b.count }) : t("收起下方元素")}
          aria-label={b.collapsed ? t("展开") : t("收起")}
          onClick={() => onBadgeClick(b)}
          onContextMenu={(e) => {
            // 右键 = 改结构的动作（并入 / 解散）；左键才是折叠/展开
            e.preventDefault();
            e.stopPropagation();
            setMenu({ id: b.id, x: e.clientX, y: e.clientY });
          }}
        >
          {/*
            2026-10-30：手绘风三角（实心 + 一道「第二笔」细描边仿手绘双线）。
            展开态 = ▼（可收起），折叠态 = ▶（可展开）——形状承担状态，不用文字字形
            （小尺寸下 ▶/− 的字体字形发虚，正是用户嫌「很烂」的一半原因）。
          */}
          <svg className="exs-fold-badge__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d={b.collapsed ? ICON_FOLD_RIGHT : ICON_FOLD_DOWN} fill="currentColor" />
            <path
              d={b.collapsed ? ICON_FOLD_RIGHT_SKETCH : ICON_FOLD_DOWN_SKETCH}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          </svg>
          {b.collapsed && b.count > 0 ? <span className="exs-fold-badge__count">{b.count}</span> : null}
        </button>
      ))}
      </div>
      {/* 2026-10-30：右键菜单（并入 / 解散）。fixed 定位在视口，z-index 高于画布。 */}
      {menu ? (
        <div ref={menuRef} className="exs-fold-menu" style={{ left: menu.x, top: menu.y }} role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              const handle = getHandle();
              setMenu(null);
              if (handle) runMerge(handle, menu.id);
            }}
          >
            {t("并入选中的元素")}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              const handle = getHandle();
              setMenu(null);
              if (handle) runArrange(handle, menu.id);
            }}
          >
            {t("一键列表排版（统一间距）")}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              const handle = getHandle();
              setMenu(null);
              if (handle) runRemove(handle, menu.id);
            }}
          >
            {t("移出选中的成员")}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              const handle = getHandle();
              setMenu(null);
              if (handle) runDissolve(handle, menu.id);
            }}
          >
            {t("解散这个折叠（恢复原样）")}
          </button>
        </div>
      ) : null}
    </>
  );
}

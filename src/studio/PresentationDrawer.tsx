/**
 * 第五十三轮：演示抽屉——画布右缘的浮层，管「哪几页、什么顺序、放不放、怎么放」。
 *
 * 为什么住画布里而不是思源的 Dialog：演示是**有状态的运行时**，页列表要和画布
 * 同屏共存（点一页要能把镜头开过去看那一页），Dialog 会糊在中间挡画布。
 * 为什么是 absolute 而不是 fixed：fixed 的含块是视口，思源右 Dock 开着或页签左右
 * 分栏时视口右缘 ≠ 画布右缘（第三十八轮色板就是栽在这儿）；absolute 的含块是
 * `.exs-root`（position: relative，本组件与 .exs-canvas 都是它的子节点），跟着画布走。
 *
 * 第八十轮：每页一张**缩略图卡片**（对标 Excalidraw+ 的 Slides 面板）。
 * 第八十一轮：窗口加宽成双列浏览窗；页序改成**拖左侧把手**（↑↓ 按钮退役，但键盘
 * ↑↓/←→ 仍可挪页）；底栏「新建页」按固定比例插标准画框——手画的框大小不一，
 * 一放映就是「这页大那页小」。
 *
 * 缩略图与改名都走宿主通道：本组件不碰 imperative 句柄，也不写场景——
 * 它只读片单/预览图/偏好，只发意图（挪页 / 新建页 / 排除 / 整页 / 跳页 / 改名 / 改偏好）。
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { t } from "../i18n";
import { LineIcon } from "./line-icon";
import { ICON_PLAY, ICON_PLUS } from "./menu-icons";
import { FRAME_RATIOS, isFrameRatio, type FrameRatio } from "./frame-presets.ts";
import { slideTitle, type Deck } from "./presentation-plan";
import {
  EFFECT_IDS,
  EFFECT_LABELS,
  STEP_MAX,
  type MotionEdit,
  type MotionRow,
} from "./presentation-motion.ts";
import type { GraphState } from "./presentation-graph.ts";
import type { PresentationSettings } from "./settings";
import { FadeScroll, PresentationSettingsMenu, usePopoverDismiss } from "./PresentationSettingsMenu";

/** 眼睛（入片/排除）。全绝对坐标，口径同 menu-icons。 */
const ICON_EYE =
  "M2.5,12C4.6,8.6 8.1,6.6 12,6.6C15.9,6.6 19.4,8.6 21.5,12C19.4,15.4 15.9,17.4 12,17.4C8.1,17.4 4.6,15.4 2.5,12Z" +
  "M12,9.6A2.4,2.4 0 1 0 12,14.4A2.4,2.4 0 1 0 12,9.6Z";

/** 斜线（排除页的眼睛上叠一道） */
const ICON_SLASH = "M4,20L20,4";

/** 逐条出场：三条长短不一的横线（一眼看出「一条条来」） */
const ICON_STEPS = "M5,7h14M5,12h9M5,17h5";

/** 设置：推子 */
const ICON_SLIDERS = "M4,7h8M17,7h3M4,12h3M11,12h9M4,17h8M17,17h3";

/** 出场编排：三级台阶（一眼是「谁先谁后」） */
const ICON_MOTION = "M4,19h4v-4h6v-4h6";

/**
 * 四档效果的字形。刻意不靠「箭头长短」区分：16px 上分不出来。
 * 浮现=三点渐显、弹入=四向弹开、升起=向上、滑入=向右（零长线段 + 圆头 = 圆点，口径同 ICON_GRIP）。
 */
const FX_ICONS: Record<(typeof EFFECT_IDS)[number], string> = {
  fade: "M7,16.5h.01M12,12h.01M17,7.5h.01",
  pop: "M12,6.5v2.5M12,15v2.5M6.5,12h2.5M15,12h2.5",
  rise: "M12,18.5V7M8.5,10.5L12,7l3.5,3.5",
  slide: "M5.5,12h12M14,8.5l3.5,3.5L14,15.5",
};

/** 拖动把手：两列小圆点（strokeLinecap=round 时零长线段就是圆点） */
const ICON_GRIP = "M9,7h.01M15,7h.01M9,12h.01M15,12h.01M9,17h.01M15,17h.01";

/** 比例按钮的第二行短名：光看 16:10 / 3:4 容易挑错 */
const RATIO_NAMES: Record<FrameRatio, string> = {
  "16:9": "宽屏",
  "4:3": "经典",
  "16:10": "近宽屏",
  "3:4": "竖版",
};

/**
 * 面板位置记忆的 localStorage 键。为什么存这里而不是 PresentationSettings：
 * 那是「放映偏好」语义（遮罩/打字机那类，改一次所有白板共用、且面板里可见可调），
 * 面板停在哪是纯本地视图状态，塞进去会给设置 schema 和它的 deepEqual 测试平白添键。
 */
const POS_KEY = "excali-present-drawer-pos";

/** 上次用的画框比例：下次开「新建页」还停在那个比例上 */
const RATIO_KEY = "excali-present-ratio";

/** 落位记忆：相对包含块(.exs-root)的百分比，换分辨率/窗口大小不会飘 */
type DrawerPos = { rx: number; ry: number };

function readPos(): DrawerPos | null {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<DrawerPos>;
    if (typeof o.rx !== "number" || typeof o.ry !== "number") return null;
    if (!Number.isFinite(o.rx) || !Number.isFinite(o.ry)) return null;
    // 旧版本「点一下头部没拖动」也会落位，把默认值 0,0 写进记忆 → 抽屉永远贴左上角。
    // 0,0 不是会有人故意挑的落点（那里压着左 Dock），读到就当成没记忆、回中。
    if (o.rx === 0 && o.ry === 0) return null;
    return { rx: Math.min(1, Math.max(0, o.rx)), ry: Math.min(1, Math.max(0, o.ry)) };
  } catch {
    return null;
  }
}

function writePos(p: DrawerPos | null): void {
  try {
    if (p) localStorage.setItem(POS_KEY, JSON.stringify(p));
    else localStorage.removeItem(POS_KEY);
  } catch {
    /* 隐私模式/配额满：记不住就只在本次会话内生效，不报错 */
  }
}

function readRatio(): FrameRatio {
  try {
    const raw = localStorage.getItem(RATIO_KEY);
    if (isFrameRatio(raw)) return raw;
  } catch {
    /* 隐私模式：用默认比例 */
  }
  return "16:9";
}

function writeRatio(ratio: FrameRatio): void {
  try {
    localStorage.setItem(RATIO_KEY, ratio);
  } catch {
    /* 同上，记不住不影响插入 */
  }
}

export function PresentationDrawer(props: {
  deck: Deck;
  /**
   * 第七十六轮：放映图状态——板子上有画框之间的箭头吗？
   * 有 → 放映沿箭头走；没有 → 按片单顺序翻。面板上要说清楚现在走哪条路线。
   */
  graph: GraphState;
  /**
   * 第八十轮：画框 id → 缩略图 data URL。缺项 = 还在生成（先显示占位）。
   * 由宿主生成并缓存（签名变了才重画），抽屉只负责显示。
   */
  thumbs: Record<string, string>;
  /** 放映偏好（宿主设置的本地快照；改一项就往上写一项） */
  settings: PresentationSettings;
  onSetting: <K extends keyof PresentationSettings>(key: K, value: PresentationSettings[K]) => void;
  /** 面板里当前选中的页（下标跟 deck.slides 一致） */
  selected: number;
  onSelect: (index: number) => void;
  /** 拖动/键盘挪一页 → StudioApp 写 order 元数据 */
  onMove: (from: number, to: number) => void;
  /** 第八十一轮：按固定比例新建一页标准画框（落在片单末尾） */
  onAddSlide: (ratio: FrameRatio) => void;
  /** 入片/排除一页 */
  onToggle: (id: string) => void;
  /** 这一页逐条 ↔ 整页 */
  onToggleReveal: (id: string) => void;
  /**
   * 第八十二轮：当前选中页的编排行（宿主按现场算好了再递进来）。
   * 空数组 = 这一页还没内容；放映中不会渲染抽屉，所以不用考虑中途变化。
   */
  rows: MotionRow[];
  /** 改一条的效果/步号 → 宿主写元素 customData（可撤销、会标脏） */
  onRowMotion: (ids: readonly string[], edit: MotionEdit) => void;
  /** 第八十轮：双击页名改画框名（宿主写场景，抽屉自己不碰） */
  onRename: (id: string, name: string) => void;
  /** 点「开始演示」→ 放映控制器接管 */
  onStart: () => void;
  onClose: () => void;
}) {
  const { slides } = props.deck;
  const shown = slides.filter((s) => s.included).length;
  const [showSettings, setShowSettings] = useState(false);
  /** 第八十二轮：出场编排区默认收起。抽屉是压在画布上的浮层，常驻一列控件就是永久少一块画布
   *  （口径同第三十八轮荧光笔色板）；要看要改时点一下即可。 */
  const [motionOpen, setMotionOpen] = useState(false);
  /** 内联改名：同一时刻只编辑一页；Enter/失焦保存，Esc 放弃 */
  const [editing, setEditing] = useState<{ id: string; draft: string } | null>(null);
  const cancelRenameRef = useRef(false);
  const menuHostRef = useRef<HTMLDivElement | null>(null);
  usePopoverDismiss(showSettings, () => setShowSettings(false), menuHostRef);

  /** 底栏「新建页」比例气泡 */
  const [newOpen, setNewOpen] = useState(false);
  const [lastRatio, setLastRatio] = useState<FrameRatio>(() => readRatio());
  const newHostRef = useRef<HTMLDivElement | null>(null);
  usePopoverDismiss(newOpen, () => setNewOpen(false), newHostRef);

  /**
   * 拖动：按住头部空白处拖动面板（设置/关闭按钮除外，见 onHeadPointerDown）。
   * 位置存「相对包含块的百分比」，用 top/left 绝对定位，由 CSS 默认值兜底默认位。
   * null = 还没拖过 → 居中浮窗（top/left 50% + translate）。
   * 初值直接读 localStorage：先渲染到右缘再跳到记忆位会闪一下。
   */
  const rootRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLOListElement | null>(null);
  const [pos, setPos] = useState<DrawerPos | null>(() => readPos());
  const [dragging, setDragging] = useState(false);
  /**
   * 进场动画只播一次。`--dragging` 里有 `animation: none`，松手撤掉这个类会让
   * `animation-name` 从 none 变回 `exs-present-in`——浏览器当成一条新动画从头播，
   * 表现就是松手闪一下。播完（或一开始就被抓住）就落 settled，之后类名怎么变都不重播。
   */
  const [settled, setSettled] = useState(false);

  const onHeadPointerDown = useCallback((e: React.PointerEvent) => {
    // 头部有设置/关闭两个按钮：点在按钮上不启动拖动，否则点按钮会变成拖面板
    if ((e.target as HTMLElement).closest("button")) return;
    const root = rootRef.current;
    if (!root) return;
    const cb = root.offsetParent as HTMLElement | null;
    if (!cb) return;
    e.preventDefault();
    const cbRect = cb.getBoundingClientRect();
    const selfRect = root.getBoundingClientRect();
    // 起点用当前实际位置（相对包含块），移动 = 起点 + 指针增量
    const left0 = selfRect.left - cbRect.left;
    const top0 = selfRect.top - cbRect.top;
    const clientX0 = e.clientX;
    const clientY0 = e.clientY;
    // 抓住即算入场结束：动画被 pointerdown 打断时不会有 animationend
    setSettled(true);
    setDragging(true);
    const clamp = (v: number, max: number): number => Math.min(Math.max(0, v), Math.max(0, max));
    // 起点必须是**当前位置**：默认值 0,0 会让「点一下头部」把抽屉钉到左上角
    let last: DrawerPos = {
      rx: cbRect.width > 0 ? clamp(left0, cbRect.width - selfRect.width) / cbRect.width : 0,
      ry: cbRect.height > 0 ? clamp(top0, cbRect.height - selfRect.height) / cbRect.height : 0,
    };
    let moved = false;
    const onMove = (ev: PointerEvent): void => {
      // 3px 起步阈值：单纯点一下（聚焦/误触）不算拖过，不该改位置
      if (!moved && Math.hypot(ev.clientX - clientX0, ev.clientY - clientY0) < 3) return;
      moved = true;
      const nx = left0 + (ev.clientX - clientX0);
      const ny = top0 + (ev.clientY - clientY0);
      const rx = cbRect.width > 0 ? clamp(nx, cbRect.width - selfRect.width) / cbRect.width : 0;
      const ry = cbRect.height > 0 ? clamp(ny, cbRect.height - selfRect.height) / cbRect.height : 0;
      last = { rx, ry };
      setPos(last);
    };
    const onUp = (): void => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      setDragging(false);
      // 只在真的拖过之后落位（居中态下点一下不该变成左上角）
      if (moved) writePos(last);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }, []);

  const onHeadDoubleClick = useCallback((): void => {
    setPos(null);
    writePos(null);
  }, []);

  const startRename = useCallback((id: string, name: string): void => {
    cancelRenameRef.current = false;
    setEditing({ id, draft: name });
  }, []);

  const finishRename = useCallback((): void => {
    const cur = editing;
    setEditing(null);
    if (!cur || cancelRenameRef.current) return;
    const name = cur.draft.trim();
    // 同值不写：改名走一次可撤销的场景更新，别为了「点进来又点出去」多一个撤销点
    const slide = slides.find((s) => s.id === cur.id);
    if (!slide || slide.name.trim() === name) return;
    props.onRename(cur.id, name);
  }, [editing, props, slides]);

  const posStyle = pos
    ? ({ left: `${pos.rx * 100}%`, top: `${pos.ry * 100}%`, right: "auto", bottom: "auto", transform: "none" } as const)
    : undefined;

  /* ---------------- 第八十一轮：拖把手指针改页序 ---------------- */

  /**
   * 正在拖的那一页。pointer 坐标是**相对抽屉**的（抽屉自己有 backdrop-filter，
   * fixed 的含块会变成它，别指望视口坐标直接用）。
   */
  const [drag, setDrag] = useState<{ from: number; id: string; x: number; y: number; target: number } | null>(null);
  /** 指针过程量放 ref：每帧 setDrag 只驱动视觉，判定逻辑不依赖渲染 */
  const dragRef = useRef<{
    id: string;
    from: number;
    startX: number;
    startY: number;
    pointerX: number;
    pointerY: number;
    active: boolean;
    raf: number;
  } | null>(null);

  const scroller = (): HTMLElement | null =>
    (rootRef.current?.querySelector(".exs-present-scroll") as HTMLElement | null) ?? null;

  /** 离指针最近的那张卡 = 松手后落在的下标（双列网格里比「插入线」更好读） */
  const targetAt = (clientX: number, clientY: number): number => {
    const cards = listRef.current?.querySelectorAll<HTMLElement>("[data-slide]");
    let best = -1;
    let bestD = Infinity;
    cards?.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const dx = clientX - (r.left + r.width / 2);
      const dy = clientY - (r.top + r.height / 2);
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  };

  const focusGrip = (id: string): void => {
    window.requestAnimationFrame(() => {
      listRef.current?.querySelectorAll<HTMLElement>("[data-grip]").forEach((g) => {
        if (g.dataset.grip === id) g.focus();
      });
    });
  };

  const beginDrag = (e: React.PointerEvent<HTMLButtonElement>, id: string, from: number): void => {
    // 只认主键：右键菜单/中键滚轮不该启动拖动
    if (e.button !== 0) return;
    e.preventDefault();
    // 按下即聚焦：键盘用户拖完能接着用 ↑↓ 微调
    e.currentTarget.focus();
    dragRef.current = {
      id,
      from,
      startX: e.clientX,
      startY: e.clientY,
      pointerX: e.clientX,
      pointerY: e.clientY,
      active: false,
      raf: 0,
    };

    const onMove = (ev: PointerEvent): void => {
      const cur = dragRef.current;
      if (!cur) return;
      cur.pointerX = ev.clientX;
      cur.pointerY = ev.clientY;
      if (!cur.active) {
        // 4px 起步阈值：单纯点一下把手不该变成「拖了一下」
        if (Math.hypot(ev.clientX - cur.startX, ev.clientY - cur.startY) < 4) return;
        cur.active = true;
        // 指针停在边缘不动时也要继续滚：靠 rAF 自己跑，别等 pointermove
        const tick = (): void => {
          const c = dragRef.current;
          if (!c || !c.active) return;
          const sc = scroller();
          if (sc) {
            const r = sc.getBoundingClientRect();
            if (c.pointerY < r.top + 26) sc.scrollTop -= 12;
            else if (c.pointerY > r.bottom - 26) sc.scrollTop += 12;
          }
          c.raf = window.requestAnimationFrame(tick);
        };
        cur.raf = window.requestAnimationFrame(tick);
      }
      const rr = rootRef.current?.getBoundingClientRect();
      const target = targetAt(ev.clientX, ev.clientY);
      setDrag({
        from: cur.from,
        id: cur.id,
        x: ev.clientX - (rr?.left ?? 0),
        y: ev.clientY - (rr?.top ?? 0),
        target: target >= 0 ? target : cur.from,
      });
    };

    const onKey = (ev: KeyboardEvent): void => {
      if (ev.key !== "Escape") return;
      ev.preventDefault();
      ev.stopPropagation();
      finish(false);
    };

    const finish = (commit: boolean): void => {
      const cur = dragRef.current;
      dragRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey, true);
      if (cur?.raf) window.cancelAnimationFrame(cur.raf);
      const target = cur ? targetAt(cur.pointerX, cur.pointerY) : -1;
      setDrag(null);
      if (cur?.active && commit && target >= 0 && target !== cur.from) props.onMove(cur.from, target);
      if (cur) focusGrip(cur.id);
    };
    const onUp = (): void => finish(true);
    const onCancel = (): void => finish(false);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey, true);
  };

  /** 键盘挪页（把手聚焦时）：↑/← 前移，↓/→ 后移；挪完把焦点还给这一页 */
  const onGripKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, id: string, i: number): void => {
    const delta = e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : 0;
    if (delta === 0) return;
    e.preventDefault();
    e.stopPropagation();
    const to = i + delta;
    if (to < 0 || to >= slides.length) return;
    props.onMove(i, to);
    focusGrip(id);
  };

  /** 新建后滚到列表底部：新页插在末尾，不滚过去用户看不见（列表页多时尤其） */
  const pendingBottomRef = useRef(false);
  useEffect(() => {
    if (!pendingBottomRef.current) return;
    pendingBottomRef.current = false;
    const sc = scroller();
    sc?.scrollTo({ top: sc.scrollHeight, behavior: "smooth" });
  }, [slides.length]);

  const insertPage = (ratio: FrameRatio): void => {
    setLastRatio(ratio);
    writeRatio(ratio);
    setNewOpen(false);
    pendingBottomRef.current = true;
    props.onAddSlide(ratio);
  };

  /**
   * 步号提交：留空 = 清掉编排（回到「排在编过步的那些之后、按阅读顺序自成一步」），
   * 写了就夹进 1..STEP_MAX。同值不写——一次写入就是一个撤销点，口径同内联改名。
   */
  const commitStep = (row: MotionRow, raw: string): void => {
    const text = raw.trim();
    const n = text === "" ? null : Math.round(Number(text));
    const next = n === null || !Number.isFinite(n) ? null : Math.min(STEP_MAX, Math.max(1, n));
    if (next !== row.step) props.onRowMotion(row.ids, { step: next });
  };

  const selIndex = Math.min(props.selected, Math.max(0, slides.length - 1));

  return (
    <aside
      ref={rootRef}
      className={
        "exs-present-drawer" +
        (pos ? "" : " exs-present-drawer--center") +
        (settled ? " exs-present-drawer--settled" : "") +
        (dragging ? " exs-present-drawer--dragging" : "")
      }
      // 只认自己那条进场动画：卡片/气泡若也有动画，冒泡上来的不算
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) setSettled(true);
      }}
      style={posStyle}
      role="complementary"
      aria-label={t("演示")}
    >
      <header
        className="exs-present-drawer__head"
        onPointerDown={onHeadPointerDown}
        onDoubleClick={onHeadDoubleClick}
        title={t("拖动移动位置，双击复位")}
      >
        <span className="exs-present-drawer__title">{t("演示")}</span>
        <span className="exs-present-drawer__meta">
          {t("{n} 页", { n: shown })}
          {props.deck.hasOrdered ? "" : ` · ${t("按位置排序")}`}
          {props.graph.kind === "linear" ? "" : ` · ${t("按箭头走")}`}
        </span>
        <div className="exs-present-menuhost" ref={menuHostRef}>
          <button
            type="button"
            className={"exs-present-close" + (showSettings ? " exs-present-close--on" : "")}
            onClick={() => setShowSettings(!showSettings)}
            title={t("演示设置")}
            aria-label={t("演示设置")}
            aria-expanded={showSettings}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d={ICON_SLIDERS} />
              <circle cx="15" cy="7" r="2" />
              <circle cx="9" cy="12" r="2" />
              <circle cx="15" cy="17" r="2" />
            </svg>
          </button>
          {showSettings ? (
            <PresentationSettingsMenu settings={props.settings} onSetting={props.onSetting} />
          ) : null}
        </div>
        <button type="button" className="exs-present-close" onClick={props.onClose} title={t("关闭")} aria-label={t("关闭")}>
          ✕
        </button>
      </header>

      <FadeScroll className="exs-present-drawer__body">
        {slides.length === 0 ? (
          <div className="exs-present-empty">
            <b>{t("还没有演示页")}</b>
            {t("先在画布上框住一页内容，或点下方「＋ 新建页」按标准比例插一页。")}
          </div>
        ) : (
          <ol className="exs-present-list" ref={listRef}>
            {slides.map((s, i) => {
              const url = props.thumbs[s.id] ?? "";
              return (
                <li
                  key={s.id}
                  data-slide={s.id}
                  className={
                    "exs-present-card" +
                    (i === props.selected ? " exs-present-card--active" : "") +
                    (s.included ? "" : " exs-present-card--off") +
                    (drag && drag.from === i ? " exs-present-card--dragging" : "") +
                    (drag && drag.target === i && drag.from !== i ? " exs-present-card--drop" : "")
                  }
                >
                  <button
                    type="button"
                    className="exs-present-grip"
                    data-grip={s.id}
                    onPointerDown={(e) => beginDrag(e, s.id, i)}
                    onKeyDown={(e) => onGripKeyDown(e, s.id, i)}
                    title={t("拖动调整页序（聚焦后可用 ↑↓）")}
                    aria-label={t("拖动调整页序")}
                  >
                    <LineIcon d={ICON_GRIP} size={14} strokeWidth={2} />
                  </button>
                  <div className="exs-present-card__main">
                    <button
                      type="button"
                      className="exs-present-card__preview"
                      onClick={() => props.onSelect(i)}
                      title={t("把镜头开过去看这一页")}
                      aria-label={t("第 {n} 页", { n: i + 1 })}
                    >
                      {s.blank ? (
                        <span className="exs-present-card__blank">{t("空白页")}</span>
                      ) : url ? (
                        <img className="exs-present-card__img" src={url} alt="" draggable={false} />
                      ) : (
                        <span className="exs-present-card__ph">{t("生成预览…")}</span>
                      )}
                      <span className="exs-present-card__no">{i + 1}</span>
                    </button>
                    <div className="exs-present-card__foot">
                    {editing?.id === s.id ? (
                      <input
                        className="exs-present-card__rename"
                        value={editing.draft}
                        autoFocus
                        onFocus={(e) => e.currentTarget.select()}
                        onChange={(e) => setEditing({ id: s.id, draft: e.currentTarget.value })}
                        onBlur={finishRename}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.currentTarget.blur();
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            cancelRenameRef.current = true;
                            e.currentTarget.blur();
                          }
                          e.stopPropagation();
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        className="exs-present-card__name"
                        onClick={() => props.onSelect(i)}
                        onDoubleClick={() => startRename(s.id, s.name)}
                        title={t("双击重命名")}
                      >
                        {t(slideTitle(s))}
                      </button>
                    )}
                    <button
                      type="button"
                      className={"exs-present-mini" + (s.reveal === "all" ? " exs-present-mini--muted" : "")}
                      onClick={() => props.onToggleReveal(s.id)}
                      title={s.reveal === "all" ? t("这一页逐条出场") : t("这一页整页一起出")}
                      aria-label={s.reveal === "all" ? t("这一页逐条出场") : t("这一页整页一起出")}
                      aria-pressed={s.reveal === "auto"}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d={ICON_STEPS} />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className={"exs-present-mini" + (s.included ? "" : " exs-present-mini--off")}
                      onClick={() => props.onToggle(s.id)}
                      title={s.included ? t("这一页不放映") : t("重新入片")}
                      aria-label={s.included ? t("这一页不放映") : t("重新入片")}
                      aria-pressed={!s.included}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d={ICON_EYE} />
                        {s.included ? null : <path d={ICON_SLASH} />}
                      </svg>
                    </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        <div className="exs-present-motion">
          <button
            type="button"
            className={"exs-present-motion__head" + (motionOpen ? " exs-present-motion__head--on" : "")}
            onClick={() => setMotionOpen(!motionOpen)}
            aria-expanded={motionOpen}
            title={t("编排这一页里每条怎么出场")}
          >
            <LineIcon d={ICON_MOTION} size={14} strokeWidth={1.8} />
            <span>{t("出场编排")}</span>
            <span className="exs-present-motion__page">{t("第 {n} 页", { n: selIndex + 1 })}</span>
            <span className="exs-present-motion__count">{props.rows.length}</span>
          </button>
          {motionOpen ? (
            props.rows.length === 0 ? (
              <div className="exs-present-motion__empty">
                {t("这一页还没有可编排的内容：先在画框里放点东西。")}
              </div>
            ) : (
              <ol className="exs-present-motion__list">
                {props.rows.map((r) => (
                  <li key={r.key} className="exs-present-mrow">
                    <span className="exs-present-mrow__label" title={t(r.label)}>
                      {t(r.label)}
                    </span>
                    <span className="exs-present-mrow__fx" role="group" aria-label={t("出场效果")}>
                      {EFFECT_IDS.map((id) => (
                        <button
                          key={id}
                          type="button"
                          className={
                            "exs-present-fx" + (!r.auto && r.effect === id ? " exs-present-fx--on" : "")
                          }
                          onClick={() => props.onRowMotion(r.ids, { effect: id })}
                          title={t(EFFECT_LABELS[id])}
                          aria-label={t(EFFECT_LABELS[id])}
                          aria-pressed={!r.auto && r.effect === id}
                        >
                          <LineIcon d={FX_ICONS[id]} size={13} strokeWidth={1.8} />
                        </button>
                      ))}
                      <button
                        type="button"
                        className={"exs-present-fx" + (r.auto ? " exs-present-fx--on" : "")}
                        onClick={() => props.onRowMotion(r.ids, { effect: null })}
                        title={t("按类型自动")}
                        aria-label={t("按类型自动")}
                        aria-pressed={r.auto}
                      >
                        A
                      </button>
                    </span>
                    {/*
                      key 带上步号：提交后宿主重算行，非受控输入框要跟着换成新值。
                      代价是改完步号焦点会跳回列表——比「输入框显示的还是旧值」划算。
                    */}
                    <input
                      key={`${r.key}:${r.step ?? ""}`}
                      className="exs-present-mrow__step"
                      type="number"
                      min={1}
                      max={STEP_MAX}
                      step={1}
                      defaultValue={r.step ?? ""}
                      placeholder="·"
                      aria-label={t("第几步出场")}
                      onBlur={(e) => commitStep(r, e.currentTarget.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.currentTarget.blur();
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          e.currentTarget.value = r.step === null ? "" : String(r.step);
                          e.currentTarget.blur();
                        }
                        e.stopPropagation();
                      }}
                    />
                  </li>
                ))}
              </ol>
            )
          ) : null}
        </div>
        <div className="exs-present-tip">
          {props.graph.kind === "linear"
            ? t("拖动左侧把手改页序；双击页名改名；≡ 管整页还是逐条，眼睛管放不放。")
            : props.graph.kind === "linked"
              ? t("已按箭头连页：放映沿箭头走，可分叉也能绕回。")
              : t("部分页面还没连上箭头，没连的按页序继续放。")}
          {motionOpen ? ` ${t("步号相同的条目一起出（自动错开一点）；留空 = 排在编过步的之后。")}` : ""}
        </div>
      </FadeScroll>

      <footer className="exs-present-drawer__foot">
        <div className="exs-present-newhost" ref={newHostRef}>
          <button
            type="button"
            className={"exs-present-newbtn" + (newOpen ? " exs-present-newbtn--on" : "")}
            onClick={() => setNewOpen(!newOpen)}
            title={t("新建标准画框")}
            aria-label={t("新建标准画框")}
            aria-expanded={newOpen}
            aria-haspopup="menu"
          >
            <LineIcon d={ICON_PLUS} size={14} strokeWidth={2} />
            {t("新建页")}
          </button>
          {newOpen ? (
            <div className="exs-present-newmenu" role="menu" aria-label={t("新建标准画框")}>
              <div className="exs-present-newmenu__head">
                <b>{t("新建标准画框")}</b>
                <span>{t("插到最后一页右侧，尺寸随现有页缩放")}</span>
              </div>
              <div className="exs-present-newmenu__grid">
                {FRAME_RATIOS.map((p) => (
                  <button
                    key={p.ratio}
                    type="button"
                    role="menuitem"
                    className={"exs-present-ratio" + (p.ratio === lastRatio ? " exs-present-ratio--on" : "")}
                    onClick={() => insertPage(p.ratio)}
                    aria-label={t("新建 {ratio} 画框", { ratio: p.ratio })}
                  >
                    <span className="exs-present-ratio__value">{p.ratio}</span>
                    <span className="exs-present-ratio__name">{t(RATIO_NAMES[p.ratio])}</span>
                  </button>
                ))}
              </div>
              <div className="exs-present-newmenu__foot">{t("插入后可随时拖动、缩放，插入本身可撤销。")}</div>
            </div>
          ) : null}
        </div>
        <button type="button" className="exs-present-play" onClick={props.onStart} disabled={shown === 0}>
          <LineIcon d={ICON_PLAY} size={14} strokeWidth={2} />
          {t("开始演示")}
        </button>
      </footer>

      {drag && slides[drag.from] ? (
        <div className="exs-present-dragghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          <span className="exs-present-dragghost__no">{drag.from + 1}</span>
          {props.thumbs[drag.id] ? (
            <img className="exs-present-dragghost__img" src={props.thumbs[drag.id]} alt="" draggable={false} />
          ) : (
            <span className="exs-present-dragghost__ph" />
          )}
          <span className="exs-present-dragghost__name">{t(slideTitle(slides[drag.from]))}</span>
        </div>
      ) : null}
    </aside>
  );
}

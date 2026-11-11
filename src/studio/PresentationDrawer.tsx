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
  rowHotspots,
  sequenceGroups,
  type EffectId,
  type MotionEdit,
  type MotionRow,
} from "./presentation-motion.ts";
import type { GraphState } from "./presentation-graph.ts";
import { readPresentUi, writePresentUi, type PresentView } from "./presentation-ui";
import type { PresentationSettings } from "./settings";
import { FadeScroll, PresentationSettingsMenu, usePopoverDismiss } from "./PresentationSettingsMenu";

/** 眼睛（入片/排除）。全绝对坐标，口径同 menu-icons。 */
const ICON_EYE =
  "M2.5,12C4.6,8.6 8.1,6.6 12,6.6C15.9,6.6 19.4,8.6 21.5,12C19.4,15.4 15.9,17.4 12,17.4C8.1,17.4 4.6,15.4 2.5,12Z" +
  "M12,9.6A2.4,2.4 0 1 0 12,14.4A2.4,2.4 0 1 0 12,9.6Z";

/** 斜线（排除页的眼睛上叠一道） */
const ICON_SLASH = "M4,20L20,4";

/** 设置：推子 */
const ICON_SLIDERS = "M4,7h8M17,7h3M4,12h3M11,12h9M4,17h8M17,17h3";

/** 四档效果的人话说明（悬浮提示与菜单副行共用；key 是中文原文，交给 t()） */
const FX_DESC: Record<EffectId, string> = {
  fade: "淡入并微微上移，最克制。",
  pop: "带一点过冲再定住，最醒目。",
  rise: "从下方升上来，位移更大。",
  slide: "从左滑入，适合箭头和连线。",
  draw: "顺着它自己的形状擦出来，适合高亮、笔刷这类填充图形。",
};

/** 「自动」的说明：没选过档时按元素类型给，用户不用逐条挑也不齐刷刷硬切 */
const AUTO_DESC = "跟着元素类型走：文本浮现、图形弹入、图片升起、箭头滑入。";

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

/**
 * 片单列数：两栏看得清页内细节、三栏一屏放更多页。
 * 纯本地视图状态（同 POS_KEY 的口径），不塞进 PresentationSettings。
 */
const COLS_KEY = "excali-present-cols";
type Cols = 2 | 3;

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

function readCols(): Cols {
  try {
    return localStorage.getItem(COLS_KEY) === "2" ? 2 : 3;
  } catch {
    /* 隐私模式：退回三栏，跟旧版观感一致 */
  }
  return 3;
}

function writeCols(cols: Cols): void {
  try {
    localStorage.setItem(COLS_KEY, String(cols));
  } catch {
    /* 同上，记不住只在本次会话内生效 */
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
  /**
   * 第八十五轮：本页编排画布的高清预览（只给选中页导出，最长边 1280）。
   * 缺项时退回卡片缩略图先顶着，等高清图到了再换。
   */
  stageThumbs: Record<string, string>;
  /** 视图记忆的命名空间（宿主传白板路径）：本页/页单停在哪，按白板各记各的 */
  boardKey: string;
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
  /**
   * 第八十七轮：页卡播放键 → 从这一页开始放映（传画框 id）。
   * 页单里的「看这一页」只开镜头；这枚才进片场，两者别混。
   */
  onStartAt: (id: string) => void;
  onClose: () => void;
}) {
  const { slides } = props.deck;
  const shown = slides.filter((s) => s.included).length;
  const [showSettings, setShowSettings] = useState(false);
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

  const [cols, setCols] = useState<Cols>(() => readCols());
  const setColumnCount = (n: Cols): void => {
    if (cols === n) return;
    setCols(n);
    writeCols(n);
  };

  /*
   * 第八十五轮：A 方案——抽屉打开就是编排模式。
   * 「本页」把画框内容放大成一张可点的编排画布（编号热区 ↔ 右栏行双向联动），
   * 「页单」保留原来的缩略图浏览/排序/入片。默认落在本页：用户开抽屉就是为了排动效。
   * 第八十九轮：视图按白板记住，关掉再开别每次都从「本页」重新点。
   */
  const [view, setView] = useState<PresentView>(() => readPresentUi(props.boardKey)?.view ?? "page");
  const changeView = (next: PresentView): void => {
    if (next === view) return;
    setView(next);
    writePresentUi(props.boardKey, { view: next });
  };
  /** 当前选中的编排条（点画面热区或右栏行都写这里） */
  const [activeKey, setActiveKey] = useState<string | null>(null);
  /** 悬浮联动：不算重状态，只在两边加高亮类 */
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  /** 效果菜单：挂在抽屉根上（行列表会滚，菜单不能跟着被裁） */
  const [fxMenu, setFxMenu] = useState<{ row: MotionRow; x: number; y: number } | null>(null);
  /** 悬浮提示（人话说明），同样挂根上，避免被滚动容器裁掉 */
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const infoHostRef = useRef<HTMLDivElement | null>(null);
  usePopoverDismiss(infoOpen, () => setInfoOpen(false), infoHostRef);
  /** 本页画布的可用尺寸：用 ResizeObserver 量，按画框比例 contain 进去 */
  const stageBodyRef = useRef<HTMLDivElement | null>(null);
  const [stageBody, setStageBody] = useState({ w: 0, h: 0 });
  /** 点了画框空白处的即时提示（证明「这片地方没有可编排的东西」） */
  const [stageNote, setStageNote] = useState<string | null>(null);
  const stageNoteTimerRef = useRef(0);
  const noteStage = (text: string): void => {
    setStageNote(text);
    window.clearTimeout(stageNoteTimerRef.current);
    stageNoteTimerRef.current = window.setTimeout(() => setStageNote(null), 1800);
  };
  useEffect(() => () => window.clearTimeout(stageNoteTimerRef.current), []);

  /** 本页画布量一次可用尺寸：按画框比例 contain，热区的百分比才有落点 */
  useEffect(() => {
    if (view !== "page") return;
    const el = stageBodyRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[entries.length - 1]?.contentRect;
      if (r) setStageBody({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [view, props.selected, slides.length]);

  /** 效果菜单开关：点外面 / Esc 都收（Esc 别冒到宿主去关抽屉） */
  useEffect(() => {
    if (!fxMenu) return;
    const onDown = (e: PointerEvent): void => {
      const t0 = e.target as HTMLElement | null;
      if (t0?.closest(".exs-present-fxmenu, .exs-present-fxbtn")) return;
      setFxMenu(null);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      setFxMenu(null);
    };
    document.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [fxMenu]);

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
    (rootRef.current?.querySelector(".exs-present-drawer__scroll") as HTMLElement | null) ?? null;

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
  const selSlide = slides.length > 0 ? slides[selIndex] : undefined;
  /** 整页模式：行照常列出来（好知道这一页有什么），但效果/步号不生效、顺序预览只留一组 */
  const together = selSlide?.reveal === "all";
  /** 空白页 / 没内容：画面与底注都不摆「点元素」的指引，免得用户对着空地找编号 */
  const stageEmpty = !selSlide || selSlide.blank || props.rows.length === 0;
  const seq = sequenceGroups(props.rows, together);
  /** 分段开关只在该翻面时写一次：点当前这一档不该多一个撤销点 */
  const setReveal = (all: boolean): void => {
    if (!selSlide || (selSlide.reveal === "all") === all) return;
    props.onToggleReveal(selSlide.id);
  };
  // 本页视图没有缩略图/眼睛，别再提示「拖动缩略图」；这里只交代画面是预览
  const graphTip =
    view === "page"
      ? t("画面只做预览：改位置或文字请回画布；翻页点上方 ‹ ›。")
      : props.graph.kind === "linear"
        ? t("拖动缩略图左上角把手改页序；双击页名改名；眼睛管放不放。")
        : props.graph.kind === "linked"
          ? t("已按箭头连页：放映沿箭头走，可分叉也能绕回。")
          : t("部分页面还没连上箭头，没连的按页序继续放。");

  /* ---------------- 第八十五轮：本页画布 ↔ 右栏行联动 ---------------- */

  /** 选中一条：点画面热区时把右栏滚到这一行；点行本身不滚 */
  const selectRow = (key: string): void => {
    setActiveKey(key);
    window.requestAnimationFrame(() => {
      const root = rootRef.current;
      const sc = root?.querySelector<HTMLElement>(".exs-present-inspector__rows");
      let row: HTMLElement | null = null;
      root?.querySelectorAll<HTMLElement>("[data-rowkey]").forEach((n) => {
        if (n.dataset.rowkey === key) row = n;
      });
      if (!sc || !row) return;
      const rr = (row as HTMLElement).getBoundingClientRect();
      const sr = sc.getBoundingClientRect();
      if (rr.top < sr.top) sc.scrollTop -= sr.top - rr.top + 4;
      else if (rr.bottom > sr.bottom) sc.scrollTop += rr.bottom - sr.bottom + 4;
    });
  };

  /** 提示坐标相对抽屉（抽屉有 backdrop-filter，fixed 在这层里不可靠） */
  const showTip = (e: React.MouseEvent, text: string): void => {
    const root = rootRef.current;
    if (!root) return;
    const rr = root.getBoundingClientRect();
    setTip({ text, x: e.clientX - rr.left, y: e.clientY - rr.top - 12 });
  };
  const hideTip = (): void => setTip(null);

  /** 一条的悬浮说明：名字 + 实际效果 + 这一步是自动还是手选 */
  const tipForRow = (r: MotionRow): string => {
    const fx = r.auto ? `${t("自动")} · ${t(EFFECT_LABELS[r.effect])}` : t(EFFECT_LABELS[r.effect]);
    const step = r.step === null ? "" : ` · ${t("第 {n} 步", { n: r.step })}`;
    return `${t(r.label)}\n${fx}${step}\n${t(r.auto ? AUTO_DESC : FX_DESC[r.effect])}`;
  };

  const openFxMenu = (r: MotionRow, clientX: number, clientY: number): void => {
    const root = rootRef.current;
    if (!root || together) return;
    const rr = root.getBoundingClientRect();
    setActiveKey(r.key);
    setTip(null);
    setFxMenu({ row: r, x: clientX - rr.left, y: clientY - rr.top });
  };
  const openFxMenuAtButton = (r: MotionRow, btn: HTMLElement): void => {
    const r0 = btn.getBoundingClientRect();
    openFxMenu(r, r0.left + r0.width / 2, r0.bottom + 4);
  };
  const applyFx = (effect: EffectId | null): void => {
    const cur = fxMenu;
    if (!cur) return;
    setFxMenu(null);
    // 同值不写：一次写入就是一个撤销点（口径同步号）
    if (effect === null ? cur.row.auto : !cur.row.auto && cur.row.effect === effect) return;
    props.onRowMotion(cur.row.ids, { effect });
  };

  const spots = selSlide
    ? rowHotspots(props.rows, { x: selSlide.x, y: selSlide.y, w: selSlide.w, h: selSlide.h })
    : [];
  /** 热区徽标号 = 这一条在右栏列表里的序号（不在框内的条没有热区，但序号仍连续） */
  const rowNo = new Map(props.rows.map((r, i) => [r.key, i + 1]));
  const rowOf = (key: string): MotionRow | undefined => props.rows.find((r) => r.key === key);
  const stageUrl = selSlide ? props.stageThumbs[selSlide.id] || props.thumbs[selSlide.id] || "" : "";
  /** 画布按画框比例 contain 进可用区域；还没量到尺寸时先给个 16:9 的近似 */
  const fw = selSlide?.w ?? 0;
  const fh = selSlide?.h ?? 0;
  const fit =
    fw > 0 && fh > 0 && stageBody.w > 0 && stageBody.h > 0 ? Math.min(stageBody.w / fw, stageBody.h / fh) : 0;
  const stageW = fit > 0 ? Math.max(1, Math.floor(fw * fit)) : 480;
  const stageH = fit > 0 ? Math.max(1, Math.floor(fh * fit)) : fw > 0 ? Math.round((480 * fh) / fw) : 270;
  const menuW = 232;
  // 六项（自动 + 五档效果）实测约 310；给到 312 是为了贴底下沿时整块还能露出来
  const menuH = 312;
  const rootW = rootRef.current?.clientWidth ?? 1180;
  const rootH = rootRef.current?.clientHeight ?? 840;
  const fxLeft = fxMenu ? Math.max(8, Math.min(fxMenu.x - menuW / 2, rootW - menuW - 8)) : 0;
  const fxTop = fxMenu ? Math.max(8, Math.min(fxMenu.y, rootH - menuH - 8)) : 0;

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
        {/* 头部是拖动把手：分段的留白也不能算拖（只拦这里，不影响空处拖窗） */}
        {slides.length === 0 ? null : (
          <div
            className="exs-present-seg exs-present-view"
            role="group"
            aria-label={t("演示面板视图")}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={"exs-present-seg__btn" + (view === "page" ? " exs-present-seg__btn--on" : "")}
              aria-pressed={view === "page"}
              onClick={() => changeView("page")}
              title={t("本页：在画面里点元素编排")}
            >
              {t("本页")}
            </button>
            <button
              type="button"
              className={"exs-present-seg__btn" + (view === "list" ? " exs-present-seg__btn--on" : "")}
              aria-pressed={view === "list"}
              onClick={() => changeView("list")}
              title={t("页单：翻页、排序、入片")}
            >
              {t("页单")}
            </button>
          </div>
        )}
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

      <div className={"exs-present-drawer__body" + (slides.length === 0 ? " exs-present-drawer__body--empty" : "")}>
        {slides.length === 0 ? (
          <div className="exs-present-empty">
            <b>{t("还没有演示页")}</b>
            {t("先在画布上框住一页内容，或点下方「＋ 新建页」按标准比例插一页。")}
          </div>
        ) : (
          <>
            {view === "page" ? (
              <section className="exs-present-drawer__slides exs-present-drawer__slides--stage">
                <div className="exs-present-stage">
                  <div className="exs-present-stage__bar">
                    <button
                      type="button"
                      className="exs-present-stage__nav"
                      disabled={selIndex <= 0}
                      onClick={() => props.onSelect(selIndex - 1)}
                      title={t("上一页")}
                      aria-label={t("上一页")}
                    >
                      ‹
                    </button>
                    <span className="exs-present-stage__pageno">
                      {t("第 {n} 页", { n: selIndex + 1 })}
                      <span className="exs-present-stage__pagetotal"> / {slides.length}</span>
                    </span>
                    <span className="exs-present-stage__pagename">{selSlide ? t(slideTitle(selSlide)) : ""}</span>
                    <button
                      type="button"
                      className="exs-present-stage__nav"
                      disabled={selIndex >= slides.length - 1}
                      onClick={() => props.onSelect(selIndex + 1)}
                      title={t("下一页")}
                      aria-label={t("下一页")}
                    >
                      ›
                    </button>
                  </div>
                  <div className="exs-present-stage__body" ref={stageBodyRef}>
                    {stageEmpty ? (
                      <div className="exs-present-stage__empty">
                        <b>{selSlide?.blank ? t("空白页") : t("这一页还没有可编排的内容")}</b>
                        <span>{t("先在画框里放点东西，再回来排顺序。")}</span>
                      </div>
                    ) : (
                      <div
                        className={"exs-present-stage__canvas" + (together ? " exs-present-stage__canvas--muted" : "")}
                        style={{ width: stageW, height: stageH }}
                        // 画框空白处：说明「这片地方没有可编排的东西」，而不是让点击没反应
                        onClick={() => noteStage(t("这里是画框空白处，点带编号的元素。"))}
                      >
                        {stageUrl ? (
                          <img className="exs-present-stage__img" src={stageUrl} alt="" draggable={false} />
                        ) : (
                          <span className="exs-present-stage__ph">{t("生成预览…")}</span>
                        )}
                        {spots.map((s) => {
                          const r = rowOf(s.key);
                          return (
                            <button
                              key={s.key}
                              type="button"
                              className={
                                "exs-present-hotspot" +
                                (s.key === activeKey ? " exs-present-hotspot--on" : "") +
                                (s.key === hoverKey ? " exs-present-hotspot--hot" : "")
                              }
                              style={{
                                left: `${s.left}%`,
                                top: `${s.top}%`,
                                width: `${s.width}%`,
                                height: `${s.height}%`,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                selectRow(s.key);
                              }}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (r) openFxMenu(r, e.clientX, e.clientY);
                              }}
                              onMouseEnter={(e) => {
                                setHoverKey(s.key);
                                if (r) showTip(e, tipForRow(r));
                              }}
                              onMouseLeave={() => {
                                setHoverKey(null);
                                hideTip();
                              }}
                              aria-label={
                                r
                                  ? t("第 {n} 条：{name}", { n: rowNo.get(s.key) ?? 0, name: t(r.label) })
                                  : t("元素")
                              }
                            >
                              <span className="exs-present-hotspot__no">{rowNo.get(s.key)}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {stageEmpty ? null : (
                    <div className="exs-present-stage__foot">
                      {stageNote ? (
                        <span className="exs-present-stage__note">{stageNote}</span>
                      ) : (
                        <span>
                          {together
                            ? t("整页一起出：画面只做预览，逐条设定暂不生效。")
                            : t("点画面里的元素选中它；右键直接换效果。")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </section>
            ) : (
            <section className="exs-present-drawer__slides">
              <div className="exs-present-pagetools">
                <span className="exs-present-pagetools__count">{t("{n} 页", { n: slides.length })}</span>
                <div
                  className="exs-present-seg exs-present-cols"
                  role="group"
                  aria-label={t("片单列数")}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className={"exs-present-seg__btn" + (cols === 2 ? " exs-present-seg__btn--on" : "")}
                    aria-pressed={cols === 2}
                    onClick={() => setColumnCount(2)}
                    title={t("两栏：缩略图更大，看清页内细节")}
                  >
                    {t("两栏")}
                  </button>
                  <button
                    type="button"
                    className={"exs-present-seg__btn" + (cols === 3 ? " exs-present-seg__btn--on" : "")}
                    aria-pressed={cols === 3}
                    onClick={() => setColumnCount(3)}
                    title={t("三栏：一屏放更多页")}
                  >
                    {t("三栏")}
                  </button>
                </div>
              </div>
              <FadeScroll className="exs-present-drawer__scroll">
                <ol className="exs-present-list" data-cols={cols} ref={listRef}>
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
                              className="exs-present-mini exs-present-mini--play"
                              onClick={() => props.onStartAt(s.id)}
                              disabled={!s.included}
                              title={s.included ? t("从这页开始放映") : t("这一页不放映")}
                              aria-label={s.included ? t("从这页开始放映") : t("这一页不放映")}
                            >
                              <LineIcon d={ICON_PLAY} size={12} strokeWidth={2} />
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
              </FadeScroll>
            </section>
            )}

            <aside className="exs-present-inspector">
              <header className="exs-present-inspector__head">
                <div className="exs-present-inspector__top">
                  <span className="exs-present-inspector__title">{t("出场编排")}</span>
                  <span className="exs-present-inspector__page">
                    {t("第 {n} 页", { n: selIndex + 1 })}
                    {selSlide ? ` · ${t(slideTitle(selSlide))}` : ""}
                  </span>
                  <div className="exs-present-info" ref={infoHostRef}>
                    <button
                      type="button"
                      className={"exs-present-info__btn" + (infoOpen ? " exs-present-info__btn--on" : "")}
                      onClick={() => setInfoOpen(!infoOpen)}
                      title={t("哪些元素能编排？")}
                      aria-label={t("哪些元素能编排？")}
                      aria-expanded={infoOpen}
                    >
                      i
                    </button>
                    {infoOpen ? (
                      <div className="exs-present-info__pop" role="note">
                        <b>{t("哪些元素能编排？")}</b>
                        <ul>
                          <li>{t("画框里的每个文字、图形、图片、箭头都算一条。")}</li>
                          <li>{t("成组元素一起出场；附着在图形上的文字跟着图形走。")}</li>
                          <li>{t("编号和下面这一行一一对应，点任意一边都会选中同一条。")}</li>
                          <li>{t("画框本身和画框外的元素不参与编排。")}</li>
                        </ul>
                        <button type="button" className="exs-present-info__ok" onClick={() => setInfoOpen(false)}>
                          {t("知道了")}
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <span className="exs-present-inspector__count">{t("{n} 条", { n: props.rows.length })}</span>
                </div>
                <div className="exs-present-inspector__sub">
                  <span className="exs-present-inspector__hint">
                    {together
                      ? t("整页一起出；逐条设定暂不生效。")
                      : t("点画面或列表选中一条；点效果换动作；步号相同的一起出。")}
                  </span>
                  <div className="exs-present-seg" role="group" aria-label={t("这一页的出场方式")}>
                    <button
                      type="button"
                      className={"exs-present-seg__btn" + (together ? "" : " exs-present-seg__btn--on")}
                      aria-pressed={!together}
                      onClick={() => setReveal(false)}
                    >
                      {t("逐条")}
                    </button>
                    <button
                      type="button"
                      className={"exs-present-seg__btn" + (together ? " exs-present-seg__btn--on" : "")}
                      aria-pressed={together}
                      onClick={() => setReveal(true)}
                    >
                      {t("整页")}
                    </button>
                  </div>
                </div>
              </header>

              <FadeScroll
                className={"exs-present-inspector__rows" + (together ? " exs-present-inspector__rows--muted" : "")}
              >
                {props.rows.length === 0 ? (
                  <div className="exs-present-inspector__empty">
                    <b>{t("这一页还没有可编排的内容")}</b>
                    {t("先在画框里放点东西，再回来排顺序。")}
                  </div>
                ) : (
                  <ol className="exs-present-mrows">
                    {props.rows.map((r, i) => (
                      <li
                        key={r.key}
                        data-rowkey={r.key}
                        className={
                          "exs-present-mrow" +
                          (r.step === null ? "" : " exs-present-mrow--on") +
                          (r.key === activeKey ? " exs-present-mrow--sel" : "")
                        }
                        // 点行空白处也能选中（和画面上点热区等价）；按钮/输入框自己处理
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest("button, input")) return;
                          selectRow(r.key);
                        }}
                        onMouseEnter={() => setHoverKey(r.key)}
                        onMouseLeave={() => setHoverKey(null)}
                      >
                        <span className="exs-present-mrow__no">{i + 1}</span>
                        <span className="exs-present-mrow__label" title={t(r.label)}>
                          {t(r.label)}
                        </span>
                        {/*
                          效果按钮说人话：自动档显示「自动 · 浮现」——用户不用先学会四个图标
                          才知道这条到底会怎么飞。点开是带说明的菜单，悬浮也有同一段说明。
                        */}
                        <button
                          type="button"
                          className={"exs-present-fxbtn" + (r.auto ? " exs-present-fxbtn--auto" : "")}
                          onClick={(e) => openFxMenuAtButton(r, e.currentTarget)}
                          onMouseEnter={(e) => showTip(e, tipForRow(r))}
                          onMouseLeave={hideTip}
                          onContextMenu={(e) => e.preventDefault()}
                          aria-label={t("出场效果：{name}", {
                            name: r.auto ? `${t("自动")} · ${t(EFFECT_LABELS[r.effect])}` : t(EFFECT_LABELS[r.effect]),
                          })}
                          aria-haspopup="menu"
                          aria-expanded={fxMenu?.row.key === r.key}
                          disabled={together}
                        >
                          <span className="exs-present-fxbtn__text">
                            {r.auto ? `${t("自动")} · ${t(EFFECT_LABELS[r.effect])}` : t(EFFECT_LABELS[r.effect])}
                          </span>
                          <span className="exs-present-fxbtn__caret" aria-hidden="true">
                            ⌄
                          </span>
                        </button>
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
                          title={t("第几步出场")}
                          aria-label={t("第几步出场")}
                          disabled={together}
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
                )}
              </FadeScroll>

              {props.rows.length === 0 ? null : (
                <section className={"exs-present-seq" + (together ? " exs-present-seq--muted" : "")} aria-label={t("出场顺序")}>
                  <div className="exs-present-seq__head">
                    <span className="exs-present-seq__title">{t("出场顺序")}</span>
                    <span className="exs-present-seq__hint">
                      {together
                        ? t("整页一起出，顺序与步号暂不生效")
                        : t("步号升序；未编步的排最后、按阅读顺序")}
                    </span>
                  </div>
                  <div className="exs-present-seq__list">
                    {seq.map((g) => (
                      <div key={g.key} className="exs-present-seq__row">
                        <span
                          className={"exs-present-seq__step" + (g.step === null ? " exs-present-seq__step--auto" : "")}
                          title={g.step === null && !g.together ? t("按阅读顺序，排在编过步的之后") : undefined}
                        >
                          {g.together ? t("整页") : g.step === null ? t("自动") : t("第 {n} 步", { n: g.step })}
                        </span>
                        <span className="exs-present-seq__chips">
                          {g.together ? (
                            <span className="exs-present-seq__chip">{t("这一页所有内容一起出现")}</span>
                          ) : (
                            g.labels.map((label, i) => (
                              <span key={`${g.key}:${i}`} className="exs-present-seq__chip" title={t(label)}>
                                {t(label)}
                              </span>
                            ))
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div className="exs-present-inspector__foot">
                {together
                  ? t("切回「逐条」后，下面每条的步号与效果会恢复生效。")
                  : t("步号相同的一起出（自动错开 70ms）；留空 = 排在编过步的之后。")}
              </div>
            </aside>
          </>
        )}
      </div>

      <footer className="exs-present-drawer__foot">
        <span className="exs-present-drawer__tipline" title={graphTip}>
          {graphTip}
        </span>
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
        {/*
          第八十七轮：底栏也可以从「当前选中的这一页」起播。
          选中的页被排除时不给点——否则会静默回落到第一页，用户以为放错。
        */}
        <button
          type="button"
          className="exs-present-playfrom"
          onClick={() => {
            const cur = slides[props.selected];
            if (cur) props.onStartAt(cur.id);
          }}
          disabled={shown === 0 || !slides[props.selected]?.included}
          title={slides[props.selected]?.included ? t("从当前这一页开始放映") : t("这一页不放映")}
          aria-label={slides[props.selected]?.included ? t("从当前这一页开始放映") : t("这一页不放映")}
        >
          <LineIcon d={ICON_PLAY} size={13} strokeWidth={2} />
          {t("从本页开始")}
        </button>
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

      {/* 效果菜单挂抽屉根：行列表会滚，菜单跟着行被裁掉就没法用 */}
      {fxMenu ? (
        <div className="exs-present-fxmenu" role="menu" aria-label={t("出场效果")} style={{ left: fxLeft, top: fxTop }}>
          <div className="exs-present-fxmenu__head">{t("出场效果")}</div>
          <button
            type="button"
            role="menuitemradio"
            aria-checked={fxMenu.row.auto}
            className={"exs-present-fxopt" + (fxMenu.row.auto ? " exs-present-fxopt--on" : "")}
            onClick={() => applyFx(null)}
          >
            <span className="exs-present-fxopt__name">
              {t("自动")}
              <span className="exs-present-fxopt__hint">{t(AUTO_DESC)}</span>
            </span>
            {fxMenu.row.auto ? (
              <span className="exs-present-fxopt__check" aria-hidden="true">
                ✓
              </span>
            ) : null}
          </button>
          <div className="exs-present-fxmenu__sep" />
          {EFFECT_IDS.map((id) => {
            // 划线只对填充折线有意义：文字/图片/箭头那几条不给这一档，免得选了没效果
            if (id === "draw" && !fxMenu.row.drawable) return null;
            const on = !fxMenu.row.auto && fxMenu.row.effect === id;
            return (
              <button
                key={id}
                type="button"
                role="menuitemradio"
                aria-checked={on}
                className={"exs-present-fxopt" + (on ? " exs-present-fxopt--on" : "")}
                onClick={() => applyFx(id)}
              >
                <span className="exs-present-fxopt__name">
                  {t(EFFECT_LABELS[id])}
                  <span className="exs-present-fxopt__hint">{t(FX_DESC[id])}</span>
                </span>
                {on ? (
                  <span className="exs-present-fxopt__check" aria-hidden="true">
                    ✓
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* 悬浮提示：人话说明，不依赖原生 title 的慢速弹出 */}
      {tip ? (
        <div
          className={"exs-present-fxtip" + (tip.y < 96 ? " exs-present-fxtip--below" : "")}
          style={{ left: Math.max(120, Math.min(tip.x, rootW - 120)), top: tip.y }}
          role="tooltip"
        >
          {tip.text}
        </div>
      ) : null}
    </aside>
  );
}

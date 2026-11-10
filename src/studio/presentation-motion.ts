/**
 * 第八十二轮：出场编排的**纯逻辑层**——每个元素「用什么效果、第几步出」。
 *
 * 为什么要这一层：放映原来是硬切（opacity 0→100 一帧到位），用户说「不够灵动、非常僵硬」。
 * 调研 Reveal.js / PowerPoint 之后的结论是——问题不在曲线，而在**没有编排**：所有条用同
 * 一条曲线、同时开始、没有错峰、没有过冲。所以这里给的是「四档固定预设 + 每元素选档 +
 * 同号合并 + 同拍自动错峰」，**不给时长/曲线/方向这类精细参数**（用户明确要求）。
 *
 * 载体还是 `customData.presentation`，只是这次写在**元素**上（画框用 order/included/
 * reveal，这里用 effect/step），vendor 官方透传 customData，restore 原样保留。
 * 只存例外：没编过步的元素不写数据，默认效果按元素类型给——于是老白板零迁移。
 *
 * 本模块不 import React / 思源 / vendor，也不 import presentation-run（run 反向依赖我，
 * 循环依赖会让 node 侧跑不动）：需要 run 的类型一律 `import type`。
 */

import { compareReadingOrder, PRESENTATION_KEY } from "./presentation-plan.ts";
import type { DeckPatch } from "./presentation-plan.ts";
import type { StepUnit } from "./presentation-run.ts";

/** 元素级元数据的命名空间，和片单共用一个 key（字段不同、互不覆盖）——单一真源，不许各写一份字面量 */
export const MOTION_KEY = PRESENTATION_KEY;

/** 同一步里各条之间的错峰；超出 STAGGER_SLOTS 条不再往后排（末尾挤在一起） */
export const STAGGER_MS = 70;
export const STAGGER_SLOTS = 5;

/** 步号上限：抽屉里的输入框按这个宽度留位 */
export const STEP_MAX = 99;

export type EffectId = "fade" | "pop" | "rise" | "slide";

/**
 * 一档效果 = 时长 + 曲线 + 起始位移（场景坐标 px）。
 * 位移只在放映期间临时写进 x/y，落定后归零——**不写宽高、不写真实坐标**。
 * 曲线控制点照搬已拍板的 demo：`pop` 的 y1=1.56 就是那点过冲，别改平滑了。
 */
export type EffectSpec = {
  id: EffectId;
  ms: number;
  cubic: readonly [number, number, number, number];
  dx: number;
  dy: number;
};

export const EFFECTS: Record<EffectId, EffectSpec> = {
  fade: { id: "fade", ms: 260, cubic: [0.25, 1, 0.5, 1], dx: 0, dy: 18 },
  pop: { id: "pop", ms: 340, cubic: [0.34, 1.56, 0.64, 1], dx: 0, dy: 24 },
  rise: { id: "rise", ms: 320, cubic: [0.22, 1, 0.36, 1], dx: 0, dy: 44 },
  slide: { id: "slide", ms: 260, cubic: [0.25, 1, 0.5, 1], dx: -36, dy: 0 },
};

export const EFFECT_IDS: readonly EffectId[] = ["fade", "pop", "rise", "slide"];

/** 效果中文名（消费方 t()） */
export const EFFECT_LABELS: Record<EffectId, string> = {
  fade: "浮现",
  pop: "弹入",
  rise: "升起",
  slide: "滑入",
};

/** 只读接口：RunElement / vendor 元素结构上都能满足 */
export type MotionElementLike = {
  id: string;
  type?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  containerId?: string | null;
  groupIds?: readonly string[];
  customData?: unknown;
  text?: string;
};

/* ------------------------------ 曲线 ------------------------------ */

/**
 * CSS 的 cubic-bezier(x1,y1,x2,y2) 求值：给定时间进度 x 求位移进度 y。
 * 系数按 bezier-easing 的口径展开（P0=(0,0)、P3=(1,1)）：
 * `B(t) = ((A t + B) t + C) t`，A = 1−3p2+3p1、B = 3p2−6p1、C = 3p1——
 * 这三个系数写错时曲线照样从 0 走到 1，但形状整个歪掉（过冲档尤其明显），别顺手改。
 * 牛顿迭代 + 二分兜底（y1>1 的过冲曲线导数会先升后降，光靠牛顿会不收敛）。
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const ax = 1 - 3 * x2 + 3 * x1;
  const bx = 3 * x2 - 6 * x1;
  const cx = 3 * x1;
  const ay = 1 - 3 * y2 + 3 * y1;
  const by = 3 * y2 - 6 * y1;
  const cy = 3 * y1;
  const at = (t: number): number => ((ax * t + bx) * t + cx) * t;
  const yt = (t: number): number => ((ay * t + by) * t + cy) * t;
  const dxt = (t: number): number => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number): number => {
    if (!(x > 0)) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i += 1) {
      const err = at(t) - x;
      if (Math.abs(err) < 1e-6) return yt(t);
      const d = dxt(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    // 兜底二分：t 必须留在 [0,1]，过冲只体现在 y 上
    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 24; i += 1) {
      const v = at(t);
      if (Math.abs(v - x) < 1e-6) break;
      if (v < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return yt(t);
  };
}

const easeCache = new Map<EffectId, (t: number) => number>();

export function easeOf(id: EffectId): (t: number) => number {
  const hit = easeCache.get(id);
  if (hit) return hit;
  const spec = EFFECTS[id];
  const fn = cubicBezier(spec.cubic[0], spec.cubic[1], spec.cubic[2], spec.cubic[3]);
  easeCache.set(id, fn);
  return fn;
}

/**
 * 动画某一帧的样子：`e` 就是位移与透明度的进度（**同一个进度**，不做双轨）。
 * `e` 会超过 1（pop 的过冲），偏移因此会飞过终点再回来——这就是「灵动」的来源。
 * 落定（elapsed ≥ 总时长）必须给整数终态，别留 0.999 的透明度在现场。
 */
export function poseOf(id: EffectId, elapsed: number): { o: number; dx: number; dy: number } {
  const spec = EFFECTS[id];
  if (elapsed >= spec.ms) return { o: 1, dx: 0, dy: 0 };
  if (elapsed <= 0) return { o: 0, dx: spec.dx, dy: spec.dy };
  const e = easeOf(id)(elapsed / spec.ms);
  const k = 1 - e;
  return { o: Math.min(1, Math.max(0, e)), dx: spec.dx * k, dy: spec.dy * k };
}

/* ------------------------------ 元数据读写 ------------------------------ */

function metaOf(e: MotionElementLike): { effect?: unknown; step?: unknown } {
  const raw = (e.customData as Record<string, unknown> | undefined)?.[MOTION_KEY];
  return typeof raw === "object" && raw !== null ? (raw as { effect?: unknown; step?: unknown }) : {};
}

export function isEffectId(v: unknown): v is EffectId {
  return typeof v === "string" && (EFFECT_IDS as readonly string[]).includes(v);
}

/** 显式写过的步号才作数；脏数据（0/负数/小数/超上限）一律当没编过 */
export function explicitStep(e: MotionElementLike): number | null {
  const v = metaOf(e).step;
  if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > STEP_MAX) return null;
  return v;
}

export function explicitEffect(e: MotionElementLike): EffectId | null {
  const v = metaOf(e).effect;
  return isEffectId(v) ? v : null;
}

const TYPE_FALLBACK: Record<string, EffectId> = {
  text: "fade",
  arrow: "slide",
  line: "slide",
  image: "rise",
};

/**
 * 没显式选档时的默认：文本浮现、箭头/连线从左边滑进来、图片升起、其余形状弹入。
 * 这是「画完就能放」的口径——用户什么都不调也是成套的动作，而不是齐刷刷硬切。
 */
export function defaultEffect(type?: string): EffectId {
  if (type && TYPE_FALLBACK[type]) return TYPE_FALLBACK[type];
  return "pop";
}

function byIdOf(list: readonly MotionElementLike[]): Map<string, MotionElementLike> {
  const m = new Map<string, MotionElementLike>();
  for (const e of list) m.set(e.id, e);
  return m;
}

/**
 * 一条里的「带头元素」：绑定文字不算（它是容器的标签），其余按给定顺序取第一个。
 * 效果跟着带头走——容器是矩形就弹入，它那句绑定文字不会因为自己是 text 就改成浮现。
 */
function leadOf(ids: readonly string[], byId: Map<string, MotionElementLike>): MotionElementLike | undefined {
  for (const id of ids) {
    const e = byId.get(id);
    if (!e) continue;
    if (!e.containerId || !byId.has(e.containerId)) return e;
  }
  return byId.get(ids[0]);
}

/** 一条的效果：先看有没有人显式选过（按 ids 顺序，第一个说话），否则按带头元素的类型给 */
export function resolveEffect(ids: readonly string[], all: readonly MotionElementLike[]): { effect: EffectId; auto: boolean } {
  const byId = byIdOf(all);
  for (const id of ids) {
    const e = byId.get(id);
    const hit = e ? explicitEffect(e) : null;
    if (hit) return { effect: hit, auto: false };
  }
  return { effect: defaultEffect(leadOf(ids, byId)?.type), auto: true };
}

export function effectOfUnit(ids: readonly string[], all: readonly MotionElementLike[]): EffectId {
  return resolveEffect(ids, all).effect;
}

export function stepOfUnit(ids: readonly string[], all: readonly MotionElementLike[]): number | null {
  const byId = byIdOf(all);
  for (const id of ids) {
    const e = byId.get(id);
    const hit = e ? explicitStep(e) : null;
    if (hit !== null) return hit;
  }
  return null;
}

/* ------------------------------ 编排：谁排第几步 ------------------------------ */

function unionBox(list: readonly MotionElementLike[]): { id: string; x: number; y: number; w: number; h: number } {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const e of list) {
    x0 = Math.min(x0, e.x);
    y0 = Math.min(y0, e.y);
    x1 = Math.max(x1, e.x + (e.width ?? 0));
    y1 = Math.max(y1, e.y + (e.height ?? 0));
  }
  return { id: list[0]?.id ?? "", x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/** 抽屉的行：一条 = 页内一个可编排单元（还没按步号合并），带着自己的效果与步号 */
export type MotionRow = {
  key: string;
  ids: string[];
  label: string;
  /** 这一条实际会用的效果（显式选过的，或按类型给的默认） */
  effect: EffectId;
  /** true = 效果没显式选过，走的是默认档——抽屉要能看出「这是自动」 */
  auto: boolean;
  /** null = 没编步（排在编过步的之后，按阅读顺序自成一步） */
  step: number | null;
};

/** 行标题：有文字就取文字，否则取类型中文名；截断交给 CSS，这里只给单行 */
function rowLabel(ids: readonly string[], byId: Map<string, MotionElementLike>): string {
  for (const id of ids) {
    const e = byId.get(id);
    const text = typeof e?.text === "string" ? e.text.trim() : "";
    if (text) return text.replace(/\s+/g, " ");
  }
  const lead = leadOf(ids, byId);
  return typeNameOf(lead?.type);
}

const TYPE_NAMES: Record<string, string> = {
  text: "文本",
  rectangle: "矩形",
  ellipse: "圆形",
  diamond: "菱形",
  arrow: "箭头",
  line: "连线",
  freedraw: "画笔",
  image: "图片",
  frame: "画框",
};

export function typeNameOf(type?: string): string {
  return type ? (TYPE_NAMES[type] ?? type) : "元素";
}

/**
 * 分条 + 标上效果/步号（抽屉用这份）。输入是 revealUnits 的结果——
 * 分组口径（同组一起、绑定文字跟容器）只在 run 里算一次，这里只贴元数据。
 */
export function motionRows(all: readonly MotionElementLike[], units: readonly StepUnit[]): MotionRow[] {
  const byId = byIdOf(all);
  return units.map((u) => {
    const fx = resolveEffect(u.ids, all);
    return {
      key: u.key,
      ids: u.ids,
      label: rowLabel(u.ids, byId),
      effect: fx.effect,
      auto: fx.auto,
      step: stepOfUnit(u.ids, all),
    };
  });
}

/**
 * 按步号合并成「一次按键」。规则（拍板口径）：
 * - 同号一起出（后续在动画里按 70ms 错峰），异号分次按键；
 * - **编过步号的先出**，没编的整批排在后面、仍按阅读顺序自成一步——
 *   你开始标步号，就是在说「这几个先出」，没标的算补充内容；
 * - 一个都没标 = 完全按阅读顺序，一条一步（老白板零行为变化）。
 */
export function mergeByStep(rows: readonly MotionRow[]): StepUnit[] {
  const assigned = new Map<number, string[]>();
  const loose: StepUnit[] = [];
  for (const r of rows) {
    if (r.step === null) {
      loose.push({ key: r.key, ids: [...r.ids] });
      continue;
    }
    const prev = assigned.get(r.step);
    if (prev) prev.push(...r.ids);
    else assigned.set(r.step, [...r.ids]);
  }
  if (assigned.size === 0) return loose;
  const keyed: StepUnit[] = [...assigned.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([step, ids]) => ({ key: `s:${step}`, ids }));
  return [...keyed, ...loose];
}

/* ------------------------------ 动画分组 ------------------------------ */

/** 动画帧写给 vendor 的补丁：opacity + 临时坐标（放映期间才存在的字段，退出必须复原） */
export type PosePatch = { id: string; x: number; y: number; opacity: number };

/**
 * 编排行的签名：抽屉开着时用它判断「要不要重算行」。
 * 只看会影响行的那些字段（成员集合、分组、绑定关系、效果/步号），
 * 以及元素数量——挪动位置不进签名（挪位置不改谁在第几步）。
 */
export function rowsSignature(list: readonly MotionElementLike[]): string {
  const parts: string[] = [];
  for (const e of list) {
    const m = metaOf(e);
    const g = e.groupIds && e.groupIds.length > 0 ? e.groupIds[0] : "";
    const c = e.containerId ?? "";
    if (m.effect === undefined && m.step === undefined && g === "" && c === "") continue;
    parts.push(`${e.id}|${m.effect ?? ""}|${m.step ?? ""}|${g}|${c}`);
  }
  return `${list.length}:${parts.join(",")}`;
}

/** 动画里的一条：同一个 key 的元素一起起步、一起停，key 之间才错峰 */
export type MotionGroup = { key: string; ids: string[]; effect: EffectId; delay: number };

/** 一组的 key：口径和 revealUnits 一致（同组一起，其余自成一条） */
function unitKey(e: MotionElementLike): string {
  return e.groupIds && e.groupIds.length > 0 ? `g:${e.groupIds[0]}` : `e:${e.id}`;
}

/**
 * 这一拍新露出的元素 → 动画分组。
 *
 * 为什么现场再分一次组：`plan.units` 可能被步号合并成一坨（一步出五个元素），
 * 而错峰要按「视觉上是几条」排，所以得从元素身上的 groupIds 还原出单元。
 * `together=true`（整页一起出）时全部 delay=0：那是用户明确要的「一起」。
 */
export function motionGroups(
  all: readonly MotionElementLike[],
  ids: readonly string[],
  together = false,
): MotionGroup[] {
  const want = new Set(ids);
  const list = all.filter((e) => want.has(e.id));
  if (list.length === 0) return [];
  const byId = byIdOf(list);
  const bound = new Map<string, MotionElementLike[]>();
  for (const e of list) {
    if (e.containerId && byId.has(e.containerId)) {
      const g = bound.get(e.containerId) ?? [];
      g.push(e);
      bound.set(e.containerId, g);
    }
  }
  const groups = new Map<string, MotionElementLike[]>();
  for (const e of list) {
    if (e.containerId && byId.has(e.containerId)) continue;
    const key = unitKey(e);
    const g = groups.get(key) ?? [];
    g.push(e);
    groups.set(key, g);
  }
  const ordered = [...groups.entries()]
    .map(([key, members]) => ({
      key,
      ids: members.flatMap((e) => [e.id, ...(bound.get(e.id) ?? []).map((t) => t.id)]),
      box: unionBox(members),
      step: stepOfUnit(members.map((e) => e.id), all),
    }))
    .sort((a, b) => {
      const as = a.step ?? Number.MAX_SAFE_INTEGER;
      const bs = b.step ?? Number.MAX_SAFE_INTEGER;
      if (as !== bs) return as - bs;
      return compareReadingOrder(a.box, b.box) || a.key.localeCompare(b.key);
    });
  return ordered.map((g, i) => ({
    key: g.key,
    ids: g.ids,
    effect: effectOfUnit(g.ids, all),
    delay: together ? 0 : Math.min(i, STAGGER_SLOTS) * STAGGER_MS,
  }));
}

/** 整场动画还要跑多久（最后一组的错峰 + 它自己的时长） */
export function motionTotalMs(groups: readonly MotionGroup[]): number {
  let total = 0;
  for (const g of groups) {
    total = Math.max(total, g.delay + EFFECTS[g.effect].ms);
  }
  return total;
}

/* ------------------------------ 编排写入 ------------------------------ */

export type MotionEdit = { effect?: EffectId | null; step?: number | null };

/**
 * 一次编排 = 给这一条的每个元素写 customData.presentation。
 * `null` = 清掉该字段（回到「自动」）——**删键而不是写 null**：null 会留在 JSON 里，
 * 也会让 explicitStep 那种「脏数据当没编过」的兜底变成常态。
 */
export function setMotionPatch(ids: readonly string[], edit: MotionEdit): DeckPatch[] {
  const patch: Record<string, unknown> = {};
  if ("effect" in edit) patch.effect = edit.effect ?? undefined;
  if ("step" in edit) patch.step = edit.step ?? undefined;
  if (Object.keys(edit).length === 0) return [];
  return ids.map((id) => ({ id, patch: { [MOTION_KEY]: patch } }));
}


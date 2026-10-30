/**
 * 2026-10-30：折叠组的动作层（overlay 的圆点菜单与画布右键菜单共用一套）。
 *
 * 为什么抽出来：TextFoldOverlay 里那些 run* 函数是组件内闭包，右键菜单用不上。
 * 两处各写一份 ⇒ 两条链路的语义会漂（折叠/展开/并入/排版/解散五件事）。
 * 这里把「动作 = 纯逻辑（text-fold.ts 的 plan*）+ 场景写入（ea handle）」收在一处，
 * 组件只负责触发与播报。
 *
 * 动画（淡入淡出 + 下滑）留在 overlay 侧：右键菜单触发的折叠/展开走**无动画**
 * 的直落版本（一步到位，用户要的是「马上变」），避免两套动画时序打架。
 */

import { CaptureUpdateAction } from "@excalidraw/excalidraw";
import type { EaBoardHandle } from "./ea-api";
import {
  arrangeMembers,
  groupIdFor,
  planDissolve,
  planMerge,
  planRefold,
  planUnfold,
  toggleOf,
  type FoldCandidate,
} from "./text-fold";

/** 折叠头 + 成员 id 的最小读取面 */
type El = { id?: unknown; link?: unknown; excaliToggle?: unknown };

function elId(e: El): string {
  return typeof e.id === "string" ? e.id : "";
}

/** 折叠组里的成员 id 名单（展开态才有；折叠态的成员在快照里） */
function memberIdsOf(tg: ReturnType<typeof toggleOf>): string[] {
  return tg?.memberIds ?? [];
}

/**
 * 并入：把 newcomerIds 并进这个折叠组。
 * 返回并入的个数（0 = 没有新成员可并）。
 */
export function mergeIntoFold(handle: EaBoardHandle, headId: string, newcomerIds: string[]): number {
  const head = handle.getElements().find((e) => e.id === headId);
  if (!head) return 0;
  const known = new Set((toggleOf(head)?.offsets ?? []).map((o) => o.id));
  const fresh = handle.getElements().filter((e) => newcomerIds.includes(e.id) && !known.has(e.id));
  if (fresh.length === 0) return 0;
  const gid = toggleOf(head)?.groupId ?? groupIdFor(headId);
  const headGroupsRaw = (head as unknown as { groupIds?: readonly string[] }).groupIds;
  const headGroups = Array.isArray(headGroupsRaw) ? headGroupsRaw : [];
  handle.patchElements([headId], { groupIds: Array.from(new Set([...headGroups, gid])) });
  handle.patchElements(
    fresh.map((n) => n.id),
    { groupIds: [gid] },
  );
  // 重读：快照要带上刚打好的编组关系
  const patched = handle.getElements().filter((e) => newcomerIds.includes(e.id) && !known.has(e.id));
  const ops = planMerge(head as FoldCandidate & { excaliToggle?: unknown }, patched as never);
  if (!ops) return 0;
  if (ops.deleteIds.length > 0) handle.deleteElements(ops.deleteIds, CaptureUpdateAction.IMMEDIATELY);
  handle.patchElements([headId], ops.headPatch, CaptureUpdateAction.IMMEDIATELY);
  return patched.length;
}

/**
 * 展开（无动画直落）：快照成员回场 + 头写展开态 + z 序排回。
 * 返回回场的成员数（0 = 没什么可展开 / 成员都还在）。
 */
export function unfoldFold(handle: EaBoardHandle, headId: string): number {
  const head = handle.getElements().find((e) => e.id === headId);
  if (!head) return 0;
  const presentIds = new Set(handle.getElements().map((e) => e.id));
  const ops = planUnfold(head as FoldCandidate & { excaliToggle?: unknown }, presentIds);
  if (!ops) return 0;
  if (ops.specs.length > 0) handle.addElements(ops.specs as never, CaptureUpdateAction.IMMEDIATELY);
  if (ops.order && ops.order.length > 0) handle.reorderElements(ops.order, CaptureUpdateAction.NEVER);
  handle.patchElements([headId], ops.headPatch, CaptureUpdateAction.IMMEDIATELY);
  return ops.specs.length;
}

/**
 * 收起（无动画直落）：编组 + 记快照/z 序 + 删成员。
 * 返回被收起的成员数（0 = 成员已不在画布上）。
 */
export function refoldFold(handle: EaBoardHandle, headId: string): number {
  const head0 = handle.getElements().find((e) => e.id === headId);
  if (!head0) return 0;
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
  if (!head) return 0;
  const all = handle.getElements();
  const ops = planRefold(
    head as FoldCandidate & { excaliToggle?: unknown },
    all as never,
    all.map((e) => e.id),
  );
  if (!ops) return 0;
  if (ops.deleteIds.length > 0) handle.deleteElements(ops.deleteIds, CaptureUpdateAction.IMMEDIATELY);
  handle.patchElements([headId], ops.headPatch, CaptureUpdateAction.IMMEDIATELY);
  return ops.deleteIds.length;
}

/**
 * 一键列表排版：框内成员垂直均分（间距沿用记住的值，没有就取现有相邻间距的平均）。
 * 返回排版的成员数（0 = 组里没成员）。
 */
export function arrangeFold(handle: EaBoardHandle, headId: string): number {
  const head = handle.getElements().find((e) => e.id === headId);
  if (!head) return 0;
  const tg = toggleOf(head);
  const memberIds = memberIdsOf(tg);
  const members = handle.getElements().filter((e) => memberIds.includes(e.id));
  if (members.length === 0) return 0;
  const plan = arrangeMembers(
    head as never,
    members as never,
    typeof tg?.gap === "number" ? tg.gap : undefined,
  );
  handle.patchElementsMany(
    plan.positions.map((p) => ({ id: p.id, patch: { x: p.x, y: p.y } })),
    CaptureUpdateAction.IMMEDIATELY,
  );
  handle.patchElements(
    [headId],
    { excaliToggle: { ...(tg ?? {}), gap: plan.gap } },
    CaptureUpdateAction.IMMEDIATELY,
  );
  return plan.positions.length;
}

/**
 * 解散：成员按「头当前位置 + 偏移」回场，头的折叠字段与编组关系一并清掉。
 * 返回回场的成员数。
 */
export function dissolveFold(handle: EaBoardHandle, headId: string): number {
  const head = handle.getElements().find((e) => e.id === headId);
  if (!head) return 0;
  const presentIds = new Set(handle.getElements().map((e) => e.id));
  const ops = planDissolve(head as FoldCandidate & { excaliToggle?: unknown }, presentIds);
  if (!ops) return 0;
  if (ops.specs.length > 0) handle.addElements(ops.specs as never, CaptureUpdateAction.IMMEDIATELY);
  if (ops.order && ops.order.length > 0) handle.reorderElements(ops.order, CaptureUpdateAction.NEVER);
  for (const p of ops.patches ?? []) handle.patchElements([p.id], p.patch, CaptureUpdateAction.NEVER);
  handle.patchElements([headId], { excaliToggle: undefined }, CaptureUpdateAction.IMMEDIATELY);
  return ops.specs.length;
}

/**
 * 移出选中的成员：退出编组 + 从成员表里摘掉（成员仍在画布上，只是不再属于这个折叠）。
 * 返回移出的个数。
 */
export function removeFoldMembers(
  handle: EaBoardHandle,
  headId: string,
  memberIds: string[],
): number {
  const head = handle.getElements().find((e) => e.id === headId);
  if (!head) return 0;
  const tg = toggleOf(head);
  const hit = memberIdsOf(tg).filter((id) => memberIds.includes(id));
  if (hit.length === 0) return 0;
  handle.patchElementsMany(
    hit.map((id) => ({ id, patch: { groupIds: [] } })),
    CaptureUpdateAction.IMMEDIATELY,
  );
  const next = {
    ...(tg ?? {}),
    memberIds: memberIdsOf(tg).filter((id) => !hit.includes(id)),
    offsets: (tg?.offsets ?? []).filter((o) => !hit.includes(o.id)),
  };
  handle.patchElements([headId], { excaliToggle: next }, CaptureUpdateAction.IMMEDIATELY);
  return hit.length;
}

/** 这个元素是不是折叠头（带 excaliToggle.collapsed 布尔） */
export function isFoldHead(el: El | null | undefined): boolean {
  if (!el) return false;
  const t = toggleOf(el);
  return !!t && typeof t.collapsed === "boolean";
}

/** 元素的规范化 link（认不出返回 null） */
export function linkOf(el: El | null | undefined): string {
  return typeof el?.link === "string" ? el.link : "";
}

export { elId };

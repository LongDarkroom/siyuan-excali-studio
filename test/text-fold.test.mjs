/**
 * 2026-10-22：文本折叠纯逻辑（text-fold.ts）——折叠/展开/再折叠的数据变换 +
 * 圆点锚点的视口换算。overlay 与「选区折叠为列表」脚本共用这一层。
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  arrangeMembers,
  badgeAnchor,
  firstLineLeft,
  foldBadgesOf,
  foldBadgesSig,
  foldHeadsOf,
  groupBounds,
  groupIdFor,
  headLineOffset,
  hiddenCount,
  offsetsOf,
  pickFoldHead,
  placeByOffsets,
  planDissolve,
  planFold,
  planMerge,
  planRefold,
  planUnfold,
  toggleOf,
} from "../src/studio/text-fold.ts";
import { estimateTextWidth } from "../src/studio/ea-element.ts";

const text = (id, y, extra = {}) => ({
  id,
  type: "text",
  x: 100,
  y,
  width: 200,
  height: 25,
  fontSize: 20,
  text: id,
  ...extra,
});

test("toggleOf：脏数据一律当没有", () => {
  assert.equal(toggleOf(null), null);
  assert.equal(toggleOf({}), null);
  assert.equal(toggleOf({ excaliToggle: "x" }), null);
  assert.equal(toggleOf({ excaliToggle: { elements: [] } }), null, "缺 collapsed 布尔不认");
  assert.deepEqual(toggleOf({ excaliToggle: { collapsed: true } }), { collapsed: true });
});

test("pickFoldHead：按 y 升序取最上，文本优先于矩形", () => {
  const picked = pickFoldHead([text("m", 140), text("h", 100), text("m2", 180)]);
  assert.equal(picked.head.id, "h");
  assert.deepEqual(picked.members.map((m) => m.id), ["m", "m2"]);
  // 矩形 y 更小也不当头
  const p2 = pickFoldHead([{ id: "r", type: "rectangle", x: 0, y: 10 }, text("t", 100)]);
  assert.equal(p2.head.id, "t");
  // y 相同按 x
  const p3 = pickFoldHead([{ id: "b", type: "text", x: 200, y: 50 }, { id: "a", type: "text", x: 50, y: 50 }]);
  assert.equal(p3.head.id, "a");
  // 不足 2 个 = 不构成折叠
  assert.equal(pickFoldHead([text("solo", 0)]), null);
  assert.equal(pickFoldHead([]), null);
});

test("planFold：快照深拷贝（改副本不污染原成员），deleteIds 齐全", () => {
  const head = text("h", 100);
  const members = [text("m1", 140), { id: "m2", type: "rectangle", x: 100, y: 180, width: 50, height: 50 }];
  const ops = planFold(head, members);
  assert.deepEqual(ops.deleteIds, ["m1", "m2"]);
  assert.equal(ops.headPatch.excaliToggle.collapsed, true);
  assert.equal(ops.headPatch.excaliToggle.elements.length, 2);
  // 深拷贝验证：改快照里的副本，原 members 不动
  ops.headPatch.excaliToggle.elements[0].y = 999;
  assert.equal(members[0].y, 140, "快照是深拷贝");
});

test("planUnfold：快照回传保 id + 记 memberIds 供再折叠", () => {
  const head = {
    id: "h",
    type: "text",
    x: 0,
    y: 0,
    excaliToggle: { collapsed: true, elements: [{ id: "m1", type: "text", x: 5, y: 5 }, { id: "m2", type: "text", x: 6, y: 6 }] },
  };
  const ops = planUnfold(head);
  assert.ok(ops);
  assert.deepEqual(ops.specs.map((s) => s.id), ["m1", "m2"], "成员 spec 保快照 id");
  assert.equal(ops.headPatch.excaliToggle.collapsed, false);
  assert.deepEqual(ops.headPatch.excaliToggle.memberIds, ["m1", "m2"]);
  // 不一致态（折叠后 ⌘Z 撤回过删除）：m1 还在场 → 只加回 m2，memberIds 仍记全部
  const ops2 = planUnfold(head, new Set(["m1"]));
  assert.deepEqual(ops2.specs.map((s) => s.id), ["m2"], "已在场的不重复进场（防同 id 两个元素）");
  assert.deepEqual(ops2.headPatch.excaliToggle.memberIds, ["m1", "m2"], "memberIds 仍记全部快照 id");
  assert.deepEqual(planUnfold(head, new Set(["m1", "m2"])).specs, [], "全在场 = 无可加");
  // 非折叠态/空快照 = 不展开
  assert.equal(planUnfold({ id: "x", type: "text", x: 0, y: 0, excaliToggle: { collapsed: false, memberIds: [] } }), null);
  assert.equal(planUnfold({ id: "x", type: "text", x: 0, y: 0, excaliToggle: { collapsed: true, elements: [] } }), null);
  assert.equal(planUnfold({ id: "x", type: "text", x: 0, y: 0 }), null);
});

test("planRefold：按 memberIds 收现存成员；部分被删只收剩下的；全没返回 null", () => {
  const head = { id: "h", type: "text", x: 0, y: 0, excaliToggle: { collapsed: false, memberIds: ["m1", "m2"] } };
  const alive = [text("m1", 140), text("m3", 180)]; // m2 被用户删了
  const ops = planRefold(head, alive);
  assert.ok(ops);
  assert.deepEqual(ops.deleteIds, ["m1"], "被删的 m2 跳过，新加的 m3 不收");
  // 全失效
  assert.equal(planRefold(head, [text("other", 0)]), null);
  // 空快照不认
  assert.equal(planRefold({ id: "h", type: "text", x: 0, y: 0, excaliToggle: { collapsed: true, elements: [] } }, alive), null);
  // 不一致态：头还是折叠态但成员已被 ⌘Z 撤回在场 → 也按快照 id 收（点头 − 收干净）
  const headB = {
    id: "h",
    type: "text",
    x: 0,
    y: 0,
    excaliToggle: { collapsed: true, elements: [{ id: "m1" }, { id: "m2" }] },
  };
  const opsB = planRefold(headB, [text("m1", 140), text("m2", 180)]);
  assert.ok(opsB);
  assert.deepEqual(opsB.deleteIds, ["m1", "m2"], "折叠态+成员在场：按快照 id 收");
  assert.equal(opsB.headPatch.excaliToggle.collapsed, true);
  // 折叠态但成员全不在场 → null（调用方提示重框选）
  assert.equal(planRefold(headB, [text("other", 0)]), null);
});

test("foldHeadsOf：只收带头（折叠态+展开态都收），元素面够 overlay 定位", () => {
  const heads = foldHeadsOf([
    text("h1", 0, { excaliToggle: { collapsed: true, elements: [{ id: "a" }] } }),
    text("h2", 40, { excaliToggle: { collapsed: false, memberIds: ["b"] } }),
    text("plain", 80),
    { id: "bad", type: "text" }, // 缺坐标——理论上 excaliToggle 也没有，双保险
  ]);
  assert.deepEqual(heads.map((h) => h.el.id), ["h1", "h2"]);
  assert.equal(heads[0].toggle.collapsed, true);
  assert.equal(hiddenCount(heads[0].toggle, new Set()), 1, "折叠态：快照成员不在场 = 1 个藏的");
  assert.equal(hiddenCount(heads[0].toggle, new Set(["a"])), 0, "成员已在场（撤销过删除）= 没有藏的");
  assert.equal(hiddenCount(heads[1].toggle, new Set(["b"])), 0, "展开态没有隐藏数");
});

test("offsetsOf / groupIdFor：成员相对头的偏移 + 稳定的编组 id", () => {
  const head = { id: "h", type: "text", x: 100, y: 50 };
  const members = [
    { id: "m1", type: "text", x: 120, y: 90 },
    { id: "m2", type: "text", x: 60, y: 50 },
  ];
  assert.deepEqual(offsetsOf(head, members), [
    { id: "m1", dx: 20, dy: 40 },
    { id: "m2", dx: -40, dy: 0 },
  ]);
  assert.equal(groupIdFor("h"), "g-h");
  assert.equal(groupIdFor("h"), groupIdFor("h"), "编组 id 稳定可重现（展开/再折叠要用同一个）");
});

test("placeByOffsets：按「头的当前位置 + 偏移」定位置（头拖走后成员跟着走）", () => {
  const members = [
    { id: "m1", x: 0, y: 40 },
    { id: "m2", x: 0, y: 80 },
  ];
  const head = { id: "h", type: "text", x: 300, y: 0 };
  const offsets = [
    { id: "m1", dx: 100, dy: 40 },
    { id: "m2", dx: 100, dy: 80 },
  ];
  const out = placeByOffsets(members, head, offsets);
  assert.equal(out[0].x, 400, "头的当前位置 300 + 偏移 100");
  assert.equal(out[1].y, 80);
  // 没有偏移记录的成员保持原坐标（不猜）
  assert.equal(placeByOffsets([{ id: "m9", x: 7, y: 9 }], head, offsets)[0].x, 7);
});

test("planMerge：并入——折叠态追加快照并隐藏，展开态只补成员表", () => {
  const collapsed = {
    id: "h",
    type: "text",
    x: 0,
    y: 0,
    excaliToggle: {
      collapsed: true,
      groupId: "g-h",
      offsets: [{ id: "m1", dx: 0, dy: 40 }],
      elements: [{ id: "m1" }],
    },
  };
  const ops = planMerge(collapsed, [{ id: "n", type: "text", x: 0, y: 80 }]);
  assert.ok(ops);
  assert.equal(ops.headPatch.excaliToggle.collapsed, true);
  assert.equal(ops.headPatch.excaliToggle.elements.length, 2, "新成员进快照");
  assert.deepEqual(ops.deleteIds, ["n"], "折叠态下新成员一起被藏起来");
  assert.deepEqual(ops.patches, [{ id: "n", patch: { groupIds: ["g-h"] } }], "新成员补编组关系");
  assert.equal(ops.headPatch.excaliToggle.offsets.length, 2, "新成员也记了偏移");
  assert.equal(planMerge(collapsed, [{ id: "m1", type: "text", x: 0, y: 40 }]), null, "已在组里的不重复并入");
  // 展开态：新成员留在画布（不删），只进成员表
  const expanded = {
    id: "h",
    type: "text",
    x: 0,
    y: 0,
    excaliToggle: { collapsed: false, groupId: "g-h", memberIds: ["m1"], offsets: [{ id: "m1", dx: 0, dy: 40 }] },
  };
  const ops2 = planMerge(expanded, [{ id: "n", type: "text", x: 0, y: 80 }]);
  assert.deepEqual(ops2.deleteIds, [], "展开态不删东西");
  assert.deepEqual(ops2.headPatch.excaliToggle.memberIds, ["m1", "n"]);
});

test("planDissolve：解散——成员按头当前位置+偏移回场，字段清空、退出编组", () => {
  const head = {
    id: "h",
    type: "text",
    x: 300,
    y: 0,
    excaliToggle: {
      collapsed: true,
      groupId: "g-h",
      offsets: [{ id: "m1", dx: 100, dy: 40 }],
      elements: [{ id: "m1", type: "text", x: 0, y: 40 }],
    },
  };
  const ops = planDissolve(head);
  assert.ok(ops);
  assert.equal(ops.headPatch.excaliToggle, undefined, "折叠字段清掉（无痕）");
  assert.equal(ops.specs[0].x, 400, "成员落在头当前位置 + 偏移");
  assert.deepEqual(ops.patches[0], { id: "h", patch: { groupIds: [] } }, "头退出编组");
  assert.equal(ops.patches.length, 2, "头 + 成员都退出编组");
});

test("groupBounds：收集框 = 头与全部成员的包围盒（场景坐标）", () => {
  const head = { id: "h", type: "text", x: 100, y: 0, width: 120, height: 25 };
  const members = [
    { id: "m1", type: "text", x: 100, y: 40, width: 80, height: 25 },
    { id: "m2", type: "text", x: 90, y: 90, width: 200, height: 25 },
  ];
  assert.deepEqual(groupBounds(head, members), { x: 90, y: 0, w: 200, h: 115 });
  assert.deepEqual(groupBounds(head, []), { x: 100, y: 0, w: 120, h: 25 }, "没成员时就是头自己");
});

test("arrangeMembers：一键列表排版——按标题到首行的留白当行距，垂直均分", () => {
  const head = { id: "h", type: "text", x: 100, y: 0, width: 120, height: 25 };
  const members = [
    { id: "m1", type: "text", x: 100, y: 40, width: 80, height: 25 },
    { id: "m2", type: "text", x: 100, y: 80, width: 80, height: 25 },
  ];
  const plan = arrangeMembers(head, members);
  assert.equal(plan.gap, 15, "行距 = 标题底(25) 到首行顶(40) 的留白");
  assert.deepEqual(plan.positions, [
    { id: "m1", x: 100, y: 40 },
    { id: "m2", x: 100, y: 80 },
  ], "本来整齐就原地不动");
  // 拖乱了 → 一次排齐（行距仍取标题到首行的留白）
  const messy = [
    { id: "m1", type: "text", x: 100, y: 40, width: 80, height: 25 },
    { id: "m2", type: "text", x: 100, y: 200, width: 80, height: 25 },
  ];
  const plan2 = arrangeMembers(head, messy);
  assert.equal(plan2.gap, 15);
  assert.equal(plan2.positions[0].y, 40);
  assert.equal(plan2.positions[1].y, 80, "第二个成员被拉到第一个下面 15px");
  // 指定间距优先（记住的值沿用）
  const plan3 = arrangeMembers(head, messy, 30);
  assert.equal(plan3.gap, 30);
  assert.equal(plan3.positions[0].y, 55);
  assert.equal(plan3.positions[1].y, 110);
  // 只动 y：x 保持原样（保留缩进层次）
  const indented = [
    { id: "m1", type: "text", x: 140, y: 40, width: 80, height: 25 },
    { id: "m2", type: "text", x: 100, y: 200, width: 80, height: 25 },
  ];
  assert.equal(arrangeMembers(head, indented).positions[0].x, 140, "x 不动");
});

test("badgeAnchor：层内坐标 = (scene + scroll) × zoom + (容器视口原点 − 层原点)，垂直居中首行", () => {
  const head = text("h", 100);
  head.fontSize = 20;
  const origin = { left: 0, top: 0 };
  // zoom=1、无平移：圆点圆心 = 文本左缘外 (半径 9 + 留白 6) = 15px
  assert.deepEqual(badgeAnchor(head, { zoom: 1, scrollX: 0, scrollY: 0, offsetLeft: 0, offsetTop: 0 }, origin), { left: 81, top: 112.5 });
  // zoom=2、scroll 100/50、offset 10/20：文本左缘 (100+100)*2+10 = 410；
  // 圆点半径 9×1.8（缩放上限）+6px 留白 ⇒ 410-22.2 = 387.8；竖直 (100+12.5+50)*2+20 = 345
  assert.deepEqual(badgeAnchor(head, { zoom: 2, scrollX: 100, scrollY: 50, offsetLeft: 10, offsetTop: 20 }, origin), { left: 383.8, top: 345 });
  // 2026-10-30：层原点 = 容器视口原点 ⇒ 两者抵消，位置与「层就是容器」一致
  assert.deepEqual(
    badgeAnchor(head, { zoom: 1, scrollX: 0, scrollY: 0, offsetLeft: 30, offsetTop: 40 }, { left: 30, top: 40 }),
    { left: 81, top: 112.5 },
    "补上层原点后不该再有整体偏移",
  );
  // 不补偿层原点 = 旧 bug：整体偏移容器视口原点（用户看到的「圆点飘在别处、还乱跳」）
  assert.deepEqual(
    badgeAnchor(head, { zoom: 1, scrollX: 0, scrollY: 0, offsetLeft: 30, offsetTop: 40 }, origin),
    { left: 111, top: 152.5 },
    "旧口径会整体偏一个容器视口原点",
  );
  // zoom 0（异常值）回落 1
  assert.equal(badgeAnchor(head, { zoom: 0, scrollX: 0, scrollY: 0, offsetLeft: 0, offsetTop: 0 }, origin).left, 81);
});

test("badgeAnchor：缩放时水平间距按屏幕像素恒定（不再随 zoom 缩窄压字）", () => {
  const head = text("h", 100);
  const view = (zoom) => ({ zoom, scrollX: 0, scrollY: 0, offsetLeft: 0, offsetTop: 0 });
  const origin = { left: 0, top: 0 };
  // 文本左缘屏幕坐标 - 圆心 = 半径×scale + 6，全程只取决于 scale
  const gapAt = (zoom) => 100 * zoom - badgeAnchor(head, view(zoom), origin).left;
  assert.equal(gapAt(1), 19, "zoom 1：9 + 10（留白加大让开收集框的左边线）");
  assert.ok(Math.abs(gapAt(0.66) - 15.94) < 1e-9, "缩小：9×0.66 + 10");
  assert.ok(Math.abs(gapAt(3) - 26.2) < 1e-9, "放大超上限 1.8：9×1.8 + 10（圆点不无限制长大）");
  // 旧口径（22 个 scene 单位）在 zoom 0.5 时只留 11px，圆点直径 18px 会压到字上
  assert.ok(gapAt(0.5) > 11, "zoom 0.5 时仍留出比旧口径更宽的间距");
});

test("headLineOffset：文本头按首行中线，无字号的矩形/容器头按几何中线", () => {
  assert.equal(headLineOffset({ id: "h", type: "text", x: 0, y: 0, fontSize: 20 }), 12.5, "20 号字 ⇒ 20×1.25/2");
  assert.equal(
    headLineOffset({ id: "h", type: "text", x: 0, y: 0, fontSize: 20, lineHeight: 1.5 }),
    15,
    "2026-10-30：行高取元素真实值（vendor 不保证 1.25）⇒ 20×1.5/2",
  );
  assert.equal(headLineOffset({ id: "h", type: "text", x: 0, y: 0, fontSize: 40 }), 25, "大标题的首行中线要更低");
  assert.equal(headLineOffset({ id: "r", type: "rectangle", x: 0, y: 0, height: 120 }), 60, "矩形头＝框子垂直居中（旧口径按 20 号字算，会顶在框上沿）");
  // fontSize 脏值（0 / undefined）+ 无高度 ⇒ 兜底
  assert.equal(headLineOffset({ id: "r", type: "rectangle", x: 0, y: 0, fontSize: 0 }), 12.5);
  assert.equal(headLineOffset({ id: "r", type: "rectangle", x: 0, y: 0 }), 12.5);
});

test("badgeAnchor：矩形折叠头垂直居中于框（选中不再让位，2026-10-30）", () => {
  const view = { zoom: 1, scrollX: 0, scrollY: 0, offsetLeft: 0, offsetTop: 0 };
  const origin = { left: 0, top: 0 };
  const box = { id: "r", type: "rectangle", x: 100, y: 200, width: 300, height: 120 };
  assert.deepEqual(badgeAnchor(box, view, origin), { left: 81, top: 260 }, "框中线 y=200+60");
  const txt = text("h", 100);
  // 圆心距文本左缘 9+6=15（不再有「选中左让 10px」这一档——那是乱跳的第二个来源）
  assert.equal(badgeAnchor(txt, view, origin).left, 81);
});

test("foldBadgesOf：选中只改样式不改位置（2026-10-30：不再为躲开选区把手而位移）", () => {
  const view = { zoom: 1, scrollX: 0, scrollY: 0, offsetLeft: 0, offsetTop: 0 };
  const origin = { left: 0, top: 0 };
  const mk = (id, y) => text(id, y, { excaliToggle: { collapsed: false, memberIds: ["m"] } });
  const els = [mk("h1", 100), mk("h2", 300)];
  const plain = foldBadgesOf(els, view, origin);
  const one = foldBadgesOf(els, view, origin, new Set(["h1"]));
  assert.deepEqual(one.map((b) => b.selected), [true, false], "选中态只进样式");
  assert.equal(one[0].left, plain[0].left, "选中的头位置一动不动");
  assert.equal(one[1].left, plain[1].left);
  assert.notEqual(foldBadgesSig(plain), foldBadgesSig(one), "选中态必须进签名（样式要刷新）");
  // 不传选中集 = 全部未选中（老调用方不破）
  assert.deepEqual(foldBadgesOf(els, view, origin).map((b) => b.selected), [false, false]);
});

test("foldBadgesOf/foldBadgesSig：拖动折叠头后签名必须变（圆点跟着元素走）", () => {
  const view = { zoom: 1, scrollX: 0, scrollY: 0, offsetLeft: 0, offsetTop: 0 };
  const origin = { left: 0, top: 0 };
  const head = text("h", 100, { excaliToggle: { collapsed: true, elements: [{ id: "m1" }, { id: "m2" }] } });
  const before = foldBadgesOf([head], view, origin);
  assert.equal(before.length, 1);
  assert.deepEqual(
    { collapsed: before[0].collapsed, count: before[0].count, left: before[0].left, top: before[0].top },
    { collapsed: true, count: 2, left: 81, top: 112.5 },
  );
  // 拖动：x/y 变但 id、collapsed、视口全不变——这正是旧签名漏掉的场景
  const moved = foldBadgesOf([{ ...head, x: 400, y: 300 }], view, origin);
  assert.notEqual(foldBadgesSig(before), foldBadgesSig(moved), "签名必须变（否则 rAF 不会重渲染，圆点留在原地）");
  assert.deepEqual({ left: moved[0].left, top: moved[0].top }, { left: 381, top: 312.5 }, "锚点跟着走");
  // 平移画布同理
  assert.notEqual(
    foldBadgesSig(before),
    foldBadgesSig(foldBadgesOf([head], { ...view, scrollX: 40, scrollY: 10 }, origin)),
    "平移也要变签名",
  );
  // 成员全在场（⌘Z 撤消过删除）→ 显展开态 −，计数 0
  const odd = foldBadgesOf([head, text("m1", 140), text("m2", 180)], view, origin);
  assert.deepEqual({ collapsed: odd[0].collapsed, count: odd[0].count }, { collapsed: false, count: 0 });
  // 无头时快照为空
  assert.deepEqual(foldBadgesOf([text("plain", 0)], view, origin), []);
});

test("firstLineLeft：贴首行文字的真实左缘（居中/右对齐要修正包围盒左边）", () => {
  // 左对齐：包围盒左边就是文字左缘
  assert.equal(firstLineLeft({ id: "h", type: "text", x: 100, y: 0, width: 200, fontSize: 20 }), 100);
  const w = estimateTextWidth("标题", 20);
  // 居中：包围盒按最宽行算，首行要往右挪 (盒宽-首行宽)/2
  const c = { id: "h", type: "text", x: 100, y: 0, width: 200, fontSize: 20, text: "标题", textAlign: "center" };
  assert.equal(firstLineLeft(c), 100 + (200 - w) / 2);
  // 右对齐：首行贴盒右边
  assert.equal(firstLineLeft({ ...c, textAlign: "right" }), 100 + 200 - w);
  // 多行居中：第一行短 ⇒ 首行左缘在盒内（旧口径锚盒左边，圆点会飘）
  assert.ok(firstLineLeft({ ...c, text: "短\n更长的第二行文字" }) > 100);
});

test("折叠/还原的 z 序：折叠记下全场顺序，还原按它排回（成员不被甩到最上层）", () => {
  const head = text("h", 100);
  const members = [text("m1", 140), text("m2", 180)];
  const order = ["a", "h", "m1", "b", "m2"];
  const ops = planFold(head, members, order);
  assert.deepEqual(ops.headPatch.excaliToggle.order, order, "折叠时记下全场 z 序");
  // 还原：order 回传 + 成员按快照里的 index 排序（层序，不是选区顺序）
  const head2 = {
    id: "h",
    type: "text",
    x: 0,
    y: 0,
    excaliToggle: { collapsed: true, order, elements: [{ id: "m2", index: 4 }, { id: "m1", index: 2 }] },
  };
  const u = planUnfold(head2);
  assert.deepEqual(u.order, order, "还原时把 z 序带出来");
  assert.deepEqual(u.specs.map((s) => s.id), ["m1", "m2"], "成员按原层序回场（不是快照数组顺序）");
  // 字符串型 index（老版本 vendor 的 "a3"）也要能排序
  const u2 = planUnfold({ ...head2, excaliToggle: { collapsed: true, elements: [{ id: "m2", index: "a4" }, { id: "m1", index: "a2" }] } });
  assert.deepEqual(u2.specs.map((s) => s.id), ["m1", "m2"]);
});

/**
 * 2026-11-21：功能目录从 assets 搬到 storage 的纯逻辑（真断言）。
 * 判错会污染思源「未引用资源」列表或让存量白板内嵌图读不回来，故放 node 直接跑。
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FUNCTIONAL_DIR_MOVES,
  FUNCTIONAL_MIGRATED_KEY,
  isMigratableFile,
  remapLegacyRef,
} from "../src/studio/storage-migration.ts";
import { SCRIPTS_DIR } from "../src/siyuan/script-store.ts";
import { STYLE_DIR } from "../src/studio/ai/style-pack.ts";
import { MEDIA_DIR, LEGACY_MEDIA_DIR } from "../src/studio/media-ref.ts";
import { LIB_DIR, DEDICATED_BOARD_DIR } from "../src/studio/settings.ts";
import { DEFAULT_LIB_DIR } from "../src/library-import-page.ts";

test("四类目录映射的目标值与运行期常量一致（改常量必须同步这里）", () => {
  const byFrom = Object.fromEntries(FUNCTIONAL_DIR_MOVES.map((m) => [m.from, m.to]));
  assert.equal(byFrom["assets/excali-scripts"], SCRIPTS_DIR);
  assert.equal(byFrom["assets/excali-styles"], STYLE_DIR);
  assert.equal(byFrom["assets/excali-media"], MEDIA_DIR);
  assert.equal(byFrom["assets/excali/excali-libraries"], LIB_DIR);
  assert.equal(LIB_DIR, DEFAULT_LIB_DIR, "落地页兜底目录与插件主体同值");
  assert.equal(FUNCTIONAL_MIGRATED_KEY, "functionalDirsMigrated");
});

test("白板目录 NOT in 迁移表（svg 必须留在 assets，否则已插图破图）", () => {
  const froms = FUNCTIONAL_DIR_MOVES.map((m) => m.from);
  assert.ok(!froms.includes("assets/excali"), "白板工程目录不能被搬");
  assert.equal(DEDICATED_BOARD_DIR, "assets/excali", "白板目录常量保持旧值");
});

test("四类映射的 kind 正确：只有 media 走 bytes，其余走 text", () => {
  for (const m of FUNCTIONAL_DIR_MOVES) {
    if (m.from === "assets/excali-media") assert.equal(m.kind, "bytes");
    else assert.equal(m.kind, "text", `${m.from} 应是文本形态`);
  }
});

test("remapLegacyRef：只改旧 media 前缀，幂等，其余路径原样", () => {
  assert.equal(
    remapLegacyRef("assets/excali-media/abc.png", LEGACY_MEDIA_DIR, MEDIA_DIR),
    "storage/excali-studio/media/abc.png",
  );
  assert.equal(
    remapLegacyRef("/data/assets/excali-media/abc.png", LEGACY_MEDIA_DIR, MEDIA_DIR),
    "/data/assets/excali-media/abc.png",
    "带 /data/ 前缀的绝对形式不匹配相对前缀（宿主读盘另有 toDataPath 归一），原样返回",
  );
  assert.equal(
    remapLegacyRef("storage/excali-studio/media/abc.png", LEGACY_MEDIA_DIR, MEDIA_DIR),
    "storage/excali-studio/media/abc.png",
    "已是新路径，幂等",
  );
  assert.equal(remapLegacyRef("assets/excali/x.svg", LEGACY_MEDIA_DIR, MEDIA_DIR), "assets/excali/x.svg", "白板 svg 不受影响");
  assert.equal(remapLegacyRef("", LEGACY_MEDIA_DIR, MEDIA_DIR), "");
});

test("isMigratableFile：跳过隐藏文件与系统残留", () => {
  assert.equal(isMigratableFile("smart-connect.md"), true);
  assert.equal(isMigratableFile(".DS_Store"), false);
  assert.equal(isMigratableFile("Thumbs.db"), false);
  assert.equal(isMigratableFile(""), false);
});

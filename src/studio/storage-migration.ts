/**
 * 2026-11-21：功能数据目录从 assets 搬到 storage 的一次性迁移（纯逻辑，node 可单测）。
 *
 * 背景：思源「设置 → 资源 → 未引用的资源文件」扫描 data/assets/ 全目录，凡没被笔记
 * 用 `assets/xxx` 引用过的文件全列出。插件的四类功能数据（脚本 md / 风格包 json /
 * 白板内嵌图 / 素材库）从不被笔记引用，却长期住在 assets 下 → 全部进列表，用户一
 * 「全选删除」就毁数据。2026-11-21 把它们统一搬到 data/storage/excali-studio/。
 *
 * 不能搬的一类：白板工程 assets/excali/*.svg——插件用思源原生图片语法
 * ![](assets/excali/x.svg) 插进笔记，思源只从 /assets/* 供图，搬走=破图。故不在本表。
 *
 * 本模块只放「旧→新目录映射 + 生成搬移清单」的纯逻辑；实际读写（列目录/搬文件/
 * 删旧）留在宿主 index.ts，用 studio/storage.ts 的 API 完成。
 */

/** 一条目录搬迁规则：旧目录 → 新目录（都是工作空间相对路径，不含 data/ 前缀） */
export interface DirMove {
  readonly from: string;
  readonly to: string;
  /** 该目录文件用的读写形态：text 走 putTextFile，bytes 走 putBytes */
  readonly kind: "text" | "bytes";
}

/**
 * 四类功能目录的搬迁表。顺序即迁移顺序，与 index.ts 的 SCRIPTS_DIR / STYLE_DIR /
 * MEDIA_DIR / LIB_DIR 常量值保持一致（改那四处常量时这里必须同步）。
 */
export const FUNCTIONAL_DIR_MOVES: readonly DirMove[] = [
  { from: "assets/excali-scripts", to: "storage/excali-studio/scripts", kind: "text" },
  { from: "assets/excali-styles", to: "storage/excali-studio/styles", kind: "text" },
  { from: "assets/excali-media", to: "storage/excali-studio/media", kind: "bytes" },
  { from: "assets/excali/excali-libraries", to: "storage/excali-studio/libraries", kind: "text" },
];

/** data.json 里的一次性迁移标记字段名 */
export const FUNCTIONAL_MIGRATED_KEY = "functionalDirsMigrated";

/**
 * 把一条旧 media 引用重写成新路径（存量白板 SVG 里 files[].path 写死旧目录）。
 * 只替换以 oldDir + "/" 开头的引用，其余原样返回；幂等。
 * 用字符串前缀而非正则，避免目录里的特殊字符被当正则元字符。
 */
export function remapLegacyRef(path: string, oldDir: string, newDir: string): string {
  if (typeof path !== "string") return path;
  const prefix = oldDir.replace(/\/+$/, "") + "/";
  if (!path.startsWith(prefix)) return path;
  return newDir.replace(/\/+$/, "") + "/" + path.slice(prefix.length);
}

/**
 * 判断一个文件是否值得搬：跳过隐藏文件与思源/系统残留（.DS_Store 等）。
 * 导出纯函数便于单测。
 */
export function isMigratableFile(name: string): boolean {
  if (typeof name !== "string" || name === "") return false;
  if (name.startsWith(".")) return false;
  return name !== "Thumbs.db" && name !== "desktop.ini";
}

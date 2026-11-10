/**
 * 第八十四轮：风格包管理（面板里的「已安装 / 导入 / 移除」）。
 *
 * 纯函数模块——不 import React / siyuan / vendor，node 单测直接跑。
 *
 * 目录口径沿用第三十九轮：真正的包只有 `<data>/assets/excali-styles/*.json`，
 * 效果图在子目录 `previews/`（加载器与内核 readDir 都只看直接子级文件，所以图不会被当包）。
 * 插件自带的两套包放在 `script/excali-style/styles/`，没装就不在运行期生效——
 * 面板必须如实显示「未安装」，不能像旧版那样硬编码两行还照给调用指令。
 *
 * 一份 JSON 双语义：`parseStylePack` 只校验样式字段、未知字段忽略，
 * 于是 `description / preview / version / prompt / $schema` 可以安全共存在同一个文件里，
 * 既是加载器吃的风格包，也是面板卡片与 GitHub 模板仓库的元数据。
 */

import { slugStyleName } from "./preset.ts";
import { STYLE_DIR, StylePackError, parseStylePack, type ParsedStylePack } from "./style-pack.ts";

export const STYLE_PREVIEW_DIR = "previews";

/** 面板「链接」一栏要的就是这个文件名（GitHub 仓库根目录约定） */
export const STYLE_TEMPLATE_FILE = "excali-style.json";

/** 与 style-pack.ts 的 NAME_RE 保持一致（install 侧防路径穿越的第一道门） */
const NAME_RE = /^[a-z0-9][a-z0-9._-]{0,31}$/;
/** preview 只能是同一目录下的 png 文件名：不许路径、不许 ..、不许别的扩展名 */
const PREVIEW_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}\.png$/i;

const DESCRIPTION_MAX = 120;
const VERSION_MAX = 20;
const PROMPT_MAX = 400;

export type StyleSource = "bundled" | "imported";

/** 卡片元数据（JSON 里除样式字段外的展示层字段） */
export interface StyleCard {
  name: string;
  label: string;
  description: string;
  /** previews/ 下的文件名；空串 = 没有效果图 */
  preview: string;
  version: string;
  /** 自定义调用指令（可选；空串 = 用通用文案） */
  prompt: string;
}

/** 面板列表的一行 */
export interface StyleEntry extends StyleCard {
  /** 工作区目录里有这个包的文件 */
  installed: boolean;
  /** 插件自带（卸了还能再装） */
  bundled: boolean;
  /** 安装文件坏了时的原因；空串 = 正常 */
  error: string;
}

export interface ParsedStyleCard {
  pack: ParsedStylePack;
  card: StyleCard;
}

export type StyleCardResult = { ok: true; value: ParsedStyleCard } | { ok: false; error: string };

export interface InstalledStyleFile {
  fileName: string;
  text: string;
}

export interface StyleEntriesInput {
  bundled: StyleCard[];
  installed: InstalledStyleFile[];
  /** 插件内 previews/ 实际存在的文件名 */
  bundledPreviews: string[];
  /** 工作区 previews/ 实际存在的文件名 */
  installedPreviews: string[];
}

export function styleJsonPath(name: string): string {
  return `${STYLE_DIR}/${name}.json`;
}

export function stylePreviewPath(fileName: string): string {
  return `${STYLE_DIR}/${STYLE_PREVIEW_DIR}/${fileName}`;
}

export function isStyleName(name: unknown): name is string {
  return typeof name === "string" && NAME_RE.test(name);
}

export function isPreviewFile(name: unknown): name is string {
  return typeof name === "string" && PREVIEW_RE.test(name);
}

/** 安装后的效果图统一叫 `<包名>.png`（JSON 的 preview 字段会被同步改写） */
export function previewFileNameFor(name: string): string {
  return `${name}.png`;
}

export function baseNameOf(path: string): string {
  const clean = String(path ?? "").replace(/\\/g, "/").replace(/\/+$/, "");
  return clean.slice(clean.lastIndexOf("/") + 1);
}

/**
 * GitHub 页面链接 → raw 地址。
 * `/blob/` 与 `/raw/` 两种页面路径都归一到 raw.githubusercontent.com；
 * 其它链接（含已经是 raw 的）原样返回。带 #/ 查询串时不动（由 rawDirOf 负责剥）。
 */
export function normalizePackUrl(raw: string): string {
  const text = String(raw ?? "").trim();
  if (text === "") return "";
  const m = text.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/([^/]+)\/(.+)$/);
  if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
  return text;
}

/** raw 文件地址 → 同目录前缀（拼相对 preview 用）；不是 http 地址返回空串 */
export function rawDirOf(url: string): string {
  const clean = String(url ?? "").trim().split(/[?#]/)[0] ?? "";
  if (!/^https?:\/\//i.test(clean)) return "";
  const cut = clean.lastIndexOf("/");
  return cut > "https://".length ? clean.slice(0, cut + 1) : "";
}

/** JSON 里写的 preview：绝对 http 地址直接用；裸文件名按包的 raw 目录解析 */
export function resolvePreviewUrl(packUrl: string, preview: string): string {
  const p = String(preview ?? "").trim();
  if (p === "") return "";
  if (/^https?:\/\//i.test(p)) return p;
  const dir = rawDirOf(packUrl);
  return dir === "" ? "" : dir + p.replace(/^\.\//, "");
}

/** 不看样式字段，只取文件里声明的包名（坏包也要能按名字移除） */
export function styleNameOf(text: string, fileName: string): string {
  const fallback = slugStyleName(String(fileName ?? "").replace(/\.json$/i, ""));
  try {
    const raw: unknown = JSON.parse(text);
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const name = (raw as Record<string, unknown>).name;
      if (typeof name === "string" && name.trim()) return slugStyleName(name);
    }
  } catch {
    // 坏 JSON：用文件名
  }
  return fallback;
}

/** 文件里声明的 preview 文件名（不合法或没写返回空串）；移除时按它清图 */
export function declaredPreviewOf(text: string): string {
  try {
    const raw: unknown = JSON.parse(text);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return "";
    const preview = (raw as Record<string, unknown>).preview;
    return typeof preview === "string" && PREVIEW_RE.test(preview.trim()) ? preview.trim() : "";
  } catch {
    return "";
  }
}

function describeError(e: unknown): string {
  if (e instanceof StylePackError) {
    const at = e.message.indexOf(" ");
    return at > 0 ? e.message.slice(at + 1) : e.message;
  }
  return e instanceof Error ? e.message : String(e);
}

function readCardFields(raw: Record<string, unknown>): { preview: string; description: string; version: string; prompt: string } {
  const preview = typeof raw.preview === "string" ? raw.preview.trim() : "";
  return {
    preview,
    description: typeof raw.description === "string" ? raw.description.trim().slice(0, DESCRIPTION_MAX) : "",
    version: typeof raw.version === "string" ? raw.version.trim().slice(0, VERSION_MAX) : "",
    prompt: typeof raw.prompt === "string" ? raw.prompt.trim().slice(0, PROMPT_MAX) : "",
  };
}

/**
 * 严格校验一份导入 JSON：样式字段走加载器同款 parseStylePack（坏的颜色/枚举当场报），
 * 元数据字段只做类型与白名单校验。返回的 pack 只是预览用，写盘时仍会重新校验。
 */
export function readStyleCard(text: string, source = "inline", known: Set<string> = new Set()): StyleCardResult {
  let pack: ParsedStylePack;
  try {
    pack = parseStylePack(text, source, known);
  } catch (e) {
    return { ok: false, error: describeError(e) };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    return { ok: false, error: `不是合法 JSON：${e instanceof Error ? e.message : String(e)}` };
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "风格包必须是 JSON 对象" };
  }
  const fields = readCardFields(raw as Record<string, unknown>);
  if (fields.preview !== "" && !PREVIEW_RE.test(fields.preview)) {
    return { ok: false, error: "preview 只能是 previews/ 下的 .png 文件名（不能带路径）" };
  }
  return {
    ok: true,
    value: {
      pack,
      card: {
        name: pack.name,
        label: pack.label,
        description: fields.description,
        preview: fields.preview,
        version: fields.version,
        prompt: fields.prompt,
      },
    },
  };
}

/** 安装前把 preview 改写成落盘的那个文件名，避免声明与文件对不上 */
export function withPreviewField(text: string, fileName: string): string {
  const raw: unknown = JSON.parse(text);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("风格包必须是 JSON 对象");
  (raw as Record<string, unknown>).preview = fileName;
  return JSON.stringify(raw, null, 2) + "\n";
}

/** 工作区里已安装的包名（extends 校验用；内置基线由 hasStyle 兜底） */
export function installedNames(installed: InstalledStyleFile[]): Set<string> {
  return new Set(installed.map((f) => slugStyleName(String(f.fileName ?? "").replace(/\.json$/i, ""))));
}

/**
 * 内置包 + 已装文件 → 面板列表。
 * 顺序：内置包保持原有顺序（装了就用已装文件里的元数据），再按名字补上外部导入的包；
 * 坏包也占一行（installed=true + error），否则用户没法在面板里把它删掉。
 */
export function buildStyleEntries(input: StyleEntriesInput): StyleEntry[] {
  const known = installedNames(input.installed);
  const bundledPreviews = new Set(input.bundledPreviews);
  const installedPreviews = new Set(input.installedPreviews);
  const bundledNames = new Set(input.bundled.map((c) => c.name));

  const parsed = new Map<string, StyleCard>();
  const broken = new Map<string, string>();
  for (const file of input.installed) {
    const result = readStyleCard(file.text, `${STYLE_DIR}/${file.fileName}`, known);
    if (result.ok) parsed.set(result.value.card.name, result.value.card);
    else broken.set(styleNameOf(file.text, file.fileName), result.error);
  }

  const livePreview = (installed: boolean, preview: string): string => {
    if (preview === "") return "";
    return (installed ? installedPreviews : bundledPreviews).has(preview) ? preview : "";
  };

  const entries: StyleEntry[] = [];
  const seen = new Set<string>();
  for (const card of input.bundled) {
    seen.add(card.name);
    const error = broken.get(card.name);
    if (error !== undefined) {
      entries.push({
        name: card.name,
        label: card.label,
        description: "",
        preview: "",
        version: "",
        prompt: "",
        installed: true,
        bundled: true,
        error,
      });
      continue;
    }
    const live = parsed.get(card.name);
    if (live) {
      entries.push({
        ...live,
        preview: livePreview(true, live.preview),
        installed: true,
        bundled: true,
        error: "",
      });
    } else {
      entries.push({
        ...card,
        preview: livePreview(false, card.preview),
        installed: false,
        bundled: true,
        error: "",
      });
    }
  }

  for (const [name, card] of parsed) {
    if (bundledNames.has(name)) continue;
    entries.push({ ...card, preview: livePreview(true, card.preview), installed: true, bundled: false, error: "" });
  }
  for (const [name, error] of broken) {
    if (bundledNames.has(name)) continue;
    entries.push({
      name,
      label: name,
      description: "",
      preview: "",
      version: "",
      prompt: "",
      installed: true,
      bundled: false,
      error,
    });
  }
  return entries;
}

/** PNG 魔数（网络下载/本地选择的图先过这一关，别把 HTML 当图写进 previews） */
export function isPngBytes(bytes: Uint8Array | undefined): boolean {
  return (
    !!bytes &&
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

/** 面板「插入空白模板」：字段与 GitHub 模板仓库的 template 保持一致 */
export function styleTemplate(): string {
  return (
    JSON.stringify(
      {
        $schema: "https://raw.githubusercontent.com/LongDarkroom/excali-style-skill/main/schema/excali-style.schema.json",
        name: "my-style",
        label: "我的风格",
        description: "一句话说明这套风格适合画什么",
        version: "1.0.0",
        extends: "pencil",
        background: "#ffffff",
        ink: "#1e1e1e",
        palette: ["#d0bfff", "#b2f2bb", "#ffec99", "#a5d8ff"],
        strokeWidth: 2,
        roughness: 1,
        preview: "preview.png",
      },
      null,
      2,
    ) + "\n"
  );
}

/** 「让 Agent 代装」通道的提示词：目标目录已经填成绝对路径，Agent 不用猜 */
export function styleAgentPrompt(dirAbs: string): string {
  const dir = dirAbs.trim() || "<工作区>/data/assets/excali-styles";
  return [
    "帮我把一个风格包装进思源插件 Excali Studio。风格包目录：",
    dir,
    "",
    "请这样处理：",
    '1. 从仓库里找到 excali-style.json（根目录没有就找带 "$schema" 的那个 JSON），原样复制为 `<name>.json`，其中 <name> 是 JSON 里的 name 字段（两者必须一致）。',
    "2. 如果 JSON 里写了 preview，把那张图存为 `previews/<name>.png`。",
    "3. 只写这两个文件，不要动目录里其他包；写完把最终路径告诉我。",
  ].join("\n");
}

export interface StyleInstallInput {
  text: string;
  /** 已拿到的效果图字节；没有就不写图 */
  previewBytes?: Uint8Array;
}

export type StylePickResult =
  | { kind: "unavailable" }
  | { kind: "canceled" }
  | { kind: "picked"; path: string; text: string; previewBytes?: Uint8Array }
  | { kind: "read-error"; path: string };

/**
 * 宿主能力（index.ts 实现，面板只认这张接口）。
 * 读盘写盘都在宿主侧，React 树不碰思源 API。
 */
export interface StyleLibraryApi {
  list: () => Promise<StyleEntry[]>;
  /** 把插件自带的包拷进工作区（JSON + 效果图） */
  installBundled: (name: string) => Promise<{ name: string; wrotePreview: boolean }>;
  install: (input: StyleInstallInput) => Promise<{ name: string; wrotePreview: boolean }>;
  remove: (name: string) => Promise<void>;
  /** 系统文件管理器打开风格包目录；false = 非桌面端 */
  openDir: () => boolean;
  /** 工作区风格包目录的绝对路径（正斜杠；拿不到宿主路径时为空串） */
  dirAbs: () => string;
  fetchText: (url: string) => Promise<string>;
  /** 效果图下载失败返回 null（图是可选的，不能因此挡住装包） */
  fetchImage: (url: string) => Promise<Uint8Array | null>;
  /** 桌面端系统选择器；浏览器端返回 unavailable，面板回落 <input type=file> */
  pickFile: () => Promise<StylePickResult>;
  /** 预览图的 blob URL；拿不到返回空串 */
  previewSrc: (entry: Pick<StyleEntry, "preview" | "installed">) => Promise<string>;
  /** 预览图的绝对路径（复制给 Agent 用）；没有图返回空串 */
  previewAbs: (entry: Pick<StyleEntry, "preview" | "installed">) => string;
}

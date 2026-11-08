/**
 * 第五十三轮·批 1B：放映舞台——遮罩 + HUD。
 *
 * 第八十轮改版（对标 Excalidraw+ 的放映观感）：
 * - **不再压黑**：遮罩用**画布底色**盖住画框以外的内容，洞里就是画布本身，
 *   换页看上去是「整页翻过去」，不是「黑幕上开一扇窗」。开关仍在设置里。
 * - **底栏重做**：‹ / 第 n / N 页 ▾ / › / ⚙ / ⛶ / ■ 终止演示。点页码弹出
 *   **缩略图预览**（最多露 3 行，往下滚看更多）；进度点与右上 ✕ 退役。
 * - 设置气泡与抽屉共用同一份列表（PresentationSettingsMenu）。
 *
 * 相机动画期间 scrollX/scrollY/zoom 每帧都在变，所以遮罩洞用 rAF 直接改属性，
 * 不经过 React state——每帧 setState 会把整棵 StudioApp 拖着重渲染。
 *
 * 换算与 scene-point 同一套口径：屏幕 = (场景 + scroll) × zoom（相对画布左上角）。
 * 组件住在 .exs-canvas（relative）里，含块跟着画布走，思源右 Dock / 分栏时
 * 遮罩不会跑到视口边缘去（第三十八轮色板的教训）。
 */

import { useEffect, useRef, useState } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { t } from "../i18n";
import type { RunPlan } from "./presentation-run.ts";
import type { PresentationSettings } from "./settings";
import { FadeScroll, PresentationSettingsMenu, usePopoverDismiss } from "./PresentationSettingsMenu";

/** 洞比画框外扩这么多屏幕像素，避免内容贴着遮罩边 */
const HOLE_PAD = 10;
const HOLE_RADIUS = 14;

/** 设置：推子（与抽屉齿轮同一枚图标） */
const ICON_SLIDERS = "M4,7h8M17,7h3M4,12h3M11,12h9M4,17h8M17,17h3";

const ICON_CHEVRON = "M5,9L12,16L19,9";

const ICON_EXPAND = "M4,9V4h5M20,9V4h-5M4,15v5h5M20,15v5h-5";
const ICON_COLLAPSE = "M9,4v5H4M15,4v5h5M9,20v-5H4M15,20v-5h5";

/** 键位提示：进片场先露这么久，然后淡出（全屏时键位是唯一可发现入口） */
const HINT_LINGER_MS = 4500;
/** 鼠标进画布顶部这条带子就把提示唤回来 */
const HINT_REVEAL_BAND = 64;
/** 离开带子后再留一会儿才收，避免上下扫一下就闪没 */
const HINT_REHIDE_MS = 1200;

export function PresentationStage(props: {
  api: ExcalidrawImperativeAPI | null;
  /** 当前页的放映计划（画框几何来自进片场时的快照） */
  plan: RunPlan;
  /** 所有入片页的标题，下标与游标 page 一致 */
  titles: readonly string[];
  /** 所有入片页的画框 id，与 titles 同序——预览行靠它查缩略图 */
  frameIds: readonly string[];
  /**
   * 第八十轮：所有入片页的缩略图（画框 id → data URL）。
   * 点页码弹出的预览用它；缺项先显示占位，不阻塞翻页。
   */
  thumbs: Record<string, string>;
  page: number;
  /** 遮罩开关：关掉时只留 HUD（画框外不再盖住） */
  mask: boolean;
  /** 遮罩用的画布底色（与当前主题/背景一致，避免亮暗主题下出现色块） */
  maskColor: string;
  /** 放映偏好（设置气泡读它；改一项由宿主落盘） */
  settings: PresentationSettings;
  onSetting: <K extends keyof PresentationSettings>(key: K, value: PresentationSettings[K]) => void;
  /** 点进度/预览行 → 跳到那一页 */
  onJump: (page: number) => void;
  onExit: () => void;
  /** 自动前进秒数（0 = 没开；没开就不显示暂停键，免得给一个无效按钮） */
  autoAdvance: number;
  paused: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePause: () => void;
  /** 第八十轮：全屏状态与开关（与 F 键同一通道） */
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const holeRef = useRef<SVGRectElement | null>(null);
  const edgeRef = useRef<SVGRectElement | null>(null);
  const hudRef = useRef<HTMLDivElement | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const previewHostRef = useRef<HTMLDivElement | null>(null);
  const settingsHostRef = useRef<HTMLDivElement | null>(null);
  usePopoverDismiss(previewOpen, () => setPreviewOpen(false), previewHostRef);
  usePopoverDismiss(settingsOpen, () => setSettingsOpen(false), settingsHostRef);

  // 提示只配一次定时器：进场 4.5s 收；鼠标进顶部热区再露；离开 1.2s 后收。
  // 只切 opacity（CSS 过渡），不改 display，画布与底栏都不会因此位移。
  useEffect(() => {
    let hideTimer = 0;
    const hideLater = (ms: number): void => {
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setHintVisible(false), ms);
    };
    hideLater(HINT_LINGER_MS);

    let inBand = false;
    const onMove = (e: PointerEvent): void => {
      const hud = hudRef.current;
      if (!hud) return;
      const y = e.clientY - hud.getBoundingClientRect().top;
      const next = y >= 0 && y <= HINT_REVEAL_BAND;
      if (next === inBand) return;
      inBand = next;
      window.clearTimeout(hideTimer);
      if (next) setHintVisible(true);
      else hideLater(HINT_REHIDE_MS);
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.clearTimeout(hideTimer);
    };
  }, []);

  // 用画框 id 而不是 useId：同一工作区可能同时挂着多块画板（各自的 React root），
  // useId 的计数器按 root 走会撞；画框 id 全年工作区唯一。
  const maskId = "exs-present-hole-" + (props.plan.frameId.replace(/[^a-zA-Z0-9_-]/g, "") || "frame");

  useEffect(() => {
    if (!props.mask) return;
    let raf = 0;
    let last = "";
    const tick = (): void => {
      raf = window.requestAnimationFrame(tick);
      const svg = svgRef.current;
      const hole = holeRef.current;
      const api = props.api;
      if (!svg || !hole || !api) return;
      const st = api.getAppState();
      const zoom = st.zoom?.value || 1;
      const { x, y, w, h } = props.plan.box;
      const sx = (x + (st.scrollX || 0)) * zoom;
      const sy = (y + (st.scrollY || 0)) * zoom;
      const sw = w * zoom;
      const sh = h * zoom;
      const sig = `${sx.toFixed(2)},${sy.toFixed(2)},${sw.toFixed(2)},${sh.toFixed(2)}`;
      if (sig === last) return;
      last = sig;
      hole.setAttribute("x", String(sx - HOLE_PAD));
      hole.setAttribute("y", String(sy - HOLE_PAD));
      hole.setAttribute("width", String(Math.max(0, sw + HOLE_PAD * 2)));
      hole.setAttribute("height", String(Math.max(0, sh + HOLE_PAD * 2)));
      const edge = edgeRef.current;
      if (edge) {
        edge.setAttribute("x", String(sx - HOLE_PAD));
        edge.setAttribute("y", String(sy - HOLE_PAD));
        edge.setAttribute("width", String(Math.max(0, sw + HOLE_PAD * 2)));
        edge.setAttribute("height", String(Math.max(0, sh + HOLE_PAD * 2)));
      }
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [props.api, props.plan, props.mask]);

  const total = props.titles.length;
  const pageNo = props.page + 1;

  return (
    <>
      {props.mask ? (
        <svg ref={svgRef} className="exs-present-scrim" aria-hidden="true">
          <defs>
            <mask id={maskId}>
              <rect x="0" y="0" width="100%" height="100%" fill="#fff" />
              <rect ref={holeRef} x="0" y="0" width="0" height="0" rx={HOLE_RADIUS} ry={HOLE_RADIUS} fill="#000" />
            </mask>
          </defs>
          <rect
            className="exs-present-scrim__fill"
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill={props.maskColor}
            mask={`url(#${maskId})`}
          />
          <rect
            ref={edgeRef}
            className="exs-present-scrim__edge"
            x="0"
            y="0"
            width="0"
            height="0"
            rx={HOLE_RADIUS}
            ry={HOLE_RADIUS}
          />
        </svg>
      ) : null}

      <div className="exs-present-hud" ref={hudRef}>
        <div className="exs-present-hud__top">
          <span
            className={"exs-present-hud__keys" + (hintVisible ? "" : " exs-present-hud__keys--hidden")}
            aria-hidden={!hintVisible}
          >
            {props.autoAdvance > 0
              ? t("← → 翻页 · 空格 下一步 · P 暂停 · F 全屏 · Esc 退出")
              : t("← → 翻页 · 空格 下一步 · F 全屏 · Esc 退出")}
          </span>
        </div>

        <div className="exs-present-hud__bottom">
          <button
            type="button"
            className="exs-present-nav"
            title={t("上一页")}
            aria-label={t("上一页")}
            onClick={props.onPrev}
          >
            ‹
          </button>

          <div className="exs-present-menuhost" ref={previewHostRef}>
            <button
              type="button"
              className={"exs-present-counter" + (previewOpen ? " exs-present-counter--on" : "")}
              onClick={() => setPreviewOpen(!previewOpen)}
              title={t("幻灯片预览")}
              aria-label={t("幻灯片预览")}
              aria-expanded={previewOpen}
            >
              {t("第 {n} / {total} 页", { n: pageNo, total })}
              <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden="true">
                <path d={ICON_CHEVRON} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </button>
            {previewOpen ? (
              <div className="exs-present-preview" role="listbox" aria-label={t("幻灯片预览")}>
                <FadeScroll className="exs-present-preview__list">
                  {props.titles.map((label, i) => {
                    const url = props.thumbs[props.frameIds[i] ?? ""] ?? "";
                    return (
                      <button
                        key={i}
                        type="button"
                        role="option"
                        aria-selected={i === props.page}
                        className={"exs-present-preview__row" + (i === props.page ? " exs-present-preview__row--on" : "")}
                        onClick={() => {
                          setPreviewOpen(false);
                          props.onJump(i);
                        }}
                      >
                        <span className="exs-present-preview__thumb">
                          {url ? <img src={url} alt="" draggable={false} /> : <span className="exs-present-card__ph" />}
                        </span>
                        <span className="exs-present-preview__no">{i + 1}</span>
                        <span className="exs-present-preview__name">{label || t("第 {n} 页", { n: i + 1 })}</span>
                      </button>
                    );
                  })}
                </FadeScroll>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="exs-present-nav"
            title={t("下一页")}
            aria-label={t("下一页")}
            onClick={props.onNext}
          >
            ›
          </button>

          {props.autoAdvance > 0 ? (
            <button
              type="button"
              className={"exs-present-nav" + (props.paused ? " exs-present-nav--on" : "")}
              title={props.paused ? t("继续自动前进") : t("暂停自动前进")}
              aria-label={props.paused ? t("继续自动前进") : t("暂停自动前进")}
              aria-pressed={props.paused}
              onClick={props.onTogglePause}
            >
              {props.paused ? "▶" : "❚❚"}
            </button>
          ) : null}

          <span className="exs-present-hud__sep" aria-hidden="true" />

          <div className="exs-present-menuhost exs-present-menuhost--up" ref={settingsHostRef}>
            <button
              type="button"
              className={"exs-present-tool" + (settingsOpen ? " exs-present-tool--on" : "")}
              onClick={() => setSettingsOpen(!settingsOpen)}
              title={t("演示设置")}
              aria-label={t("演示设置")}
              aria-expanded={settingsOpen}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d={ICON_SLIDERS} />
                <circle cx="15" cy="7" r="2" />
                <circle cx="9" cy="12" r="2" />
                <circle cx="15" cy="17" r="2" />
              </svg>
            </button>
            {settingsOpen ? (
              <PresentationSettingsMenu settings={props.settings} onSetting={props.onSetting} />
            ) : null}
          </div>

          <button
            type="button"
            className={"exs-present-tool exs-present-tool--soft" + (props.fullscreen ? " exs-present-tool--on" : "")}
            title={props.fullscreen ? t("退出全屏") : t("全屏演示")}
            aria-label={props.fullscreen ? t("退出全屏") : t("全屏演示")}
            aria-pressed={props.fullscreen}
            onClick={props.onToggleFullscreen}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={props.fullscreen ? ICON_COLLAPSE : ICON_EXPAND} />
            </svg>
          </button>

          <button type="button" className="exs-present-stop" onClick={props.onExit} title={t("终止演示")}>
            <span className="exs-present-stop__mark" aria-hidden="true" />
            {t("终止演示")}
          </button>
        </div>
      </div>
    </>
  );
}

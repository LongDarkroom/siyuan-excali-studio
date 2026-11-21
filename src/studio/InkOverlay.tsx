/**
 * 描线覆盖层（见 presentation-ink 的文件头）：画布上方的一层 SVG，
 * 内容 = 终态 roughjs 操作流的原样拷贝，外加一条沿骨架增长的遮罩带。
 *
 * 每帧只改两个属性：遮罩路径的 `d` 和相机变换；不经过 React 重渲染。
 * 坐标系与幕布一致：屏幕 =（场景 + scroll）× zoom（相对画布左上角），
 * 所以路径放在元素局部坐标里、外层套 `translate(x, y)`，再统一吃相机变换。
 * 描线中的元素两端箭头尖不在覆盖层里——收笔那一下随画布元素一起出现，
 * 与历来的收笔表现一致。
 *
 * 相机跟随的 rAF 只在有元素在画时跑（没有覆盖层就停），别让空闲的板子
 * 一直每帧读 appState。
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { traceRevealPoints, type StrokePath } from "./presentation-draw.ts";
import type { InkShape } from "./presentation-ink.ts";

const NS = "http://www.w3.org/2000/svg";

export type InkItem = {
  id: string;
  shape: InkShape;
  path: StrokePath;
  /** 元素原点（points 相对它） */
  x: number;
  y: number;
  /** 目标不透明度 0..100（覆盖层替画布元素出场） */
  opacity: number;
};

export type InkHandle = {
  begin(items: readonly InkItem[]): void;
  reveal(id: string, p: number): void;
  end(id: string): void;
  clear(): void;
};

type Entry = {
  group: SVGGElement;
  reveal: SVGPathElement;
  path: StrokePath;
  lastP: number;
};

let inkSeq = 0;

function el<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
  return document.createElementNS(NS, tag);
}

function revealD(path: StrokePath, p: number): string {
  const pts = traceRevealPoints(path, p);
  if (pts.length === 0) return "";
  if (pts.length === 1) {
    // 单个点也要有笔头：零长线段配圆头就是一个点
    const [x, y] = pts[0];
    return `M ${x} ${y} L ${x} ${y}`;
  }
  return "M " + pts.map((q) => `${q[0]} ${q[1]}`).join(" L ");
}

export const InkOverlay = forwardRef<InkHandle, { api: ExcalidrawImperativeAPI | null }>(
  function InkOverlay(props, ref) {
    const camRef = useRef<SVGGElement | null>(null);
    const entriesRef = useRef(new Map<string, Entry>());
    const prefixRef = useRef(0);
    const apiRef = useRef(props.api);
    const rafRef = useRef(0);
    if (prefixRef.current === 0) prefixRef.current = ++inkSeq;

    apiRef.current = props.api;

    /** 相机：屏幕 =（场景 + scroll）× zoom，与幕布同一套口径 */
    const syncCamera = useRef<() => void>(() => {});
    syncCamera.current = () => {
      const api = apiRef.current;
      const cam = camRef.current;
      if (!api || !cam) return;
      const st = api.getAppState();
      const zoom = st.zoom?.value || 1;
      cam.setAttribute(
        "transform",
        `scale(${zoom}) translate(${st.scrollX || 0} ${st.scrollY || 0})`,
      );
    };

    const loop = useRef<{ start: () => void; stop: () => void }>({ start: () => {}, stop: () => {} });
    loop.current.start = () => {
      if (rafRef.current) return;
      const tick = (): void => {
        rafRef.current = window.requestAnimationFrame(tick);
        syncCamera.current();
      };
      rafRef.current = window.requestAnimationFrame(tick);
    };
    loop.current.stop = () => {
      if (!rafRef.current) return;
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
    useEffect(() => () => loop.current.stop(), []);

    useImperativeHandle(
      ref,
      () => ({
        begin(items) {
          const cam = camRef.current;
          if (!cam) return;
          for (const item of items) {
            if (entriesRef.current.has(item.id)) continue;
            const maskId = `exs-ink-${prefixRef.current}-${item.id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
            const group = el("g");
            group.setAttribute("transform", `translate(${item.x} ${item.y})`);
            group.setAttribute("opacity", String(Math.max(0, Math.min(100, item.opacity)) / 100));

            const mask = el("mask");
            mask.setAttribute("id", maskId);
            mask.setAttribute("maskUnits", "userSpaceOnUse");
            mask.setAttribute("x", "-100000");
            mask.setAttribute("y", "-100000");
            mask.setAttribute("width", "200000");
            mask.setAttribute("height", "200000");
            const backdrop = el("rect");
            backdrop.setAttribute("x", "-100000");
            backdrop.setAttribute("y", "-100000");
            backdrop.setAttribute("width", "200000");
            backdrop.setAttribute("height", "200000");
            backdrop.setAttribute("fill", "#000");
            const reveal = el("path");
            reveal.setAttribute("fill", "none");
            reveal.setAttribute("stroke", "#fff");
            reveal.setAttribute("stroke-width", String(item.shape.band * 2));
            reveal.setAttribute("stroke-linecap", "round");
            reveal.setAttribute("stroke-linejoin", "round");
            mask.append(backdrop, reveal);

            const ink = el("g");
            ink.setAttribute("mask", `url(#${maskId})`);
            for (const s of item.shape.strokes) {
              const p = el("path");
              p.setAttribute("d", s.d);
              p.setAttribute("fill", "none");
              p.setAttribute("stroke", s.stroke);
              p.setAttribute("stroke-width", String(s.width));
              p.setAttribute("stroke-linecap", "round");
              p.setAttribute("stroke-linejoin", "round");
              if (s.dash) p.setAttribute("stroke-dasharray", s.dash);
              ink.appendChild(p);
            }
            group.append(mask, ink);
            cam.appendChild(group);
            entriesRef.current.set(item.id, { group, reveal, path: item.path, lastP: -1 });
          }
          if (entriesRef.current.size > 0) {
            syncCamera.current();
            loop.current.start();
          }
        },
        reveal(id, p) {
          const e = entriesRef.current.get(id);
          if (!e) return;
          const q = Math.max(0, Math.min(1, p));
          if (e.lastP >= 0 && Math.abs(q - e.lastP) < 0.0005) return;
          e.lastP = q;
          e.reveal.setAttribute("d", revealD(e.path, q));
        },
        end(id) {
          const e = entriesRef.current.get(id);
          if (!e) return;
          e.group.remove();
          entriesRef.current.delete(id);
          if (entriesRef.current.size === 0) loop.current.stop();
        },
        clear() {
          for (const e of entriesRef.current.values()) e.group.remove();
          entriesRef.current.clear();
          loop.current.stop();
        },
      }),
      [],
    );

    return (
      <div className="exs-ink-layer" aria-hidden="true">
        <svg className="exs-ink-svg">
          <g ref={camRef} />
        </svg>
      </div>
    );
  },
);

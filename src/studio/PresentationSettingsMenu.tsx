/**
 * 第八十轮：**统一演示设置列表**——抽屉齿轮与放映底栏齿轮共用这一份。
 *
 * 为什么抽出来：两处入口若各写一套，文案、分组、滑块区间迟早分叉；
 * 用户也会发现「同一个开关在两边行为不同」。这里只读设置、只发意图，
 * 落盘与「哪些项即时生效」由 StudioApp 决定（放映中有的项只能下一步生效）。
 *
 * 外观是**气泡**：尾巴（小啾啾）由宿主容器的 CSS 画在按钮那一侧，
 * 本组件不关心自己挂在哪；滚动条一律隐藏，内容溢出时用底部渐隐提示还有更多。
 */

import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { t } from "../i18n";
import type { PresentationSettings } from "./settings";

/** 自动前进是开关而不是滑杆：统一 10 秒/页，设置表一行就能说清 */
const AUTO_ADVANCE_SECONDS = 10;

/**
 * 隐藏原生滚动条的滚动容器：内容溢出且没滚到底时，底部渐隐。
 * 用 class 而不是内联样式，暗色主题的渐隐遮罩由 CSS 变量接管。
 */
export function FadeScroll(props: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const more = el.scrollHeight > el.clientHeight + 1 && el.scrollTop + el.clientHeight < el.scrollHeight - 1;
    el.classList.toggle("exs-present-scroll--more", more);
  }, []);
  // 内容高度变化（缩略图晚到、设置分组渲染完）没有 resize 事件：每次渲染补一次
  useLayoutEffect(update);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    ro?.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro?.disconnect();
    };
  }, [update]);
  return (
    <div ref={ref} className={"exs-present-scroll" + (props.className ? " " + props.className : "")}>
      {props.children}
    </div>
  );
}

/** 预览/设置浮层的气泡尾巴由 CSS 画；这里只管把焦点收住（Esc 由宿主统一收） */
export function usePopoverDismiss(
  open: boolean,
  onClose: () => void,
  hostRef: React.RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent): void => {
      const target = e.target as Node | null;
      if (target && hostRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [onClose, open, hostRef]);
}

function ToggleRow(props: {
  label: string;
  checked: boolean;
  title?: string;
  onChange: (on: boolean) => void;
}) {
  return (
    <label className="exs-present-set" title={props.title}>
      <span className="exs-present-set__label">{props.label}</span>
      {/*
        为什么不用 input：主题（如 Neo）会用 `input[type=checkbox]:not(.b3-switch)`
        的 0,2,1 特异性把复选框压成 16px 并叠 mask，滑块直接消失。
        button + role=switch 不在那条规则里，键盘/读屏语义也由自己兜住。
      */}
      <button
        type="button"
        role="switch"
        aria-checked={props.checked}
        aria-label={props.label}
        className="exs-present-switch"
        onClick={() => props.onChange(!props.checked)}
      />
    </label>
  );
}

export function PresentationSettingsMenu(props: {
  settings: PresentationSettings;
  onSetting: <K extends keyof PresentationSettings>(key: K, value: PresentationSettings[K]) => void;
}) {
  const st = props.settings;
  return (
    <section className="exs-present-menu" role="group" aria-label={t("演示设置")}>
      <header className="exs-present-menu__head">
        {t("演示设置")}
        <span>{t("自动保存")}</span>
      </header>
      <FadeScroll className="exs-present-menu__body">
        <div className="exs-present-group">{t("画面")}</div>
        <ToggleRow label={t("遮罩画框外")} checked={st.scrim} onChange={(v) => props.onSetting("scrim", v)} />
        <ToggleRow label={t("放映时隐藏网格")} checked={st.hideGrid} onChange={(v) => props.onSetting("hideGrid", v)} />

        <div className="exs-present-group">{t("出场效果")}</div>
        <ToggleRow label={t("逐条出场")} checked={st.reveal} onChange={(v) => props.onSetting("reveal", v)} />
        <ToggleRow label={t("打字机效果")} checked={st.typewriter} onChange={(v) => props.onSetting("typewriter", v)} />

        <div className="exs-present-group">{t("播放")}</div>
        <ToggleRow
          label={t("自动前进")}
          title={t("每页停留 10 秒后自动翻页")}
          checked={st.autoAdvance > 0}
          onChange={(on) => props.onSetting("autoAdvance", on ? AUTO_ADVANCE_SECONDS : 0)}
        />
        <ToggleRow
          label={t("方向键沿边导航")}
          checked={st.directional}
          onChange={(v) => props.onSetting("directional", v)}
        />
        <ToggleRow
          label={t("开始演示时全屏")}
          checked={st.fullscreen}
          onChange={(v) => props.onSetting("fullscreen", v)}
        />
      </FadeScroll>
    </section>
  );
}

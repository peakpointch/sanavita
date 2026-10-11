import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useWebflowContext } from "@webflow/react";

import { useTab, useTabAutoplay, useTabs } from "./tabs-hooks";
import type { TabId } from "./tabs-events";
import { useMobileWheelDrag } from "./wheel-hooks";
import {
  DEFAULT_WHEEL_HEADING,
  DEFAULT_WHEEL_ID,
  DEFAULT_WHEEL_LAYOUT,
  WHEEL_CONTENT_TRANSITION_DURATION,
  type WheelTabMetadata,
  type WheelLayout,
} from "./wheel-utils";
import { FullWheel, MobileMiniWheel, WheelPanel } from "./WheelViews";

export type WheelItemProps = {
  wheelId?: string;
  tabId?: TabId;
  label?: string;
  description?: ReactNode;
};

export function WheelItem({
  wheelId = DEFAULT_WHEEL_ID,
  tabId = 1,
  label = "Mehr",
  description,
}: WheelItemProps) {
  const tabMetadata = useMemo(() => ({ label }), [label]);
  const isActive = useTab(wheelId, tabId, tabMetadata);
  const [isMounted, setIsMounted] = useState(tabId === 1);
  const [isContentVisible, setIsContentVisible] = useState(tabId === 1);
  const transitionTimeout = useRef<number | null>(null);
  const transitionFrame = useRef<number | null>(null);
  const transitionId = useRef(0);
  const hasInitializedTransition = useRef(false);

  function clearContentTransition() {
    if (transitionTimeout.current !== null) {
      window.clearTimeout(transitionTimeout.current);
      transitionTimeout.current = null;
    }

    if (transitionFrame.current !== null) {
      window.cancelAnimationFrame(transitionFrame.current);
      transitionFrame.current = null;
    }
  }

  useEffect(() => {
    const currentTransitionId = ++transitionId.current;
    clearContentTransition();

    if (!hasInitializedTransition.current) {
      hasInitializedTransition.current = true;
      return clearContentTransition;
    }

    setIsContentVisible(false);

    if (isActive) {
      setIsMounted(false);
      transitionTimeout.current = window.setTimeout(() => {
        if (currentTransitionId !== transitionId.current) return;

        setIsMounted(true);
        transitionFrame.current = window.requestAnimationFrame(() => {
          if (currentTransitionId !== transitionId.current) return;

          setIsContentVisible(true);
          transitionFrame.current = null;
        });
        transitionTimeout.current = null;
      }, WHEEL_CONTENT_TRANSITION_DURATION);
      return;
    }

    transitionTimeout.current = window.setTimeout(() => {
      if (currentTransitionId !== transitionId.current) return;

      setIsMounted(false);
      transitionTimeout.current = null;
    }, WHEEL_CONTENT_TRANSITION_DURATION);

    return clearContentTransition;
  }, [isActive]);

  return (
    <div
      data-wheel-item="true"
      data-wheel-id={wheelId}
      data-wheel-tab-id={tabId}
      hidden={!isMounted}
      aria-hidden={!isActive}
      className="transition-opacity duration-300 ease-in-out"
      style={{
        display: !isMounted ? "none" : undefined,
        opacity: isActive && isContentVisible ? 1 : 0,
        pointerEvents: isActive ? undefined : "none",
      }}
    >
      {description}
    </div>
  );
}

type WheelProps = {
  wheelId?: string;
  visibility?: boolean;
  initialTabId?: TabId;
  layout?: WheelLayout;
  heading?: string;
  children?: ReactNode;
  autoplay?: {
    enabled: boolean;
    delay: number;
  };
};

export function Wheel({
  wheelId = DEFAULT_WHEEL_ID,
  visibility = true,
  initialTabId = 1,
  layout = DEFAULT_WHEEL_LAYOUT,
  heading = DEFAULT_WHEEL_HEADING,
  children,
  autoplay: autoplayConfig = { enabled: false, delay: 10000 },
}: WheelProps) {
  const { mode } = useWebflowContext();
  const isAnimationAllowed = mode === "preview" || mode === "publish";
  const isAutoplayEnabled = autoplayConfig.enabled && isAnimationAllowed;
  const [hasMounted, setHasMounted] = useState(false);
  const [isInViewport, setIsInViewport] = useState(true);
  const id = useRef(`wheel-${Math.random().toString(36).slice(2)}`).current;
  const wheelRootRef = useRef<HTMLDivElement | null>(null);
  const tabs = useTabs<WheelTabMetadata>({
    groupId: wheelId,
    initialTabId,
  });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const element = wheelRootRef.current;

    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting && entry.intersectionRatio >= 0.25);
      },
      { threshold: [0, 0.25] },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const autoplay = useTabAutoplay({
    enabled: isAutoplayEnabled,
    delay: autoplayConfig.delay,
    activeTabId: tabs.activeTabId,
    hasTabs: tabs.tabs.length > 0,
    suspended: !isInViewport,
    onAdvance: tabs.selectNextTab,
  });

  const mobileDragHandlers = useMobileWheelDrag();

  function selectTab(tabId: TabId) {
    if (isAutoplayEnabled && tabId === tabs.activeTabId) {
      if (autoplay.status === "running") {
        autoplay.pause();
      } else if (autoplay.status === "paused") {
        autoplay.resume();
      }
    } else {
      tabs.selectTab(tabId);
      autoplay.pause();
    }
  }

  if (!visibility) return null;

  const wheelViewProps = {
    id,
    tabs: tabs.tabs,
    activeTabId: tabs.activeTabId,
    hasMounted,
    autoplayDelay: autoplayConfig.delay,
    isAutoplayEnabled: autoplay.status === "running",
    isInViewport,
    onSelect: selectTab,
    onKeyDown: tabs.handleKeyDown,
  };

  return (
    <div ref={wheelRootRef} className="wf w-full md:p-14 md:pt-17">
      <div className="relative">
        {layout === "mini" && <MobileMiniWheel {...wheelViewProps} heading={heading} />}

        <FullWheel {...wheelViewProps} {...mobileDragHandlers} layout={layout} />

        <WheelPanel id={id} activeTabId={tabs.activeTabId} layout={layout}>
          {children}
        </WheelPanel>
      </div>

      {hasMounted && !tabs.tabs.length && <div>Keine Einträge</div>}
    </div>
  );
}

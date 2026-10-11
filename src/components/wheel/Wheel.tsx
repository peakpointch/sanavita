import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useWebflowContext } from "@webflow/react";

import { useTab, useTabAutoplay, useTabs } from "./tabs-hooks";
import { useMobileWheelDrag } from "./wheel-hooks";
import {
  toZeroBasedIndex,
  DEFAULT_WHEEL_HEADING,
  DEFAULT_WHEEL_ID,
  DEFAULT_WHEEL_LAYOUT,
  WHEEL_CONTENT_TRANSITION_DURATION,
  type WheelTabMetadata,
  type WheelLayout,
} from "./wheel-utils";
import { FullWheel, MobileMiniWheel, WheelPanel } from "./WheelViews";

type WheelItemProps = {
  wheelId?: string;
  index?: number;
  visibility?: boolean;
  label?: string;
  description?: ReactNode;
};

function WheelItem({
  wheelId = DEFAULT_WHEEL_ID,
  index = 1,
  visibility = true,
  label = "Mehr",
  description,
}: WheelItemProps) {
  const zeroBasedIndex = toZeroBasedIndex(index);
  const tabMetadata = useMemo(() => ({ label, visible: visibility }), [label, visibility]);
  const isActive = useTab(wheelId, zeroBasedIndex, tabMetadata);
  const [isMounted, setIsMounted] = useState(zeroBasedIndex === 0);
  const [isContentVisible, setIsContentVisible] = useState(zeroBasedIndex === 0);
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

  if (!visibility) return null;

  return (
    <div
      data-wheel-item="true"
      data-wheel-id={wheelId}
      data-wheel-index={index}
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
  tabCount?: number;
  startIndex?: number;
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
  tabCount = 1,
  startIndex = 1,
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
    tabCount,
    initialIndex: toZeroBasedIndex(startIndex),
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
    activeTabIndex: tabs.activeIndex,
    tabCount,
    suspended: !isInViewport,
    onAdvance: tabs.selectNextTab,
  });

  const mobileDragHandlers = useMobileWheelDrag();

  function selectTab(index: number) {
    if (isAutoplayEnabled && index === tabs.activeIndex) {
      if (autoplay.status === "running") {
        autoplay.pause();
      } else if (autoplay.status === "paused") {
        autoplay.resume();
      }
    } else {
      tabs.selectTab(index);
      autoplay.pause();
    }
  }

  if (!visibility) return null;

  const wheelViewProps = {
    id,
    count: tabCount,
    activeTabIndex: tabs.activeIndex,
    registeredTabs: tabs.registeredTabs,
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

        <WheelPanel id={id} activeTabIndex={tabs.activeIndex} layout={layout}>
          {children}
        </WheelPanel>
      </div>

      {!tabCount && <div>Keine Einträge</div>}
    </div>
  );
}

Wheel.Item = WheelItem;

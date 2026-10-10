import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { useWebflowContext } from "@webflow/react";

import {
  VALUES_WHEEL_ITEM_REGISTER,
  VALUES_WHEEL_ITEM_UNREGISTER,
  VALUES_WHEEL_SELECT,
  type ValuesWheelItemRegisterDetail,
  type ValuesWheelItemUnregisterDetail,
  type ValuesWheelSelectDetail,
} from "./values-wheel-events";
import { useMobileWheelDrag, useValuesWheelRegistry } from "./values-wheel-hooks";
import {
  clampTabIndex,
  DEFAULT_VALUES_WHEEL_HEADING,
  DEFAULT_VALUES_WHEEL_ID,
  DEFAULT_VALUES_WHEEL_LAYOUT,
  toZeroBasedIndex,
  VALUES_WHEEL_CONTENT_TRANSITION_DURATION,
  type ValuesWheelLayout,
} from "./values-wheel-utils";
import { FullWheel, MobileMiniWheel, ValuesWheelPanel } from "./ValuesWheelViews";

type ValuesWheelItemProps = {
  wheelId?: string;
  index?: number;
  visibility?: boolean;
  label?: string;
  description?: ReactNode;
};

function ValuesWheelItem({
  wheelId = DEFAULT_VALUES_WHEEL_ID,
  index = 1,
  visibility = true,
  label = "Mehr",
  description,
}: ValuesWheelItemProps) {
  const zeroBasedIndex = toZeroBasedIndex(index);
  const [isActive, setIsActive] = useState(zeroBasedIndex === 0);
  const [isMounted, setIsMounted] = useState(zeroBasedIndex === 0);
  const [isContentVisible, setIsContentVisible] = useState(zeroBasedIndex === 0);
  const transitionTimeout = useRef<number | null>(null);
  const transitionFrame = useRef<number | null>(null);

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
    const handleSelect = (event: Event) => {
      const detail = (event as CustomEvent<ValuesWheelSelectDetail>).detail;

      if (detail?.wheelId !== wheelId) return;

      const nextIsActive = detail.index === zeroBasedIndex;

      if (nextIsActive === isActive) return;

      clearContentTransition();
      setIsActive(nextIsActive);
      setIsContentVisible(false);

      if (nextIsActive) {
        setIsMounted(false);
        transitionTimeout.current = window.setTimeout(() => {
          setIsMounted(true);
          transitionFrame.current = window.requestAnimationFrame(() => {
            setIsContentVisible(true);
            transitionFrame.current = null;
          });
          transitionTimeout.current = null;
        }, VALUES_WHEEL_CONTENT_TRANSITION_DURATION);
        return;
      }

      transitionTimeout.current = window.setTimeout(() => {
        setIsMounted(false);
        transitionTimeout.current = null;
      }, VALUES_WHEEL_CONTENT_TRANSITION_DURATION);
    };

    window.addEventListener(VALUES_WHEEL_SELECT, handleSelect);

    return () => {
      window.removeEventListener(VALUES_WHEEL_SELECT, handleSelect);
    };
  }, [isActive, wheelId, zeroBasedIndex]);

  useEffect(() => clearContentTransition, []);

  useEffect(() => {
    const detail: ValuesWheelItemRegisterDetail = {
      wheelId,
      index: zeroBasedIndex,
      label,
      visible: visibility,
    };

    window.dispatchEvent(new CustomEvent(VALUES_WHEEL_ITEM_REGISTER, { detail }));

    return () => {
      const unregisterDetail: ValuesWheelItemUnregisterDetail = {
        wheelId,
        index: zeroBasedIndex,
      };

      window.dispatchEvent(
        new CustomEvent(VALUES_WHEEL_ITEM_UNREGISTER, { detail: unregisterDetail }),
      );
    };
  }, [zeroBasedIndex, label, visibility, wheelId]);

  if (!visibility) return null;

  return (
    <div
      data-values-wheel-item="true"
      data-values-wheel-id={wheelId}
      data-values-wheel-index={index}
      hidden={!isMounted}
      aria-hidden={!isActive}
      className="transition-opacity duration-300 ease-in-out"
      style={{
        display: !isMounted ? "none" : undefined,
        opacity: isContentVisible ? 1 : 0,
      }}
    >
      {description}
    </div>
  );
}

type ValuesWheelProps = {
  wheelId?: string;
  visibility?: boolean;
  tabCount?: number;
  startIndex?: number;
  layout?: ValuesWheelLayout;
  heading?: string;
  children?: ReactNode;
  autoPlay: boolean;
  autoPlayDuration: number;
};

export function ValuesWheel({
  wheelId = DEFAULT_VALUES_WHEEL_ID,
  visibility = true,
  tabCount = 1,
  startIndex = 1,
  layout = DEFAULT_VALUES_WHEEL_LAYOUT,
  heading = DEFAULT_VALUES_WHEEL_HEADING,
  children,
  autoPlay = true,
  autoPlayDuration = 10000,
}: ValuesWheelProps) {
  const { mode } = useWebflowContext();
  const isAutoPlayAllowed = mode === "preview" || mode === "publish";
  const autoPlayConfigured = autoPlay && isAutoPlayAllowed;
  const [currentTabIndex, setCurrentTabIndex] = useState(toZeroBasedIndex(startIndex));
  const [hasMounted, setHasMounted] = useState(false);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(autoPlayConfigured);
  const [isInViewport, setIsInViewport] = useState(true);
  const id = useRef(`values-wheel-${Math.random().toString(36).slice(2)}`).current;
  const wheelRootRef = useRef<HTMLDivElement | null>(null);
  const autoPlayRemainingRef = useRef(autoPlayDuration);
  const activeTabIndex = clampTabIndex(currentTabIndex, tabCount);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    setIsAutoPlayEnabled(autoPlayConfigured);
  }, [autoPlayConfigured]);

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

  useEffect(() => {
    setCurrentTabIndex(toZeroBasedIndex(startIndex));
  }, [startIndex]);

  useEffect(() => {
    autoPlayRemainingRef.current = autoPlayDuration;
  }, [currentTabIndex, autoPlayDuration]);

  useEffect(() => {
    const shouldAutoPlay = isAutoPlayEnabled && isInViewport && tabCount >= 1;
    if (!shouldAutoPlay) return;

    const duration = Math.max(0, autoPlayRemainingRef.current);
    const startedAt = performance.now();
    const timeout = window.setTimeout(() => {
      autoPlayRemainingRef.current = 0;
      setCurrentTabIndex((current) => (current + 1) % tabCount);
    }, duration);

    return () => {
      autoPlayRemainingRef.current = Math.max(0, duration - (performance.now() - startedAt));
      window.clearTimeout(timeout);
    };
  }, [currentTabIndex, autoPlayDuration, tabCount, isAutoPlayEnabled, isInViewport]);

  const registeredItems = useValuesWheelRegistry(wheelId, activeTabIndex);
  const mobileDragHandlers = useMobileWheelDrag();

  function selectTab(index: number) {
    if (autoPlayConfigured && index === activeTabIndex) {
      setIsAutoPlayEnabled((enabled) => !enabled);
    } else {
      setCurrentTabIndex(index);
      setIsAutoPlayEnabled(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    const buttons = Array.from(
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button") ?? [],
    );
    const currentPosition = buttons.findIndex(
      (button) => Number(button.dataset.valuesWheelIndex) === index,
    );

    if (currentPosition === -1 || buttons.length === 0) return;

    event.preventDefault();

    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextPosition = (currentPosition + direction + buttons.length) % buttons.length;
    const nextButton = buttons[nextPosition];

    nextButton.focus();
    nextButton.click();
  }

  if (!visibility) return null;

  const wheelViewProps = {
    id,
    count: tabCount,
    activeTabIndex,
    registeredItems,
    hasMounted,
    autoPlayDuration,
    isAutoPlayEnabled,
    isInViewport,
    onSelect: selectTab,
    onKeyDown: handleKeyDown,
  };

  return (
    <div ref={wheelRootRef} className="wf w-full md:p-14 md:pt-17">
      <div className="relative">
        {layout === "mini" && <MobileMiniWheel {...wheelViewProps} heading={heading} />}

        <FullWheel {...wheelViewProps} {...mobileDragHandlers} layout={layout} />

        <ValuesWheelPanel id={id} activeTabIndex={activeTabIndex} layout={layout}>
          {children}
        </ValuesWheelPanel>
      </div>

      {!tabCount && <div>Keine Einträge</div>}
    </div>
  );
}

ValuesWheel.Item = ValuesWheelItem;

import { cn } from "@/lib/utils";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import type { useMobileWheelDrag } from "./wheel-hooks";
import type { TabId } from "./tabs-events";
import type { RegisteredTab } from "./tabs-hooks";
import {
  formatItemNumber,
  getWheelRotation,
  type WheelTabMetadata,
  type WheelLayout,
  DESKTOP_ACTIVE_TAB_ROTATION,
  DESKTOP_ROTATION_DIRECTION,
  MOBILE_ACTIVE_TAB_ROTATION,
  MOBILE_ROTATION_DIRECTION,
  WHEEL_BUTTON_TRANSITION_DURATION,
  WHEEL_PAUSE_TRANSITION_DURATION,
} from "./wheel-utils";

type SelectTab = (tabId: TabId) => void;
type HandleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, tabId: TabId) => void;

type WheelViewProps = {
  id: string;
  tabs: RegisteredTab<WheelTabMetadata>[];
  activeTabId: TabId | null;
  hasMounted: boolean;
  autoplayDelay: number;
  isAutoplayEnabled: boolean;
  isInViewport: boolean;
  onSelect: SelectTab;
  onKeyDown: HandleKeyDown;
};

type MobileMiniWheelProps = WheelViewProps & {
  heading: string;
};

function useTransitioningFromTabId(activeTabId: TabId | null, isAutoplayEnabled: boolean) {
  const previousRef = useRef({ tabId: activeTabId, isAutoplayEnabled });
  const [transitioningFromTabId, setTransitioningFromTabId] = useState<TabId | null>(null);
  const hasSelectionChanged = previousRef.current.tabId !== activeTabId;
  const previousWasAutoplaying = previousRef.current.isAutoplayEnabled;
  const renderedTransitioningTabId = hasSelectionChanged
    ? previousRef.current.tabId
    : transitioningFromTabId;

  useEffect(() => {
    if (previousRef.current.tabId === activeTabId) return;

    const previous = previousRef.current;
    previousRef.current = { tabId: activeTabId, isAutoplayEnabled };

    if (!previous.isAutoplayEnabled || !isAutoplayEnabled) {
      setTransitioningFromTabId(null);
      return;
    }

    setTransitioningFromTabId(previous.tabId);
    const timeout = window.setTimeout(() => {
      setTransitioningFromTabId(null);
    }, WHEEL_BUTTON_TRANSITION_DURATION);

    return () => window.clearTimeout(timeout);
  }, [isAutoplayEnabled, activeTabId]);

  return previousWasAutoplaying && isAutoplayEnabled ? renderedTransitioningTabId : null;
}

type AutoplayPausePhase = "running" | "pausing" | "paused" | "restarting";

function useAutoplayPauseTransition(
  activeTabId: TabId | null,
  isAutoplayEnabled: boolean,
  isInViewport: boolean,
) {
  const isAutoplayPaused = !isAutoplayEnabled || !isInViewport;
  const previousRef = useRef({ activeTabId, isAutoplayPaused });
  const [phase, setPhase] = useState<AutoplayPausePhase>(isAutoplayPaused ? "paused" : "running");
  const [pausedTabId, setPausedTabId] = useState<TabId | null>(null);
  const hasJustPaused =
    !previousRef.current.isAutoplayPaused &&
    isAutoplayPaused &&
    previousRef.current.activeTabId === activeTabId;
  const hasJustRestarted =
    previousRef.current.isAutoplayPaused &&
    !isAutoplayPaused &&
    previousRef.current.activeTabId === activeTabId;
  const isPauseTarget = pausedTabId === activeTabId || hasJustPaused || hasJustRestarted;

  useEffect(() => {
    const previous = previousRef.current;
    previousRef.current = { activeTabId, isAutoplayPaused };

    if (previous.isAutoplayPaused !== isAutoplayPaused) {
      if (isAutoplayPaused) {
        if (previous.activeTabId !== activeTabId) {
          setPausedTabId(null);
          setPhase("paused");
          return;
        }

        setPausedTabId(activeTabId);
        setPhase("pausing");
        const timeout = window.setTimeout(() => {
          setPhase("paused");
        }, WHEEL_PAUSE_TRANSITION_DURATION);

        return () => window.clearTimeout(timeout);
      }

      if (previous.activeTabId !== activeTabId) {
        setPausedTabId(null);
        setPhase("running");
        return;
      }

      setPhase("restarting");
      const timeout = window.setTimeout(() => {
        setPhase("running");
        setPausedTabId(null);
      }, WHEEL_PAUSE_TRANSITION_DURATION);

      return () => window.clearTimeout(timeout);
    }

    if (previous.activeTabId !== activeTabId) {
      setPausedTabId(null);
      setPhase(isAutoplayPaused ? "paused" : "running");
    }
  }, [isAutoplayPaused, activeTabId]);

  return {
    isPauseTarget,
    isAutoplayPaused,
    isPauseTransition:
      hasJustPaused || hasJustRestarted || phase === "pausing" || phase === "restarting",
  };
}

export function MobileMiniWheel({
  id,
  tabs,
  activeTabId,
  hasMounted,
  autoplayDelay,
  isAutoplayEnabled,
  isInViewport,
  heading,
  onSelect,
  onKeyDown,
}: MobileMiniWheelProps) {
  const activeTabPosition = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === activeTabId),
  );
  const transitioningFromTabId = useTransitioningFromTabId(activeTabId, isAutoplayEnabled);
  const { isPauseTarget, isAutoplayPaused, isPauseTransition } = useAutoplayPauseTransition(
    activeTabId,
    isAutoplayEnabled,
    isInViewport,
  );

  return (
    <div className="md:hidden">
      <div
        className={cn(
          "@container relative mx-auto aspect-square w-[calc(100%-var(--mini-button-size))]",
          "rounded-full border border-beige-200 bg-brand-50",
          !tabs.length && "hidden",
        )}
        style={
          {
            "--mini-button-size": "4rem",
            "--mini-inactive-button-size": "3rem",
          } as CSSProperties
        }
      >
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center px-8 text-center">
          <span className="text-3xl font-semibold text-black">{heading}</span>
        </div>
        <div role="tablist" aria-label="Werte" className="block">
          {tabs.map((tab, tabPosition) => {
            const tabId = tab.id;
            const isActive = activeTabId === tabId;
            const isTransitioningFrom = transitioningFromTabId === tabId;
            const isCollapsing =
              isTransitioningFrom || (isActive && isPauseTarget && isAutoplayPaused);
            const rotation = getWheelRotation(
              tabPosition,
              tabs.length,
              activeTabPosition,
              MOBILE_ACTIVE_TAB_ROTATION,
              MOBILE_ROTATION_DIRECTION,
            );

            return (
              <button
                key={tabId}
                id={`${id}-mini-tab-${tabId}`}
                data-tab-id={tabId}
                data-wheel-tab-id={tabId}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${id}-panel-${activeTabId}`}
                tabIndex={0}
                onClick={() => onSelect(tabId)}
                onKeyDown={(event) => onKeyDown(event, tabId)}
                className={cn(
                  "absolute top-1/2 left-1/2 z-10",
                  "flex cursor-pointer! items-center justify-center rounded-full border text-center",
                  hasMounted &&
                    "transition-[width,height,transform,background-color,border-color] duration-1000 ease-in-out",
                  "hover:border-beige-200 hover:bg-brand-50",
                  isActive
                    ? "h-(--mini-button-size) w-(--mini-button-size) border-beige-200 bg-brand-50"
                    : "h-(--mini-inactive-button-size) w-(--mini-inactive-button-size) border-border bg-beige-100",
                )}
                style={
                  {
                    transform: `
                      translate(-50%, -50%)
                      rotate(${rotation}deg)
                      translate(50cqw)
                      rotate(${-rotation}deg)
                    `,
                  } as CSSProperties
                }
              >
                {((isActive && (isAutoplayEnabled || isPauseTarget)) || isTransitioningFrom) && (
                  <WheelProgress
                    key={tabId}
                    animationPlayState={isInViewport && isAutoplayEnabled ? "running" : "paused"}
                    autoplayDelay={autoplayDelay}
                    isComplete={isTransitioningFrom}
                    isCollapsing={isCollapsing}
                    isPausing={isPauseTransition}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 tracking-wide text-beige-800 uppercase",
                    hasMounted && "transition-[font-size,font-weight] duration-1000 ease-in-out",
                    isActive ? "text-md font-bold" : "text-xs font-medium",
                  )}
                >
                  {formatItemNumber(tabPosition)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type FullWheelProps = WheelViewProps &
  ReturnType<typeof useMobileWheelDrag> & {
    layout: WheelLayout;
  };

function DesktopWheelTabs({
  id,
  tabs,
  activeTabId,
  hasMounted,
  autoplayDelay,
  isAutoplayEnabled,
  isInViewport,
  onSelect,
  onKeyDown,
}: WheelViewProps) {
  const activeTabPosition = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === activeTabId),
  );
  const transitioningFromTabId = useTransitioningFromTabId(activeTabId, isAutoplayEnabled);
  const { isPauseTarget, isAutoplayPaused, isPauseTransition } = useAutoplayPauseTransition(
    activeTabId,
    isAutoplayEnabled,
    isInViewport,
  );

  return (
    <div role="tablist" aria-label="Werte" className="hidden md:block">
      {tabs.map((tab, tabPosition) => {
        const tabId = tab.id;
        const isActive = activeTabId === tabId;
        const isTransitioningFrom = transitioningFromTabId === tabId;
        const isCollapsing = isTransitioningFrom || (isActive && isPauseTarget && isAutoplayPaused);
        const rotation = getWheelRotation(
          tabPosition,
          tabs.length,
          activeTabPosition,
          DESKTOP_ACTIVE_TAB_ROTATION,
          DESKTOP_ROTATION_DIRECTION,
        );

        return (
          <button
            key={tabId}
            id={`${id}-tab-${tabId}`}
            data-tab-id={tabId}
            data-wheel-tab-id={tabId}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`${id}-panel-${activeTabId}`}
            tabIndex={0}
            onClick={() => onSelect(tabId)}
            onKeyDown={(event) => onKeyDown(event, tabId)}
            className={cn(
              "absolute top-1/2 left-1/2 z-10",
              "flex flex-col items-center justify-center gap-(--wheel-label-gap)",
              "cursor-pointer! rounded-full border text-center",
              hasMounted &&
                "transition-[width,height,transform,background-color,border-color] duration-1000 ease-in-out",
              "hover:border-beige-200 hover:bg-brand-50",
              isActive
                ? "h-32 w-32 border-beige-200 bg-brand-50"
                : "h-26 w-26 border-border bg-beige-100",
            )}
            style={
              {
                appearance: "none",
                visibility: hasMounted ? "visible" : "hidden",
                "--wheel-number-height": "1.5rem",
                "--wheel-label-height": "1.25rem",
                "--wheel-label-gap": "0.25rem",
                transform: `
                  translate(-50%, -50%)
                  rotate(${rotation}deg)
                  translate(50cqw)
                  rotate(${-rotation}deg)
                `,
              } as CSSProperties
            }
          >
            {((isActive && (isAutoplayEnabled || isPauseTarget)) || isTransitioningFrom) && (
              <WheelProgress
                key={tabId}
                animationPlayState={isInViewport && isAutoplayEnabled ? "running" : "paused"}
                autoplayDelay={autoplayDelay}
                isComplete={isTransitioningFrom}
                isCollapsing={isCollapsing}
                isPausing={isPauseTransition}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-(--wheel-number-height) items-center justify-center text-sm leading-none font-medium tracking-wide text-beige-800 uppercase transition-all duration-1000 ease-in-out",
                isActive ? "text-xl font-bold" : "text-sm font-medium",
              )}
              style={{
                transform: isActive
                  ? "translateY(calc((var(--wheel-label-height) + var(--wheel-label-gap)) / 2))"
                  : "translateY(0)",
              }}
            >
              {formatItemNumber(tabPosition)}
            </span>
            <span
              className={cn(
                "relative z-10 flex h-(--wheel-label-height) items-center text-sm leading-none font-medium tracking-wide text-beige-800 uppercase transition-opacity duration-500",
                isActive && "opacity-0",
              )}
            >
              {tab.metadata.label || "Mehr"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

type WheelProgressProps = {
  animationPlayState: "paused" | "running";
  autoplayDelay: number;
  isComplete: boolean;
  isCollapsing: boolean;
  isPausing: boolean;
};

function WheelProgress({
  animationPlayState,
  autoplayDelay,
  isComplete,
  isCollapsing,
  isPausing,
}: WheelProgressProps) {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const elapsedRef = useRef(0);
  const lastTimestampRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    progressRef.current = 0;
    elapsedRef.current = 0;
    lastTimestampRef.current = null;
    setProgress(0);
  }, [autoplayDelay]);

  useEffect(() => {
    if (isComplete) {
      progressRef.current = 1;
      elapsedRef.current = autoplayDelay;
      lastTimestampRef.current = null;
      setProgress(1);
      return;
    }

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (animationPlayState === "paused") {
      lastTimestampRef.current = null;
      return;
    }

    const updateProgress = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      elapsedRef.current += timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      const nextProgress = Math.min(1, elapsedRef.current / autoplayDelay);
      progressRef.current = nextProgress;
      setProgress(nextProgress);

      if (nextProgress < 1) {
        frameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    frameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      if (lastTimestampRef.current !== null) {
        elapsedRef.current += performance.now() - lastTimestampRef.current;
        lastTimestampRef.current = null;
      }
    };
  }, [animationPlayState, autoplayDelay, isComplete]);

  if (autoplayDelay <= 0) return null;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "wheel-progress pointer-events-none absolute inset-0 z-0 rounded-full text-brand-400 transition-[padding] ease-in-out",
        isPausing ? "duration-300" : "duration-1000",
      )}
      style={
        {
          background: `conic-gradient(currentColor ${isComplete ? 100 : progress * 100}%, transparent ${isComplete ? 100 : progress * 100}%)`,
          padding: isCollapsing ? "0px" : "3px",
        } as CSSProperties
      }
    >
      <span
        className={cn(
          "block h-full w-full rounded-full transition-colors duration-1000 ease-in-out",
          isComplete ? "bg-beige-100" : "bg-brand-50",
        )}
      />
    </span>
  );
}

type MobileTabListProps = WheelViewProps & ReturnType<typeof useMobileWheelDrag>;

function MobileTabList({
  id,
  tabs,
  activeTabId,
  onSelect,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onClickCapture,
}: MobileTabListProps) {
  return (
    <div
      role="tablist"
      aria-label="Werte auswählen"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onClickCapture={onClickCapture}
      className="mt-6 flex cursor-grab scrollbar-none gap-3 overflow-x-auto pb-2 select-none [-ms-overflow-style:none] active:cursor-grabbing md:hidden [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((tab, tabPosition) => {
        const tabId = tab.id;
        const isActive = activeTabId === tabId;

        return (
          <button
            key={tabId}
            id={`${id}-mobile-tab-${tabId}`}
            data-tab-id={tabId}
            data-wheel-tab-id={tabId}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`${id}-panel-${activeTabId}`}
            tabIndex={0}
            onClick={() => onSelect(tabId)}
            onKeyDown={(event) => onKeyDown(event, tabId)}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-full border px-4 py-3 text-left",
              "transition-colors",
              "cursor-pointer! hover:border-beige-200 hover:bg-brand-50",
              isActive ? "border-beige-200 bg-brand-50" : "border-border bg-beige-100",
            )}
          >
            <span className="text-sm font-medium tracking-wide text-brand-400 uppercase">
              {formatItemNumber(tabPosition)}
            </span>
            <span className="text-sm font-medium tracking-wide text-brand-400 uppercase">
              {tab.metadata.label || "Mehr"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function FullWheel({ layout, ...props }: FullWheelProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full md:@container",
        "md:aspect-square md:w-full md:min-w-lg md:rounded-full md:border md:border-beige-200 md:bg-brand-50",
        layout === "mini" && "hidden md:block",
        !props.tabs.length && "hidden",
      )}
    >
      <DesktopWheelTabs {...props} />
      <MobileTabList {...props} />
    </div>
  );
}

type WheelPanelProps = {
  id: string;
  activeTabId: TabId | null;
  layout: WheelLayout;
  children?: ReactNode;
};

export function WheelPanel({ id, activeTabId, layout, children }: WheelPanelProps) {
  return (
    <div
      id={`${id}-panel-${activeTabId}`}
      role="tabpanel"
      aria-labelledby={
        layout === "mini" ? `${id}-mini-tab-${activeTabId}` : `${id}-tab-${activeTabId}`
      }
      className={cn(
        "max-w-2xltext-center mx-auto",
        "md:absolute md:inset-20 md:z-0 md:mt-0 md:flex md:max-w-none md:items-center md:justify-center md:text-center",
        layout === "full" ? "mt-4" : "mt-12",
      )}
    >
      {children}
    </div>
  );
}

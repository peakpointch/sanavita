import { cn } from "@/lib/utils";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import type { useMobileWheelDrag } from "./values-wheel-hooks";
import {
  formatItemNumber,
  getWheelRotation,
  type RegisteredItem,
  type ValuesWheelLayout,
  DESKTOP_ACTIVE_TAB_ROTATION,
  DESKTOP_ROTATION_DIRECTION,
  MOBILE_ACTIVE_TAB_ROTATION,
  MOBILE_ROTATION_DIRECTION,
  VALUES_WHEEL_BUTTON_TRANSITION_DURATION,
  VALUES_WHEEL_PAUSE_TRANSITION_DURATION,
} from "./values-wheel-utils";

type SelectTab = (index: number) => void;
type HandleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => void;

type WheelViewProps = {
  id: string;
  count: number;
  selectedIndex: number;
  registeredItems: Record<number, RegisteredItem>;
  isReady: boolean;
  autoPlayDuration: number;
  isAutoPlayEnabled: boolean;
  isInViewport: boolean;
  onSelect: SelectTab;
  onKeyDown: HandleKeyDown;
};

type MobileMiniWheelProps = WheelViewProps & {
  heading: string;
};

function useTransitioningFromIndex(selectedIndex: number, isAutoPlayEnabled: boolean) {
  const previousRef = useRef({ index: selectedIndex, isAutoPlayEnabled });
  const [transitioningFromIndex, setTransitioningFromIndex] = useState<number | null>(null);
  const hasSelectionChanged = previousRef.current.index !== selectedIndex;
  const previousWasAutoPlaying = previousRef.current.isAutoPlayEnabled;
  const renderedTransitioningIndex = hasSelectionChanged
    ? previousRef.current.index
    : transitioningFromIndex;

  useEffect(() => {
    if (previousRef.current.index === selectedIndex) return;

    const previous = previousRef.current;
    previousRef.current = { index: selectedIndex, isAutoPlayEnabled };

    if (!previous.isAutoPlayEnabled || !isAutoPlayEnabled) {
      setTransitioningFromIndex(null);
      return;
    }

    setTransitioningFromIndex(previous.index);
    const timeout = window.setTimeout(() => {
      setTransitioningFromIndex(null);
    }, VALUES_WHEEL_BUTTON_TRANSITION_DURATION);

    return () => window.clearTimeout(timeout);
  }, [isAutoPlayEnabled, selectedIndex]);

  return previousWasAutoPlaying && isAutoPlayEnabled ? renderedTransitioningIndex : null;
}

type AutoPlayPausePhase = "running" | "pausing" | "paused" | "restarting";

function useAutoPlayPauseTransition(
  selectedIndex: number,
  isAutoPlayEnabled: boolean,
  isInViewport: boolean,
) {
  const isAutoPlayPaused = !isAutoPlayEnabled || !isInViewport;
  const previousRef = useRef({ selectedIndex, isAutoPlayPaused });
  const [phase, setPhase] = useState<AutoPlayPausePhase>(isAutoPlayPaused ? "paused" : "running");
  const [pausedIndex, setPausedIndex] = useState<number | null>(null);
  const hasJustPaused =
    !previousRef.current.isAutoPlayPaused &&
    isAutoPlayPaused &&
    previousRef.current.selectedIndex === selectedIndex;
  const hasJustRestarted =
    previousRef.current.isAutoPlayPaused &&
    !isAutoPlayPaused &&
    previousRef.current.selectedIndex === selectedIndex;
  const isPauseTarget = pausedIndex === selectedIndex || hasJustPaused || hasJustRestarted;

  useEffect(() => {
    const previous = previousRef.current;
    previousRef.current = { selectedIndex, isAutoPlayPaused };

    if (previous.isAutoPlayPaused !== isAutoPlayPaused) {
      if (isAutoPlayPaused) {
        if (previous.selectedIndex !== selectedIndex) {
          setPausedIndex(null);
          setPhase("paused");
          return;
        }

        setPausedIndex(selectedIndex);
        setPhase("pausing");
        const timeout = window.setTimeout(() => {
          setPhase("paused");
        }, VALUES_WHEEL_PAUSE_TRANSITION_DURATION);

        return () => window.clearTimeout(timeout);
      }

      if (previous.selectedIndex !== selectedIndex) {
        setPausedIndex(null);
        setPhase("running");
        return;
      }

      setPhase("restarting");
      const timeout = window.setTimeout(() => {
        setPhase("running");
        setPausedIndex(null);
      }, VALUES_WHEEL_PAUSE_TRANSITION_DURATION);

      return () => window.clearTimeout(timeout);
    }

    if (previous.selectedIndex !== selectedIndex) {
      setPausedIndex(null);
      setPhase(isAutoPlayPaused ? "paused" : "running");
    }
  }, [isAutoPlayPaused, selectedIndex]);

  return {
    isPauseTarget,
    isAutoPlayPaused,
    isPauseTransition:
      hasJustPaused || hasJustRestarted || phase === "pausing" || phase === "restarting",
  };
}

export function MobileMiniWheel({
  id,
  count,
  selectedIndex,
  registeredItems,
  isReady,
  autoPlayDuration,
  isAutoPlayEnabled,
  isInViewport,
  heading,
  onSelect,
  onKeyDown,
}: MobileMiniWheelProps) {
  const transitioningFromIndex = useTransitioningFromIndex(selectedIndex, isAutoPlayEnabled);
  const { isPauseTarget, isAutoPlayPaused, isPauseTransition } = useAutoPlayPauseTransition(
    selectedIndex,
    isAutoPlayEnabled,
    isInViewport,
  );

  return (
    <div className="md:hidden">
      <div
        className={cn(
          "@container relative mx-auto aspect-square w-[calc(100%-var(--mini-button-size))]",
          "rounded-full border border-beige-200 bg-brand-50",
          !count && "hidden",
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
          {Array.from({ length: count }, (_, index) => {
            const registeredItem = registeredItems[index];
            if (registeredItem && !registeredItem.visible) return null;

            const isActive = selectedIndex === index;
            const isTransitioningFrom = transitioningFromIndex === index;
            const isCollapsing =
              isTransitioningFrom || (isActive && isPauseTarget && isAutoPlayPaused);
            const rotation = getWheelRotation(
              index,
              count,
              selectedIndex,
              MOBILE_ACTIVE_TAB_ROTATION,
              MOBILE_ROTATION_DIRECTION,
            );

            return (
              <button
                key={index}
                id={`${id}-mini-tab-${index}`}
                data-values-wheel-index={index}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${id}-panel-${selectedIndex}`}
                tabIndex={0}
                onClick={() => onSelect(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={cn(
                  "absolute top-1/2 left-1/2 z-10",
                  "flex cursor-pointer! items-center justify-center rounded-full border text-center",
                  isReady &&
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
                {((isActive && (isAutoPlayEnabled || isPauseTarget)) || isTransitioningFrom) && (
                  <ValuesWheelProgress
                    key={index}
                    animationPlayState={isInViewport && isAutoPlayEnabled ? "running" : "paused"}
                    autoPlayDuration={autoPlayDuration}
                    isComplete={isTransitioningFrom}
                    isCollapsing={isCollapsing}
                    isPausing={isPauseTransition}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 tracking-wide text-beige-800 uppercase",
                    isReady && "transition-[font-size,font-weight] duration-1000 ease-in-out",
                    isActive ? "text-md font-bold" : "text-xs font-medium",
                  )}
                >
                  {formatItemNumber(index)}
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
    layout: ValuesWheelLayout;
  };

function DesktopWheelTabs({
  id,
  count,
  selectedIndex,
  registeredItems,
  isReady,
  autoPlayDuration,
  isAutoPlayEnabled,
  isInViewport,
  onSelect,
  onKeyDown,
}: WheelViewProps) {
  const transitioningFromIndex = useTransitioningFromIndex(selectedIndex, isAutoPlayEnabled);
  const { isPauseTarget, isAutoPlayPaused, isPauseTransition } = useAutoPlayPauseTransition(
    selectedIndex,
    isAutoPlayEnabled,
    isInViewport,
  );

  return (
    <div role="tablist" aria-label="Werte" className="hidden md:block">
      {Array.from({ length: count }, (_, index) => {
        const registeredItem = registeredItems[index];
        if (registeredItem && !registeredItem.visible) return null;

        const isActive = selectedIndex === index;
        const isTransitioningFrom = transitioningFromIndex === index;
        const isCollapsing = isTransitioningFrom || (isActive && isPauseTarget && isAutoPlayPaused);
        const rotation = getWheelRotation(
          index,
          count,
          selectedIndex,
          DESKTOP_ACTIVE_TAB_ROTATION,
          DESKTOP_ROTATION_DIRECTION,
        );

        return (
          <button
            key={index}
            id={`${id}-tab-${index}`}
            data-values-wheel-index={index}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`${id}-panel-${selectedIndex}`}
            tabIndex={0}
            onClick={() => onSelect(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "absolute top-1/2 left-1/2 z-10",
              "flex flex-col items-center justify-center gap-(--wheel-label-gap)",
              "cursor-pointer! rounded-full border text-center",
              isReady &&
                "transition-[width,height,transform,background-color,border-color] duration-1000 ease-in-out",
              "hover:border-beige-200 hover:bg-brand-50",
              isActive
                ? "h-32 w-32 border-beige-200 bg-brand-50"
                : "h-26 w-26 border-border bg-beige-100",
            )}
            style={
              {
                appearance: "none",
                visibility: isReady ? "visible" : "hidden",
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
            {((isActive && (isAutoPlayEnabled || isPauseTarget)) || isTransitioningFrom) && (
              <ValuesWheelProgress
                key={index}
                animationPlayState={isInViewport && isAutoPlayEnabled ? "running" : "paused"}
                autoPlayDuration={autoPlayDuration}
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
              {formatItemNumber(index)}
            </span>
            <span
              className={cn(
                "relative z-10 flex h-(--wheel-label-height) items-center text-sm leading-none font-medium tracking-wide text-beige-800 uppercase transition-opacity duration-500",
                isActive && "opacity-0",
              )}
            >
              {registeredItem?.label || "Mehr"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

type ValuesWheelProgressProps = {
  animationPlayState: "paused" | "running";
  autoPlayDuration: number;
  isComplete: boolean;
  isCollapsing: boolean;
  isPausing: boolean;
};

function ValuesWheelProgress({
  animationPlayState,
  autoPlayDuration,
  isComplete,
  isCollapsing,
  isPausing,
}: ValuesWheelProgressProps) {
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
  }, [autoPlayDuration]);

  useEffect(() => {
    if (isComplete) {
      progressRef.current = 1;
      elapsedRef.current = autoPlayDuration;
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

      const nextProgress = Math.min(1, elapsedRef.current / autoPlayDuration);
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
  }, [animationPlayState, autoPlayDuration, isComplete]);

  if (autoPlayDuration <= 0) return null;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "values-wheel-progress pointer-events-none absolute inset-0 z-0 rounded-full text-brand-400 transition-[padding] ease-in-out",
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
  count,
  selectedIndex,
  registeredItems,
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
      {Array.from({ length: count }, (_, index) => {
        const registeredItem = registeredItems[index];
        if (registeredItem && !registeredItem.visible) return null;

        const isActive = selectedIndex === index;

        return (
          <button
            key={index}
            id={`${id}-mobile-tab-${index}`}
            data-values-wheel-index={index}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`${id}-panel-${selectedIndex}`}
            tabIndex={0}
            onClick={() => onSelect(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-full border px-4 py-3 text-left",
              "transition-colors",
              "cursor-pointer! hover:border-beige-200 hover:bg-brand-50",
              isActive ? "border-beige-200 bg-brand-50" : "border-border bg-beige-100",
            )}
          >
            <span className="text-sm font-medium tracking-wide text-brand-400 uppercase">
              {formatItemNumber(index)}
            </span>
            <span className="text-sm font-medium tracking-wide text-brand-400 uppercase">
              {registeredItem?.label || "Mehr"}
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
        !props.count && "hidden",
      )}
    >
      <DesktopWheelTabs {...props} />
      <MobileTabList {...props} />
    </div>
  );
}

type ValuesWheelPanelProps = {
  id: string;
  selectedIndex: number;
  layout: ValuesWheelLayout;
  children?: ReactNode;
};

export function ValuesWheelPanel({ id, selectedIndex, layout, children }: ValuesWheelPanelProps) {
  return (
    <div
      id={`${id}-panel-${selectedIndex}`}
      role="tabpanel"
      aria-labelledby={
        layout === "mini" ? `${id}-mini-tab-${selectedIndex}` : `${id}-tab-${selectedIndex}`
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

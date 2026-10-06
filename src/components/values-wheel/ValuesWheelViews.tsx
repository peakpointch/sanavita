import { cn } from "@/lib/utils";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";

import type { useMobileWheelDrag } from "./values-wheel-hooks";
import {
  DESKTOP_ACTIVE_TAB_ROTATION,
  DESKTOP_ROTATION_DIRECTION,
  formatItemNumber,
  getWheelRotation,
  MOBILE_ACTIVE_TAB_ROTATION,
  MOBILE_ROTATION_DIRECTION,
  type RegisteredItem,
  type ValuesWheelLayout,
} from "./values-wheel-utils";

type SelectTab = (index: number) => void;
type HandleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => void;

type WheelViewProps = {
  id: string;
  count: number;
  selectedIndex: number;
  registeredItems: Record<number, RegisteredItem>;
  isReady: boolean;
  onSelect: SelectTab;
  onKeyDown: HandleKeyDown;
};

type MobileMiniWheelProps = WheelViewProps & {
  heading: string;
};

export function MobileMiniWheel({
  id,
  count,
  selectedIndex,
  registeredItems,
  isReady,
  heading,
  onSelect,
  onKeyDown,
}: MobileMiniWheelProps) {
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
                  "flex items-center justify-center rounded-full border text-center",
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
                <span
                  className={cn(
                    "tracking-wide text-beige-800 uppercase",
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
  onSelect,
  onKeyDown,
}: WheelViewProps) {
  return (
    <div role="tablist" aria-label="Werte" className="hidden md:block">
      {Array.from({ length: count }, (_, index) => {
        const registeredItem = registeredItems[index];
        if (registeredItem && !registeredItem.visible) return null;

        const isActive = selectedIndex === index;
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
              "rounded-full border text-center",
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
            <span
              className={cn(
                "flex h-(--wheel-number-height) items-center justify-center text-sm leading-none font-medium tracking-wide text-beige-800 uppercase transition-all duration-1000 ease-in-out",
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
                "flex h-(--wheel-label-height) items-center text-sm leading-none font-medium tracking-wide text-beige-800 uppercase transition-opacity duration-500",
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
              "hover:border-beige-200 hover:bg-brand-50",
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

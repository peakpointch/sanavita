"use client";

import * as React from "react";
import { cn } from "cn";
import { Tabs as TabsPrimitive } from "radix-ui";

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col", className)} {...props} />
  );
}

function TabsList({
  className,
  onKeyDownCapture,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const handleKeyDownCapture = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDownCapture?.(event);
    if (event.defaultPrevented) return;

    const orientation = event.currentTarget.getAttribute("aria-orientation") ?? "horizontal";
    const isPreviousKey =
      orientation === "vertical" ? event.key === "ArrowUp" : event.key === "ArrowLeft";
    const isNextKey =
      orientation === "vertical" ? event.key === "ArrowDown" : event.key === "ArrowRight";

    if (!isPreviousKey && !isNextKey) return;

    const currentTab = event.target;
    if (!(currentTab instanceof HTMLElement) || currentTab.getAttribute("role") !== "tab") return;

    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]'),
    ).filter(
      (tab) => !tab.hasAttribute("disabled") && tab.getAttribute("aria-disabled") !== "true",
    );
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex < 0) return;

    event.preventDefault();
    event.stopPropagation();

    const nextIndex = currentIndex + (isNextKey ? 1 : -1);
    const nextTab = tabs[nextIndex];
    if (!nextTab) return;

    nextTab.focus();
    nextTab.click();
  };

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      loop={false}
      onKeyDownCapture={handleKeyDownCapture}
      className={cn(
        "inline-flex h-10 w-full items-center divide-x divide-neutral-700/10 border border-neutral-700/10 bg-beige-50 p-0 text-neutral-700/60",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-full flex-1 cursor-pointer! items-center justify-center px-3 text-xs font-semibold tracking-wider whitespace-nowrap uppercase transition-colors outline-none hover:bg-beige-100 hover:text-neutral-700 focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-neutral-700 data-[state=active]:text-white data-[state=active]:hover:bg-neutral-700 data-[state=active]:hover:text-white",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("mt-5 outline-none focus-visible:ring-2 focus-visible:ring-ring/30", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

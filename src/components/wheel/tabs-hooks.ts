import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";

import {
  TABS_REGISTER,
  TABS_SELECT,
  TABS_UNREGISTER,
  type TabRegisterDetail,
  type TabSelectDetail,
  type TabUnregisterDetail,
} from "./tabs-events";

type UseTabsOptions<TMetadata> = {
  groupId: string;
  tabCount: number;
  initialIndex: number;
};

export function useTabs<TMetadata>({ groupId, tabCount, initialIndex }: UseTabsOptions<TMetadata>) {
  const [registeredTabs, setRegisteredTabs] = useState<Record<number, TMetadata>>({});
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const activeIndex = Math.min(currentIndex, Math.max(tabCount - 1, 0));

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleRegister = (event: Event) => {
      const detail = (event as CustomEvent<TabRegisterDetail<TMetadata>>).detail;

      if (detail?.groupId !== groupId) return;

      setRegisteredTabs((tabs) => ({
        ...tabs,
        [detail.index]: detail.metadata as TMetadata,
      }));

      dispatchTabSelection(groupId, activeIndex);
    };

    const handleUnregister = (event: Event) => {
      const detail = (event as CustomEvent<TabUnregisterDetail>).detail;

      if (detail?.groupId !== groupId) return;

      setRegisteredTabs((tabs) => {
        const nextTabs = { ...tabs };
        delete nextTabs[detail.index];
        return nextTabs;
      });
    };

    window.addEventListener(TABS_REGISTER, handleRegister);
    window.addEventListener(TABS_UNREGISTER, handleUnregister);

    return () => {
      window.removeEventListener(TABS_REGISTER, handleRegister);
      window.removeEventListener(TABS_UNREGISTER, handleUnregister);
    };
  }, [activeIndex, groupId]);

  useEffect(() => {
    dispatchTabSelection(groupId, activeIndex);
  }, [activeIndex, groupId]);

  const selectTab = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const selectNextTab = useCallback(() => {
    if (tabCount < 1) return;

    setCurrentIndex((index) => (index + 1) % tabCount);
  }, [tabCount]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    const buttons = Array.from(
      event.currentTarget
        .closest('[role="tablist"]')
        ?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
    );
    const currentPosition = buttons.findIndex(
      (button) => Number(button.dataset.tabsIndex) === index,
    );

    if (currentPosition === -1 || buttons.length === 0) return;

    event.preventDefault();

    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextPosition = (currentPosition + direction + buttons.length) % buttons.length;
    const nextButton = buttons[nextPosition];

    nextButton.focus();
    nextButton.click();
  }, []);

  return {
    registeredTabs,
    currentIndex,
    activeIndex,
    selectTab,
    selectNextTab,
    handleKeyDown,
  };
}

export function useTab<TMetadata>(groupId: string, index: number, metadata?: TMetadata) {
  const [isSelected, setIsSelected] = useState(index === 0);

  useEffect(() => {
    const handleSelect = (event: Event) => {
      const detail = (event as CustomEvent<TabSelectDetail>).detail;

      if (detail?.groupId !== groupId) return;

      setIsSelected(detail.index === index);
    };

    window.addEventListener(TABS_SELECT, handleSelect);

    window.dispatchEvent(
      new CustomEvent<TabRegisterDetail<TMetadata>>(TABS_REGISTER, {
        detail: { groupId, index, metadata },
      }),
    );

    return () => {
      window.removeEventListener(TABS_SELECT, handleSelect);
      window.dispatchEvent(
        new CustomEvent<TabUnregisterDetail>(TABS_UNREGISTER, {
          detail: { groupId, index },
        }),
      );
    };
  }, [groupId, index, metadata]);

  return isSelected;
}

export type TabAutoplayStatus = "stopped" | "paused" | "running";

type UseTabAutoplayOptions = {
  enabled: boolean;
  delay: number;
  activeTabIndex: number;
  tabCount: number;
  suspended: boolean;
  onAdvance: () => void;
};

export function useTabAutoplay({
  enabled,
  delay,
  activeTabIndex,
  tabCount,
  suspended,
  onAdvance,
}: UseTabAutoplayOptions) {
  const [status, setStatus] = useState<TabAutoplayStatus>(enabled ? "running" : "stopped");
  const remainingTimeRef = useRef(delay);
  const onAdvanceRef = useRef(onAdvance);

  onAdvanceRef.current = onAdvance;

  useEffect(() => {
    setStatus(enabled ? "running" : "stopped");
  }, [enabled]);

  useEffect(() => {
    remainingTimeRef.current = delay;
  }, [activeTabIndex, delay]);

  const start = useCallback(() => {
    if (!enabled) return;

    remainingTimeRef.current = delay;
    setStatus("running");
  }, [delay, enabled]);

  const stop = useCallback(() => {
    remainingTimeRef.current = delay;
    setStatus("stopped");
  }, [delay]);

  const pause = useCallback(() => {
    setStatus((currentStatus) => (currentStatus === "running" ? "paused" : currentStatus));
  }, []);

  const resume = useCallback(() => {
    if (!enabled) return;

    setStatus((currentStatus) => (currentStatus === "paused" ? "running" : currentStatus));
  }, [enabled]);

  useEffect(() => {
    if (status !== "running" || suspended || tabCount < 1) return;

    const remainingTime = Math.max(0, remainingTimeRef.current);
    const startedAt = performance.now();
    const timeout = window.setTimeout(() => {
      remainingTimeRef.current = 0;
      onAdvanceRef.current();
    }, remainingTime);

    return () => {
      remainingTimeRef.current = Math.max(0, remainingTime - (performance.now() - startedAt));
      window.clearTimeout(timeout);
    };
  }, [activeTabIndex, delay, status, suspended, tabCount]);

  return {
    status,
    start,
    stop,
    pause,
    resume,
  };
}

function dispatchTabSelection(groupId: string, index: number) {
  window.dispatchEvent(
    new CustomEvent<TabSelectDetail>(TABS_SELECT, {
      detail: { groupId, index },
    }),
  );
}

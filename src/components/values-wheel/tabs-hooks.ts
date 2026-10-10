import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

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

export function useTabs<TMetadata>({
  groupId,
  tabCount,
  initialIndex,
}: UseTabsOptions<TMetadata>) {
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

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
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
    },
    [],
  );

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

type UseTabAutoplayOptions = {
  enabled: boolean;
  duration: number;
  currentIndex: number;
  tabCount: number;
  paused: boolean;
  onAdvance: () => void;
};

export function useTabAutoplay({
  enabled,
  duration,
  currentIndex,
  tabCount,
  paused,
  onAdvance,
}: UseTabAutoplayOptions) {
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(enabled);
  const remainingTimeRef = useRef(duration);
  const onAdvanceRef = useRef(onAdvance);

  onAdvanceRef.current = onAdvance;

  useEffect(() => {
    setIsAutoplayEnabled(enabled);
  }, [enabled]);

  useEffect(() => {
    remainingTimeRef.current = duration;
  }, [currentIndex, duration]);

  useEffect(() => {
    if (!isAutoplayEnabled || paused || tabCount < 1) return;

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
  }, [currentIndex, duration, isAutoplayEnabled, paused, tabCount]);

  return {
    isAutoplayEnabled,
    setIsAutoplayEnabled,
  };
}

function dispatchTabSelection(groupId: string, index: number) {
  window.dispatchEvent(
    new CustomEvent<TabSelectDetail>(TABS_SELECT, {
      detail: { groupId, index },
    }),
  );
}

import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  TABS_REGISTER,
  TABS_REQUEST_REGISTRATION,
  TABS_SELECT,
  TABS_UNREGISTER,
  type TabRegisterDetail,
  type TabRegistrationRequestDetail,
  type TabId,
  type TabSelectDetail,
  type TabUnregisterDetail,
} from "./tabs-events";

type UseTabsOptions<TMetadata> = {
  groupId: string;
  initialTabId: TabId;
};

export type RegisteredTab<TMetadata> = {
  id: TabId;
  metadata: TMetadata;
};

export function useTabs<TMetadata>({ groupId, initialTabId }: UseTabsOptions<TMetadata>) {
  const [registeredTabs, setRegisteredTabs] = useState<Record<number, TMetadata>>({});
  const [selectedTabId, setSelectedTabId] = useState(initialTabId);
  const tabs = useMemo(
    () =>
      Object.entries(registeredTabs)
        .map(([tabId, metadata]) => ({ id: Number(tabId), metadata }))
        .sort((a, b) => a.id - b.id),
    [registeredTabs],
  );
  const tabIds = useMemo(() => tabs.map((tab) => tab.id), [tabs]);
  const activeTabId = tabIds.includes(selectedTabId)
    ? selectedTabId
    : tabIds.includes(initialTabId)
      ? initialTabId
      : (tabIds[0] ?? null);

  useEffect(() => {
    setSelectedTabId(initialTabId);
  }, [initialTabId]);

  useEffect(() => {
    setRegisteredTabs({});

    const handleRegister = (event: Event) => {
      const detail = (event as CustomEvent<TabRegisterDetail<TMetadata>>).detail;

      if (detail?.groupId !== groupId) return;

      setRegisteredTabs((tabs) => ({
        ...tabs,
        [detail.tabId]: detail.metadata,
      }));
    };

    const handleUnregister = (event: Event) => {
      const detail = (event as CustomEvent<TabUnregisterDetail>).detail;

      if (detail?.groupId !== groupId) return;

      setRegisteredTabs((tabs) => {
        const nextTabs = { ...tabs };
        delete nextTabs[detail.tabId];
        return nextTabs;
      });
    };

    window.addEventListener(TABS_REGISTER, handleRegister);
    window.addEventListener(TABS_UNREGISTER, handleUnregister);
    window.dispatchEvent(
      new CustomEvent<TabRegistrationRequestDetail>(TABS_REQUEST_REGISTRATION, {
        detail: { groupId },
      }),
    );

    return () => {
      window.removeEventListener(TABS_REGISTER, handleRegister);
      window.removeEventListener(TABS_UNREGISTER, handleUnregister);
    };
  }, [groupId]);

  useEffect(() => {
    if (activeTabId === null) return;

    dispatchTabSelection(groupId, activeTabId);
  }, [activeTabId, groupId]);

  const selectTab = useCallback((tabId: TabId) => {
    setSelectedTabId(tabId);
  }, []);

  const selectNextTab = useCallback(() => {
    if (!tabIds.length || activeTabId === null) return;

    const currentPosition = tabIds.indexOf(activeTabId);
    const nextPosition = (currentPosition + 1) % tabIds.length;

    setSelectedTabId(tabIds[nextPosition]);
  }, [activeTabId, tabIds]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>, tabId: TabId) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    const buttons = Array.from(
      event.currentTarget
        .closest('[role="tablist"]')
        ?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
    );
    const currentPosition = buttons.findIndex((button) => Number(button.dataset.tabId) === tabId);

    if (currentPosition === -1 || buttons.length === 0) return;

    event.preventDefault();

    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextPosition = (currentPosition + direction + buttons.length) % buttons.length;
    const nextButton = buttons[nextPosition];

    nextButton.focus();
    nextButton.click();
  }, []);

  return {
    tabs,
    activeTabId,
    selectTab,
    selectNextTab,
    handleKeyDown,
  };
}

export function useTab<TMetadata>(groupId: string, tabId: TabId, metadata: TMetadata) {
  const [isSelected, setIsSelected] = useState(tabId === 1);

  useEffect(() => {
    const register = () => {
      window.dispatchEvent(
        new CustomEvent<TabRegisterDetail<TMetadata>>(TABS_REGISTER, {
          detail: { groupId, tabId, metadata },
        }),
      );
    };
    const handleSelect = (event: Event) => {
      const detail = (event as CustomEvent<TabSelectDetail>).detail;

      if (detail?.groupId !== groupId) return;

      setIsSelected(detail.tabId === tabId);
    };
    const handleRegistrationRequest = (event: Event) => {
      const detail = (event as CustomEvent<TabRegistrationRequestDetail>).detail;

      if (detail?.groupId !== groupId) return;

      register();
    };

    window.addEventListener(TABS_SELECT, handleSelect);
    window.addEventListener(TABS_REQUEST_REGISTRATION, handleRegistrationRequest);
    register();

    return () => {
      window.removeEventListener(TABS_SELECT, handleSelect);
      window.removeEventListener(TABS_REQUEST_REGISTRATION, handleRegistrationRequest);
      window.dispatchEvent(
        new CustomEvent<TabUnregisterDetail>(TABS_UNREGISTER, {
          detail: { groupId, tabId },
        }),
      );
    };
  }, [groupId, tabId, metadata]);

  return isSelected;
}

export type TabAutoplayStatus = "stopped" | "paused" | "running";

type UseTabAutoplayOptions = {
  enabled: boolean;
  delay: number;
  activeTabId: TabId | null;
  hasTabs: boolean;
  suspended: boolean;
  onAdvance: () => void;
};

export function useTabAutoplay({
  enabled,
  delay,
  activeTabId,
  hasTabs,
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
  }, [activeTabId, delay]);

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
    if (status !== "running" || suspended || !hasTabs) return;

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
  }, [activeTabId, delay, hasTabs, status, suspended]);

  return {
    status,
    start,
    stop,
    pause,
    resume,
  };
}

function dispatchTabSelection(groupId: string, tabId: TabId) {
  window.dispatchEvent(
    new CustomEvent<TabSelectDetail>(TABS_SELECT, {
      detail: { groupId, tabId },
    }),
  );
}

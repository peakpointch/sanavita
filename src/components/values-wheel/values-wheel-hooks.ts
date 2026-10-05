import { type MouseEvent, type PointerEvent, useEffect, useRef, useState } from "react";

import {
  VALUES_WHEEL_ITEM_REGISTER,
  VALUES_WHEEL_ITEM_UNREGISTER,
  VALUES_WHEEL_SELECT,
  type ValuesWheelItemRegisterDetail,
  type ValuesWheelItemUnregisterDetail,
  type ValuesWheelSelectDetail,
} from "./values-wheel-events";
import type { RegisteredItem } from "./values-wheel-utils";

export function useValuesWheelRegistry(wheelId: string, selectedIndex: number) {
  const [registeredItems, setRegisteredItems] = useState<Record<number, RegisteredItem>>({});

  useEffect(() => {
    const handleRegister = (event: Event) => {
      const detail = (event as CustomEvent<ValuesWheelItemRegisterDetail>).detail;

      if (detail?.wheelId !== wheelId) return;

      setRegisteredItems((items) => ({
        ...items,
        [detail.index]: {
          label: detail.label,
          visible: detail.visible,
        },
      }));

      window.dispatchEvent(
        new CustomEvent<ValuesWheelSelectDetail>(VALUES_WHEEL_SELECT, {
          detail: { wheelId, index: selectedIndex },
        }),
      );
    };

    const handleUnregister = (event: Event) => {
      const detail = (event as CustomEvent<ValuesWheelItemUnregisterDetail>).detail;

      if (detail?.wheelId !== wheelId) return;

      setRegisteredItems((items) => {
        const nextItems = { ...items };
        delete nextItems[detail.index];
        return nextItems;
      });
    };

    window.addEventListener(VALUES_WHEEL_ITEM_REGISTER, handleRegister);
    window.addEventListener(VALUES_WHEEL_ITEM_UNREGISTER, handleUnregister);

    return () => {
      window.removeEventListener(VALUES_WHEEL_ITEM_REGISTER, handleRegister);
      window.removeEventListener(VALUES_WHEEL_ITEM_UNREGISTER, handleUnregister);
    };
  }, [selectedIndex, wheelId]);

  useEffect(() => {
    const detail: ValuesWheelSelectDetail = { wheelId, index: selectedIndex };

    window.dispatchEvent(new CustomEvent(VALUES_WHEEL_SELECT, { detail }));
  }, [selectedIndex, wheelId]);

  return registeredItems;
}

export function useMobileWheelDrag() {
  const mobileDrag = useRef({
    startX: 0,
    startScrollLeft: 0,
    isDragging: false,
    didDrag: false,
  });
  const suppressMobileClick = useRef(false);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    mobileDrag.current = {
      startX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
      isDragging: true,
      didDrag: false,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = mobileDrag.current;

    if (!drag.isDragging) return;

    const distance = event.clientX - drag.startX;

    if (Math.abs(distance) < 4) return;

    drag.didDrag = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    event.currentTarget.scrollLeft = drag.startScrollLeft - distance;
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const drag = mobileDrag.current;

    if (!drag.isDragging) return;

    suppressMobileClick.current = drag.didDrag;
    drag.isDragging = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!suppressMobileClick.current) return;

    event.preventDefault();
    event.stopPropagation();
    suppressMobileClick.current = false;
  }

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
    onClickCapture: handleClickCapture,
  };
}

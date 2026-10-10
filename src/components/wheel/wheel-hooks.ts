import { type MouseEvent, type PointerEvent, useRef } from "react";

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

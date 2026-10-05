export const DEFAULT_VALUES_WHEEL_ID = "wheel-1";
export const DEFAULT_VALUES_WHEEL_LAYOUT = "mini";
export const DEFAULT_VALUES_WHEEL_HEADING = "Werte bei Sanavita";

export const DESKTOP_ACTIVE_TAB_ROTATION = -90;
export const MOBILE_ACTIVE_TAB_ROTATION = 90;
export const DESKTOP_ROTATION_DIRECTION = 1;
export const MOBILE_ROTATION_DIRECTION = -1;
export const VALUES_WHEEL_CONTENT_TRANSITION_DURATION = 300;

export type ValuesWheelLayout = "full" | "mini";

export type RegisteredItem = {
  label: string;
  visible: boolean;
};

export function toZeroBasedIndex(value: number) {
  return Math.max(0, Math.trunc(value) - 1);
}

export function normalizeItemCount(value: number) {
  return Math.max(0, Math.trunc(value));
}

export function clampActiveIndex(activeIndex: number, itemCount: number) {
  return Math.min(activeIndex, Math.max(itemCount - 1, 0));
}

export function getWheelRotation(
  index: number,
  itemCount: number,
  selectedIndex: number,
  activeTabRotation: number,
  rotationDirection: number,
) {
  const step = 360 / itemCount;

  return (index * step - selectedIndex * step) * rotationDirection + activeTabRotation;
}

export function formatItemNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

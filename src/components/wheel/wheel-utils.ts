export const DEFAULT_WHEEL_ID = "wheel-1";
export const DEFAULT_WHEEL_LAYOUT = "mini";
export const DEFAULT_WHEEL_HEADING = "Werte bei Sanavita";

export const DESKTOP_ACTIVE_TAB_ROTATION = -90;
export const MOBILE_ACTIVE_TAB_ROTATION = 90;
export const DESKTOP_ROTATION_DIRECTION = 1;
export const MOBILE_ROTATION_DIRECTION = -1;
export const WHEEL_CONTENT_TRANSITION_DURATION = 300;
export const WHEEL_BUTTON_TRANSITION_DURATION = 1000;
export const WHEEL_PAUSE_TRANSITION_DURATION = 300;

export type WheelLayout = "full" | "mini";

export type WheelTabMetadata = {
  label: string;
  visible: boolean;
};

export function toZeroBasedIndex(value: number) {
  return Math.max(0, Math.trunc(value) - 1);
}

export function getWheelRotation(
  tabIndex: number,
  tabCount: number,
  activeTabIndex: number,
  activeTabRotation: number,
  rotationDirection: number,
) {
  const step = 360 / tabCount;

  return (tabIndex * step - activeTabIndex * step) * rotationDirection + activeTabRotation;
}

export function formatItemNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

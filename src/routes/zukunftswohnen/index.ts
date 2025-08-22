import { WFRoute } from "@xatom/core";
import { initTimeline } from "./timeline.js";
import { initCountDown } from "./count-down.js";

/**
 * WFRoute "/zukunftswohnen"
 */
export const zukunftswohnen = () => {
  new WFRoute("/zukunftswohnen").execute(() => {
    initTimeline();
    initCountDown();
  });
};

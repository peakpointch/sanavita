import { onReady } from "@xatom/core";
import { routes, forms } from "./routes";
import { zukunftswohnen } from "./routes/zukunftswohnen";
import { overrideWebflowScroll } from "peakflow/scroll";

onReady(() => {
  global();

  // By module
  forms();

  // By page
  routes();
  zukunftswohnen();
});

/**
 * Code that runs on all pages
 */
function global(): void {
  overrideWebflowScroll({
    defaultOffset: 99,
    defaultBehaviour: "smooth",
  });
}

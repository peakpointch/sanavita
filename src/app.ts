import { onReady } from "@xatom/core";
import { app, bistroMenus, forms } from "./routes";
import { zukunftswohnen } from "./routes/zukunftswohnen";
import { overrideWebflowScroll } from "peakflow/scroll";

onReady(() => {
  global();

  // By module
  forms();
  bistroMenus();

  // By page
  app();
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

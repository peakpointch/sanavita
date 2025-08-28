import { onReady } from "@xatom/core";
import { app, bistroMenus, forms } from "./routes";
import { job, jobs } from "./routes/jobs";
import { zukunftswohnen } from "./routes/zukunftswohnen";
import { overrideWebflowScroll } from "peakflow/scroll";

onReady(() => {
  global();

  // By module
  forms();

  // By page
  app();
  jobs();
  job();
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

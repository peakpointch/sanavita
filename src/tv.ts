import { onReady, WFRoute } from "@xatom/core";
import peakflow from "peakflow";
import { initWfVideo } from "./modules/wfvideo";
// import { initAutoScroll } from "./modules/tv/auto-scroll";

onReady(() => {
  const homeRoutes = ["/tv/home", "/tv/design"];

  for (const route of homeRoutes) {
    new WFRoute(route).execute(() => {
      peakflow.execute("inlinecms", "swiper");
      peakflow.execute("dateflow");
      initWfVideo();
      // initAutoScroll();
      initReload();
    });
  }
});

function initReload(): void {
  setInterval(() => {
    window.location.reload();
  }, 1 * 60 * 60 * 1000); // Update every hour
}

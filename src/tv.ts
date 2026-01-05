import { onReady, WFRoute } from "@xatom/core";
import peakflow from "peakflow";
import { initWfVideo } from "./modules/wfvideo";

onReady(() => {
  const homeRoutes = ["/tv/home", "/tv/design"];

  for (const route of homeRoutes) {
    new WFRoute(route).execute(() => {
      peakflow.execute("inlinecms", "swiper");
      peakflow.execute("dateflow");
      initWfVideo();
    });
  }
});

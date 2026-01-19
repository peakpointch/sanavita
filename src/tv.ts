import { onReady, WFRoute } from "@xatom/core";
import {
  peakflow,
  Slider,
  dateflow,
  mergeOptions,
  inlineCms,
  wf,
} from "peakflow";
import { initWfVideo } from "./modules/wfvideo";
import { autoRefresh } from "./modules/auto-refresh";
import { populateSwiper } from "./modules/utils";
import { de } from "date-fns/locale/de";
import { Autoplay, Manipulation } from "swiper/modules";
// import { initAutoScroll } from "./modules/tv/auto-scroll";

interface TVGlobal {
  refresh?: () => void;
}

declare global {
  interface Window {
    tv: TVGlobal;
  }
}

onReady(() => {
  const homeRoutes = ["/tv/home", "/tv/design"];

  for (const route of homeRoutes) {
    new WFRoute(route).execute(() => {
      window.tv = window.tv || {};

      peakflow.execute("inlinecms");
      peakflow.execute("dateflow");

      Slider.initAll(document.body, {
        modules: [Autoplay, Manipulation],
      });

      initWfVideo();

      // initAutoScroll();

      autoRefresh({
        delay: 60 * 60, // Refresh once every hour
        beforeRefresh: ({ newDoc }) => {
          console.log("Refreshing");

          inlineCms({
            origins: "[data-inlinecms-component]",
            doc: newDoc,
          });

          dateflow(de, newDoc.body);

          // populateSwiper({ name: "news", amount: 4, doc: newDoc });
        },
      });
    });
  }
});

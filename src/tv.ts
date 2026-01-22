import { onReady, WFRoute } from "@xatom/core";
import { peakflow, Slider, dateflow, inlineCms } from "peakflow";
import { initWfVideo } from "./modules/wfvideo";
import { autoRefresh } from "./modules/auto-refresh";
import { de } from "date-fns/locale/de";
import { Autoplay, Manipulation } from "swiper/modules";
// import { initAutoScroll } from "./modules/tv/auto-scroll";

declare global {
  interface Window {
    tv: TVGlobal;
  }
}

interface TVGlobal {
  refresh?: () => void;
  refreshCore?: () => void;
  failed: number;
}

onReady(() => {
  const homeRoutes = ["/tv/home", "/tv/design"];

  for (const route of homeRoutes) {
    new WFRoute(route).execute(initTV);
  }
});

function initTVGlobals(): void {
  window.tv = window.tv || {
    failed: 0,
  };
}

function initTV(): void {
  initTVGlobals();

  peakflow.execute("inlinecms");
  peakflow.execute("dateflow");

  Slider.initAll(document.body, {
    modules: [Autoplay, Manipulation],
  });

  initWfVideo();

  // initAutoScroll();

  autoRefresh({
    delay: 60 * 60, // Refresh once every hour
    // nodes: ({ mode }) => mode !== "code-component",
    beforeRefresh: ({ newDoc }) => {
      console.log("Refreshing");

      inlineCms({
        origins: "[data-inlinecms-component]",
        doc: newDoc,
      });

      dateflow(de, newDoc.body);

      // populateSwiper({ name: "news", amount: 4, doc: newDoc });
    },
    beforeNodeRefresh: ({ id, mode }) => {
      console.log(`${mode}:${id}`);
    },
  });
}

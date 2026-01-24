import { onReady, WFRoute } from "@xatom/core";
import { Slider, dateflow, inlineCms } from "peakflow";
import { initWfVideo } from "./modules/wfvideo";
import { autoRefresh, AutoRefreshContext } from "./modules/auto-refresh";
import { de } from "date-fns/locale/de";
import { Autoplay, Manipulation } from "swiper/modules";
import { format } from "date-fns";
// import { initAutoScroll } from "./modules/tv/auto-scroll";

declare global {
  interface Window {
    tv: TVGlobal;
  }
}

interface TVGlobal {
  refreshers: {
    [x: string]: AutoRefreshContext;
  };
}

function initTVGlobals(): void {
  window.tv = window.tv || {
    refreshers: {},
  };
}

function logStamp(): string {
  return format(new Date(), "MMM dd HH:mm:ss.SS");
}

function initCmsRefresh(): void {
  const ctx = autoRefresh({
    delay: 60 * 60, // Refresh once every hour
    nodes: ({ mode }) =>
      !["code-component", "body", "page", "document"].includes(mode),
    beforeRefresh: ({ newDoc }) => {
      console.log(`${logStamp()} Refresh: CMS`);

      inlineCms({
        origins: "[data-inlinecms-component]",
        doc: newDoc,
      });

      dateflow(de, newDoc.body);

      // populateSwiper({ name: "news", amount: 4, doc: newDoc });
    },
    beforeNodeRefresh: ({ id, mode }) => {
      // console.log(`${mode}:${id}`);
    },
  });

  window.tv.refreshers.cms = ctx;
}

function initComponentsRefresh(): void {
  const ctx = autoRefresh({
    delay: 60 * 60 * 12, // Hard refresh every 12 hours
    nodes: ["weather", "watch"],
    beforeRefresh: () => {
      console.log(`${logStamp()} Refresh: components`);
    },
    afterRefresh: ({ doc }) => {
      initTVDOM(doc);
    },
  });

  window.tv.refreshers.components = ctx;
}

function initPageRefresh(): void {
  const ctx = autoRefresh({
    delay: 60 * 60 * 12, // Hard refresh every 12 hours
    nodes: ["page-wrapper"],
    beforeRefresh: () => {
      console.log(`${logStamp()} Refresh: page`);
    },
    afterRefresh: ({ doc }) => {
      initTVDOM(doc);
    },
  });

  window.tv.refreshers.page = ctx;
}

function initTVDOM(doc: Document): Document {
  try {
    inlineCms({
      origins: "[data-inlinecms-component]",
      doc: doc,
    });
  } catch (e) {
    console.warn(e);
  }

  dateflow(de, doc.body);

  Slider.initAll(doc.body, {
    modules: [Autoplay, Manipulation],
  });

  initWfVideo(doc);

  // initAutoScroll();

  return doc;
}

function initTV(): void {
  initTVGlobals();

  initTVDOM(document);

  initCmsRefresh();
  initComponentsRefresh();
  initPageRefresh();
}

onReady(() => {
  const homeRoutes = ["/tv/home", "/tv/design"];

  for (const route of homeRoutes) {
    new WFRoute(route).execute(initTV);
  }
});

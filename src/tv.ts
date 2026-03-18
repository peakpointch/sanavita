import { onReady, WFRoute } from "@xatom/core";
import { Slider, dateflow, inlineCms } from "peakflow";
import { initWfVideo } from "./modules/wfvideo";
import { autoRefresh, AutoRefreshContext } from "./modules/auto-refresh";
import { de } from "date-fns/locale/de";
import { Autoplay, Manipulation } from "swiper/modules";
import { format } from "date-fns";
import { initAutoScroll } from "./modules/tv/auto-scroll";

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

function initTVAutoScroll({ doc }: { doc: Document | Element }): void {
  initAutoScroll({
    doc,
    speed: 3,
    pauseFor: 5_000,
    mode: "smooth",
    tolerance: 10,
    scrollbar: {
      hide: true,
    },
  });
}

function initCmsRefresh(opts?: { enabled: boolean }): void {
  opts.enabled = opts.enabled === undefined ? true : opts.enabled;

  const ctx = autoRefresh({
    enabled: opts.enabled,
    delay: 60 * 60 * 1, // Refresh every 1 hour
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
    afterRefresh: ({ doc }) => {
      initTVAutoScroll({ doc });
    },
  });

  window.tv.refreshers.cms = ctx;
}

function initComponentsRefresh(opts?: { enabled: boolean }): void {
  opts.enabled = opts.enabled === undefined ? true : opts.enabled;

  const ctx = autoRefresh({
    enabled: opts.enabled,
    delay: 60 * 60 * 12, // 12 hours
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

function initPageRefresh(opts?: { enabled: boolean }): void {
  opts.enabled = opts.enabled === undefined ? true : opts.enabled;

  const ctx = autoRefresh({
    enabled: opts.enabled,
    delay: 60 * 60 * 24, // 24 hours
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

  initTVAutoScroll({ doc });

  return doc;
}

function initTV(): void {
  initTVGlobals();

  initTVDOM(document);

  initCmsRefresh({ enabled: true });
  initComponentsRefresh({ enabled: false });
  initPageRefresh({ enabled: false });
}

onReady(() => {
  const homeRoutes = ["/tv/home", "/tv/design"];

  for (const route of homeRoutes) {
    new WFRoute(route).execute(initTV);
  }
});

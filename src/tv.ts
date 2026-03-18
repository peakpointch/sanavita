import { onReady, WFRoute } from "@xatom/core";
import { Slider, dateflow, inlineCms } from "peakflow";
import { initWfVideo } from "./modules/wfvideo";
import {
  autoRefresh,
  AutoRefreshContext,
  onRefreshScript,
  refreshOwnNodes,
} from "./modules/auto-refresh";
import { de } from "date-fns/locale/de";
import { Autoplay, Manipulation } from "swiper/modules";
import { format, addDays } from "date-fns";
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
  opts = opts ?? { enabled: true };
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
  opts = opts ?? { enabled: true };
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
  opts = opts ?? { enabled: true };
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

function initMidnightRefresh(opts?: { enabled: boolean }): void {
  opts = opts ?? { enabled: true };
  opts.enabled = opts.enabled === undefined ? true : opts.enabled;

  if (!opts.enabled) return;

  const now = new Date();

  let midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  if (midnight < now) {
    midnight = addDays(midnight, 1);
  }

  const timeUntilMidnight = midnight.getTime() - now.getTime();

  const diff = new Date(timeUntilMidnight);

  console.log(
    `Time left: ${diff.getHours()}:${diff.getMinutes()}:${diff.getSeconds()}, refreshing in ${timeUntilMidnight}ms`
  );

  setTimeout(() => {
    try {
      window.location.reload();
      // refreshOwnNodes({
      //   nodes: ["midnight"],
      //   beforeNodeRefresh: ({ mode }) => {
      //     console.log(`${logStamp()} Refresh "${mode}": midnight`);
      //   },
      //   afterRefresh: ({ doc }) => {
      //     initTVDOM(doc);
      //   },
      // });
    } catch (error) {
      console.error(
        logStamp(),
        `Refresh: Something went wrong during the midnight "document" refresh.`
      );
    }
  }, timeUntilMidnight);
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
  initMidnightRefresh({ enabled: true });
}

onReady(() => {
  const homeRoutes = ["/tv/home", "/tv/design"];

  for (const route of homeRoutes) {
    new WFRoute(route).execute(initTV);
  }
});

onRefreshScript(() => {
  // Runs before this file gets reloaded
  const refreshers = Object.values(window.tv.refreshers);
  for (const ctx of refreshers) {
    clearInterval(ctx.interval);
  }
});

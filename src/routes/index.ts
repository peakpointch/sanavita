import { WFRoute } from "@xatom/core";
import peakflow, { dateflow, Script, Stylesheet } from "peakflow";
import { initBistroMenus } from "src/modules/menu";
import { initWfVideo } from "src/modules/wfvideo";
import { initVimePlayer } from "peakflow/video";
import { initApartmentRegistrationForm } from "src/modules/apartment-form";
import { initCircleTabs } from "./jobs/circle-tabs.js";
import { initSozjobsList } from "@/modules/sozjobs/list";
import { initJobItemPage } from "@/modules/sozjobs/job";
import { de } from "date-fns/locale";

/**
 * WFRoute "/"
 */
export const app = async () => {
  new WFRoute("/").execute(() => {
    initWfVideo();
    peakflow.execute("inlinecms", "swiper", "dateflow");
  });

  new WFRoute("/lindenpark").execute(() => {
    initVimePlayer({
      customPoster: true,
    });
    peakflow.execute("copyComponent");
  });

  new WFRoute("/wohnungen").execute(() => {
    peakflow.execute("swiper");
    initVimePlayer({
      customPoster: true,
    });
  });

  new WFRoute("/jobs").execute(() => {
    initCircleTabs();
    initSozjobsList();
    peakflow.execute("uploadcare");
    new Stylesheet({
      href: "https://cdn.jsdelivr.net/gh/lukas-peakpoint/peakpoint@v0.2.46/assets/css/uploadcare-sanavita.css",
    }).load();
  });

  new WFRoute("/jobs/job").execute(() => {
    initJobItemPage();
  });

  new WFRoute("/bistro").execute(() => {
    peakflow.execute("inlinecms", "swiper", "dateflow");
  });

  new WFRoute("/bistro/bankette").execute(() => {
    peakflow.execute("cmsselect");
  });

  new WFRoute("/uber-uns").execute(() => {
    peakflow.execute("copyComponent");
  });

  new WFRoute("/aktuelles").execute(async () => {
    await new Script({
      src: "https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js",
      type: "module",
      async: true,
      attributes: {
        "fs-list": null,
      },
    }).load();

    const listWrapperSelector = `[data-wf-collection="news"]`;
    const listWrapper =
      document.querySelector<HTMLElement>(listWrapperSelector);

    dateflow(de, listWrapper);

    const selector = `[fs-list-fuzzy]`;
    const searchInputs = document.querySelectorAll<HTMLElement>(selector);
    searchInputs.forEach((input) => {
      input.addEventListener("input", () => {
        dateflow(de, listWrapper);
      });
    });
  });

  new WFRoute("/dokumente").execute(() => {
    new Script({
      src: "https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js",
      type: "module",
      async: true,
      attributes: {
        "fs-list": null,
        "fs-list-highlight": "true",
        "fs-list-highlightclass": "is-hightlight",
      },
    }).load();
  });
};

/**
 * Every page with bistro menu cards
 */
export const bistroMenus = () => {
  const routes: string[] = ["/", "/bistro", "/bistro/bankette"];

  for (const currentRoute of routes) {
    new WFRoute(currentRoute).execute(() => {
      initBistroMenus();
    });
  }
};

export const forms = () => {
  const routes: string[] = [
    "/anmeldung-wohnen-mit-service",
    "/wohnungen/anmeldung",
  ];

  for (const currentRoute of routes) {
    new WFRoute(currentRoute).execute(() => {
      initApartmentRegistrationForm();
      peakflow.execute("uploadcare");
      new Stylesheet({
        href: "https://cdn.jsdelivr.net/gh/lukas-peakpoint/peakpoint@v0.2.46/assets/css/uploadcare-sanavita.css",
      }).load();
    });
  }
};

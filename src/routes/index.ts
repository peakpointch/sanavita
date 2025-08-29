import { WFRoute } from "@xatom/core";
import peakflow, { Stylesheet } from "peakflow";
import { initBistroMenus } from "src/modules/menu";
import { initWfVideo } from "src/modules/wfvideo";
import { initVimePlayer } from "peakflow/video";
import { initApartmentRegistrationForm } from "src/modules/apartment-form";

/**
 * WFRoute "/"
 */
export const app = () => {
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

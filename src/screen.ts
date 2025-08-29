import { onReady, WFRoute } from "@xatom/core";
import { initBistroMenus } from "./modules/menu";
import { initDigitalSignage } from "./modules/screen/home";
import peakflow from "peakflow";

onReady(() => {
  const homeRoutes = [
    "/screen/home",
    "/screen/home-lindenpark",
    "/screen/home-sonnenweg",
  ];
  for (const route of homeRoutes) {
    new WFRoute(route).execute(() => {
      initDigitalSignage();
    });
  }

  new WFRoute("/screen/bistro").execute(() => {
    peakflow.execute("swiper");
    initBistroMenus();
  });
});

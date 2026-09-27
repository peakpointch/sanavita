import { onReady, WFRoute } from "@xatom/core";
import { initDigitalSignage } from "./modules/screen/home";
import { initWfVideo } from "./modules/wfvideo";
import { peakflow, Dataset } from "peakflow";

onReady(() => {
  const dataset = Dataset.define({
    isPreview: Dataset.Boolean("data-admin-preview", false),
    previewRoute: Dataset.String("data-preview-route"),
  });

  const { isPreview, previewRoute } = dataset.parse(document.documentElement);

  // Route matching helper
  const handleRoute = (route: string, callback: () => void) => {
    if (isPreview) {
      if (previewRoute === route) callback();
    } else {
      new WFRoute(route).execute(callback);
    }
  };

  const homeRoutes = [
    "/screen/home",
    "/screen/home-lindenpark",
    "/screen/home-rzl",
    "/screen/home-sonnenweg",
  ];
  for (const route of homeRoutes) {
    handleRoute(route, () => {
      peakflow.execute("inlinecms", "swiper");
      initDigitalSignage({ preview: isPreview });
      peakflow.execute("dateflow");
    });
  }

  handleRoute("/screen/bistro", () => {
    peakflow.execute("inlinecms", "swiper");
    peakflow.execute("dateflow");
  });

  handleRoute("/screen/video-home", () => {
    initWfVideo(document);
  });
});

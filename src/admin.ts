import { onReady, WFRoute } from "@xatom/core";
import { initActivityPdf } from "src/modules/activity-pdf";
import { initMenuplanPdf } from "src/modules/menuplan-pdf";

onReady(() => {
  new WFRoute("/admin/menuplan").execute(() => {
    initMenuplanPdf();
  });

  new WFRoute("/admin/aktivitaten").execute(() => {
    initActivityPdf();
  });
});

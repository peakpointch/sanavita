import { onReady, WFRoute } from "@xatom/core";
import { initActivityPdf } from "@/modules/activity-pdf";
import { initMenuplanPdf } from "@/modules/menuplan-pdf";

onReady(() => {
  new WFRoute("/admin/menuplan").execute(() => {
    initMenuplanPdf();
  });

  new WFRoute("/admin/aktivitaten").execute(() => {
    initActivityPdf();
  });
});

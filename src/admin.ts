import { WFRoute } from "@xatom/core";
import { initActivityPdf } from "src/modules/activity-pdf";
import { initMenuplanPdf } from "src/modules/menuplan-pdf";

export const adminMenuplan = () => {
  new WFRoute("/admin/menuplan").execute(() => {
    initMenuplanPdf();
  });
};

export const adminActivity = () => {
  new WFRoute("/admin/aktivitaten").execute(() => {
    initActivityPdf();
  });
};

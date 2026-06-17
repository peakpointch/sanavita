import { WFRoute } from "@xatom/core";
import peakflow, { PdfEmbed, PdfEmbedFile, Script, Stylesheet, payload } from "peakflow";
import { initVimePlayer } from "peakflow/video";
import app from "@/manifest.js";
import { initCircleTabs } from "@/routes/jobs/circle-tabs.js";
import { initBistroMenus } from "@/modules/menu";
import { initWfVideo } from "@/modules/wfvideo";
import { initApartmentRegistrationForm } from "@/modules/apartment-form";
import { initSozjobsList } from "@/modules/sozjobs/list";
import { initJobItemPage } from "@/modules/sozjobs/job";
import { initListFilter } from "@/modules/list-filter.js";
import { initRoomRegistrationForm } from "@/modules/lindenpark-form.js";

/**
 * WFRoute "/"
 */
export const routes = async () => {
  new WFRoute("/").execute(() => {
    initWfVideo();
    peakflow.execute("inlinecms", "swiper", "dateflow");
  });

  new WFRoute("/lindenpark").execute(() => {
    peakflow.execute("swiper");
    initVimePlayer({
      customPoster: true,
    });
    peakflow.execute("copyComponent");
  });

  new WFRoute("/lindenpark/anmeldung").execute(() => {
    initRoomRegistrationForm();
    loadUploadcareStylesheet();
  });

  new WFRoute("/wohnen-mit-service").execute(() => {
    peakflow.execute("swiper");
    initVimePlayer({
      customPoster: true,
    });
  });

  new WFRoute("/jobs").execute(() => {
    initCircleTabs();
    initSozjobsList();
    peakflow.execute("uploadcare");
    loadUploadcareStylesheet();
  });

  new WFRoute("/jobs/job").execute(() => {
    initJobItemPage();
  });

  new WFRoute("/bistro").execute(() => {
    peakflow.execute("inlinecms", "swiper");
    peakflow.execute("dateflow");

    const dateInput = document.querySelector<HTMLInputElement>("#wf-form-Tischreservation #date");
    dateInput.min = new Date().toISOString().split("T")[0];
  });

  new WFRoute("/bistro/bankette").execute(() => {
    peakflow.execute("cmsselect");
  });

  new WFRoute("/uber-uns").execute(() => {
    peakflow.execute("copyComponent");
  });

  new WFRoute("/aktuelles").execute(async () => {
    peakflow.execute("dateflow");
    initListFilter();
  });

  new WFRoute("/aktuelles/(.*)").execute(async () => {
    peakflow.execute("inlinecms", "swiper");
    peakflow.execute("dateflow");
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

  new WFRoute("/dokumente/(.*)").execute(async () => {
    const embed = new PdfEmbed(document.body, {
      clientIds: {
        localhost: "e224587c20e14348b402d87d050ec2df",
        "sanavita-ag.webflow.io": "e224587c20e14348b402d87d050ec2df",
        "sanavita-ag.ch": "744f4f1acac04b4ea39d95a5bba33ceb",
      },
    });

    const file = payload.get<PdfEmbedFile>("file");
    await embed.preview(file);
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
  new WFRoute("/wohnen-mit-service/anmeldung").execute(() => {
    initApartmentRegistrationForm();
    peakflow.execute("uploadcare");
    loadUploadcareStylesheet();
  });
};

export const loadUploadcareStylesheet = (): void => {
  const ucStyles = new Stylesheet({
    href: `https://cdn.jsdelivr.net/gh/peakpointch/${app.name}@v${app.version}/src/styles/uploadcare.css`,
  });

  ucStyles.setAttribute("data-devflow-local", "src/styles/uploadcare.css");
  ucStyles.setAttribute("data-devflow-hmr", "true");
  ucStyles.load();
};

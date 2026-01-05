import { getSozjobsCollection, getSozjobsItem } from "./api";
import { getJobRenderData } from "./list";
import { Renderer } from "peakflow";

function removePlaceholderClass(): void {
  document
    .querySelector<HTMLElement>('[data-job-element="layout"]')
    .classList.remove("placeholder");
}

export async function initJobItemPage() {
  const url = new URL(window.location.href);
  const { contractTypes } = await getSozjobsCollection("contractTypes");
  const jobId = url.searchParams.get("id");
  const job = await getSozjobsItem("jobs", jobId);

  const renderer = new Renderer(document.body, {
    attributeName: "job",
    pathPrefix: "renderer"
  });

  const renderData = getJobRenderData({
    job: job,
    contractTypes: contractTypes,
  });

  renderer.render(renderData);

  removePlaceholderClass();
}

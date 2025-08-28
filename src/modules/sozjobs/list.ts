import { getSozjobsCollection, getSozjobsItem } from "./api";
import { RenderData, Renderer } from "peakflow";
import type { SozjobsContractType, SozjobsJob } from "./types";

function createOption(value: string): HTMLOptionElement {
  const optionElement = document.createElement("option");
  optionElement.setAttribute("value", value);
  optionElement.innerText = value;
  return optionElement;
}

function emptyState(jobList: HTMLElement, jobEmptyState: HTMLElement) {
  jobList.remove();
  jobEmptyState.classList.remove("hide");
}

function disableLoading(jobLoadingTemplate: NodeListOf<HTMLElement>) {
  jobLoadingTemplate.forEach((element) => {
    element.remove();
  });
}

export function getJobRenderData(data: {
  job: SozjobsJob;
  contractTypes: SozjobsContractType[];
}): RenderData {
  const { job, contractTypes } = data;

  const renderData: RenderData = [
    {
      element: "title",
      value: job.title,
      type: "text",
      visibility: true,
    },
    {
      element: "accession-per",
      value: job.accessionper,
      type: "text",
      visibility: true,
    },
    {
      element: "rate",
      value: job.isparttime
        ? job.parttimefrom === job.parttimeto
          ? `${job.parttimeto}%`
          : `${job.parttimefrom}-${job.parttimeto}%`
        : "Vollzeit 100%",
      type: "text",
      visibility: true,
    },
    {
      element: "categories",
      value: (() => {
        return job.categories
          .map((category: any) => (category ? category.name : ""))
          .filter((name: string | null) => name !== null)
          .join(", ");
      })(),
      type: "text",
      visibility: true,
    },
    {
      element: "contract-type",
      value: (() => {
        return contractTypes.find((type) => type.key === job.contracttype)
          ?.value;
      })(),
      type: "text",
      visibility: true,
    },
    {
      element: "abstract",
      value: job.abstract,
      type: "html",
      visibility: true,
    },
    {
      element: "detail",
      value: job.detail,
      type: "html",
      visibility: true,
    },
  ];

  return renderData;
}

function cloneTemplate<T extends Element>(template: T): T {
  const cloned = template.cloneNode(true) as T;
  cloned.classList.remove("hide");
  return cloned;
}

export async function initSozjobsList() {
  function displayJobs(start: number, count: number) {
    // Select jobs to show
    const jobsToShow = jobs.slice(start, start + count);

    // Render jobs
    jobsToShow.forEach((job) => {
      const newJobCard = cloneTemplate(jobCardTemplate);

      const renderData = getJobRenderData({
        job: job,
        contractTypes: contractTypes,
      });

      renderer.render(renderData, newJobCard);

      const cardLink = newJobCard.querySelector<HTMLAnchorElement>("a");
      if (cardLink) {
        cardLink.href = `/jobs/job?id=${job.identitynumber}`;
        cardLink.target = "";
      }

      jobList.appendChild(newJobCard);
    });
  }

  const formSelectField = document.querySelector<HTMLElement>(
    "[data-form-select-target]",
  );
  const jobComponent = document.querySelector<HTMLElement>(
    '[data-job-element="component"]',
  );
  const jobList = jobComponent.querySelector<HTMLElement>(
    '[data-job-element="list"]',
  );
  const jobEmptyState = jobComponent.querySelector<HTMLElement>(
    '[data-job-element="empty-state"]',
  );
  const jobLoadingTemplate = jobComponent.querySelectorAll<HTMLElement>(
    '[data-job-element="loading"]',
  );
  const jobCardTemplate = jobComponent.querySelector<HTMLElement>(
    '[data-job-element="template"]',
  );
  const renderer = new Renderer(jobList, {
    attributeName: "job",
  });

  let displayedJobs = 3; // Start with the first 3 jobs

  const { contractTypes, publicationsOwn } = await getSozjobsCollection(
    "contractTypes",
    "publicationsOwn",
  );

  const jobIds = publicationsOwn.map((pub) => pub.jobidentitynumber);
  jobIds.push("J931213"); // Change this for dev
  const jobs = await getSozjobsItem("jobs", jobIds);

  if (!jobs.length) {
    emptyState(jobList, jobEmptyState);
    return;
  }

  jobEmptyState.remove();

  // Initial display of jobs
  displayJobs(0, displayedJobs);
  disableLoading(jobLoadingTemplate);

  // Load More Button
  if (jobs.length > displayedJobs) {
    const loadButton = jobComponent.querySelector(
      '[data-job-element="pagination"]',
    );
    loadButton.classList.remove("hide");

    loadButton.addEventListener("click", () => {
      displayedJobs += 3; // Increase the count of displayed jobs
      displayJobs(displayedJobs - 3, 3); // Display the next set of jobs

      // Hide the button if all jobs are displayed
      if (displayedJobs >= jobs.length) {
        loadButton.classList.add("hide");
      }
    });
  }

  jobs.map((job) => {
    const optionElement = createOption(job.title);
    formSelectField.appendChild(optionElement);
  });
}

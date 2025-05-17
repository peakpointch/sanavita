(() => {
  // src/sanavita/sozjobs.js
  function toKebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }
  function toJobDataset(str) {
    return `job${str.charAt(0).toUpperCase() + str.slice(1)}`;
  }
  function Option(value) {
    const optionElement = document.createElement("option");
    optionElement.setAttribute("value", value);
    optionElement.innerText = value;
    return optionElement;
  }
  function emptyState() {
    jobList.remove();
    jobEmptyState.classList.remove("hide");
  }
  function disableLoading() {
    jobLoadingTemplate.forEach((element) => {
      element.remove();
    });
  }
  var formSelectField = document.querySelector("[data-form-select-target]");
  var jobComponent = document.querySelector('[data-job-element="component"]');
  var jobList = jobComponent.querySelector('[data-job-element="list"]');
  var jobEmptyState = jobComponent.querySelector('[data-job-element="empty-state"]');
  var jobCardTemplate = jobComponent.querySelector('[data-job-element="template"]');
  var jobLoadingTemplate = jobComponent.querySelectorAll('[data-job-element="loading"]');
  var displayedJobs = 3;
  window.addEventListener("jobDataReady", () => {
    let jobs = window.jobData;
    const contractTypes = window.contractTypesData;
    if (!jobs.length) {
      emptyState();
      return;
    }
    jobEmptyState.remove();
    const displayJobs = (start, count) => {
      const jobsToShow = jobs.slice(start, start + count);
      jobsToShow.forEach((job) => {
        const jobCard = jobCardTemplate.cloneNode(true);
        jobCard.classList.remove("hide");
        jobCard.classList.remove("is-template");
        jobCard.style.display = "flex";
        const props = ["title", "accessionPer", "rate", "categoryNames", "contractTypeName"];
        if (job.isparttime) {
          job.rate = `${job.parttimefrom}-${job.parttimeto}%`;
        } else {
          job.rate = `Vollzeit 100%`;
        }
        job.categorynames = job.categories.map((category) => category ? category.name : "").filter((name) => name !== null).join(", ");
        job.contracttypename = contractTypes.find((type) => type.key === job.contracttype)?.value;
        props.forEach((prop) => {
          const attr = `[data-job-${toKebabCase(prop)}]:not(a)`;
          const el = jobCard.querySelector(attr);
          el.innerText = job[prop.toLowerCase()];
          el.dataset[toJobDataset(prop)] = job[prop.toLowerCase()] || "init";
        });
        const cardLink = jobCard.querySelector("a");
        cardLink.href = `/jobs/job?id=${job.identitynumber}`;
        cardLink.target = "";
        jobList.appendChild(jobCard);
      });
    };
    displayJobs(0, displayedJobs);
    disableLoading();
    if (jobs.length > displayedJobs) {
      const loadButton = jobComponent.querySelector('[data-job-element="pagination"]');
      loadButton.classList.remove("hide");
      loadButton.addEventListener("click", () => {
        displayedJobs += 3;
        displayJobs(displayedJobs - 3, 3);
        if (displayedJobs >= jobs.length) {
          loadButton.classList.add("hide");
        }
      });
    }
    jobs.map((job) => {
      const optionElement = new Option(job.title);
      formSelectField.appendChild(optionElement);
    });
  });
  window.addEventListener("jobDataEmpty", () => {
    emptyState();
  });
})();
//# sourceMappingURL=sozjobs.js.map

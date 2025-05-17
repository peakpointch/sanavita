function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

function toJobDataset(str) {
  return `job${str.charAt(0).toUpperCase() + str.slice(1)}`;
}

function Option(value) {
  const optionElement = document.createElement('option');
  optionElement.setAttribute('value', value);
  optionElement.innerText = value;

  return optionElement;
}

function emptyState() {
  jobList.remove();
  jobEmptyState.classList.remove('hide');
}

function disableLoading() {
  jobLoadingTemplate.forEach(element => {
    element.remove();
  });
}

const formSelectField = document.querySelector("[data-form-select-target]");
const jobComponent = document.querySelector('[data-job-element="component"]');
const jobList = jobComponent.querySelector('[data-job-element="list"]');
const jobEmptyState = jobComponent.querySelector('[data-job-element="empty-state"]');
const jobCardTemplate = jobComponent.querySelector('[data-job-element="template"]');
const jobLoadingTemplate = jobComponent.querySelectorAll('[data-job-element="loading"]');

let displayedJobs = 3; // Start with the first 3 jobs

window.addEventListener('jobDataReady', () => {
  let jobs = window.jobData; // Get all jobs fetched by api
  const contractTypes = window.contractTypesData;

  // console.log('JOB DATA READY', jobs);
  // jobs = [];

  if (!jobs.length) {
    emptyState();
    return
  }
  jobEmptyState.remove();

  const displayJobs = (start, count) => {
    const jobsToShow = jobs.slice(start, start + count);
    jobsToShow.forEach(job => {
      const jobCard = jobCardTemplate.cloneNode(true);
      jobCard.classList.remove('hide');
      jobCard.classList.remove('is-template');
      jobCard.style.display = "flex";
      const props = ['title', 'accessionPer', 'rate', 'categoryNames', 'contractTypeName'];

      // Determine rate
      if (job.isparttime) {
        job.rate = `${job.parttimefrom}-${job.parttimeto}%`;
      } else {
        job.rate = `Vollzeit 100%`;
      }

      // Determine category names
      job.categorynames = job.categories
        .map(category => category ? category.name : '')
        .filter(name => name !== null)
        .join(', ');

      job.contracttypename = contractTypes.find(type => type.key === job.contracttype)?.value;

      props.forEach(prop => {
        const attr = `[data-job-${toKebabCase(prop)}]:not(a)`;
        const el = jobCard.querySelector(attr);
        el.innerText = job[prop.toLowerCase()];
        el.dataset[toJobDataset(prop)] = job[prop.toLowerCase()] || "init";
      });

      const cardLink = jobCard.querySelector('a');
      cardLink.href = `/jobs/job?id=${job.identitynumber}`;
      cardLink.target = "";

      jobList.appendChild(jobCard);
    });
  };

  // Initial display of jobs
  displayJobs(0, displayedJobs);
  disableLoading();

  // Load More Button
  if (jobs.length > displayedJobs) {
    const loadButton = jobComponent.querySelector('[data-job-element="pagination"]');
    loadButton.classList.remove('hide');

    loadButton.addEventListener('click', () => {
      displayedJobs += 3; // Increase the count of displayed jobs
      displayJobs(displayedJobs - 3, 3); // Display the next set of jobs

      // Hide the button if all jobs are displayed
      if (displayedJobs >= jobs.length) {
        loadButton.classList.add('hide');
      }
    });
  }

  jobs.map(job => {
    const optionElement = new Option(job.title);
    formSelectField.appendChild(optionElement);
  });
});

window.addEventListener('jobDataEmpty', () => {
  emptyState();
});

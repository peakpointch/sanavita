(() => {
  function toKebabCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
  }

  function toJobDataset(str) {
    return `job${str.charAt(0).toUpperCase() + str.slice(1)}`;
  }

  const jobComponent = document.querySelector('[data-job-element="component"]');
  const jobList = jobComponent.querySelector('[data-job-element="list"]');
  const jobEmptyState = jobComponent.querySelector('[data-job-element="empty-state"]');
  const jobCardTemplate = jobComponent.querySelector('[data-job-element="template"]');

  window.addEventListener('jobDataReady', () => {
    console.log('JOB DATA READY');
    jobEmptyState.remove();

    const jobs = window.jobData; // Get all jobs fetched by api
    const categories = window.categoryData;
    const contractTypes = window.contractTypesData;

    console.log(jobData);

    jobs.forEach(job => {
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
        .map(category => {
          console.log('CATEGORY NAME:', category.name);
          return category ? category.name : '';
        })
        .filter(name => name !== null)
        .join(', ');

      job.contracttypename = contractTypes.find(type => type.key === job.contracttype)?.value

      props.forEach(prop => {
        const attr = `[data-job-${toKebabCase(prop)}]:not(a)`;
        const el = jobCard.querySelector(attr);
        // console.log(el);
        el.innerText = job[prop.toLowerCase()];
        el.dataset[toJobDataset(prop)] = job[prop.toLowerCase()] || "init";

        if (prop === 'title') {
          el.dataset.formSelectOptionValue = job[prop.toLowerCase()];
        }
      });

      const cardLink = jobCard.querySelector('a');
      cardLink.href = `/jobs/job?id=${job.identitynumber}`;
      cardLink.target = ""

      jobList.appendChild(jobCard);
      console.log(job);
    });

    const cmsFormSelectReady = new Event('cmsFormSelectReady');
    jobList.dispatchEvent(cmsFormSelectReady);
  })

  window.addEventListener('jobDataEmpty', () => {
    jobList.remove();
  })
})();
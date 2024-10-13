(() => {
  function toKebabCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
  }

  function toJobDataset(str) {
    return `job${str.charAt(0).toUpperCase() + str.slice(1)}`;
  }

  function removePlaceholderClass() {
    document.querySelector('[data-job-element="layout"]').classList.remove('placeholder');
  }

  window.addEventListener('jobDataReady', () => {
    const job = window.jobData;
    const contractTypes = window.contractTypesData;
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
        return category ? category.name : '';
      })
      .filter(name => name !== null)
      .join(', ');

    job.contracttypename = contractTypes.find(type => type.key === job.contracttype)?.value

    props.forEach(prop => {
      const attr = `[data-job-${toKebabCase(prop)}]:not(a)`;
      const elements = document.querySelectorAll(attr);
      elements.forEach(el => {
        el.innerText = job[prop.toLowerCase()];
        el.dataset[toJobDataset(prop)] = job[prop.toLowerCase()] || "init";
      });
    });

    const abstractWrapper = document.querySelector('[data-job-abstract]');
    abstractWrapper.insertAdjacentHTML('beforeend', job.abstract)

    const detailWrapper = document.querySelector('[data-job-detail]');
    detailWrapper.insertAdjacentHTML('beforeend', job.detail)

    removePlaceholderClass();
  })
})();
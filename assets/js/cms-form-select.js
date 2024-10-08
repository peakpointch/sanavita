(() => {
  function getSelectValue(item) {
    const prefix = item.dataset.formSelectOptionPrefix || "";
    const value = item.dataset.formSelectOptionValue || "";

    const optionValue = prefix ? `${prefix} ${value}` : value;
    return optionValue;
  }

  function Option(value) {
    const optionElement = document.createElement('option');
    optionElement.setAttribute('value', value);
    optionElement.innerText = value;

    return optionElement;
  }

  function insertSelectOptions() {
    const items = selectList.querySelectorAll("[data-form-select-option-value]");
    const selectTarget = document.querySelector("[data-form-select-target]");

    items.forEach(item => {
      const optionValue = getSelectValue(item);

      if (optionValue) {
        const option = new Option(optionValue);
        console.log('CMS FORM SELECT -- INSERTING ...', optionValue);
        selectTarget.appendChild(option);
      } else {
        console.log('CMS FORM SELECT -- SKIPPING EMPTY OPTION');
      }
    });
  }

  const selectList = document.querySelector("[data-form-select-source]");
  const waitEvent = selectList.dataset.formSelectWait

  if (waitEvent && waitEvent.length > 0) {
    console.log('CMS FORM SELECT -- WAITING ...');

    selectList.addEventListener(selectList.dataset.formSelectWait, insertSelectOptions);
  } else {
    console.log('CMS FORM SELECT -- INSTANT ...');
    insertSelectOptions();
  }
})();
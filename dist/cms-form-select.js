(() => {
  // src/js/cms-form-select.js
  function getSelectValue(item) {
    const prefix = item.dataset.formSelectOptionPrefix || "";
    const value = item.dataset.formSelectOptionValue || "";
    const optionValue = prefix ? `${prefix} ${value}` : value;
    return optionValue;
  }
  function Option(value) {
    const optionElement = document.createElement("option");
    optionElement.setAttribute("value", value);
    optionElement.innerText = value;
    return optionElement;
  }
  function insertSelectOptions() {
    const items = selectList.querySelectorAll('[data-form-select-element="option-value"]');
    const selectTarget = document.querySelector('[data-form-select-element="target"]');
    items.forEach((item) => {
      const optionValue = getSelectValue(item);
      const optionStatus = item.dataset.status ? item.dataset.status : null;
      if (optionValue && (!optionStatus || optionStatus === "active")) {
        const option = new Option(optionValue);
        console.log("CMS FORM SELECT -- INSERTING ...", optionValue);
        selectTarget.appendChild(option);
      } else {
        console.log("CMS FORM SELECT -- SKIPPING EMPTY OPTION");
      }
    });
  }
  var selectList = document.querySelector('[data-form-select-element="source"]');
  var waitEvent = selectList.dataset.formSelectWait || null;
  if (waitEvent && waitEvent.length > 0) {
    console.log("CMS FORM SELECT -- WAITING ...");
    selectList.addEventListener(selectList.dataset.formSelectWait, insertSelectOptions);
  } else {
    console.log("CMS FORM SELECT -- INSTANT ...");
    insertSelectOptions();
  }
})();

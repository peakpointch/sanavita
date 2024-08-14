(() => {
  function getSelectValue(item) {
    const prefix = item.dataset.formSelectOptionPrefix + " ";
    const value = item.dataset.formSelectOptionValue;

    const optionValue =  prefix + value;
    return optionValue;
  }

  function Option(value) {
    const optionElement = document.createElement('option');
    optionElement.setAttribute('value', value);
    optionElement.innerText = value;

    return optionElement;
  }

  const selectList = document.querySelector("[data-form-select-source]");
  const items = selectList.querySelectorAll("[data-form-select-option-value]");
  const selectTarget = document.querySelector("[data-form-select-target]");

  items.forEach(item => {
    const optionValue = getSelectValue(item);
    const option = new Option(optionValue);

    selectTarget.appendChild(option);
  });
})();
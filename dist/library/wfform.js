// library/attributeselector.ts
var createAttribute = (attrName, defaultValue = null) => {
  return (name = defaultValue) => {
    if (!name) {
      return `[${attrName}]`;
    }
    return `[${attrName}="${name}"]`;
  };
};
var attributeselector_default = createAttribute;

// library/wfform.ts
var siteId = document.documentElement.dataset.wfSite || "";
var pageId = document.documentElement.dataset.wfPage || "";
var W_CHECKBOX_CLASS = ".w-checkbox-input";
var W_RADIO_CLASS = ".w-radio-input";
var W_CHECKED_CLASS = "w--redirected-checked";
var W_INPUT = ".w-input";
var W_SELECT = ".w-select";
var formElementSelector = attributeselector_default("data-form-element");
var filterFormSelector = attributeselector_default("data-filter-form");
var FORM_SELECTOR = "form";
var CHECKBOX_INPUT_SELECTOR = `.w-checkbox input[type="checkbox"]:not(${W_CHECKBOX_CLASS})`;
var RADIO_INPUT_SELECTOR = '.w-radio input[type="radio"]';
var FORM_INPUT_SELECTOR_LIST = [
  W_INPUT,
  W_SELECT,
  RADIO_INPUT_SELECTOR,
  CHECKBOX_INPUT_SELECTOR
];
var FORM_INPUT_SELECTOR = FORM_INPUT_SELECTOR_LIST.join(", ");
var FORM_FILTERS_SELECTOR = FORM_INPUT_SELECTOR_LIST.join(`${filterFormSelector("field")}, `);
function isRadioInput(input) {
  return input instanceof HTMLInputElement && input.type === "radio";
}
function isCheckboxInput(input) {
  return input instanceof HTMLInputElement && input.type === "checkbox";
}
async function sendFormData(formData) {
  const url = `https://webflow.com/api/v1/form/${siteId}`;
  const request = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/javascript, */*; q=0.01"
    },
    body: JSON.stringify(formData)
  };
  try {
    const response = await fetch(url, request);
    if (!response.ok) {
      throw new Error(`Network response "${response.status}" was not okay`);
    }
    console.log("Form submission success! Status", response.status);
    return true;
  } catch (error) {
    console.error("Form submission failed:", error);
    return false;
  }
}
function clearRadioGroup(container, name) {
  container.querySelectorAll(
    `${RADIO_INPUT_SELECTOR}[name="${name}"]`
  ).forEach((radio) => {
    radio.checked = false;
    const customRadio = radio.closest(".w-radio")?.querySelector(W_RADIO_CLASS);
    if (customRadio) {
      customRadio.classList.remove(W_CHECKED_CLASS);
    }
  });
}
function initCustomInputs(container) {
  const focusClass = "w--redirected-focus";
  const focusVisibleClass = "w--redirected-focus-visible";
  const focusVisibleSelector = ":focus-visible, [data-wf-focus-visible]";
  const inputTypes = [
    ["checkbox", W_CHECKBOX_CLASS],
    ["radio", W_RADIO_CLASS]
  ];
  container.querySelectorAll(CHECKBOX_INPUT_SELECTOR).forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target;
      const customCheckbox = target.closest(".w-checkbox")?.querySelector(W_CHECKBOX_CLASS);
      if (customCheckbox) {
        customCheckbox.classList.toggle(W_CHECKED_CLASS, target.checked);
      }
    });
  });
  container.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target;
      if (!target.checked)
        return;
      const name = target.name;
      container.querySelectorAll(
        `input[type="radio"][name="${name}"]`
      ).forEach((radio) => {
        const customRadio = radio.closest(".w-radio")?.querySelector(W_RADIO_CLASS);
        if (customRadio) {
          customRadio.classList.remove(W_CHECKED_CLASS);
        }
      });
      const selectedCustomRadio = target.closest(".w-radio")?.querySelector(W_RADIO_CLASS);
      if (selectedCustomRadio) {
        selectedCustomRadio.classList.add(W_CHECKED_CLASS);
      }
    });
  });
  inputTypes.forEach(([type, customClass]) => {
    container.querySelectorAll(
      `input[type="${type}"]:not(${customClass})`
    ).forEach((input) => {
      input.addEventListener("focus", (event) => {
        const target = event.target;
        const customElement = target.closest(".w-checkbox, .w-radio")?.querySelector(customClass);
        if (customElement) {
          customElement.classList.add(focusClass);
          if (target.matches(focusVisibleSelector)) {
            customElement.classList.add(focusVisibleClass);
          }
        }
      });
      input.addEventListener("blur", (event) => {
        const target = event.target;
        const customElement = target.closest(".w-checkbox, .w-radio")?.querySelector(customClass);
        if (customElement) {
          customElement.classList.remove(focusClass, focusVisibleClass);
        }
      });
    });
  });
}
function validateFields(inputs, report = true) {
  let valid = true;
  let invalidField = null;
  for (const input of Array.from(inputs)) {
    if (!input.checkValidity()) {
      valid = false;
      if (report && !invalidField) {
        input.reportValidity();
        input.classList.add("has-error");
        if (isCheckboxInput(input)) {
          input.parentElement?.querySelector(W_CHECKBOX_CLASS)?.classList.add("has-error");
        }
        input.addEventListener(
          "change",
          () => {
            input.classList.remove("has-error");
            if (isCheckboxInput(input)) {
              input.parentElement?.querySelector(W_CHECKBOX_CLASS)?.classList.remove("has-error");
            }
          },
          { once: true }
        );
        invalidField = input;
      }
      break;
    } else {
      input.classList.remove("has-error");
    }
  }
  return { valid, invalidField };
}
var wf = {
  siteId,
  pageId
};
var wfclass = {
  input: W_INPUT,
  select: W_SELECT,
  radio: W_RADIO_CLASS,
  checkbox: W_CHECKBOX_CLASS,
  checked: W_CHECKED_CLASS
};
var formQuery = {
  form: FORM_SELECTOR,
  checkbox: CHECKBOX_INPUT_SELECTOR,
  radio: RADIO_INPUT_SELECTOR,
  select: W_SELECT,
  input: FORM_INPUT_SELECTOR,
  inputOnly: W_INPUT,
  inputSelectorList: FORM_INPUT_SELECTOR_LIST,
  filters: FORM_FILTERS_SELECTOR
};
export {
  clearRadioGroup,
  filterFormSelector,
  formElementSelector,
  formQuery,
  initCustomInputs,
  isCheckboxInput,
  isRadioInput,
  sendFormData,
  validateFields,
  wf,
  wfclass
};

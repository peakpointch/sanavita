// library/parameterize.ts
function parameterize(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-");
}

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
var W_INPUT = ".w-input";
var W_SELECT = ".w-select";
var formElementSelector = attributeselector_default("data-form-element");
var filterFormSelector = attributeselector_default("data-filter-form");
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

// library/formfield.ts
var FormField = class {
  constructor(data = null) {
    if (!data) {
      return;
    }
    this.id = data.id || `field-${Math.random().toString(36).substring(2)}`;
    this.label = data.label || `Unnamed Field`;
    this.value = data.value || "";
    this.required = data.required || false;
    this.type = data.type || "text";
    if (this.type === "radio" || "checkbox") {
      this.checked = data.checked || false;
    }
    if (this.type === "checkbox" && !this.checked) {
      console.log(this.label, this.type, this.checked, data.checked);
      this.value = "Nicht angew\xE4hlt";
    }
  }
  validate(report = true) {
    let valid = true;
    if (this.required) {
      if (this.type === "radio" || this.type === "checkbox") {
        if (!this.checked) {
          valid = false;
        }
      } else {
        if (!this.value.trim()) {
          valid = false;
        }
      }
    }
    if (!valid && report) {
      console.warn(`Field "${this.label}" is invalid.`);
    }
    return valid;
  }
};
function FieldFromInput(input, index) {
  if (input.type === "radio" && !input.checked) {
    return new FormField();
  }
  const field = new FormField({
    id: input.id || parameterize(input.dataset.name || `field ${index}`),
    label: input.dataset.name || `field ${index}`,
    value: input.value,
    required: input.required || false,
    type: input.type,
    checked: isCheckboxInput(input) || isRadioInput(input) ? input.checked : void 0
  });
  return field;
}
export {
  FieldFromInput,
  FormField
};

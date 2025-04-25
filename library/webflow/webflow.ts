import type {
  Webflow,
  WebflowClassNames,
  WebflowSelectors,
  WebflowFormQuery,
} from "~/types/webflow";

// Webflow environment
const siteId: string = document.documentElement.dataset.wfSite || "";
const pageId: string = document.documentElement.dataset.wfPage || "";

// Constants
export const wfclass: WebflowClassNames = {
  input: "w-input",
  select: "w-select",
  radio: "w-radio-input",
  checkbox: "w-checkbox-input",
  checked: "w--redirected-checked",
};

export const wfselect: WebflowSelectors = {
  input: `.${wfclass.input}`,
  select: `.${wfclass.select}`,
  radio: `.${wfclass.radio}`,
  checkbox: `.${wfclass.checkbox}`,
  checked: `.${wfclass.checked}`,
};

const inputSelectorList: string[] = [
  wfselect.input,
  wfselect.select,
  '.w-radio input[type="radio"]',
  `.w-checkbox input[type="checkbox"]:not(${wfselect.checkbox})`,
];

export const wfform: WebflowFormQuery = {
  form: "form",
  checkbox: `.w-checkbox input[type="checkbox"]:not(${wfselect.checkbox})`,
  radio: '.w-radio input[type="radio"]',
  select: wfselect.select,
  inputOnly: wfselect.input,
  inputSelectorList,
  input: inputSelectorList.join(", "),
};

// You can assign these from env, config, or inject later
export const wf: Webflow = {
  siteId: "your-site-id", // ideally replaced at runtime
  pageId: "your-page-id", // ideally replaced at runtime
  class: wfclass,
  query: wfselect,
  formQuery: wfform,
};

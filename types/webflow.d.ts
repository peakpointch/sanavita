export interface WebflowClassNames {
  input: "w-input";
  select: "w-select";
  radio: "w-radio-input";
  checkbox: "w-checkbox-input";
  checked: "w--redirected-checked";
}

export interface WebflowSelectors {
  input: ".w-input";
  select: ".w-select";
  radio: ".w-radio-input";
  checkbox: ".w-checkbox-input";
  checked: ".w--redirected-checked";
}

export interface WebflowFormQuery {
  form: string;
  checkbox: string;
  radio: string;
  select: string;
  input: string;
  inputOnly: string;
  inputSelectorList: string[];
  filters?: string;
}

export interface Webflow {
  siteId: string;
  pageId: string;
  class: WebflowClassNames;
  query: WebflowSelectors;
  formQuery: WebflowFormQuery;
}


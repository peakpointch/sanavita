export interface WebflowClassNames {
  input: "w-input";
  select: "w-select";
  wradio: "w-radio";
  radio: "w-radio-input";
  wcheckbox: "w-checkbox";
  checkbox: "w-checkbox-input";
  checked: "w--redirected-checked";
}

type InputSelectorList = Array<
  `.${WebflowClassNames["input"]}`
  | `.${WebflowClassNames["select"]}`
  | `.${WebflowClassNames["wradio"]} input[type="radio"]`
  | `.${WebflowClassNames["wcheckbox"]} input[type="checkbox"]:not(.${WebflowClassNames["checkbox"]})`
>;

export interface WebflowSelectors {
  input: `.${WebflowClassNames["input"]}`;
  select: `.${WebflowClassNames["select"]}`;
  wradio: `.${WebflowClassNames["wradio"]}`;
  radio: `.${WebflowClassNames["radio"]}`;
  wcheckbox: `.${WebflowClassNames["wcheckbox"]}`;
  checkbox: `.${WebflowClassNames["checkbox"]}`;
  checked: `.${WebflowClassNames["checked"]}`;

  /** CSS Selector to select all `HTMLFormInput`'s. */
  formInput: string;
  radioInput: `.${WebflowClassNames["wradio"]} input[type="radio"]`;
  checkboxInput: `.${WebflowClassNames["wcheckbox"]} input[type="checkbox"]:not(.${WebflowClassNames["checkbox"]})`;
  inputSelectorList: InputSelectorList;
}

export interface Webflow {
  siteId: string;
  pageId: string;
  class: WebflowClassNames;
  select: WebflowSelectors;
}


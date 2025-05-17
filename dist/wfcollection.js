(() => {
  // ../peakflow/src/webflow/webflow.ts
  var siteId = document.documentElement.dataset.wfSite || "";
  var pageId = document.documentElement.dataset.wfPage || "";
  var wfclass = {
    invisible: "w-condition-invisible",
    input: "w-input",
    select: "w-select",
    wradio: "w-radio",
    radio: "w-radio-input",
    wcheckbox: "w-checkbox",
    checkbox: "w-checkbox-input",
    checked: "w--redirected-checked"
  };
  var inputSelectorList = [
    `.${wfclass.input}`,
    `.${wfclass.select}`,
    `.${wfclass.wradio} input[type="radio"]`,
    `.${wfclass.wcheckbox} input[type="checkbox"]:not(.${wfclass.checkbox})`
  ];
  var wfselect = {
    invisible: `.${wfclass.invisible}`,
    input: `.${wfclass.input}`,
    select: `.${wfclass.select}`,
    wradio: `.${wfclass.wradio}`,
    radio: `.${wfclass.radio}`,
    wcheckbox: `.${wfclass.wcheckbox}`,
    checkbox: `.${wfclass.checkbox}`,
    checked: `.${wfclass.checked}`,
    formInput: inputSelectorList.join(", "),
    radioInput: `.${wfclass.wradio} input[type="radio"]`,
    checkboxInput: `.${wfclass.wcheckbox} input[type="checkbox"]:not(.${wfclass.checkbox})`,
    inputSelectorList
  };

  // ../peakflow/src/wfcollection/wfcollection.ts
  var wfCollections = {
    initialized: false
  };
  var initWfCollections = (collections) => {
    if (wfCollections.initialized) return;
    wfCollections.initialized = true;
    collections.forEach((collection) => {
      wfCollections[collection] = [];
    });
  };

  // src/js/wfcollection.js
  window.initWfCollections = initWfCollections;
  window.wfCollections = wfCollections;
})();
//# sourceMappingURL=wfcollection.js.map

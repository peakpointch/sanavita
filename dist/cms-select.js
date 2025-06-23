(() => {
  // ../peakflow/src/attributeselector.ts
  var attrMatchTypes = {
    startsWith: "^",
    endsWith: "$",
    includes: "*",
    whitespace: "~",
    hyphen: "|",
    exact: ""
  };
  function getOperator(type) {
    return attrMatchTypes[type] || "";
  }
  function exclude(selector, ...exclusions) {
    if (exclusions.length === 0) return selector;
    return extend(selector, `:not(${exclusions.join(", ")})`);
  }
  function extend(selector, ...extensions) {
    if (extensions.length === 0) return selector;
    const selectors = split(selector);
    const selectorsWithExtensions = extensions.map((extension) => {
      return append(selectors, extension);
    });
    return selectorsWithExtensions.join(", ");
  }
  function append(selectorList, suffix) {
    return selectorList.reduce((acc, string) => {
      const prefix = acc === "" ? "" : `${acc}, `;
      return `${prefix}${string}${suffix}`;
    }, "");
  }
  function split(selector) {
    const result = [];
    let current = "";
    let depth = 0;
    let i = 0;
    while (i < selector.length) {
      const char = selector[i];
      if (char === "(") {
        depth++;
      } else if (char === ")") {
        depth--;
      }
      if (char === "," && depth === 0) {
        result.push(current.trim());
        current = "";
        i++;
        while (selector[i] === " ") i++;
        continue;
      }
      current += char;
      i++;
    }
    if (current.trim()) {
      result.push(current.trim());
    }
    return result;
  }
  var createAttribute = (attrName, defaultOptions) => {
    const mergedDefaultOptions = {
      defaultMatchType: defaultOptions?.defaultMatchType ?? "exact",
      defaultValue: defaultOptions?.defaultValue ?? void 0,
      defaultExclusions: defaultOptions?.defaultExclusions ?? []
    };
    return (name = mergedDefaultOptions.defaultValue, options) => {
      const mergedOptions = {
        matchType: options?.matchType ?? mergedDefaultOptions.defaultMatchType,
        exclusions: options?.exclusions ?? mergedDefaultOptions.defaultExclusions
      };
      if (!name) {
        return exclude(`[${attrName}]`, ...mergedOptions.exclusions);
      }
      const value = String(name);
      const selector = `[${attrName}${getOperator(mergedOptions.matchType)}="${value}"]`;
      return exclude(selector, ...mergedOptions.exclusions ?? []);
    };
  };
  var attributeselector_default = createAttribute;

  // ../peakflow/src/utils/getelements.ts
  function getAllElements(input, single = false) {
    if (typeof input === "string") {
      const elements = Array.from(document.querySelectorAll(input)).filter(Boolean);
      if (elements.length === 0) {
        throw new Error(`No elements found matching selector: ${input}`);
      } else if (single) {
        return [elements[0]];
      } else {
        return elements;
      }
    } else if (input instanceof HTMLElement) {
      return [input];
    } else if (Array.isArray(input)) {
      return input;
    } else if (input instanceof NodeList) {
      return Array.from(input);
    } else {
      throw new Error("Invalid input provided: must be a string, HTMLElement, array or node list.");
    }
  }
  function getElement(input, singleOnly = true) {
    if (typeof input === "string") {
      const elements = Array.from(document.querySelectorAll(input));
      if (elements.length === 0) {
        throw new Error(`No elements found matching selector: "${input}".`);
      } else if (singleOnly && elements.length > 1) {
        throw new Error(`More than 1 element found matching selector "${input}". Make your selector more specific.`);
      }
      return elements[0];
    } else if (input instanceof HTMLElement) {
      return input;
    } else {
      throw new Error("Invalid input provided: must be a string or HTMLElement.");
    }
  }

  // ../peakflow/src/form/cms-select.ts
  var CMSSelect = class _CMSSelect {
    constructor(component) {
      this.attr = {
        element: "data-cms-select-element",
        prefix: "data-cms-select-prefix",
        value: "data-cms-select-value",
        wait: "data-cms-select-wait",
        status: "data-cms-select-status"
      };
      this.selector = attributeselector_default("data-cms-select-element");
      try {
        this.source = getElement(component);
        if (!this.source) {
          throw new Error(`Source list element is not defined.`);
        }
        this.waitEvent = this.source.dataset.formSelectWait || null;
        this.targets = getAllElements(this.selector("target"));
        this.readValues();
      } catch (e) {
        console.error(`Failed to create CMSSelect instance: ${e.message}`);
      }
    }
    static {
      this.selector = attributeselector_default("data-cms-select-element");
    }
    static initializeAll() {
      try {
        const sourceLists = getAllElements(_CMSSelect.selector("source"));
        sourceLists.forEach((list) => {
          const cmsSelect = new _CMSSelect(list);
          if (cmsSelect.initWaitEvent(true)) return;
          cmsSelect.insertSelectOptions();
        });
      } catch (e) {
        console.error(`Failed to initialize all CMS select components: ${e.message}`);
      }
    }
    static createOption(value) {
      const optionElement = document.createElement("option");
      optionElement.setAttribute("value", value);
      optionElement.innerText = value;
      return optionElement;
    }
    /**
     * @param graceful Whether to throw an error if the wait event is invalid.
     * @returns A boolean indicating whether the wait event was initialized successfully.
     */
    initWaitEvent(graceful = false) {
      if (this.waitEvent) {
        this.source.addEventListener(this.waitEvent, () => {
          this.insertSelectOptions();
        });
        return true;
      } else {
        const message = `The wait event name "${this.waitEvent}" is invalid.`;
        if (graceful) return false;
        throw new Error(message);
      }
    }
    readValues() {
      this.values = [];
      const optionElements = this.source.querySelectorAll(_CMSSelect.selector("option"));
      optionElements.forEach((element) => {
        this.values.push(this.getSelectValue(element));
      });
    }
    insertSelectOptions(targets = this.targets) {
      this.values.forEach((val) => {
        if (val) {
          const option = _CMSSelect.createOption(val);
          targets.forEach((target) => target.appendChild(option));
        } else {
          console.warn("CMS select: skip empty option");
        }
      });
    }
    getSelectValue(item) {
      const prefix = item.getAttribute(this.attr.prefix) || "";
      const value = item.getAttribute(this.attr.value) || "";
      const optionValue = prefix ? `${prefix} ${value}` : value;
      return optionValue;
    }
  };

  // src/ts/cms-select.ts
  document.addEventListener("DOMContentLoaded", () => {
    CMSSelect.initializeAll();
  });
})();
//# sourceMappingURL=cms-select.js.map

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
    return result.map((sel) => `${sel}:not(${exclusions.join(", ")})`).join(", ");
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

  // ../peakflow/src/deepmerge.ts
  function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      const sourceValue = source[key];
      const targetValue = target[key];
      if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else if (sourceValue !== void 0) {
        result[key] = sourceValue;
      }
    }
    return result;
  }
  function isPlainObject(value) {
    return value !== void 0 && value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype;
  }

  // src/sanavita/ts/save-options.ts
  var SaveOptions = class _SaveOptions {
    constructor(component, settings = {}) {
      this.actions = /* @__PURE__ */ new Map();
      this.currentActionKey = null;
      this.renderButtonContent = (action) => {
        this.saveButton.textContent = action.label;
      };
      this.component = component;
      this.settings = deepMerge(_SaveOptions.defaultSettings, settings);
      this.instance = this.settings.id || component.getAttribute(_SaveOptions.attr.id);
      component.setAttribute(_SaveOptions.attr.id, this.instance);
      this.saveButton = this.select("button");
      const dropdownOptions = this.selectAll("option");
      dropdownOptions.forEach((optionEl) => {
        const key = optionEl.getAttribute(_SaveOptions.attr.key);
        const label = optionEl.getAttribute(_SaveOptions.attr.label) || optionEl.textContent?.trim() || "";
        if (!key) return;
        this.actions.set(key, {
          label,
          element: optionEl,
          handler: () => {
          }
        });
        optionEl.addEventListener("click", () => {
          this.setAction(key);
          this.executeAction();
        });
      });
      this.saveButton.addEventListener("click", () => {
        this.executeAction();
      });
    }
    static get attr() {
      return {
        id: "data-save-options-id",
        element: "data-save-options-element",
        key: "data-save-options-key",
        label: "data-save-options-label"
      };
    }
    static get defaultSettings() {
      return {
        id: void 0,
        hideSelectedAction: true
      };
    }
    static {
      this.attributeSelector = attributeselector_default(_SaveOptions.attr.element);
    }
    /**
     * Static selector
     */
    static selector(element, instance) {
      const base = _SaveOptions.attributeSelector(element);
      return instance ? `${base}[${_SaveOptions.attr.id}="${instance}"]` : base;
    }
    /**
     * Instance selector
     */
    selector(element, local = true) {
      return local ? _SaveOptions.selector(element, this.instance) : _SaveOptions.selector(element);
    }
    static select(element, instance) {
      return document.querySelector(_SaveOptions.selector(element, instance));
    }
    static selectAll(element, instance) {
      return document.querySelectorAll(_SaveOptions.selector(element, instance));
    }
    select(element, local = true) {
      return local ? this.component.querySelector(_SaveOptions.selector(element)) : document.querySelector(_SaveOptions.selector(element, this.instance));
    }
    selectAll(element, local = true) {
      return local ? this.component.querySelectorAll(_SaveOptions.selector(element)) : document.querySelectorAll(_SaveOptions.selector(element, this.instance));
    }
    setRenderButtonContent(renderer) {
      this.renderButtonContent = renderer;
    }
    setAction(key) {
      if (!this.actions.has(key)) {
        throw new Error(`Save action '${key}' not found`);
      }
      const action = this.actions.get(key);
      if (this.settings.hideSelectedAction) {
        this.actions.get(this.currentActionKey)?.element.classList.remove("hide");
        action.element.classList.add("hide");
      }
      this.currentActionKey = key;
      this.renderButtonContent(action);
    }
    setActionHandler(key, handler) {
      const action = this.actions.get(key);
      if (!action) {
        throw new Error(`Cannot set handler, action '${key}' not found`);
      }
      action.handler = handler;
    }
    executeAction() {
      if (!this.currentActionKey) {
        throw new Error(`No save action selected`);
      }
      const action = this.actions.get(this.currentActionKey);
      if (!action) {
        throw new Error(`Save action '${this.currentActionKey}' not found`);
      }
      action.handler();
    }
    showAllActionElements() {
      for (const action of this.actions.values()) {
        action.element.classList.remove("hide");
      }
    }
  };
})();
//# sourceMappingURL=save-options.js.map

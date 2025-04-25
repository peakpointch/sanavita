(() => {
  // library/attributeselector.ts
  function exclude(selector, ...exclusions) {
    if (exclusions.length === 0) return selector;
    return selector.split(", ").reduce((acc, str) => {
      let separator = acc === "" ? "" : ", ";
      return acc + separator + `${str}:not(${exclusions.join(", ")})`;
    }, "");
  }
  var createAttribute = (attrName, options = {
    defaultType: "exact",
    defaultValue: null,
    exclusions: []
  }) => {
    return (name = options.defaultValue, type = options.defaultType) => {
      if (!name) {
        return exclude(`[${attrName}]`, ...options.exclusions);
      }
      const value = String(name);
      let selector;
      switch (type) {
        case "startsWith":
          selector = `[${attrName}^="${value}"]`;
          break;
        case "endsWith":
          selector = `[${attrName}$="${value}"]`;
          break;
        case "includes":
          selector = `[${attrName}*="${value}"]`;
          break;
        case "whitespace":
          selector = `[${attrName}~="${value}"]`;
          break;
        case "hyphen":
          selector = `[${attrName}|="${value}"]`;
          break;
        case "exact":
        default:
          selector = `[${attrName}="${value}"]`;
          break;
      }
      return exclude(selector, ...options.exclusions ?? []);
    };
  };
  var attributeselector_default = createAttribute;

  // library/webflow/webflow.ts
  var siteId = document.documentElement.dataset.wfSite || "";
  var pageId = document.documentElement.dataset.wfPage || "";
  var wfclass = {
    input: "w-input",
    select: "w-select",
    radio: "w-radio-input",
    checkbox: "w-checkbox-input",
    checked: "w--redirected-checked"
  };
  var wfselect = {
    input: `.${wfclass.input}`,
    select: `.${wfclass.select}`,
    radio: `.${wfclass.radio}`,
    checkbox: `.${wfclass.checkbox}`,
    checked: `.${wfclass.checked}`
  };
  var inputSelectorList = [
    wfselect.input,
    wfselect.select,
    '.w-radio input[type="radio"]',
    `.w-checkbox input[type="checkbox"]:not(${wfselect.checkbox})`
  ];
  var wfform = {
    form: "form",
    checkbox: `.w-checkbox input[type="checkbox"]:not(${wfselect.checkbox})`,
    radio: '.w-radio input[type="radio"]',
    select: wfselect.select,
    inputOnly: wfselect.input,
    inputSelectorList,
    input: inputSelectorList.join(", ")
  };
  var wf = {
    siteId: "your-site-id",
    // ideally replaced at runtime
    pageId: "your-page-id",
    // ideally replaced at runtime
    class: wfclass,
    query: wfselect,
    formQuery: wfform
  };

  // library/form/form.ts
  var formElementSelector = attributeselector_default("data-form-element");
  var filterFormSelector = attributeselector_default("data-filter-form");
  function isRadioInput(input) {
    return input instanceof HTMLInputElement && input.type === "radio";
  }
  function isCheckboxInput(input) {
    return input instanceof HTMLInputElement && input.type === "checkbox";
  }
  async function sendFormData(formData) {
    const url = `https://webflow.com/api/v1/form/${wf.siteId}`;
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
      `${wf.formQuery.radio}[name="${name}"]`
    ).forEach((radio) => {
      radio.checked = false;
      const customRadio = radio.closest(".w-radio")?.querySelector(wf.query.radio);
      if (customRadio) {
        customRadio.classList.remove(wf.class.checked);
      }
    });
  }
  function initCustomInputs(container) {
    const focusClass = "w--redirected-focus";
    const focusVisibleClass = "w--redirected-focus-visible";
    const focusVisibleSelector = ":focus-visible, [data-wf-focus-visible]";
    const inputTypes = [
      ["checkbox", wf.query.checkbox],
      ["radio", wf.query.radio]
    ];
    container.querySelectorAll(wf.formQuery.checkbox).forEach((input) => {
      input.addEventListener("change", (event) => {
        const target = event.target;
        const customCheckbox = target.closest(".w-checkbox")?.querySelector(wf.query.checkbox);
        if (customCheckbox) {
          customCheckbox.classList.toggle(wf.class.checked, target.checked);
        }
      });
    });
    container.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.addEventListener("change", (event) => {
        const target = event.target;
        if (!target.checked) return;
        const name = target.name;
        container.querySelectorAll(
          `input[type="radio"][name="${name}"]`
        ).forEach((radio) => {
          const customRadio = radio.closest(".w-radio")?.querySelector(wf.query.radio);
          if (customRadio) {
            customRadio.classList.remove(wf.class.checked);
          }
        });
        const selectedCustomRadio = target.closest(".w-radio")?.querySelector(wf.query.radio);
        if (selectedCustomRadio) {
          selectedCustomRadio.classList.add(wf.class.checked);
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
  function validateFields2(inputs, report = true) {
    let valid = true;
    let invalidField = null;
    for (const input of Array.from(inputs)) {
      if (!input.checkValidity()) {
        valid = false;
        if (report && !invalidField) {
          input.reportValidity();
          input.classList.add("has-error");
          if (isCheckboxInput(input)) {
            input.parentElement?.querySelector(wf.query.checkbox)?.classList.add("has-error");
          }
          input.addEventListener("change", () => {
            input.classList.remove("has-error");
            if (isCheckboxInput(input)) {
              input.parentElement?.querySelector(wf.query.checkbox)?.classList.remove("has-error");
            }
          }, { once: true });
          invalidField = input;
        }
        break;
      } else {
        input.classList.remove("has-error");
      }
    }
    return { valid, invalidField };
  }

  // library/parameterize.ts
  function parameterize(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-");
  }

  // library/form/formfield.ts
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
  function fieldFromInput(input, index) {
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

  // library/form/fieldgroup.ts
  var FieldGroup = class {
    constructor(fields = /* @__PURE__ */ new Map()) {
      this.fields = fields;
    }
    /**
     * Finds a specific `FormField` instance by id.
     *
     * @param fieldId The id attribute of the associated DOM element.
     */
    getField(fieldId) {
      return this.fields.get(fieldId);
    }
  };

  // library/form/formmessage.ts
  var FormMessage = class {
    /**
     * Constructs a new FormMessage instance.
     * @param componentName The name of the component (used in `data-message-component`).
     * @param messageFor The target form field identifier (used in `data-message-for`).
     */
    constructor(componentName, messageFor) {
      this.initialized = false;
      this.messageFor = messageFor;
      const component = document.querySelector(
        `[data-message-component="${componentName}"][data-message-for="${this.messageFor}"]`
      );
      if (!component) {
        console.warn(
          `No FormMessage component was found: ${componentName}, ${this.messageFor}`
        );
        return;
      }
      this.component = component;
      this.messageElement = this.component?.querySelector('[data-message-element="message"]') || null;
      this.reset();
      this.initialized = true;
    }
    /**
     * Displays an informational message.
     * @param message The message text to display. Defaults to `null`.
     * @param silent If `true`, skips accessibility announcements. Defaults to `false`.
     */
    info(message2 = null, silent = false) {
      if (!this.initialized) return;
      if (!silent) {
        this.component.setAttribute("aria-live", "polite");
      }
      this.setMessage(message2, "info", silent);
    }
    /**
     * Displays an error message.
     * @param message The message text to display. Defaults to `null`.
     * @param silent If `true`, skips accessibility announcements. Defaults to `false`.
     */
    error(message2 = null, silent = false) {
      if (!this.initialized) return;
      if (!silent) {
        this.component.setAttribute("role", "alert");
        this.component.setAttribute("aria-live", "assertive");
      }
      this.setMessage(message2, "error", silent);
    }
    /**
     * Resets the message component, hiding any displayed message.
     */
    reset() {
      if (!this.initialized) return;
      this.component.classList.remove("info", "error");
    }
    /**
     * Sets the message text and type (private method).
     * @param message The message text to display. Defaults to `null`.
     * @param type The type of message (`"info"` or `"error"`).
     * @param silent If `true`, skips accessibility announcements. Defaults to `false`.
     */
    setMessage(message2 = null, type, silent = false) {
      if (!this.initialized) return;
      if (this.messageElement && message2) {
        this.messageElement.textContent = message2;
      } else if (!this.messageElement) {
        console.warn("Message text element not found.");
      }
      this.component.classList.remove("info", "error");
      this.component.classList.add(type);
      if (silent) return;
      this.component.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  };

  // library/form/formdecision.ts
  var FormDecision = class {
    /**
     * Constructs a new FormDecision instance.
     * @param component The FormDecision element.
     * @param id Unique identifier for the specific instance.
     */
    constructor(component, id) {
      this.paths = [];
      this.errorMessages = {};
      this.defaultErrorMessage = "Please complete the required fields.";
      if (!component || !id) {
        console.error(`FormDecision: Component not found.`);
        return;
      } else if (!component.hasAttribute("data-decision-component")) {
        console.error(
          `FormDecision: Selected element is not a FormDecision component:`,
          component
        );
        return;
      }
      this.component = component;
      this.id = id;
      this.formMessage = new FormMessage("FormDecision", id);
      this.initialize();
    }
    /**
     * Initializes the FormDecision instance by setting up decision inputs & paths as well as their event listeners.
     */
    initialize() {
      const decisionFieldsWrapper = this.component.querySelector('[data-decision-element="decision"]') || this.component;
      this.decisionInputs = decisionFieldsWrapper.querySelectorAll(
        "input[data-decision-action]"
      );
      if (this.decisionInputs.length === 0) {
        console.warn(
          `Decision component "${this.id}" does not contain any decision input elements.`
        );
        return;
      }
      this.decisionInputs.forEach((input) => {
        const path = this.component.querySelector(
          `[data-decision-path="${input.dataset.decisionAction || input.value}"]`
        );
        if (path) {
          path.style.display = "none";
          this.paths.push(path);
        }
        input.addEventListener("change", (event) => {
          this.handleChange(path, event);
          this.formMessage.reset();
        });
      });
      this.component.addEventListener("change", () => this.formMessage.reset());
    }
    /**
     * Handles changes to the decision input fields and updates the associated path visibility.
     * @param path The HTMLElement that contains the form fields of this path.
     * @param event The event that invokes this change.
     */
    handleChange(path, event) {
      this.paths.forEach((entry) => {
        entry.style.display = "none";
      });
      if (path) {
        path.style.removeProperty("display");
      }
      this.updateRequiredAttributes();
    }
    /**
     * Retrieves the currently selected decision input.
     * @returns The selected input element, or undefined if none is selected.
     */
    getSelectedInput() {
      return Array.from(this.decisionInputs).find((input) => input.checked);
    }
    /**
     * Validates the FormDecision based on the selected path to ensure the form's correctness.
     * @returns A boolean indicating whether the validation passed.
     */
    validate() {
      const selectedInput = this.getSelectedInput();
      const { valid: decisionValid } = validateFields(this.decisionInputs);
      if (!decisionValid || !selectedInput) {
        console.warn("No decision selected!");
        this.handleValidationMessages(false);
        return false;
      }
      const pathId = selectedInput.dataset.decisionAction || selectedInput.value;
      const pathIndex = this.paths.findIndex(
        (path) => path.dataset.decisionPath === pathId
      );
      const isValid2 = pathIndex === -1 || this.checkPathValidity(pathIndex);
      this.handleValidationMessages(isValid2);
      return isValid2;
    }
    /**
     * Sets custom error messages for the decision inputs.
     * @param messages An object mapping decision input values to error messages.
     * @param defaultMessage An optional default error message to use when no specific message is provided.
     */
    setErrorMessages(messages, defaultMessage) {
      this.errorMessages = messages;
      if (defaultMessage) {
        this.defaultErrorMessage = defaultMessage;
      }
    }
    /**
     * Validates the fields within the specified path and returns whether they are valid.
     * @param pathIndex The index of the path to validate.
     * @returns A boolean indicating whether the specified path is valid.
     */
    checkPathValidity(pathIndex) {
      const pathElement = this.paths[pathIndex];
      const inputs = pathElement.querySelectorAll(formQuery.input);
      const { valid, invalidField } = validateFields(inputs, true);
      return valid;
    }
    /**
     * Updates the required attributes of input fields within the paths based on the selected decision input.
     */
    updateRequiredAttributes() {
      this.paths.forEach((path) => {
        const inputs = path.querySelectorAll(
          "input, select, textarea"
        );
        inputs.forEach((input) => {
          input.required = false;
        });
      });
      const selectedInput = this.component.querySelector(
        "input[data-decision-action]:checked"
      );
      if (selectedInput) {
        const pathId = selectedInput.dataset.decisionAction || selectedInput.value;
        const selectedPath = this.paths.find(
          (path) => path.dataset.decisionPath === pathId
        );
        if (selectedPath) {
          const requiredFields = selectedPath.querySelectorAll(
            '[data-decision-required="required"], [data-decision-required="true"]'
          );
          requiredFields.forEach((input) => {
            input.required = true;
          });
        }
      }
    }
    /**
     * Displays validation message based on the current path.
     * @param currentGroupValid A boolean indicating whether the current group of inputs is valid.
     */
    handleValidationMessages(currentGroupValid) {
      if (!currentGroupValid) {
        const selectedInput = this.getSelectedInput();
        const pathId = selectedInput?.dataset.decisionAction || selectedInput?.value;
        const customMessage = this.errorMessages[pathId] || this.defaultErrorMessage;
        this.formMessage.error(customMessage);
      } else {
        this.formMessage.reset();
      }
    }
  };

  // library/form/filterform.ts
  var actionSelector = attributeselector_default("data-action");

  // node_modules/date-fns/constants.js
  var daysInYear = 365.2425;
  var maxTime = Math.pow(10, 8) * 24 * 60 * 60 * 1e3;
  var minTime = -maxTime;
  var millisecondsInWeek = 6048e5;
  var millisecondsInDay = 864e5;
  var secondsInHour = 3600;
  var secondsInDay = secondsInHour * 24;
  var secondsInWeek = secondsInDay * 7;
  var secondsInYear = secondsInDay * daysInYear;
  var secondsInMonth = secondsInYear / 12;
  var secondsInQuarter = secondsInMonth * 3;
  var constructFromSymbol = Symbol.for("constructDateFrom");

  // node_modules/date-fns/constructFrom.js
  function constructFrom(date, value) {
    if (typeof date === "function") return date(value);
    if (date && typeof date === "object" && constructFromSymbol in date)
      return date[constructFromSymbol](value);
    if (date instanceof Date) return new date.constructor(value);
    return new Date(value);
  }

  // node_modules/date-fns/toDate.js
  function toDate(argument, context) {
    return constructFrom(context || argument, argument);
  }

  // node_modules/date-fns/addDays.js
  function addDays(date, amount, options) {
    const _date = toDate(date, options?.in);
    if (isNaN(amount)) return constructFrom(options?.in || date, NaN);
    if (!amount) return _date;
    _date.setDate(_date.getDate() + amount);
    return _date;
  }

  // node_modules/date-fns/_lib/defaultOptions.js
  var defaultOptions = {};
  function getDefaultOptions() {
    return defaultOptions;
  }

  // node_modules/date-fns/startOfWeek.js
  function startOfWeek(date, options) {
    const defaultOptions2 = getDefaultOptions();
    const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
    const _date = toDate(date, options?.in);
    const day = _date.getDay();
    const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
    _date.setDate(_date.getDate() - diff);
    _date.setHours(0, 0, 0, 0);
    return _date;
  }

  // node_modules/date-fns/startOfISOWeek.js
  function startOfISOWeek(date, options) {
    return startOfWeek(date, { ...options, weekStartsOn: 1 });
  }

  // node_modules/date-fns/getISOWeekYear.js
  function getISOWeekYear(date, options) {
    const _date = toDate(date, options?.in);
    const year = _date.getFullYear();
    const fourthOfJanuaryOfNextYear = constructFrom(_date, 0);
    fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
    fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
    const startOfNextYear = startOfISOWeek(fourthOfJanuaryOfNextYear);
    const fourthOfJanuaryOfThisYear = constructFrom(_date, 0);
    fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4);
    fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0);
    const startOfThisYear = startOfISOWeek(fourthOfJanuaryOfThisYear);
    if (_date.getTime() >= startOfNextYear.getTime()) {
      return year + 1;
    } else if (_date.getTime() >= startOfThisYear.getTime()) {
      return year;
    } else {
      return year - 1;
    }
  }

  // node_modules/date-fns/_lib/getTimezoneOffsetInMilliseconds.js
  function getTimezoneOffsetInMilliseconds(date) {
    const _date = toDate(date);
    const utcDate = new Date(
      Date.UTC(
        _date.getFullYear(),
        _date.getMonth(),
        _date.getDate(),
        _date.getHours(),
        _date.getMinutes(),
        _date.getSeconds(),
        _date.getMilliseconds()
      )
    );
    utcDate.setUTCFullYear(_date.getFullYear());
    return +date - +utcDate;
  }

  // node_modules/date-fns/_lib/normalizeDates.js
  function normalizeDates(context, ...dates) {
    const normalize = constructFrom.bind(
      null,
      context || dates.find((date) => typeof date === "object")
    );
    return dates.map(normalize);
  }

  // node_modules/date-fns/startOfDay.js
  function startOfDay(date, options) {
    const _date = toDate(date, options?.in);
    _date.setHours(0, 0, 0, 0);
    return _date;
  }

  // node_modules/date-fns/differenceInCalendarDays.js
  function differenceInCalendarDays(laterDate, earlierDate, options) {
    const [laterDate_, earlierDate_] = normalizeDates(
      options?.in,
      laterDate,
      earlierDate
    );
    const laterStartOfDay = startOfDay(laterDate_);
    const earlierStartOfDay = startOfDay(earlierDate_);
    const laterTimestamp = +laterStartOfDay - getTimezoneOffsetInMilliseconds(laterStartOfDay);
    const earlierTimestamp = +earlierStartOfDay - getTimezoneOffsetInMilliseconds(earlierStartOfDay);
    return Math.round((laterTimestamp - earlierTimestamp) / millisecondsInDay);
  }

  // node_modules/date-fns/startOfISOWeekYear.js
  function startOfISOWeekYear(date, options) {
    const year = getISOWeekYear(date, options);
    const fourthOfJanuary = constructFrom(options?.in || date, 0);
    fourthOfJanuary.setFullYear(year, 0, 4);
    fourthOfJanuary.setHours(0, 0, 0, 0);
    return startOfISOWeek(fourthOfJanuary);
  }

  // node_modules/date-fns/setISOWeekYear.js
  function setISOWeekYear(date, weekYear, options) {
    let _date = toDate(date, options?.in);
    const diff = differenceInCalendarDays(
      _date,
      startOfISOWeekYear(_date, options)
    );
    const fourthOfJanuary = constructFrom(options?.in || date, 0);
    fourthOfJanuary.setFullYear(weekYear, 0, 4);
    fourthOfJanuary.setHours(0, 0, 0, 0);
    _date = startOfISOWeekYear(fourthOfJanuary);
    _date.setDate(_date.getDate() + diff);
    return _date;
  }

  // node_modules/date-fns/addWeeks.js
  function addWeeks(date, amount, options) {
    return addDays(date, amount * 7, options);
  }

  // node_modules/date-fns/isDate.js
  function isDate(value) {
    return value instanceof Date || typeof value === "object" && Object.prototype.toString.call(value) === "[object Date]";
  }

  // node_modules/date-fns/isValid.js
  function isValid(date) {
    return !(!isDate(date) && typeof date !== "number" || isNaN(+toDate(date)));
  }

  // node_modules/date-fns/startOfYear.js
  function startOfYear(date, options) {
    const date_ = toDate(date, options?.in);
    date_.setFullYear(date_.getFullYear(), 0, 1);
    date_.setHours(0, 0, 0, 0);
    return date_;
  }

  // node_modules/date-fns/locale/en-US/_lib/formatDistance.js
  var formatDistanceLocale = {
    lessThanXSeconds: {
      one: "less than a second",
      other: "less than {{count}} seconds"
    },
    xSeconds: {
      one: "1 second",
      other: "{{count}} seconds"
    },
    halfAMinute: "half a minute",
    lessThanXMinutes: {
      one: "less than a minute",
      other: "less than {{count}} minutes"
    },
    xMinutes: {
      one: "1 minute",
      other: "{{count}} minutes"
    },
    aboutXHours: {
      one: "about 1 hour",
      other: "about {{count}} hours"
    },
    xHours: {
      one: "1 hour",
      other: "{{count}} hours"
    },
    xDays: {
      one: "1 day",
      other: "{{count}} days"
    },
    aboutXWeeks: {
      one: "about 1 week",
      other: "about {{count}} weeks"
    },
    xWeeks: {
      one: "1 week",
      other: "{{count}} weeks"
    },
    aboutXMonths: {
      one: "about 1 month",
      other: "about {{count}} months"
    },
    xMonths: {
      one: "1 month",
      other: "{{count}} months"
    },
    aboutXYears: {
      one: "about 1 year",
      other: "about {{count}} years"
    },
    xYears: {
      one: "1 year",
      other: "{{count}} years"
    },
    overXYears: {
      one: "over 1 year",
      other: "over {{count}} years"
    },
    almostXYears: {
      one: "almost 1 year",
      other: "almost {{count}} years"
    }
  };
  var formatDistance = (token, count, options) => {
    let result;
    const tokenValue = formatDistanceLocale[token];
    if (typeof tokenValue === "string") {
      result = tokenValue;
    } else if (count === 1) {
      result = tokenValue.one;
    } else {
      result = tokenValue.other.replace("{{count}}", count.toString());
    }
    if (options?.addSuffix) {
      if (options.comparison && options.comparison > 0) {
        return "in " + result;
      } else {
        return result + " ago";
      }
    }
    return result;
  };

  // node_modules/date-fns/locale/_lib/buildFormatLongFn.js
  function buildFormatLongFn(args) {
    return (options = {}) => {
      const width = options.width ? String(options.width) : args.defaultWidth;
      const format2 = args.formats[width] || args.formats[args.defaultWidth];
      return format2;
    };
  }

  // node_modules/date-fns/locale/en-US/_lib/formatLong.js
  var dateFormats = {
    full: "EEEE, MMMM do, y",
    long: "MMMM do, y",
    medium: "MMM d, y",
    short: "MM/dd/yyyy"
  };
  var timeFormats = {
    full: "h:mm:ss a zzzz",
    long: "h:mm:ss a z",
    medium: "h:mm:ss a",
    short: "h:mm a"
  };
  var dateTimeFormats = {
    full: "{{date}} 'at' {{time}}",
    long: "{{date}} 'at' {{time}}",
    medium: "{{date}}, {{time}}",
    short: "{{date}}, {{time}}"
  };
  var formatLong = {
    date: buildFormatLongFn({
      formats: dateFormats,
      defaultWidth: "full"
    }),
    time: buildFormatLongFn({
      formats: timeFormats,
      defaultWidth: "full"
    }),
    dateTime: buildFormatLongFn({
      formats: dateTimeFormats,
      defaultWidth: "full"
    })
  };

  // node_modules/date-fns/locale/en-US/_lib/formatRelative.js
  var formatRelativeLocale = {
    lastWeek: "'last' eeee 'at' p",
    yesterday: "'yesterday at' p",
    today: "'today at' p",
    tomorrow: "'tomorrow at' p",
    nextWeek: "eeee 'at' p",
    other: "P"
  };
  var formatRelative = (token, _date, _baseDate, _options) => formatRelativeLocale[token];

  // node_modules/date-fns/locale/_lib/buildLocalizeFn.js
  function buildLocalizeFn(args) {
    return (value, options) => {
      const context = options?.context ? String(options.context) : "standalone";
      let valuesArray;
      if (context === "formatting" && args.formattingValues) {
        const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
        const width = options?.width ? String(options.width) : defaultWidth;
        valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
      } else {
        const defaultWidth = args.defaultWidth;
        const width = options?.width ? String(options.width) : args.defaultWidth;
        valuesArray = args.values[width] || args.values[defaultWidth];
      }
      const index = args.argumentCallback ? args.argumentCallback(value) : value;
      return valuesArray[index];
    };
  }

  // node_modules/date-fns/locale/en-US/_lib/localize.js
  var eraValues = {
    narrow: ["B", "A"],
    abbreviated: ["BC", "AD"],
    wide: ["Before Christ", "Anno Domini"]
  };
  var quarterValues = {
    narrow: ["1", "2", "3", "4"],
    abbreviated: ["Q1", "Q2", "Q3", "Q4"],
    wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
  };
  var monthValues = {
    narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    abbreviated: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ],
    wide: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ]
  };
  var dayValues = {
    narrow: ["S", "M", "T", "W", "T", "F", "S"],
    short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    wide: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ]
  };
  var dayPeriodValues = {
    narrow: {
      am: "a",
      pm: "p",
      midnight: "mi",
      noon: "n",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night"
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "midnight",
      noon: "noon",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night"
    },
    wide: {
      am: "a.m.",
      pm: "p.m.",
      midnight: "midnight",
      noon: "noon",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night"
    }
  };
  var formattingDayPeriodValues = {
    narrow: {
      am: "a",
      pm: "p",
      midnight: "mi",
      noon: "n",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night"
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "midnight",
      noon: "noon",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night"
    },
    wide: {
      am: "a.m.",
      pm: "p.m.",
      midnight: "midnight",
      noon: "noon",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night"
    }
  };
  var ordinalNumber = (dirtyNumber, _options) => {
    const number = Number(dirtyNumber);
    const rem100 = number % 100;
    if (rem100 > 20 || rem100 < 10) {
      switch (rem100 % 10) {
        case 1:
          return number + "st";
        case 2:
          return number + "nd";
        case 3:
          return number + "rd";
      }
    }
    return number + "th";
  };
  var localize = {
    ordinalNumber,
    era: buildLocalizeFn({
      values: eraValues,
      defaultWidth: "wide"
    }),
    quarter: buildLocalizeFn({
      values: quarterValues,
      defaultWidth: "wide",
      argumentCallback: (quarter) => quarter - 1
    }),
    month: buildLocalizeFn({
      values: monthValues,
      defaultWidth: "wide"
    }),
    day: buildLocalizeFn({
      values: dayValues,
      defaultWidth: "wide"
    }),
    dayPeriod: buildLocalizeFn({
      values: dayPeriodValues,
      defaultWidth: "wide",
      formattingValues: formattingDayPeriodValues,
      defaultFormattingWidth: "wide"
    })
  };

  // node_modules/date-fns/locale/_lib/buildMatchFn.js
  function buildMatchFn(args) {
    return (string, options = {}) => {
      const width = options.width;
      const matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
      const matchResult = string.match(matchPattern);
      if (!matchResult) {
        return null;
      }
      const matchedString = matchResult[0];
      const parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
      const key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString)) : (
        // [TODO] -- I challenge you to fix the type
        findKey(parsePatterns, (pattern) => pattern.test(matchedString))
      );
      let value;
      value = args.valueCallback ? args.valueCallback(key) : key;
      value = options.valueCallback ? (
        // [TODO] -- I challenge you to fix the type
        options.valueCallback(value)
      ) : value;
      const rest = string.slice(matchedString.length);
      return { value, rest };
    };
  }
  function findKey(object, predicate) {
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key) && predicate(object[key])) {
        return key;
      }
    }
    return void 0;
  }
  function findIndex(array, predicate) {
    for (let key = 0; key < array.length; key++) {
      if (predicate(array[key])) {
        return key;
      }
    }
    return void 0;
  }

  // node_modules/date-fns/locale/_lib/buildMatchPatternFn.js
  function buildMatchPatternFn(args) {
    return (string, options = {}) => {
      const matchResult = string.match(args.matchPattern);
      if (!matchResult) return null;
      const matchedString = matchResult[0];
      const parseResult = string.match(args.parsePattern);
      if (!parseResult) return null;
      let value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
      value = options.valueCallback ? options.valueCallback(value) : value;
      const rest = string.slice(matchedString.length);
      return { value, rest };
    };
  }

  // node_modules/date-fns/locale/en-US/_lib/match.js
  var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
  var parseOrdinalNumberPattern = /\d+/i;
  var matchEraPatterns = {
    narrow: /^(b|a)/i,
    abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
    wide: /^(before christ|before common era|anno domini|common era)/i
  };
  var parseEraPatterns = {
    any: [/^b/i, /^(a|c)/i]
  };
  var matchQuarterPatterns = {
    narrow: /^[1234]/i,
    abbreviated: /^q[1234]/i,
    wide: /^[1234](th|st|nd|rd)? quarter/i
  };
  var parseQuarterPatterns = {
    any: [/1/i, /2/i, /3/i, /4/i]
  };
  var matchMonthPatterns = {
    narrow: /^[jfmasond]/i,
    abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
    wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
  };
  var parseMonthPatterns = {
    narrow: [
      /^j/i,
      /^f/i,
      /^m/i,
      /^a/i,
      /^m/i,
      /^j/i,
      /^j/i,
      /^a/i,
      /^s/i,
      /^o/i,
      /^n/i,
      /^d/i
    ],
    any: [
      /^ja/i,
      /^f/i,
      /^mar/i,
      /^ap/i,
      /^may/i,
      /^jun/i,
      /^jul/i,
      /^au/i,
      /^s/i,
      /^o/i,
      /^n/i,
      /^d/i
    ]
  };
  var matchDayPatterns = {
    narrow: /^[smtwf]/i,
    short: /^(su|mo|tu|we|th|fr|sa)/i,
    abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
    wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
  };
  var parseDayPatterns = {
    narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
    any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
  };
  var matchDayPeriodPatterns = {
    narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
    any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
  };
  var parseDayPeriodPatterns = {
    any: {
      am: /^a/i,
      pm: /^p/i,
      midnight: /^mi/i,
      noon: /^no/i,
      morning: /morning/i,
      afternoon: /afternoon/i,
      evening: /evening/i,
      night: /night/i
    }
  };
  var match = {
    ordinalNumber: buildMatchPatternFn({
      matchPattern: matchOrdinalNumberPattern,
      parsePattern: parseOrdinalNumberPattern,
      valueCallback: (value) => parseInt(value, 10)
    }),
    era: buildMatchFn({
      matchPatterns: matchEraPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseEraPatterns,
      defaultParseWidth: "any"
    }),
    quarter: buildMatchFn({
      matchPatterns: matchQuarterPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseQuarterPatterns,
      defaultParseWidth: "any",
      valueCallback: (index) => index + 1
    }),
    month: buildMatchFn({
      matchPatterns: matchMonthPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseMonthPatterns,
      defaultParseWidth: "any"
    }),
    day: buildMatchFn({
      matchPatterns: matchDayPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseDayPatterns,
      defaultParseWidth: "any"
    }),
    dayPeriod: buildMatchFn({
      matchPatterns: matchDayPeriodPatterns,
      defaultMatchWidth: "any",
      parsePatterns: parseDayPeriodPatterns,
      defaultParseWidth: "any"
    })
  };

  // node_modules/date-fns/locale/en-US.js
  var enUS = {
    code: "en-US",
    formatDistance,
    formatLong,
    formatRelative,
    localize,
    match,
    options: {
      weekStartsOn: 0,
      firstWeekContainsDate: 1
    }
  };

  // node_modules/date-fns/getDayOfYear.js
  function getDayOfYear(date, options) {
    const _date = toDate(date, options?.in);
    const diff = differenceInCalendarDays(_date, startOfYear(_date));
    const dayOfYear = diff + 1;
    return dayOfYear;
  }

  // node_modules/date-fns/getISOWeek.js
  function getISOWeek(date, options) {
    const _date = toDate(date, options?.in);
    const diff = +startOfISOWeek(_date) - +startOfISOWeekYear(_date);
    return Math.round(diff / millisecondsInWeek) + 1;
  }

  // node_modules/date-fns/getWeekYear.js
  function getWeekYear(date, options) {
    const _date = toDate(date, options?.in);
    const year = _date.getFullYear();
    const defaultOptions2 = getDefaultOptions();
    const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
    const firstWeekOfNextYear = constructFrom(options?.in || date, 0);
    firstWeekOfNextYear.setFullYear(year + 1, 0, firstWeekContainsDate);
    firstWeekOfNextYear.setHours(0, 0, 0, 0);
    const startOfNextYear = startOfWeek(firstWeekOfNextYear, options);
    const firstWeekOfThisYear = constructFrom(options?.in || date, 0);
    firstWeekOfThisYear.setFullYear(year, 0, firstWeekContainsDate);
    firstWeekOfThisYear.setHours(0, 0, 0, 0);
    const startOfThisYear = startOfWeek(firstWeekOfThisYear, options);
    if (+_date >= +startOfNextYear) {
      return year + 1;
    } else if (+_date >= +startOfThisYear) {
      return year;
    } else {
      return year - 1;
    }
  }

  // node_modules/date-fns/startOfWeekYear.js
  function startOfWeekYear(date, options) {
    const defaultOptions2 = getDefaultOptions();
    const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
    const year = getWeekYear(date, options);
    const firstWeek = constructFrom(options?.in || date, 0);
    firstWeek.setFullYear(year, 0, firstWeekContainsDate);
    firstWeek.setHours(0, 0, 0, 0);
    const _date = startOfWeek(firstWeek, options);
    return _date;
  }

  // node_modules/date-fns/getWeek.js
  function getWeek(date, options) {
    const _date = toDate(date, options?.in);
    const diff = +startOfWeek(_date, options) - +startOfWeekYear(_date, options);
    return Math.round(diff / millisecondsInWeek) + 1;
  }

  // node_modules/date-fns/_lib/addLeadingZeros.js
  function addLeadingZeros(number, targetLength) {
    const sign = number < 0 ? "-" : "";
    const output = Math.abs(number).toString().padStart(targetLength, "0");
    return sign + output;
  }

  // node_modules/date-fns/_lib/format/lightFormatters.js
  var lightFormatters = {
    // Year
    y(date, token) {
      const signedYear = date.getFullYear();
      const year = signedYear > 0 ? signedYear : 1 - signedYear;
      return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
    },
    // Month
    M(date, token) {
      const month = date.getMonth();
      return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
    },
    // Day of the month
    d(date, token) {
      return addLeadingZeros(date.getDate(), token.length);
    },
    // AM or PM
    a(date, token) {
      const dayPeriodEnumValue = date.getHours() / 12 >= 1 ? "pm" : "am";
      switch (token) {
        case "a":
        case "aa":
          return dayPeriodEnumValue.toUpperCase();
        case "aaa":
          return dayPeriodEnumValue;
        case "aaaaa":
          return dayPeriodEnumValue[0];
        case "aaaa":
        default:
          return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
      }
    },
    // Hour [1-12]
    h(date, token) {
      return addLeadingZeros(date.getHours() % 12 || 12, token.length);
    },
    // Hour [0-23]
    H(date, token) {
      return addLeadingZeros(date.getHours(), token.length);
    },
    // Minute
    m(date, token) {
      return addLeadingZeros(date.getMinutes(), token.length);
    },
    // Second
    s(date, token) {
      return addLeadingZeros(date.getSeconds(), token.length);
    },
    // Fraction of second
    S(date, token) {
      const numberOfDigits = token.length;
      const milliseconds = date.getMilliseconds();
      const fractionalSeconds = Math.trunc(
        milliseconds * Math.pow(10, numberOfDigits - 3)
      );
      return addLeadingZeros(fractionalSeconds, token.length);
    }
  };

  // node_modules/date-fns/_lib/format/formatters.js
  var dayPeriodEnum = {
    am: "am",
    pm: "pm",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  };
  var formatters = {
    // Era
    G: function(date, token, localize2) {
      const era = date.getFullYear() > 0 ? 1 : 0;
      switch (token) {
        // AD, BC
        case "G":
        case "GG":
        case "GGG":
          return localize2.era(era, { width: "abbreviated" });
        // A, B
        case "GGGGG":
          return localize2.era(era, { width: "narrow" });
        // Anno Domini, Before Christ
        case "GGGG":
        default:
          return localize2.era(era, { width: "wide" });
      }
    },
    // Year
    y: function(date, token, localize2) {
      if (token === "yo") {
        const signedYear = date.getFullYear();
        const year = signedYear > 0 ? signedYear : 1 - signedYear;
        return localize2.ordinalNumber(year, { unit: "year" });
      }
      return lightFormatters.y(date, token);
    },
    // Local week-numbering year
    Y: function(date, token, localize2, options) {
      const signedWeekYear = getWeekYear(date, options);
      const weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;
      if (token === "YY") {
        const twoDigitYear = weekYear % 100;
        return addLeadingZeros(twoDigitYear, 2);
      }
      if (token === "Yo") {
        return localize2.ordinalNumber(weekYear, { unit: "year" });
      }
      return addLeadingZeros(weekYear, token.length);
    },
    // ISO week-numbering year
    R: function(date, token) {
      const isoWeekYear = getISOWeekYear(date);
      return addLeadingZeros(isoWeekYear, token.length);
    },
    // Extended year. This is a single number designating the year of this calendar system.
    // The main difference between `y` and `u` localizers are B.C. years:
    // | Year | `y` | `u` |
    // |------|-----|-----|
    // | AC 1 |   1 |   1 |
    // | BC 1 |   1 |   0 |
    // | BC 2 |   2 |  -1 |
    // Also `yy` always returns the last two digits of a year,
    // while `uu` pads single digit years to 2 characters and returns other years unchanged.
    u: function(date, token) {
      const year = date.getFullYear();
      return addLeadingZeros(year, token.length);
    },
    // Quarter
    Q: function(date, token, localize2) {
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      switch (token) {
        // 1, 2, 3, 4
        case "Q":
          return String(quarter);
        // 01, 02, 03, 04
        case "QQ":
          return addLeadingZeros(quarter, 2);
        // 1st, 2nd, 3rd, 4th
        case "Qo":
          return localize2.ordinalNumber(quarter, { unit: "quarter" });
        // Q1, Q2, Q3, Q4
        case "QQQ":
          return localize2.quarter(quarter, {
            width: "abbreviated",
            context: "formatting"
          });
        // 1, 2, 3, 4 (narrow quarter; could be not numerical)
        case "QQQQQ":
          return localize2.quarter(quarter, {
            width: "narrow",
            context: "formatting"
          });
        // 1st quarter, 2nd quarter, ...
        case "QQQQ":
        default:
          return localize2.quarter(quarter, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // Stand-alone quarter
    q: function(date, token, localize2) {
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      switch (token) {
        // 1, 2, 3, 4
        case "q":
          return String(quarter);
        // 01, 02, 03, 04
        case "qq":
          return addLeadingZeros(quarter, 2);
        // 1st, 2nd, 3rd, 4th
        case "qo":
          return localize2.ordinalNumber(quarter, { unit: "quarter" });
        // Q1, Q2, Q3, Q4
        case "qqq":
          return localize2.quarter(quarter, {
            width: "abbreviated",
            context: "standalone"
          });
        // 1, 2, 3, 4 (narrow quarter; could be not numerical)
        case "qqqqq":
          return localize2.quarter(quarter, {
            width: "narrow",
            context: "standalone"
          });
        // 1st quarter, 2nd quarter, ...
        case "qqqq":
        default:
          return localize2.quarter(quarter, {
            width: "wide",
            context: "standalone"
          });
      }
    },
    // Month
    M: function(date, token, localize2) {
      const month = date.getMonth();
      switch (token) {
        case "M":
        case "MM":
          return lightFormatters.M(date, token);
        // 1st, 2nd, ..., 12th
        case "Mo":
          return localize2.ordinalNumber(month + 1, { unit: "month" });
        // Jan, Feb, ..., Dec
        case "MMM":
          return localize2.month(month, {
            width: "abbreviated",
            context: "formatting"
          });
        // J, F, ..., D
        case "MMMMM":
          return localize2.month(month, {
            width: "narrow",
            context: "formatting"
          });
        // January, February, ..., December
        case "MMMM":
        default:
          return localize2.month(month, { width: "wide", context: "formatting" });
      }
    },
    // Stand-alone month
    L: function(date, token, localize2) {
      const month = date.getMonth();
      switch (token) {
        // 1, 2, ..., 12
        case "L":
          return String(month + 1);
        // 01, 02, ..., 12
        case "LL":
          return addLeadingZeros(month + 1, 2);
        // 1st, 2nd, ..., 12th
        case "Lo":
          return localize2.ordinalNumber(month + 1, { unit: "month" });
        // Jan, Feb, ..., Dec
        case "LLL":
          return localize2.month(month, {
            width: "abbreviated",
            context: "standalone"
          });
        // J, F, ..., D
        case "LLLLL":
          return localize2.month(month, {
            width: "narrow",
            context: "standalone"
          });
        // January, February, ..., December
        case "LLLL":
        default:
          return localize2.month(month, { width: "wide", context: "standalone" });
      }
    },
    // Local week of year
    w: function(date, token, localize2, options) {
      const week = getWeek(date, options);
      if (token === "wo") {
        return localize2.ordinalNumber(week, { unit: "week" });
      }
      return addLeadingZeros(week, token.length);
    },
    // ISO week of year
    I: function(date, token, localize2) {
      const isoWeek = getISOWeek(date);
      if (token === "Io") {
        return localize2.ordinalNumber(isoWeek, { unit: "week" });
      }
      return addLeadingZeros(isoWeek, token.length);
    },
    // Day of the month
    d: function(date, token, localize2) {
      if (token === "do") {
        return localize2.ordinalNumber(date.getDate(), { unit: "date" });
      }
      return lightFormatters.d(date, token);
    },
    // Day of year
    D: function(date, token, localize2) {
      const dayOfYear = getDayOfYear(date);
      if (token === "Do") {
        return localize2.ordinalNumber(dayOfYear, { unit: "dayOfYear" });
      }
      return addLeadingZeros(dayOfYear, token.length);
    },
    // Day of week
    E: function(date, token, localize2) {
      const dayOfWeek = date.getDay();
      switch (token) {
        // Tue
        case "E":
        case "EE":
        case "EEE":
          return localize2.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting"
          });
        // T
        case "EEEEE":
          return localize2.day(dayOfWeek, {
            width: "narrow",
            context: "formatting"
          });
        // Tu
        case "EEEEEE":
          return localize2.day(dayOfWeek, {
            width: "short",
            context: "formatting"
          });
        // Tuesday
        case "EEEE":
        default:
          return localize2.day(dayOfWeek, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // Local day of week
    e: function(date, token, localize2, options) {
      const dayOfWeek = date.getDay();
      const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
      switch (token) {
        // Numerical value (Nth day of week with current locale or weekStartsOn)
        case "e":
          return String(localDayOfWeek);
        // Padded numerical value
        case "ee":
          return addLeadingZeros(localDayOfWeek, 2);
        // 1st, 2nd, ..., 7th
        case "eo":
          return localize2.ordinalNumber(localDayOfWeek, { unit: "day" });
        case "eee":
          return localize2.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting"
          });
        // T
        case "eeeee":
          return localize2.day(dayOfWeek, {
            width: "narrow",
            context: "formatting"
          });
        // Tu
        case "eeeeee":
          return localize2.day(dayOfWeek, {
            width: "short",
            context: "formatting"
          });
        // Tuesday
        case "eeee":
        default:
          return localize2.day(dayOfWeek, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // Stand-alone local day of week
    c: function(date, token, localize2, options) {
      const dayOfWeek = date.getDay();
      const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
      switch (token) {
        // Numerical value (same as in `e`)
        case "c":
          return String(localDayOfWeek);
        // Padded numerical value
        case "cc":
          return addLeadingZeros(localDayOfWeek, token.length);
        // 1st, 2nd, ..., 7th
        case "co":
          return localize2.ordinalNumber(localDayOfWeek, { unit: "day" });
        case "ccc":
          return localize2.day(dayOfWeek, {
            width: "abbreviated",
            context: "standalone"
          });
        // T
        case "ccccc":
          return localize2.day(dayOfWeek, {
            width: "narrow",
            context: "standalone"
          });
        // Tu
        case "cccccc":
          return localize2.day(dayOfWeek, {
            width: "short",
            context: "standalone"
          });
        // Tuesday
        case "cccc":
        default:
          return localize2.day(dayOfWeek, {
            width: "wide",
            context: "standalone"
          });
      }
    },
    // ISO day of week
    i: function(date, token, localize2) {
      const dayOfWeek = date.getDay();
      const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
      switch (token) {
        // 2
        case "i":
          return String(isoDayOfWeek);
        // 02
        case "ii":
          return addLeadingZeros(isoDayOfWeek, token.length);
        // 2nd
        case "io":
          return localize2.ordinalNumber(isoDayOfWeek, { unit: "day" });
        // Tue
        case "iii":
          return localize2.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting"
          });
        // T
        case "iiiii":
          return localize2.day(dayOfWeek, {
            width: "narrow",
            context: "formatting"
          });
        // Tu
        case "iiiiii":
          return localize2.day(dayOfWeek, {
            width: "short",
            context: "formatting"
          });
        // Tuesday
        case "iiii":
        default:
          return localize2.day(dayOfWeek, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // AM or PM
    a: function(date, token, localize2) {
      const hours = date.getHours();
      const dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
      switch (token) {
        case "a":
        case "aa":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          });
        case "aaa":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          }).toLowerCase();
        case "aaaaa":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting"
          });
        case "aaaa":
        default:
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // AM, PM, midnight, noon
    b: function(date, token, localize2) {
      const hours = date.getHours();
      let dayPeriodEnumValue;
      if (hours === 12) {
        dayPeriodEnumValue = dayPeriodEnum.noon;
      } else if (hours === 0) {
        dayPeriodEnumValue = dayPeriodEnum.midnight;
      } else {
        dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
      }
      switch (token) {
        case "b":
        case "bb":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          });
        case "bbb":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          }).toLowerCase();
        case "bbbbb":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting"
          });
        case "bbbb":
        default:
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // in the morning, in the afternoon, in the evening, at night
    B: function(date, token, localize2) {
      const hours = date.getHours();
      let dayPeriodEnumValue;
      if (hours >= 17) {
        dayPeriodEnumValue = dayPeriodEnum.evening;
      } else if (hours >= 12) {
        dayPeriodEnumValue = dayPeriodEnum.afternoon;
      } else if (hours >= 4) {
        dayPeriodEnumValue = dayPeriodEnum.morning;
      } else {
        dayPeriodEnumValue = dayPeriodEnum.night;
      }
      switch (token) {
        case "B":
        case "BB":
        case "BBB":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          });
        case "BBBBB":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting"
          });
        case "BBBB":
        default:
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // Hour [1-12]
    h: function(date, token, localize2) {
      if (token === "ho") {
        let hours = date.getHours() % 12;
        if (hours === 0) hours = 12;
        return localize2.ordinalNumber(hours, { unit: "hour" });
      }
      return lightFormatters.h(date, token);
    },
    // Hour [0-23]
    H: function(date, token, localize2) {
      if (token === "Ho") {
        return localize2.ordinalNumber(date.getHours(), { unit: "hour" });
      }
      return lightFormatters.H(date, token);
    },
    // Hour [0-11]
    K: function(date, token, localize2) {
      const hours = date.getHours() % 12;
      if (token === "Ko") {
        return localize2.ordinalNumber(hours, { unit: "hour" });
      }
      return addLeadingZeros(hours, token.length);
    },
    // Hour [1-24]
    k: function(date, token, localize2) {
      let hours = date.getHours();
      if (hours === 0) hours = 24;
      if (token === "ko") {
        return localize2.ordinalNumber(hours, { unit: "hour" });
      }
      return addLeadingZeros(hours, token.length);
    },
    // Minute
    m: function(date, token, localize2) {
      if (token === "mo") {
        return localize2.ordinalNumber(date.getMinutes(), { unit: "minute" });
      }
      return lightFormatters.m(date, token);
    },
    // Second
    s: function(date, token, localize2) {
      if (token === "so") {
        return localize2.ordinalNumber(date.getSeconds(), { unit: "second" });
      }
      return lightFormatters.s(date, token);
    },
    // Fraction of second
    S: function(date, token) {
      return lightFormatters.S(date, token);
    },
    // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
    X: function(date, token, _localize) {
      const timezoneOffset = date.getTimezoneOffset();
      if (timezoneOffset === 0) {
        return "Z";
      }
      switch (token) {
        // Hours and optional minutes
        case "X":
          return formatTimezoneWithOptionalMinutes(timezoneOffset);
        // Hours, minutes and optional seconds without `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `XX`
        case "XXXX":
        case "XX":
          return formatTimezone(timezoneOffset);
        // Hours, minutes and optional seconds with `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `XXX`
        case "XXXXX":
        case "XXX":
        // Hours and minutes with `:` delimiter
        default:
          return formatTimezone(timezoneOffset, ":");
      }
    },
    // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
    x: function(date, token, _localize) {
      const timezoneOffset = date.getTimezoneOffset();
      switch (token) {
        // Hours and optional minutes
        case "x":
          return formatTimezoneWithOptionalMinutes(timezoneOffset);
        // Hours, minutes and optional seconds without `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `xx`
        case "xxxx":
        case "xx":
          return formatTimezone(timezoneOffset);
        // Hours, minutes and optional seconds with `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `xxx`
        case "xxxxx":
        case "xxx":
        // Hours and minutes with `:` delimiter
        default:
          return formatTimezone(timezoneOffset, ":");
      }
    },
    // Timezone (GMT)
    O: function(date, token, _localize) {
      const timezoneOffset = date.getTimezoneOffset();
      switch (token) {
        // Short
        case "O":
        case "OO":
        case "OOO":
          return "GMT" + formatTimezoneShort(timezoneOffset, ":");
        // Long
        case "OOOO":
        default:
          return "GMT" + formatTimezone(timezoneOffset, ":");
      }
    },
    // Timezone (specific non-location)
    z: function(date, token, _localize) {
      const timezoneOffset = date.getTimezoneOffset();
      switch (token) {
        // Short
        case "z":
        case "zz":
        case "zzz":
          return "GMT" + formatTimezoneShort(timezoneOffset, ":");
        // Long
        case "zzzz":
        default:
          return "GMT" + formatTimezone(timezoneOffset, ":");
      }
    },
    // Seconds timestamp
    t: function(date, token, _localize) {
      const timestamp = Math.trunc(+date / 1e3);
      return addLeadingZeros(timestamp, token.length);
    },
    // Milliseconds timestamp
    T: function(date, token, _localize) {
      return addLeadingZeros(+date, token.length);
    }
  };
  function formatTimezoneShort(offset, delimiter = "") {
    const sign = offset > 0 ? "-" : "+";
    const absOffset = Math.abs(offset);
    const hours = Math.trunc(absOffset / 60);
    const minutes = absOffset % 60;
    if (minutes === 0) {
      return sign + String(hours);
    }
    return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
  }
  function formatTimezoneWithOptionalMinutes(offset, delimiter) {
    if (offset % 60 === 0) {
      const sign = offset > 0 ? "-" : "+";
      return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
    }
    return formatTimezone(offset, delimiter);
  }
  function formatTimezone(offset, delimiter = "") {
    const sign = offset > 0 ? "-" : "+";
    const absOffset = Math.abs(offset);
    const hours = addLeadingZeros(Math.trunc(absOffset / 60), 2);
    const minutes = addLeadingZeros(absOffset % 60, 2);
    return sign + hours + delimiter + minutes;
  }

  // node_modules/date-fns/_lib/format/longFormatters.js
  var dateLongFormatter = (pattern, formatLong2) => {
    switch (pattern) {
      case "P":
        return formatLong2.date({ width: "short" });
      case "PP":
        return formatLong2.date({ width: "medium" });
      case "PPP":
        return formatLong2.date({ width: "long" });
      case "PPPP":
      default:
        return formatLong2.date({ width: "full" });
    }
  };
  var timeLongFormatter = (pattern, formatLong2) => {
    switch (pattern) {
      case "p":
        return formatLong2.time({ width: "short" });
      case "pp":
        return formatLong2.time({ width: "medium" });
      case "ppp":
        return formatLong2.time({ width: "long" });
      case "pppp":
      default:
        return formatLong2.time({ width: "full" });
    }
  };
  var dateTimeLongFormatter = (pattern, formatLong2) => {
    const matchResult = pattern.match(/(P+)(p+)?/) || [];
    const datePattern = matchResult[1];
    const timePattern = matchResult[2];
    if (!timePattern) {
      return dateLongFormatter(pattern, formatLong2);
    }
    let dateTimeFormat;
    switch (datePattern) {
      case "P":
        dateTimeFormat = formatLong2.dateTime({ width: "short" });
        break;
      case "PP":
        dateTimeFormat = formatLong2.dateTime({ width: "medium" });
        break;
      case "PPP":
        dateTimeFormat = formatLong2.dateTime({ width: "long" });
        break;
      case "PPPP":
      default:
        dateTimeFormat = formatLong2.dateTime({ width: "full" });
        break;
    }
    return dateTimeFormat.replace("{{date}}", dateLongFormatter(datePattern, formatLong2)).replace("{{time}}", timeLongFormatter(timePattern, formatLong2));
  };
  var longFormatters = {
    p: timeLongFormatter,
    P: dateTimeLongFormatter
  };

  // node_modules/date-fns/_lib/protectedTokens.js
  var dayOfYearTokenRE = /^D+$/;
  var weekYearTokenRE = /^Y+$/;
  var throwTokens = ["D", "DD", "YY", "YYYY"];
  function isProtectedDayOfYearToken(token) {
    return dayOfYearTokenRE.test(token);
  }
  function isProtectedWeekYearToken(token) {
    return weekYearTokenRE.test(token);
  }
  function warnOrThrowProtectedError(token, format2, input) {
    const _message = message(token, format2, input);
    console.warn(_message);
    if (throwTokens.includes(token)) throw new RangeError(_message);
  }
  function message(token, format2, input) {
    const subject = token[0] === "Y" ? "years" : "days of the month";
    return `Use \`${token.toLowerCase()}\` instead of \`${token}\` (in \`${format2}\`) for formatting ${subject} to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
  }

  // node_modules/date-fns/format.js
  var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
  var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
  var escapedStringRegExp = /^'([^]*?)'?$/;
  var doubleQuoteRegExp = /''/g;
  var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
  function format(date, formatStr, options) {
    const defaultOptions2 = getDefaultOptions();
    const locale = options?.locale ?? defaultOptions2.locale ?? enUS;
    const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
    const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
    const originalDate = toDate(date, options?.in);
    if (!isValid(originalDate)) {
      throw new RangeError("Invalid time value");
    }
    let parts = formatStr.match(longFormattingTokensRegExp).map((substring) => {
      const firstCharacter = substring[0];
      if (firstCharacter === "p" || firstCharacter === "P") {
        const longFormatter = longFormatters[firstCharacter];
        return longFormatter(substring, locale.formatLong);
      }
      return substring;
    }).join("").match(formattingTokensRegExp).map((substring) => {
      if (substring === "''") {
        return { isToken: false, value: "'" };
      }
      const firstCharacter = substring[0];
      if (firstCharacter === "'") {
        return { isToken: false, value: cleanEscapedString(substring) };
      }
      if (formatters[firstCharacter]) {
        return { isToken: true, value: substring };
      }
      if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
        throw new RangeError(
          "Format string contains an unescaped latin alphabet character `" + firstCharacter + "`"
        );
      }
      return { isToken: false, value: substring };
    });
    if (locale.localize.preprocessor) {
      parts = locale.localize.preprocessor(originalDate, parts);
    }
    const formatterOptions = {
      firstWeekContainsDate,
      weekStartsOn,
      locale
    };
    return parts.map((part) => {
      if (!part.isToken) return part.value;
      const token = part.value;
      if (!options?.useAdditionalWeekYearTokens && isProtectedWeekYearToken(token) || !options?.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(token)) {
        warnOrThrowProtectedError(token, formatStr, String(date));
      }
      const formatter = formatters[token[0]];
      return formatter(originalDate, token, locale.localize, formatterOptions);
    }).join("");
  }
  function cleanEscapedString(input) {
    const matched = input.match(escapedStringRegExp);
    if (!matched) {
      return input;
    }
    return matched[1].replace(doubleQuoteRegExp, "'");
  }

  // node_modules/date-fns/getISOWeeksInYear.js
  function getISOWeeksInYear(date, options) {
    const thisYear = startOfISOWeekYear(date, options);
    const nextYear = startOfISOWeekYear(addWeeks(thisYear, 60));
    const diff = +nextYear - +thisYear;
    return Math.round(diff / millisecondsInWeek);
  }

  // node_modules/date-fns/setISOWeek.js
  function setISOWeek(date, week, options) {
    const _date = toDate(date, options?.in);
    const diff = getISOWeek(_date, options) - week;
    _date.setDate(_date.getDate() - diff * 7);
    return _date;
  }

  // library/form/calendarweekcomponent.ts
  function getISOWeeksOfYear(year) {
    return getISOWeeksInYear(new Date(year, 5, 1));
  }
  var CalendarweekComponent = class _CalendarweekComponent {
    constructor(container, mode) {
      this.minDate = null;
      this.maxDate = null;
      this.mode = "continuous";
      this.onChangeActions = [];
      this.container = container;
      this.weekInput = container.querySelector(_CalendarweekComponent.select("week"));
      this.yearInput = container.querySelector(_CalendarweekComponent.select("year"));
      if (!this.weekInput || !this.yearInput) {
        throw new Error(`Couldn't find required "week" or "year" input element. Check the attribute selector "${_CalendarweekComponent.select()}"`);
      }
      if (!mode) {
        mode = container.getAttribute("data-mode");
        if (!["continuous", "loop", "fixed"].some((validMode) => validMode === mode)) {
          mode = "continuous";
          console.info(`Mode parsed from attribute was invalid. Mode was set to "${mode}".`);
        }
      }
      this.setMode(mode);
      const minDateStr = container.getAttribute("data-min-date") || "";
      const maxDateStr = container.getAttribute("data-max-date") || "";
      this.setMinMaxDates(new Date(minDateStr), new Date(maxDateStr));
      this.updateWeekMinMax();
      this.weekInput.addEventListener("keydown", (event) => this.onWeekKeydown(event));
      this.yearInput.addEventListener("keydown", (event) => this.onYearKeydown(event));
      this.weekInput.addEventListener("change", () => this.onWeekChange());
      this.yearInput.addEventListener("change", () => this.onYearChange());
    }
    static {
      this.select = attributeselector_default("data-cweek-element");
    }
    setDate(date, silent = false) {
      const year = getISOWeekYear(date);
      const week = getISOWeek(date);
      if (this.minDate && date < this.minDate || this.maxDate && date > this.maxDate) {
        throw new Error("The provided date is out of range.");
      }
      this.year = year;
      this.week = week;
      this.updateWeekMinMax();
      if (!silent) {
        this.onChange();
      } else {
        this.updateClient();
      }
    }
    setMode(mode) {
      switch (mode) {
        case "continuous":
        case "loop":
        case "fixed":
          this.mode = mode;
          break;
        default:
          throw new Error(`"${mode}" is not a valid mode.`);
      }
      console.info(`Calendarweek: Mode set to "${this.mode}".`);
    }
    setMinMaxDates(newMinDate, newMaxDate) {
      if (newMinDate instanceof Date && !isNaN(newMinDate.getTime())) {
        this.minDate = newMinDate;
        this.minDateYear = getISOWeekYear(newMinDate);
        this.minDateWeek = getISOWeek(newMinDate);
        this.yearInput.min = this.minDateYear.toString();
        this.container.dataset.minDate = format(newMinDate, "yyyy-MM-dd");
      } else {
        this.minDate = null;
        this.minDateYear = null;
        this.minDateWeek = null;
        this.yearInput.min = null;
        this.container.dataset.minDate = null;
      }
      if (newMaxDate instanceof Date && !isNaN(newMaxDate.getTime())) {
        this.maxDate = newMaxDate;
        this.maxDateYear = getISOWeekYear(newMaxDate);
        this.maxDateWeek = getISOWeek(newMaxDate);
        this.yearInput.max = this.maxDateYear.toString();
        this.container.dataset.maxDate = format(newMaxDate, "yyyy-MM-dd");
      } else {
        this.maxDate = null;
        this.maxDateYear = null;
        this.maxDateWeek = null;
        this.yearInput.max = null;
        this.container.dataset.maxDate = null;
      }
      this.updateWeekMinMax();
    }
    addOnChange(callback) {
      this.onChangeActions.push(callback);
    }
    removeOnChange(callback) {
      this.onChangeActions = this.onChangeActions.filter((fn) => fn !== callback);
    }
    getCurrentDate() {
      let date = setISOWeekYear(/* @__PURE__ */ new Date(0), this.year);
      date = setISOWeek(date, this.week);
      return startOfISOWeek(date);
    }
    parseWeekAndYear() {
      let parsedYear = parseInt(this.yearInput.value, 10);
      let parsedWeek = parseInt(this.weekInput.value, 10);
      parsedYear = this.keepYearInBounds(parsedYear);
      this.updateWeekMinMax(parsedYear);
      parsedWeek = this.keepWeekInBounds(parsedWeek);
      this.year = parsedYear;
      this.week = parsedWeek;
    }
    onChange() {
      this.updateClient();
      this.onChangeActions.forEach((callback) => callback(this.week, this.year, this.getCurrentDate()));
    }
    updateClient() {
      this.updateClientWeekMinMax();
      this.updateClientValues();
    }
    updateClientWeekMinMax() {
      this.weekInput.min = this.currentMinWeek.toString();
      this.weekInput.max = this.currentMaxWeek.toString();
    }
    updateClientValues() {
      this.yearInput.value = this.year.toString();
      this.weekInput.value = this.week.toString();
    }
    onYearChange() {
      this.parseWeekAndYear();
      this.onChange();
    }
    onWeekChange() {
      this.parseWeekAndYear();
      this.onChange();
    }
    updateWeekMinMax(currentYear = this.year) {
      const maxWeeksOfCurrentYear = getISOWeeksOfYear(currentYear);
      let minCalendarWeek = 1;
      let maxCalendarWeek = maxWeeksOfCurrentYear;
      if (this.minDate !== null && this.minDateYear === currentYear) {
        minCalendarWeek = this.minDateWeek;
      }
      if (this.maxDate !== null && this.maxDateYear === currentYear) {
        maxCalendarWeek = this.maxDateWeek;
      }
      this.currentMinWeek = minCalendarWeek;
      this.currentMaxWeek = maxCalendarWeek;
    }
    onWeekKeydown(event) {
      this.parseWeekAndYear();
      let changed = false;
      if (event.key === "ArrowUp" && this.week >= this.currentMaxWeek) {
        event.preventDefault();
        switch (this.mode) {
          case "continuous":
            if (this.year === this.maxDateYear) break;
            this.year += 1;
            this.week = 1;
            this.updateWeekMinMax();
            changed = true;
            break;
          case "loop":
            this.week = this.currentMinWeek;
            changed = true;
            break;
        }
      } else if (event.key === "ArrowDown" && this.week <= this.currentMinWeek) {
        event.preventDefault();
        switch (this.mode) {
          case "continuous":
            if (this.year === this.minDateYear) break;
            this.year -= 1;
            this.week = getISOWeeksOfYear(this.year);
            this.updateWeekMinMax();
            changed = true;
            break;
          case "loop":
            this.week = this.currentMaxWeek;
            changed = true;
            break;
        }
      }
      if (changed) {
        this.onChange();
      }
    }
    keepYearInBounds(year) {
      if (this.minDateYear !== null && year < this.minDateYear) {
        return this.minDateYear;
      }
      if (this.maxDateYear !== null && year > this.maxDateYear) {
        return this.maxDateYear;
      }
      return year;
    }
    keepWeekInBounds(week) {
      if (week < this.currentMinWeek) {
        return this.currentMinWeek;
      } else if (week > this.currentMaxWeek) {
        return this.currentMaxWeek;
      }
      return week;
    }
    onYearKeydown(event) {
      if (this.mode !== "loop" || !this.minDate || !this.maxDate) return;
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      const isArrowUp = event.key === "ArrowUp";
      const isArrowDown = event.key === "ArrowDown";
      this.parseWeekAndYear();
      if (isArrowUp && this.year === this.maxDateYear || isArrowDown && this.year === this.minDateYear) {
        event.preventDefault();
        this.year = isArrowUp ? this.minDateYear : this.maxDateYear;
        this.onChange();
      }
    }
  };

  // library/accordion.ts
  var modalSelector = attributeselector_default("data-modal-element");
  var Accordion = class {
    constructor(component) {
      this.isOpen = false;
      this.component = component;
      this.trigger = component.querySelector('[data-animate="trigger"]');
      this.uiTrigger = component.querySelector('[data-animate="ui-trigger"]');
      this.icon = component.querySelector('[data-animate="icon"]');
      this.uiTrigger.addEventListener("click", () => {
        this.toggle();
      });
    }
    open() {
      if (!this.isOpen) {
        this.trigger.click();
        setTimeout(() => {
          this.icon.classList.add("is-open");
        }, 200);
        this.isOpen = true;
      }
    }
    close() {
      if (this.isOpen) {
        this.trigger.click();
        setTimeout(() => {
          this.icon.classList.remove("is-open");
        }, 200);
        this.isOpen = false;
      }
    }
    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }
    scrollIntoView() {
      let offset = 0;
      const scrollWrapper = this.component.closest(
        modalSelector("scroll")
      );
      const elementPosition = this.component.getBoundingClientRect().top;
      if (scrollWrapper) {
        const wrapperPosition = scrollWrapper.getBoundingClientRect().top;
        offset = scrollWrapper.querySelector('[data-scroll-child="sticky"]').clientHeight;
        scrollWrapper.scrollBy({
          top: elementPosition - wrapperPosition - offset - 2,
          behavior: "smooth"
        });
      } else {
        window.scrollTo({
          top: elementPosition + window.scrollY - offset - 2,
          behavior: "smooth"
        });
      }
    }
  };

  // library/modal.ts
  var defaultModalAnimation = {
    type: "none",
    duration: 0,
    className: "is-closed"
  };
  var defaultModalSettings = {
    animation: defaultModalAnimation,
    stickyFooter: false,
    stickyHeader: false
  };
  var Modal = class _Modal {
    constructor(component, settings = defaultModalSettings) {
      this.settings = settings;
      this.initialized = false;
      if (!component) {
        throw new Error(`The component's HTMLElement cannot be undefined.`);
      }
      this.component = component;
      this.setInitialState();
      this.setupStickyFooter();
      this.initialized = true;
    }
    static {
      this.select = attributeselector_default("data-modal-element");
    }
    setupStickyFooter() {
      const modalContent = this.component.querySelector(_Modal.select("scroll"));
      const stickyFooter = this.component.querySelector(_Modal.select("sticky-bottom"));
      if (!modalContent || !stickyFooter) {
        console.warn("Initialize modal: skip sticky footer");
      } else {
        this.setupScrollEvent(modalContent, stickyFooter);
      }
    }
    setupScrollEvent(modalContent, stickyFooter) {
      modalContent.addEventListener("scroll", () => {
        const { scrollHeight, scrollTop, clientHeight } = modalContent;
        const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 1;
        if (isScrolledToBottom) {
          stickyFooter.classList.remove("modal-scroll-shadow");
        } else {
          stickyFooter.classList.add("modal-scroll-shadow");
        }
      });
    }
    setInitialState() {
      this.component.style.display = "none";
      this.hide();
      switch (this.settings.animation.type) {
        case "fade":
          this.component.style.willChange = "opacity";
          this.component.style.transitionProperty = "opacity";
          this.component.style.transitionDuration = this.settings.animation.duration.toString();
          break;
        case "slideUp":
          this.component.style.willChange = "opacity, translate";
          this.component.style.transitionProperty = "opacity, translate";
          this.component.style.transitionDuration = this.settings.animation.duration.toString();
          break;
        case "none":
          break;
      }
      this.component.dataset.state = "closed";
    }
    show() {
      this.component.dataset.state = "opening";
      this.component.style.removeProperty("display");
      switch (this.settings.animation.type) {
        case "fade":
          this.component.style.opacity = "1";
          break;
        case "slideUp":
          this.component.style.opacity = "1";
          this.component.style.translate = "0px 0vh0;";
          break;
        default:
          this.component.classList.remove("is-closed");
      }
      this.component.dataset.state = "open";
    }
    hide() {
      this.component.dataset.state = "closing";
      switch (this.settings.animation.type) {
        case "fade":
          this.component.style.opacity = "0";
          break;
        case "slideUp":
          this.component.style.opacity = "0";
          this.component.style.translate = "0px 20vh";
          break;
        default:
          break;
      }
      setTimeout(() => {
        this.component.style.display = "none";
      }, this.settings.animation.duration);
      this.component.dataset.state = "closed";
    }
    /**
     * Opens the modal instance.
     *
     * This method calls the `show` method and locks the scroll of the document body.
     */
    open() {
      this.show();
      lockBodyScroll();
    }
    /**
     * Closes the modal instance.
     *
     * This method calls the `hide` method and unlocks the scroll of the document body.
     */
    close() {
      unlockBodyScroll();
      this.hide();
    }
  };
  function lockBodyScroll() {
    document.body.style.overflow = "hidden";
  }
  function unlockBodyScroll() {
    document.body.style.removeProperty("overflow");
  }

  // src/ts/sanavita-form.ts
  var stepsElementSelector = attributeselector_default("data-steps-element");
  var stepsTargetSelector = attributeselector_default("data-step-target");
  var stepsNavSelector = attributeselector_default("data-steps-nav");
  var personSelector = attributeselector_default("data-person-element");
  var STEPS_PAGINATION_ITEM_SELECTOR = `button${stepsTargetSelector()}`;
  var ARRAY_LIST_SELECTOR = '[data-form-array-element="list"]';
  var ARRAY_GROUP_SELECTOR = "[data-person-data-group]";
  var ACCORDION_SELECTOR = `[data-animate="accordion"]`;
  var STORAGE_KEY = "formProgress";
  var Person = class {
    constructor(personalData = new FieldGroup(), doctor = new FieldGroup(), health = new FieldGroup(), primaryRelative = new FieldGroup(), secondaryRelative = new FieldGroup()) {
      this.personalData = personalData;
      this.doctor = doctor;
      this.health = health;
      this.primaryRelative = primaryRelative;
      this.secondaryRelative = secondaryRelative;
    }
    validate() {
      let valid = true;
      const groups = Object.keys(this);
      groups.forEach((groupName) => {
        const group = this[groupName];
        if (group.fields) {
          group.fields.forEach((field) => {
            if (!(field instanceof FormField)) {
              console.error(
                `Validate Person: field object is not of instance "Field"`
              );
              return;
            } else {
              const fieldValid = field.validate(true);
              if (!fieldValid) {
                valid = false;
              }
            }
          });
        }
      });
      return valid;
    }
    getFullName() {
      return `${this.personalData.getField("first-name").value} ${this.personalData.getField("name").value}`.trim() || "Neue Person";
    }
    serialize() {
      return {
        personalData: mapToObject(this.personalData.fields),
        doctor: mapToObject(this.doctor.fields),
        health: mapToObject(this.health.fields),
        primaryRelative: mapToObject(this.primaryRelative.fields),
        secondaryRelative: mapToObject(this.secondaryRelative.fields)
      };
    }
    flatten(prefix) {
      const fields = {};
      const groupNames = Object.keys(this);
      for (const groupName of groupNames) {
        const group = this[groupName];
        group.fields.forEach((field, index) => {
          const fieldName = `${prefix}_${groupName}_${field.id}`;
          fields[fieldName] = field.value;
        });
      }
      return fields;
    }
  };
  function convertObjectToFields(fieldsObj) {
    const fieldsMap = /* @__PURE__ */ new Map();
    Object.entries(fieldsObj).forEach(([key, fieldData]) => {
      const field = new FormField(fieldData);
      fieldsMap.set(key, field);
    });
    return fieldsMap;
  }
  function deserializeFieldGroup(fieldGroupData) {
    const fieldsMap = convertObjectToFields(fieldGroupData);
    return new FieldGroup(fieldsMap);
  }
  function deserializePerson(data) {
    return new Person(
      deserializeFieldGroup(data.personalData),
      deserializeFieldGroup(data.doctor),
      deserializeFieldGroup(data.health),
      deserializeFieldGroup(data.primaryRelative),
      deserializeFieldGroup(data.secondaryRelative)
    );
  }
  var FormModal = class extends Modal {
  };
  var FormArray = class {
    constructor(container, id) {
      this.accordionList = [];
      this.initialized = false;
      this.editingKey = null;
      this.id = id;
      this.container = container;
      this.people = /* @__PURE__ */ new Map();
      this.list = this.container.querySelector(ARRAY_LIST_SELECTOR);
      this.template = this.list.querySelector(personSelector("template"));
      this.addButton = this.container.querySelector(personSelector("add"));
      this.formMessage = new FormMessage("FormArray", this.id.toString());
      this.modalForm = document.querySelector(wf.formQuery.form);
      this.modalElement = document.querySelector(
        formElementSelector("modal") + `[data-modal-for="person"]`
      );
      this.modal = new FormModal(this.modalElement);
      this.saveButton = this.modalElement.querySelector(personSelector("save"));
      this.cancelButtons = this.modalElement.querySelectorAll(
        personSelector("cancel")
      );
      this.modalInputs = this.modalElement.querySelectorAll(wf.formQuery.input);
      this.groupElements = this.modalElement.querySelectorAll(ARRAY_GROUP_SELECTOR);
      this.initialize();
    }
    initialize() {
      this.cancelButtons.forEach((button) => {
        button.addEventListener("click", () => this.handleCancel());
      });
      this.modalInputs.forEach((input) => {
        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            this.savePersonFromModal();
          }
        });
        input.addEventListener("focusin", () => {
          const accordionIndex = this.accordionIndexOf(input);
          const accordionInstance = this.accordionList[accordionIndex];
          if (!accordionInstance.isOpen) {
            this.openAccordion(accordionIndex, this.accordionList);
            setTimeout(() => {
              input.scrollIntoView({
                behavior: "smooth",
                block: "center"
              });
            }, 500);
          }
        });
      });
      this.saveButton.addEventListener("click", () => this.savePersonFromModal());
      this.addButton.addEventListener("click", () => this.addPerson());
      this.renderList();
      this.closeModal();
      const accordionList = this.container.querySelectorAll(ACCORDION_SELECTOR);
      for (let i = 0; i < accordionList.length; i++) {
        const accordionElement = accordionList[i];
        accordionElement.dataset.index = i.toString();
        const accordion = new Accordion(accordionElement);
        this.accordionList.push(accordion);
        accordion.uiTrigger.addEventListener("click", () => {
          this.openAccordion(i, this.accordionList);
          setTimeout(() => {
            accordion.scrollIntoView();
          }, 500);
        });
      }
      this.openAccordion(0, this.accordionList);
      this.initialized = true;
    }
    handleCancel() {
      this.closeModal();
    }
    addPerson() {
      if (this.people.size === 2) {
        this.formMessage.error("Sie k\xF6nnen nur max. 2 Personen hinzuf\xFCgen.");
        setTimeout(() => this.formMessage.reset(), 5e3);
        return;
      }
      this.clearModal();
      this.setLiveText("state", "Hinzuf\xFCgen");
      this.setLiveText("full-name", "Neue Person");
      this.openModal();
      this.editingKey = null;
    }
    savePersonFromModal(validate = true) {
      const listValid = this.validateModal(validate);
      if (!listValid) {
        console.warn(
          `Couldn't save person. Please fill in all the values correctly.`
        );
        if (validate) return null;
      }
      const person = this.extractData();
      if (this.savePerson(person)) {
        this.renderList();
        this.closeModal();
      }
      this.saveProgress();
    }
    savePerson(person) {
      if (this.editingKey !== null) {
        this.people.set(this.editingKey, person);
      } else {
        const uniqueSuffix = crypto.randomUUID();
        const newKey = `person-${uniqueSuffix}`;
        this.people.set(newKey, person);
      }
      return true;
    }
    setLiveText(element, string) {
      const liveElements = this.modalElement.querySelectorAll(`[data-live-text="${element}"]`);
      let valid = true;
      for (const element2 of Array.from(liveElements)) {
        if (!element2) {
          valid = false;
          break;
        }
        element2.innerText = string;
      }
      return valid;
    }
    renderList() {
      this.list.innerHTML = "";
      this.list.dataset.length = this.people.size.toString();
      if (this.people.size) {
        this.people.forEach((person, key) => this.renderPerson(person, key));
        this.formMessage.reset();
      } else {
        this.formMessage.info(
          "Bitte f\xFCgen Sie die Mieter (max. 2 Personen) hinzu.",
          !this.initialized
        );
      }
    }
    renderPerson(person, key) {
      const newElement = this.template.cloneNode(
        true
      );
      const props = ["full-name", "phone", "email", "street", "zip", "city"];
      newElement.style.removeProperty("display");
      const editButton = newElement.querySelector('[data-person-action="edit"]');
      const deleteButton = newElement.querySelector(
        '[data-person-action="delete"]'
      );
      editButton.addEventListener("click", () => {
        this.setLiveText("state", "bearbeiten");
        this.setLiveText("full-name", person.getFullName() || "Neue Person");
        this.populateModal(person);
        this.openModal();
        this.editingKey = key;
      });
      deleteButton.addEventListener("click", () => {
        this.people.delete(key);
        this.renderList();
        this.closeModal();
        this.saveProgress();
      });
      props.forEach((prop) => {
        const propSelector = `[data-${prop}]`;
        const el = newElement.querySelector(propSelector);
        if (el && prop === "full-name") {
          el.innerText = person.getFullName();
        } else if (el) {
          const currentField = person.personalData.getField(prop);
          if (!currentField) {
            console.error(`Render person: A field for "${prop}" doesn't exist.`);
            return;
          }
          el.innerText = currentField.value || currentField.label;
        }
      });
      this.list.appendChild(newElement);
    }
    populateModal(person) {
      this.groupElements.forEach((group) => {
        const groupInputs = group.querySelectorAll(wf.formQuery.input);
        const groupName = group.dataset.personDataGroup;
        groupInputs.forEach((input) => {
          const field = person[groupName].getField(input.id);
          if (!field) {
            console.warn(`Field not found:`, field, input.id);
            return;
          }
          if (!isRadioInput(input) && !isCheckboxInput(input)) {
            input.value = field.value.trim();
            return;
          }
          if (isRadioInput(input) && input.value === field.value) {
            input.checked = field.checked;
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
          if (isCheckboxInput(input)) {
            input.checked = field.checked;
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
      });
    }
    validate() {
      let valid = true;
      if (this.people.size === 0) {
        console.warn("Bitte f\xFCgen Sie mindestens eine mietende Person hinzu.");
        this.formMessage.error(
          `Bitte f\xFCgen Sie mindestens eine mietende Person hinzu.`
        );
        setTimeout(
          () => this.formMessage.info(
            "Bitte f\xFCgen Sie die Mieter (max. 2 Personen) hinzu.",
            true
          ),
          5e3
        );
        valid = false;
      } else {
        this.people.forEach((person, key) => {
          if (!person.validate()) {
            console.warn(
              `Bitte f\xFCllen Sie alle Felder f\xFCr "${person.getFullName()}" aus.`
            );
            this.formMessage.error(
              `Bitte f\xFCllen Sie alle Felder f\xFCr "${person.getFullName()}" aus.`
            );
            valid = false;
          }
        });
      }
      return valid;
    }
    openModal() {
      const personalDataGroup = this.modalElement.querySelector(
        '[data-person-data-group="personalData"]'
      );
      const nameInputs = personalDataGroup.querySelectorAll("#first-name, #name");
      nameInputs.forEach((input) => {
        input.addEventListener("input", () => {
          const editingPerson = this.extractData();
          this.setLiveText(
            "full-name",
            editingPerson.getFullName() || "Neue Person"
          );
        });
      });
      this.formMessage.reset();
      this.openAccordion(0, this.accordionList);
      this.modal.open();
    }
    closeModal() {
      this.modal.close();
      if (this.initialized) {
        this.list.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
      this.clearModal();
    }
    clearModal() {
      this.setLiveText("state", "hinzuf\xFCgen");
      this.setLiveText("full-name", "Neue Person");
      this.modalInputs.forEach((input) => {
        if (isRadioInput(input)) {
          input.checked = false;
          clearRadioGroup(this.modalElement, input.name);
        } else if (isCheckboxInput(input)) {
          input.checked = false;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        } else {
          input.value = "";
        }
      });
    }
    validateModal(report = true) {
      const allModalFields = this.modalElement.querySelectorAll(wf.formQuery.input);
      const { valid, invalidField } = validateFields2(allModalFields, report);
      if (valid === true) {
        return true;
      } else if (invalidField) {
        const accordionIndex = this.accordionIndexOf(invalidField);
        if (accordionIndex !== -1) {
          this.openAccordion(accordionIndex, this.accordionList);
          setTimeout(() => {
            invalidField.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });
          }, 500);
        }
        return false;
      }
      return false;
    }
    openAccordion(index, accordionList) {
      for (let i = 0; i < accordionList.length; i++) {
        const accordion = accordionList[i];
        if (i === index && !accordion.isOpen) {
          accordion.open();
        } else if (i !== index && accordion.isOpen) {
          accordion.close();
        }
      }
    }
    /**
     * Finds the index of the accordion that contains a specific field element.
     * This method traverses the DOM to locate the accordion that wraps the field
     * and returns its index in the `accordionList`.
     *
     * @param field - The form element (field) to search for within the accordions.
     * @returns The index of the accordion containing the field, or `-1` if no accordion contains the field.
     */
    accordionIndexOf(field) {
      let parentElement = field.closest(
        '[data-animate="accordion"]'
      );
      if (parentElement) {
        const accordionIndex = this.accordionList.findIndex(
          (accordion) => accordion.component === parentElement
        );
        return accordionIndex !== -1 ? accordionIndex : -1;
      }
      return -1;
    }
    extractData() {
      const personData = new Person();
      this.groupElements.forEach((group) => {
        const groupInputs = group.querySelectorAll(wf.formQuery.input);
        const groupName = group.dataset.personDataGroup;
        if (!personData[groupName]) {
          console.error(`The group "${groupName}" doesn't exist.`);
          return;
        }
        groupInputs.forEach((input, index) => {
          const field = fieldFromInput(input, index);
          if (field?.id) {
            personData[groupName].fields.set(field.id, field);
          }
        });
      });
      return personData;
    }
    /**
     * Save the progress to localStorage
     */
    saveProgress() {
      const serializedPeople = peopleMapToObject(this.people);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedPeople));
        console.log("Form progress saved.");
        console.log(serializedPeople);
      } catch (error) {
        console.error("Error saving form progress to localStorage:", error);
      }
    }
    /**
     * Clear the saved progress from localStorage
     */
    clearProgress() {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Error clearing form progress from localStorage:", error);
      }
    }
    /**
     * Load the saved progress from localStorage
     */
    loadProgress() {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const deserializedData = JSON.parse(savedData);
          for (const key in deserializedData) {
            if (deserializedData.hasOwnProperty(key)) {
              const personData = deserializedData[key];
              const person = deserializePerson(personData);
              this.people.set(key, person);
              this.renderList();
              this.closeModal();
            }
          }
          console.log("Form progress loaded.");
        } catch (error) {
          console.error("Error loading form progress from localStorage:", error);
        }
      } else {
        console.log("No saved form progress found.");
      }
    }
  };
  var MultiStepForm = class {
    constructor(component, options) {
      this.initialized = false;
      this.currentStep = 0;
      this.customComponents = [];
      this.component = component;
      this.formElement = this.component.querySelector(wf.formQuery.form);
      this.options = options;
      if (!this.formElement) {
        throw new Error("Form element not found within the specified component.");
      }
      this.formSteps = this.component.querySelectorAll(stepsElementSelector("step"));
      this.paginationItems = this.component.querySelectorAll(STEPS_PAGINATION_ITEM_SELECTOR);
      this.navigationElement = this.component.querySelector(stepsElementSelector("navigation"));
      this.buttonsNext = this.component.querySelectorAll(stepsNavSelector("next"));
      this.buttonsPrev = this.component.querySelectorAll(stepsNavSelector("prev"));
      this.successElement = this.component.querySelector(formElementSelector("success"));
      this.errorElement = this.component.querySelector(formElementSelector("error"));
      this.submitButton = this.component.querySelector(formElementSelector("submit"));
      this.initialize();
    }
    initialize() {
      if (!this.component.getAttribute("data-steps-element")) {
        console.error(
          `Form Steps: Component is not a steps component or is missing the attribute ${stepsElementSelector("component")}.
Component:`,
          this.component
        );
        return;
      }
      if (!this.formSteps.length) {
        console.warn(
          `Form Steps: The selected list doesn't contain any steps. Skipping initialization. Provided List:`,
          this.component.querySelector(stepsElementSelector("list"))
        );
        return;
      }
      initFormButtons(this.formElement);
      initCustomInputs(this.component);
      this.setupSteps();
      this.initPagination();
      this.changeToStep(this.currentStep);
      this.formElement.setAttribute("novalidate", "");
      this.formElement.dataset.state = "initialized";
      this.formElement.addEventListener("submit", (event) => {
        event.preventDefault();
        this.submitToWebflow();
      });
      this.initialized = true;
    }
    addCustomComponent(step, instance, validator, getData) {
      const customComponent = {
        step,
        instance,
        validator,
        getData
      };
      this.customComponents.push(customComponent);
    }
    async submitToWebflow() {
      if (this.currentStep !== this.formSteps.length - 1) {
        console.error(
          "SUBMIT ERROR: the current step is not the last step. Can only submit the MultiStepForm in the last step."
        );
        return;
      }
      const allStepsValid = this.validateAllSteps();
      if (!allStepsValid) {
        console.warn("Form submission blocked: Not all steps are valid.");
        return;
      }
      this.formElement.dataset.state = "sending";
      if (this.submitButton) {
        this.submitButton.dataset.defaultText = this.submitButton.value;
        this.submitButton.value = this.submitButton.dataset.wait || "Wird gesendet ...";
      }
      const formData = this.buildJsonForWebflow();
      console.log(formData);
      const success = await sendFormData(formData);
      if (success) {
        this.onFormSuccess();
      } else {
        this.onFormError();
      }
    }
    buildJsonForWebflow() {
      const customFields = this.customComponents.reduce((acc, entry) => {
        return {
          ...acc,
          ...entry.getData ? entry.getData() : {}
        };
      }, {});
      const fields = {
        ...mapToObject(this.getAllFormData(), false),
        ...customFields
      };
      if (this.options.recaptcha) {
        const recaptcha = this.formElement.querySelector("#g-recaptcha-response").value;
        fields["g-recaptcha-response"] = recaptcha;
      }
      return {
        name: this.formElement.dataset.name,
        pageId: wf.pageId,
        elementId: this.formElement.dataset.wfElementId,
        source: window.location.href,
        test: false,
        fields,
        dolphin: false
      };
    }
    onFormSuccess() {
      if (this.errorElement) this.errorElement.style.display = "none";
      if (this.successElement) this.successElement.style.display = "block";
      this.formElement.style.display = "none";
      this.formElement.dataset.state = "success";
      this.formElement.dispatchEvent(new CustomEvent("formSuccess"));
      if (this.submitButton) {
        this.submitButton.value = this.submitButton.dataset.defaultText || "Submit";
      }
    }
    onFormError() {
      if (this.errorElement) this.errorElement.style.display = "block";
      if (this.successElement) this.successElement.style.display = "none";
      this.formElement.dataset.state = "error";
      this.formElement.dispatchEvent(new CustomEvent("formError"));
      if (this.submitButton) {
        this.submitButton.value = this.submitButton.dataset.defaultText || "Submit";
      }
    }
    setupSteps() {
      this.formSteps.forEach((step, index) => {
        step.dataset.stepId = index.toString();
        step.classList.toggle("hide", index !== this.currentStep);
        step.querySelectorAll(wf.formQuery.input).forEach((input) => {
          input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              this.changeToNext();
            }
          });
        });
      });
    }
    initPagination() {
      this.paginationItems.forEach((item, index) => {
        item.dataset.stepTarget = index.toString();
        item.addEventListener("click", (event) => {
          event.preventDefault();
          this.changeToStep(index);
        });
      });
      this.buttonsNext.forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          this.changeToNext();
        });
      });
      this.buttonsPrev.forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          this.changeToPrevious();
        });
      });
    }
    changeToNext() {
      if (this.currentStep < this.formSteps.length - 1) {
        this.changeToStep(this.currentStep + 1);
      }
    }
    changeToPrevious() {
      if (this.currentStep > 0) {
        this.changeToStep(this.currentStep - 1);
      }
    }
    changeToStep(target) {
      if (this.currentStep === target && this.initialized) {
        return;
      }
      if (target > this.currentStep && this.initialized) {
        for (let step = this.currentStep; step < target; step++) {
          if (!this.validateCurrentStep(step)) {
            this.changeToStep(step);
            return;
          }
        }
        this.component.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
      const event = new CustomEvent("changeStep", {
        detail: { previousStep: this.currentStep, currentStep: target }
      });
      this.component.dispatchEvent(event);
      this.updateStepVisibility(target);
      this.updatePagination(target);
      this.currentStep = target;
      console.log(`Step ${this.currentStep + 1}/${this.formSteps.length}`);
    }
    updateStepVisibility(target) {
      this.formSteps[this.currentStep].classList.add("hide");
      this.formSteps[target].classList.remove("hide");
    }
    updatePagination(target) {
      this.buttonsPrev.forEach((button) => {
        if (target === 0) {
          button.style.visibility = "hidden";
          button.style.opacity = "0";
        } else {
          button.style.visibility = "visible";
          button.style.opacity = "1";
        }
      });
      this.buttonsNext.forEach((button) => {
        if (target === this.formSteps.length - 1) {
          button.style.visibility = "hidden";
          button.style.opacity = "0";
        } else {
          button.style.visibility = "visible";
          button.style.opacity = "1";
        }
      });
      if (target === this.options.navigation.hideInStep) {
        this.navigationElement.style.visibility = "hidden";
        this.navigationElement.style.opacity = "0";
      } else {
        this.navigationElement.style.removeProperty("visibility");
        this.navigationElement.style.removeProperty("opacity");
      }
      this.paginationItems.forEach((step, index) => {
        step.classList.toggle("is-done", index < target);
        step.classList.toggle("is-active", index === target);
      });
    }
    validateAllSteps() {
      let allValid = true;
      this.formSteps.forEach((step, index) => {
        if (!this.validateCurrentStep(index)) {
          console.warn(`Step ${index + 1} is invalid.`);
          allValid = false;
          this.changeToStep(index);
        }
      });
      return allValid;
    }
    validateCurrentStep(step) {
      const basicError = `Validation failed for step: ${step + 1}/${this.formSteps.length}`;
      const currentStepElement = this.formSteps[step];
      const inputs = currentStepElement.querySelectorAll(wf.formQuery.input);
      const filteredInputs = Array.from(inputs).filter((input) => {
        const isExcluded = this.options.excludeInputSelectors.some(
          (selector) => {
            return input.closest(`${selector}`) !== null || input.matches(selector);
          }
        );
        return !isExcluded;
      });
      let { valid } = validateFields2(filteredInputs);
      if (!valid) {
        console.warn(`${basicError}: Standard validation is not valid`);
        return valid;
      }
      const customValidators = this.customComponents.filter((entry) => entry.step === step).map((entry) => () => entry.validator());
      const customValid = customValidators?.every((validator) => validator()) ?? true;
      if (!customValid) {
        console.warn(`${basicError}: Custom validation is not valid`);
      }
      return valid && customValid;
    }
    getFormDataForStep(step) {
      let fields = /* @__PURE__ */ new Map();
      const stepElement = this.formSteps[step];
      const stepInputs = stepElement.querySelectorAll(wf.formQuery.input);
      stepInputs.forEach((input, inputIndex) => {
        const entry = fieldFromInput(input, inputIndex);
        if (entry?.id) {
          fields.set(entry.id, entry.value);
        }
      });
      return fields;
    }
    getAllFormData() {
      const fields = Array.from(this.formSteps).reduce((acc, entry, stepIndex) => {
        const stepData = this.getFormDataForStep(stepIndex);
        return new Map([
          ...acc,
          ...stepData
        ]);
      }, /* @__PURE__ */ new Map());
      return fields;
    }
  };
  function mapToObject(map, stringify = false) {
    const obj = {};
    for (const [key, value] of map) {
      obj[key] = value instanceof Map ? mapToObject(value, stringify) : stringify ? JSON.stringify(value) : value;
    }
    return obj;
  }
  function peopleMapToObject(people) {
    const peopleObj = {};
    for (const [key, person] of people) {
      peopleObj[key] = person.serialize();
    }
    return peopleObj;
  }
  function flattenPeople(people) {
    let peopleObj = {};
    let peopleArray = [...people.values()];
    for (let i = 0; i < peopleArray.length; i++) {
      let person = peopleArray[i];
      peopleObj = { ...peopleObj, ...person.flatten(`person${i + 1}`) };
    }
    return peopleObj;
  }
  function initFormButtons(form) {
    const buttons = form.querySelectorAll("button");
    buttons.forEach((button) => {
      button.setAttribute("type", "button");
      button.addEventListener("click", (event) => {
      });
    });
  }
  function decisionSelector(id) {
    return id ? `[data-decision-component="${id}"]` : `[data-decision-component]`;
  }
  function initializeFormDecisions(form, errorMessages, defaultMessages = {}) {
    form.formSteps.forEach((step, stepIndex) => {
      const formDecisions = step.querySelectorAll(
        decisionSelector()
      );
      formDecisions.forEach((element) => {
        const id = element.dataset.decisionComponent;
        const decision = new FormDecision(element, id);
        if (id && errorMessages[id]) {
          decision.setErrorMessages(errorMessages[id], defaultMessages[id]);
        }
        form.addCustomComponent(stepIndex, decision, () => decision.validate());
      });
    });
  }
  function initializeOtherFormDecisions(form, errorMessages, defaultMessages = {}) {
    const formDecisions = form.querySelectorAll(decisionSelector());
    formDecisions.forEach((element) => {
      const id = element.dataset.decisionComponent;
      const decision = new FormDecision(element, id);
      if (id && errorMessages[id]) {
        decision.setErrorMessages(errorMessages[id], defaultMessages[id]);
      }
    });
  }
  function insertSearchParamValues() {
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const selectElement = document.querySelector(
        "#wohnung"
      );
      const wohnungValue = params.get("wohnung");
      const option = selectElement.querySelector(
        `option[value="${wohnungValue}"]`
      );
      if (wohnungValue && option) {
        selectElement.value = wohnungValue;
      } else {
        console.warn(`No matching option for value: ${wohnungValue}`);
      }
    }
  }
  var formElement = document.querySelector(
    formElementSelector("component")
  );
  formElement?.classList.remove("w-form");
  document.addEventListener("DOMContentLoaded", () => {
    if (!formElement) {
      console.error("Form not found.");
      return;
    }
    const peopleArray = new FormArray(formElement, "personArray");
    const FORM = new MultiStepForm(formElement, {
      navigation: {
        hideInStep: 0
      },
      recaptcha: true,
      excludeInputSelectors: [
        '[data-decision-path="upload"]',
        "[data-decision-component]"
      ]
    });
    FORM.addCustomComponent(
      2,
      peopleArray,
      () => peopleArray.validate(),
      () => flattenPeople(peopleArray.people)
    );
    FORM.component.addEventListener("changeStep", () => peopleArray.closeModal());
    const errorMessages = {
      beilagenSenden: {
        upload: "Bitte laden Sie alle Beilagen hoch."
      }
    };
    const defaultMessages = {
      beilagenSenden: `Bitte laden Sie alle Beilagen hoch oder w\xE4hlen Sie die Option "Beilagen per Post senden".`
    };
    initializeOtherFormDecisions(
      peopleArray.modalElement,
      errorMessages,
      defaultMessages
    );
    initializeFormDecisions(FORM, errorMessages, defaultMessages);
    insertSearchParamValues();
    peopleArray.loadProgress();
    FORM.formElement.addEventListener("formSuccess", () => {
      peopleArray.clearProgress();
    });
    console.log("Form initialized:", FORM.initialized, FORM);
  });
})();

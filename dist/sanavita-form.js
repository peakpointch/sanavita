(() => {
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

  // library/form/form.ts
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
            input.parentElement?.querySelector(W_CHECKBOX_CLASS)?.classList.add("has-error");
          }
          input.addEventListener("change", () => {
            input.classList.remove("has-error");
            if (isCheckboxInput(input)) {
              input.parentElement?.querySelector(W_CHECKBOX_CLASS)?.classList.remove("has-error");
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
  var wf = {
    siteId,
    pageId
  };
  var formQuery2 = {
    form: FORM_SELECTOR,
    checkbox: CHECKBOX_INPUT_SELECTOR,
    radio: RADIO_INPUT_SELECTOR,
    select: W_SELECT,
    input: FORM_INPUT_SELECTOR,
    inputOnly: W_INPUT,
    inputSelectorList: FORM_INPUT_SELECTOR_LIST,
    filters: FORM_FILTERS_SELECTOR
  };

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
    info(message = null, silent = false) {
      if (!this.initialized)
        return;
      if (!silent) {
        this.component.setAttribute("aria-live", "polite");
      }
      this.setMessage(message, "info", silent);
    }
    /**
     * Displays an error message.
     * @param message The message text to display. Defaults to `null`.
     * @param silent If `true`, skips accessibility announcements. Defaults to `false`.
     */
    error(message = null, silent = false) {
      if (!this.initialized)
        return;
      if (!silent) {
        this.component.setAttribute("role", "alert");
        this.component.setAttribute("aria-live", "assertive");
      }
      this.setMessage(message, "error", silent);
    }
    /**
     * Resets the message component, hiding any displayed message.
     */
    reset() {
      if (!this.initialized)
        return;
      this.component.classList.remove("info", "error");
    }
    /**
     * Sets the message text and type (private method).
     * @param message The message text to display. Defaults to `null`.
     * @param type The type of message (`"info"` or `"error"`).
     * @param silent If `true`, skips accessibility announcements. Defaults to `false`.
     */
    setMessage(message = null, type, silent = false) {
      if (!this.initialized)
        return;
      if (this.messageElement && message) {
        this.messageElement.textContent = message;
      } else if (!this.messageElement) {
        console.warn("Message text element not found.");
      }
      this.component.classList.remove("info", "error");
      this.component.classList.add(type);
      if (silent)
        return;
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
      const isValid = pathIndex === -1 || this.checkPathValidity(pathIndex);
      this.handleValidationMessages(isValid);
      return isValid;
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

  // src/ts/sanavita-form.ts
  var stepsElementSelector = attributeselector_default("data-steps-element");
  var stepsTargetSelector = attributeselector_default("data-step-target");
  var stepsNavSelector = attributeselector_default("data-steps-nav");
  var modalSelector2 = attributeselector_default("data-modal-element");
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
  var Modal = class {
    constructor(component) {
      this.initialized = false;
      if (!component) {
        throw new Error(`The passed component doesn't exist.`);
      }
      this.component = component;
      const modalContent = this.getModalContent();
      const stickyFooter = this.getStickyFooter();
      if (!modalContent || !stickyFooter) {
        console.warn("Initialize modal: skip sticky footer");
      } else {
        this.setupScrollEvent(modalContent, stickyFooter);
      }
      this.initialized = true;
    }
    getModalContent() {
      return this.component.querySelector(modalSelector2("scroll"));
    }
    getStickyFooter() {
      return this.component.querySelector(modalSelector2("sticky-bottom"));
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
    showComponent() {
      this.component.style.removeProperty("display");
      this.component.classList.remove("is-closed");
      this.component.dataset.state = "open";
    }
    hideComponent() {
      this.component.classList.add("is-closed");
      this.component.dataset.state = "closed";
      setTimeout(() => {
        this.component.style.display = "none";
      }, 500);
    }
    /**
     * Opens the modal instance.
     *
     * This method calls the `showComponent` method and locks the scroll of the document body.
     */
    open() {
      this.showComponent();
      lockBodyScroll();
    }
    /**
     * Closes the modal instance.
     *
     * This method calls the `hideComponent` method and unlocks the scroll of the document body.
     */
    close() {
      unlockBodyScroll();
      this.hideComponent();
    }
    addCustomAction(action) {
    }
  };
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
      this.modalForm = document.querySelector(formQuery2.form);
      this.modalElement = document.querySelector(
        formElementSelector("modal") + `[data-modal-for="person"]`
      );
      this.modal = new FormModal(this.modalElement);
      this.saveButton = this.modalElement.querySelector(personSelector("save"));
      this.cancelButtons = this.modalElement.querySelectorAll(
        personSelector("cancel")
      );
      this.modalInputs = this.modalElement.querySelectorAll(formQuery2.input);
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
        if (validate)
          return null;
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
        const groupInputs = group.querySelectorAll(formQuery2.input);
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
      const allModalFields = this.modalElement.querySelectorAll(formQuery2.input);
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
        const groupInputs = group.querySelectorAll(formQuery2.input);
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
      this.formElement = this.component.querySelector(formQuery2.form);
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
      if (this.errorElement)
        this.errorElement.style.display = "none";
      if (this.successElement)
        this.successElement.style.display = "block";
      this.formElement.style.display = "none";
      this.formElement.dataset.state = "success";
      this.formElement.dispatchEvent(new CustomEvent("formSuccess"));
      if (this.submitButton) {
        this.submitButton.value = this.submitButton.dataset.defaultText || "Submit";
      }
    }
    onFormError() {
      if (this.errorElement)
        this.errorElement.style.display = "block";
      if (this.successElement)
        this.successElement.style.display = "none";
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
        step.querySelectorAll(formQuery2.input).forEach((input) => {
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
      const inputs = currentStepElement.querySelectorAll(formQuery2.input);
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
      const stepInputs = stepElement.querySelectorAll(formQuery2.input);
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
  function lockBodyScroll() {
    document.body.style.overflow = "hidden";
  }
  function unlockBodyScroll() {
    document.body.style.removeProperty("overflow");
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

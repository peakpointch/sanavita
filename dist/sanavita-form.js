(() => {
  // assets/ts/sanavita-form.ts
  var W_CHECKBOX_CLASS = ".w-checkbox-input";
  var W_RADIO_CLASS = ".w-radio-input";
  var W_CHECKED_CLASS = "w--redirected-checked";
  var FORM_COMPONENT_SELECTOR = '[data-form-element="component"]';
  var FORM_SELECTOR = "form";
  var FORM_SUCCESS_SELECTOR = '[data-form-element="success"]';
  var FORM_ERROR_SELECTOR = '[data-form-element="error"]';
  var FORM_SUBMIT_SELECTOR = '[data-form-element="submit"]';
  var CHECKBOX_INPUT_SELECTOR = `.w-checkbox input[type="checkbox"]:not(${W_CHECKBOX_CLASS})`;
  var RADIO_INPUT_SELECTOR = '.w-radio input[type="radio"]';
  var FORM_INPUT_SELECTOR = `.w-input, .w-select, ${RADIO_INPUT_SELECTOR}, ${CHECKBOX_INPUT_SELECTOR}`;
  var STEPS_COMPONENT_SELECTOR = '[data-steps-element="component"]';
  var STEPS_LIST_SELECTOR = '[data-steps-element="list"]';
  var STEPS_SELECTOR = '[data-steps-element="step"]';
  var STEPS_PAGINATION_ITEM_SELECTOR = "button[data-step-target]";
  var STEPS_PREV_SELECTOR = '[data-steps-nav="prev"]';
  var STEPS_NEXT_SELECTOR = '[data-steps-nav="next"]';
  var ARRAY_LIST_SELECTOR = '[data-form-array-element="list"]';
  var ARRAY_TEMPLATE_SELECTOR = '[data-person-element="template"]';
  var ARRAY_ADD_SELECTOR = '[data-person-element="add"]';
  var ARRAY_SAVE_SELECTOR = '[data-person-element="save"]';
  var ARRAY_CANCEL_SELECTOR = '[data-person-element="cancel"]';
  var ARRAY_GROUP_SELECTOR = "[data-person-data-group]";
  var MODAL_SELECTOR = '[data-form-element="modal"]';
  var MODAL_SCROLL_SELECTOR = '[data-modal-element="scroll"]';
  var ACCORDION_SELECTOR = `[data-animate="accordion"]`;
  var siteId = document.documentElement.dataset.wfSite || "";
  var pageId = document.documentElement.dataset.wfPage || "";
  var Accordion = class {
    component;
    trigger;
    uiTrigger;
    isOpen = false;
    constructor(component) {
      this.component = component;
      this.trigger = component.querySelector('[data-animate="trigger"]');
      this.uiTrigger = component.querySelector('[data-animate="ui-trigger"]');
      this.uiTrigger.addEventListener("click", () => {
        this.toggle();
      });
    }
    open() {
      if (!this.isOpen) {
        this.trigger.click();
        this.isOpen = true;
      }
    }
    close() {
      if (this.isOpen) {
        this.trigger.click();
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
      const scrollWrapper = this.component.closest(MODAL_SCROLL_SELECTOR);
      const elementPosition = this.uiTrigger.getBoundingClientRect().top;
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
  var FieldGroup = class {
    fields;
    constructor(fields = /* @__PURE__ */ new Map()) {
      this.fields = fields;
    }
    // Method to retrieve a field by its id
    getField(fieldId) {
      return this.fields.get(fieldId);
    }
  };
  var Person = class {
    personalData;
    doctor;
    health;
    relatives;
    constructor(personalData = new FieldGroup(), doctor = new FieldGroup(), health = new FieldGroup(), relatives = new FieldGroup()) {
      this.personalData = personalData;
      this.doctor = doctor;
      this.health = health;
      this.relatives = relatives;
    }
    validate() {
      let valid = true;
      const groups = Object.keys(this);
      groups.forEach((groupName) => {
        const group = this[groupName];
        if (group.fields) {
          group.fields.forEach((field) => {
            const fieldValid = field.validate(true);
            if (!fieldValid) {
              valid = false;
            }
          });
        }
      });
      return valid;
    }
    getFullName() {
      return `${this.personalData.getField("first-name").value} ${this.personalData.getField("name").value}`.trim() || "Neue Person";
    }
  };
  var Field = class {
    id;
    label;
    value;
    required;
    type;
    checked;
    constructor(input, index) {
      if (input.type === "radio" && !input.checked) {
        return;
      }
      this.id = input.id || parameterize(input.dataset.name || `field ${index}`);
      this.label = input.dataset.name || `field ${index}`;
      this.value = input.value;
      this.required = input.required || false;
      this.type = input.type;
      if (isRadioInput(input) || isCheckboxInput(input)) {
        this.checked = input.checked;
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
  var FormMessage = class {
    messageFor;
    component;
    messageElement;
    constructor(componentName, messageFor) {
      this.messageFor = messageFor;
      const component = document.querySelector(
        `[data-message-component="${componentName}"][data-message-for="${this.messageFor}"]`
      );
      if (!component) {
        console.warn("No FormMessage component was found.");
        return;
      }
      this.component = component;
      this.messageElement = this.component?.querySelector('[data-message-element="message"]') || null;
      this.reset();
    }
    // Method to display an info message
    info(message = null) {
      this.component.setAttribute("aria-live", "polite");
      this.setMessage(message, "info");
    }
    // Method to display an error message
    error(message = null) {
      this.component.setAttribute("role", "alert");
      this.component.setAttribute("aria-live", "assertive");
      this.setMessage(message, "error");
    }
    // Method to reset/hide the message
    reset() {
      this.component.classList.remove("info", "error");
    }
    // Private method to set the message and style
    setMessage(message = null, type) {
      if (this.messageElement && message) {
        this.messageElement.textContent = message;
      } else if (!this.messageElement) {
        console.warn("Message text element not found.");
      }
      this.component.classList.remove("info", "error");
      this.component.classList.add(type);
      this.component.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  };
  var FormGroup = class {
    form;
    container;
    groupNames;
    validationMessage;
    formMessage;
    constructor(container, groupNames, validationMessage) {
      this.container = container;
      this.groupNames = groupNames;
      this.validationMessage = validationMessage;
      const formElement = this.getAllGroupFields()[0].closest("form");
      if (!formElement) {
        console.error(`Cannot construct a FormGroup that is not part of a form.`);
        return;
      }
      this.form = formElement;
      this.formMessage = new FormMessage("FormGroup", this.groupNames.join(","));
      this.initialize();
    }
    initialize() {
      const allFields = this.getAllGroupFields();
      allFields.forEach((field) => {
        field.addEventListener("change", () => this.formMessage.reset());
      });
    }
    getGroupFields(groupName) {
      return this.container.querySelectorAll(
        `[data-form-group="${groupName}"]`
      );
    }
    getAllGroupFields() {
      const selectorList = this.groupNames.map((groupName) => {
        return `[data-form-group="${groupName}"]`;
      });
      let selector = selectorList.join(", ");
      return this.container.querySelectorAll(selector);
    }
    validate() {
      console.log("VALIDATING FORM GROUPS: ", this.groupNames);
      const anyGroupValid = this.checkGroupValidity();
      this.handleValidationMessages(anyGroupValid);
      console.log(anyGroupValid);
      return anyGroupValid;
    }
    checkGroupValidity() {
      return this.groupNames.some((groupName) => {
        const groupFields = Array.from(this.getGroupFields(groupName));
        return groupFields.some((field) => {
          if (isCheckboxInput(field) || isRadioInput(field)) {
            return field.checked;
          }
          return field.value.trim() !== "";
        });
      });
    }
    updateRequiredAttributes(anyGroupValid) {
      const allFields = this.getAllGroupFields();
      allFields.forEach((field) => {
        field.required = !anyGroupValid;
      });
      this.formMessage.reset();
    }
    handleValidationMessages(anyGroupValid) {
      if (!anyGroupValid) {
        this.formMessage.error();
      } else {
        this.formMessage.reset();
      }
    }
  };
  var MultiStepForm = class {
    component;
    formElement;
    formSteps;
    paginationItems;
    buttonNext;
    buttonPrev;
    currentStep = 0;
    customValidators = [];
    peopleArray;
    beilagenGroup;
    successElement;
    errorElement;
    submitButton;
    constructor(component) {
      this.component = component;
      this.formElement = this.component.querySelector(FORM_SELECTOR);
      if (!this.formElement) {
        throw new Error("Form element not found within the specified component.");
      }
      this.formSteps = this.component.querySelectorAll(STEPS_SELECTOR);
      this.paginationItems = this.component.querySelectorAll(STEPS_PAGINATION_ITEM_SELECTOR);
      this.buttonNext = this.component.querySelector(STEPS_NEXT_SELECTOR);
      this.buttonPrev = this.component.querySelector(STEPS_PREV_SELECTOR);
      this.peopleArray = new FormArray(this.component, "personArray");
      this.beilagenGroup = new FormGroup(this.component, ["upload", "post"], "validation message");
      this.successElement = this.component.querySelector(FORM_SUCCESS_SELECTOR);
      this.errorElement = this.component.querySelector(FORM_ERROR_SELECTOR);
      this.submitButton = this.component.querySelector(FORM_SUBMIT_SELECTOR);
      this.initialize();
    }
    addCustomValidator(step, validator) {
      if (!this.customValidators[step]) {
        this.customValidators[step] = [];
      }
      this.customValidators[step].push(validator);
    }
    initialize() {
      if (!this.component.getAttribute("data-steps-element")) {
        console.error(`Form Steps: Component is not a steps component or is missing the attribute ${STEPS_COMPONENT_SELECTOR}.
Component:`, this.component);
        return;
      }
      if (!this.formSteps.length) {
        console.warn(`Form Steps: The selected list doesn't contain any steps. Skipping initialization. Provided List:`, this.component.querySelector(STEPS_LIST_SELECTOR));
        return;
      }
      this.setupSteps();
      this.initPagination();
      this.changeToStep(this.currentStep, true);
      this.addCustomValidator(3, () => this.beilagenGroup.validate());
      this.addCustomValidator(2, () => this.peopleArray.validateArray());
      initFormButtons(this.formElement);
      initCustomInputs(this.component);
      initDecisions(this.component);
      this.component.addEventListener("changeStep", () => this.peopleArray.closeModal());
      this.formElement.setAttribute("novalidate", "");
      this.formElement.dataset.state = "initialized";
      this.formElement.addEventListener("submit", (event) => {
        event.preventDefault();
        this.submitToWebflow();
      });
    }
    async submitToWebflow() {
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
      const fields = {
        ...mapToObject(this.getAllFormData()),
        people: peopleMapToObject(this.peopleArray.people)
      };
      const recaptcha = this.formElement.querySelector("#g-recaptcha-response").value;
      return {
        name: this.formElement.dataset.name,
        pageId,
        elementId: this.formElement.dataset.wfElementId,
        source: window.location.href,
        test: false,
        fields: {
          fields: JSON.stringify(fields),
          "g-recaptcha-response": recaptcha
        },
        dolphin: false
      };
    }
    onFormSuccess() {
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
      this.formElement.dataset.state = "error";
      this.formElement.dispatchEvent(new CustomEvent("formError"));
      if (this.submitButton) {
        this.submitButton.value = this.submitButton.dataset.defaultText || "Submit";
      }
    }
    setupSteps() {
      this.formSteps.forEach((step, index) => {
        step.dataset.stepId = index.toString();
        step.classList.toggle("hide", index !== 0);
        step.querySelectorAll(FORM_INPUT_SELECTOR).forEach((input) => {
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
      this.buttonNext.addEventListener("click", (event) => {
        event.preventDefault();
        this.changeToNext();
      });
      this.buttonPrev.addEventListener("click", (event) => {
        event.preventDefault();
        this.changeToPrevious();
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
    changeToStep(target, init = false) {
      if (this.currentStep === target && !init) {
        console.log("Change Form Step: Target step equals current step.");
        return;
      }
      if (target > this.currentStep && !init) {
        for (let step = this.currentStep; step < target; step++) {
          if (!this.validateCurrentStep(step)) {
            console.warn("Standard validation failed for step:", step + 1);
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
    }
    updateStepVisibility(target) {
      this.formSteps[this.currentStep].classList.add("hide");
      this.formSteps[target].classList.remove("hide");
    }
    updatePagination(target) {
      if (target === 0) {
        this.buttonPrev.style.visibility = "hidden";
        this.buttonPrev.style.opacity = "0";
      } else if (target === this.formSteps.length - 1) {
        this.buttonNext.style.visibility = "hidden";
        this.buttonNext.style.opacity = "0";
      } else {
        this.buttonPrev.style.visibility = "visible";
        this.buttonPrev.style.opacity = "1";
        this.buttonNext.style.visibility = "visible";
        this.buttonNext.style.opacity = "1";
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
      const currentStepElement = this.formSteps[step];
      const inputs = currentStepElement.querySelectorAll(FORM_INPUT_SELECTOR);
      let { valid, invalidField } = validateFields(inputs);
      if (!valid) {
        console.warn(`STANDARD VALIDATION: NOT VALID`);
        return valid;
      }
      const customValid = this.customValidators[step]?.every((validator) => validator()) ?? true;
      if (!customValid) {
        console.warn(`CUSTOM VALIDATION: NOT VALID`);
      }
      return valid && customValid;
    }
    getFormDataForStep(step) {
      let fields = /* @__PURE__ */ new Map();
      const stepElement = this.formSteps[step];
      const stepInputs = stepElement.querySelectorAll(FORM_INPUT_SELECTOR);
      stepInputs.forEach((input, inputIndex) => {
        const entry = new Field(input, inputIndex);
        if (entry.id) {
          fields.set(entry.id, entry);
        }
      });
      return fields;
    }
    getAllFormData() {
      let fields = /* @__PURE__ */ new Map();
      this.formSteps.forEach((step, stepIndex) => {
        const stepData = this.getFormDataForStep(stepIndex);
        fields = new Map([...fields, ...stepData]);
      });
      return fields;
    }
  };
  var FormArray = class {
    id;
    people;
    container;
    list;
    template;
    formMessage;
    addButton;
    modal;
    modalForm;
    saveButton;
    cancelButtons;
    modalInputs;
    groupElements;
    accordionList = [];
    editingKey = null;
    constructor(container, id) {
      this.id = id;
      this.container = container;
      this.people = /* @__PURE__ */ new Map();
      this.list = this.container.querySelector(ARRAY_LIST_SELECTOR);
      this.template = this.list.querySelector(ARRAY_TEMPLATE_SELECTOR);
      this.addButton = this.container.querySelector(ARRAY_ADD_SELECTOR);
      this.formMessage = new FormMessage("FormArray", this.id.toString());
      this.modal = document.querySelector(MODAL_SELECTOR);
      this.modalForm = document.querySelector(FORM_SELECTOR);
      this.saveButton = this.modal.querySelector(ARRAY_SAVE_SELECTOR);
      this.cancelButtons = this.modal.querySelectorAll(ARRAY_CANCEL_SELECTOR);
      this.modalInputs = this.modal.querySelectorAll(FORM_INPUT_SELECTOR);
      this.groupElements = this.modal.querySelectorAll(ARRAY_GROUP_SELECTOR);
      this.initialize();
    }
    initialize() {
      this.cancelButtons.forEach((button) => {
        button.addEventListener("click", this.closeModal.bind(this));
      });
      this.modalInputs.forEach((input) => {
        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            this.savePersonFromModal();
          }
        });
      });
      this.addButton.addEventListener("click", () => this.handleAddButtonClick());
      this.saveButton.addEventListener("click", () => this.savePersonFromModal());
      this.renderList();
      this.closeModal();
      const accordionList = this.container.querySelectorAll(ACCORDION_SELECTOR);
      for (let i = 0; i < accordionList.length; i++) {
        const accordionElement = accordionList[i];
        accordionElement.dataset.index = i.toString();
        const accordion = new Accordion(accordionElement);
        this.accordionList.push(accordion);
        accordion.uiTrigger.addEventListener("click", () => {
          this.openAccordion(i);
          setTimeout(() => {
            accordion.scrollIntoView();
          }, 500);
        });
      }
      this.openAccordion(0);
    }
    openAccordion(index) {
      for (let i = 0; i < this.accordionList.length; i++) {
        const accordion = this.accordionList[i];
        if (i === index && !accordion.isOpen) {
          accordion.open();
        } else if (i !== index && accordion.isOpen) {
          accordion.close();
        }
      }
    }
    handleAddButtonClick() {
      this.clearModal();
      this.setLiveText("state", "Hinzuf\xFCgen");
      this.setLiveText("full-name", "Neue Person");
      this.openModal();
      this.editingKey = null;
    }
    savePersonFromModal(validate = true) {
      const listValid = this.validateModal(validate);
      if (!listValid) {
        console.warn(`Couldn't save person. Please fill in all the values correctly.`);
        if (validate)
          return null;
      }
      const person = this.extractData();
      if (this.savePerson(person)) {
        this.renderList();
        this.closeModal();
      }
    }
    savePerson(person) {
      if (this.editingKey !== null) {
        this.people.set(this.editingKey, person);
      } else {
        const uniqueSuffix = crypto.randomUUID();
        const newKey = `person${this.people.size + 1}`;
        this.people.set(newKey, person);
      }
      return true;
    }
    setLiveText(element, string) {
      const liveElements = this.modal.querySelectorAll(`[data-live-text="${element}"]`);
      let valid = true;
      for (const element2 of liveElements) {
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
        this.formMessage.info("Bitte f\xFCgen Sie die Mieter (max. 2 Personen) hinzu.");
      }
    }
    renderPerson(person, key) {
      const newElement = this.template.cloneNode(true);
      const props = ["full-name", "phone", "email", "street", "zip", "city"];
      newElement.style.removeProperty("display");
      const editButton = newElement.querySelector('[data-person-action="edit"]');
      const deleteButton = newElement.querySelector('[data-person-action="delete"]');
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
        const groupInputs = group.querySelectorAll(FORM_INPUT_SELECTOR);
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
    validateArray() {
      let valid = true;
      if (this.people.size === 0) {
        console.warn("Bitte f\xFCgen Sie mindestens eine mietende Person hinzu.");
        this.formMessage.error(`Bitte f\xFCgen Sie mindestens eine mietende Person hinzu.`);
        setTimeout(() => this.formMessage.info("Bitte f\xFCgen Sie die Mieter (max. 2 Personen) hinzu."), 5e3);
        valid = false;
      } else {
        this.people.forEach((person, key) => {
          if (!person.validate()) {
            console.warn(`Bitte f\xFCllen Sie alle Felder f\xFCr "${person.getFullName()}" aus.`);
            this.formMessage.error(`Bitte f\xFCllen Sie alle Felder f\xFCr "${person.getFullName()}" aus.`);
            valid = false;
          }
        });
      }
      return valid;
    }
    openModal() {
      const personalDataGroup = this.modal.querySelector('[data-person-data-group="personalData"]');
      const nameInputs = personalDataGroup.querySelectorAll("#first-name, #name");
      nameInputs.forEach((input) => {
        input.addEventListener("input", () => {
          const editingPerson = this.extractData();
          this.setLiveText("full-name", editingPerson.getFullName() || "Neue Person");
        });
      });
      this.formMessage.info();
      this.openAccordion(0);
      this.modal.style.removeProperty("display");
      this.modal.classList.remove("is-closed");
      this.modal.dataset.state = "open";
      document.body.style.overflow = "hidden";
    }
    closeModal() {
      document.body.style.removeProperty("overflow");
      this.modal.classList.add("is-closed");
      this.modal.dataset.state = "closed";
      this.list.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
      setTimeout(() => {
        this.modal.style.display = "none";
      }, 500);
      this.clearModal();
    }
    clearModal() {
      this.setLiveText("state", "hinzuf\xFCgen");
      this.setLiveText("full-name", "Neue Person");
      this.modalInputs.forEach((input) => {
        if (isRadioInput(input)) {
          input.checked = false;
          clearRadioGroup(this.modal, input.name);
        } else if (isCheckboxInput(input)) {
          input.checked = false;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        } else {
          input.value = "";
        }
      });
    }
    validateModal(report = true) {
      const allModalFields = this.modal.querySelectorAll(FORM_INPUT_SELECTOR);
      const { valid, invalidField } = validateFields(allModalFields, report);
      if (valid === true) {
        return true;
      } else if (invalidField) {
        const accordionIndex = this.accordionIndexOf(invalidField);
        if (accordionIndex !== -1) {
          this.openAccordion(accordionIndex);
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
    /**
     * Finds the index of the accordion that contains a specific field element.
     * This method traverses the DOM to locate the accordion that wraps the field
     * and returns its index in the `accordionList`.
     * 
     * @param field - The form element (field) to search for within the accordions.
     * @returns The index of the accordion containing the field, or `-1` if no accordion contains the field.
     */
    accordionIndexOf(field) {
      let parentElement = field.closest('[data-animate="accordion"]');
      if (parentElement) {
        const accordionIndex = this.accordionList.findIndex((accordion) => accordion.component === parentElement);
        return accordionIndex !== -1 ? accordionIndex : -1;
      }
      return -1;
    }
    extractData() {
      const personData = new Person();
      this.groupElements.forEach((group) => {
        const groupInputs = group.querySelectorAll(FORM_INPUT_SELECTOR);
        const groupName = group.dataset.personDataGroup;
        if (!personData[groupName]) {
          console.error(`The group "${groupName}" doesn't exist.`);
          return;
        }
        groupInputs.forEach((input, index) => {
          const field = new Field(input, index);
          if (field.id) {
            personData[groupName].fields.set(field.id, field);
          }
        });
      });
      console.log(personData);
      return personData;
    }
  };
  function parameterize(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-");
  }
  function mapToObject(map) {
    const obj = {};
    for (const [key, value] of map) {
      obj[key] = value instanceof Map ? mapToObject(value) : value;
    }
    return obj;
  }
  function peopleMapToObject(people) {
    const peopleObj = {};
    for (const [key, person] of people) {
      peopleObj[key] = {
        personalData: {
          fields: mapToObject(person.personalData.fields)
        },
        doctor: {
          fields: mapToObject(person.doctor.fields)
        },
        health: {
          fields: mapToObject(person.health.fields)
        },
        relatives: {
          fields: mapToObject(person.relatives.fields)
        }
      };
    }
    return peopleObj;
  }
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
  function initFormButtons(form2) {
    const buttons = form2.querySelectorAll("button");
    buttons.forEach((button) => {
      button.setAttribute("type", "button");
      button.addEventListener("click", (event) => {
      });
    });
  }
  function clearRadioGroup(container, name) {
    container.querySelectorAll(`${RADIO_INPUT_SELECTOR}[name="${name}"]`).forEach((radio) => {
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
        container.querySelectorAll(`input[type="radio"][name="${name}"]`).forEach((radio) => {
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
      container.querySelectorAll(`input[type="${type}"]:not(${customClass})`).forEach((input) => {
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
  function initDecisions(component) {
    const decisionGroups = component.querySelectorAll("[data-decision-group]");
    decisionGroups.forEach((group) => {
      const radios = group.querySelectorAll("input[data-decision]");
      const targetGroup = group.dataset.decisionGroup;
      const extraFieldsWrapper = document.querySelector(`[data-decision-extra-fields="${targetGroup}"]`);
      if (radios.length === 0) {
        console.error(`Decision group "${targetGroup}" does not contain any decision input elements.`);
        return;
      }
      if (!extraFieldsWrapper) {
        console.error(`Extra fields container for decision group "${targetGroup}" not found.`);
        return;
      }
      extraFieldsWrapper.style.display = "none";
      group.addEventListener("change", (event) => {
        const target = event.target;
        if (target.matches("input[data-decision]") && target.dataset.decision === "show") {
          extraFieldsWrapper.style.display = "block";
        } else {
          extraFieldsWrapper.style.display = "none";
        }
      });
    });
  }
  function validateFields(inputs, report = true) {
    let valid = true;
    let invalidField = null;
    for (const input of inputs) {
      if (!input.checkValidity()) {
        valid = false;
        if (report && !invalidField) {
          input.reportValidity();
          input.classList.add("has-error");
          input.addEventListener("change", () => {
            input.classList.remove("has-error");
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
  window.PEAKPOINT = {};
  var form = document.querySelector(FORM_COMPONENT_SELECTOR);
  form?.classList.remove("w-form");
  document.addEventListener("DOMContentLoaded", () => {
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const selectElement = document.querySelector("#wohnung");
      const wohnungValue = params.get("wohnung");
      const option = selectElement.querySelector(`option[value="${wohnungValue}"]`);
      if (wohnungValue && option) {
        selectElement.value = wohnungValue;
      } else {
        console.warn(`No matching option for value: ${wohnungValue}`);
      }
    }
    const inizialized = new MultiStepForm(form);
    console.log("Form initialized:", inizialized);
  });
})();

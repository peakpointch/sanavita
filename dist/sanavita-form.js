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
  var siteId = document.documentElement.dataset.wfSite || "";
  var pageId = document.documentElement.dataset.wfPage || "";
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
    getFullName() {
      return `${this.personalData.getField("first-name").value} ${this.personalData.getField("name").value}`.trim();
    }
  };
  var Field = class {
    id;
    label;
    value;
    required;
    constructor(input, index) {
      if (input.type === "radio" && !input.checked) {
        return;
      }
      this.id = input.id || parameterize(input.dataset.name || `field ${index}`);
      this.label = input.dataset.name || `field ${index}`;
      this.value = input.value;
      this.required = input.required || false;
    }
  };
  var FormSteps = class {
    component;
    formSteps;
    paginationItems;
    buttonNext;
    buttonPrev;
    currentStep = 0;
    constructor(component) {
      this.component = component;
      this.formSteps = this.component.querySelectorAll(STEPS_SELECTOR);
      this.paginationItems = this.component.querySelectorAll(STEPS_PAGINATION_ITEM_SELECTOR);
      this.buttonNext = this.component.querySelector(STEPS_NEXT_SELECTOR);
      this.buttonPrev = this.component.querySelector(STEPS_PREV_SELECTOR);
      this.initialize();
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
    }
    setupSteps() {
      this.formSteps.forEach((step, index) => {
        step.dataset.stepId = index.toString();
        step.classList.toggle("hide", index !== 0);
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
        if (this.currentStep < this.formSteps.length - 1) {
          this.changeToStep(this.currentStep + 1);
        }
      });
      this.buttonPrev.addEventListener("click", (event) => {
        event.preventDefault();
        if (this.currentStep > 0) {
          this.changeToStep(this.currentStep - 1);
        }
      });
    }
    changeToStep(target, init = false) {
      if (this.currentStep === target && !init) {
        console.log("Change Form Step: Target step equals current step.");
        return;
      }
      if (target > this.currentStep && !init) {
        for (let step = this.currentStep; step < target; step++) {
          if (!this.validateCurrentStep(step)) {
            console.warn("Validation failed for step:", step + 1);
            this.changeToStep(step);
            return;
          }
        }
      }
      this.updateStepVisibility(target);
      this.updatePagination(target);
      this.currentStep = target;
    }
    updateStepVisibility(target) {
      this.formSteps[this.currentStep].classList.add("hide");
      this.formSteps[target].classList.remove("hide");
    }
    updatePagination(target) {
      this.buttonPrev.style.opacity = target === 0 ? "0" : "1";
      this.buttonNext.style.opacity = target === this.formSteps.length - 1 ? "0" : "1";
      this.paginationItems.forEach((step, index) => {
        step.classList.toggle("is-done", index < target);
        step.classList.toggle("is-active", index === target);
      });
    }
    validateCurrentStep(step) {
      const currentStepElement = this.formSteps[step];
      const inputs = currentStepElement.querySelectorAll(FORM_INPUT_SELECTOR);
      let fieldsValid = validateFields(inputs);
      const formArrayListElement = currentStepElement.querySelector('[data-form-array-element="list"]');
      if (!formArrayListElement)
        return fieldsValid;
      const listLength = parseInt(formArrayListElement.dataset.length);
      const listValid = listLength > 0;
      if (!listValid) {
        console.warn(`Couldn't validate current step. Please add at least one person.`);
        const errorElement = formArrayListElement.parentElement.querySelector('[data-person-element="empty"]');
        errorElement.setAttribute("aria-live", "assertive");
        errorElement.setAttribute("role", "alert");
        errorElement.setAttribute("tabindex", "-1");
        errorElement.classList.add("has-error");
        reinsertElement(errorElement);
      }
      return fieldsValid && listValid;
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
  function personMapToObject(people2) {
    const peopleObj = {};
    for (const [key, person] of people2) {
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
  function reinsertElement(element) {
    if (!element || !element.firstElementChild) {
      console.warn("Element or its first element child is not defined.");
      return;
    }
    const childElement = element.firstElementChild;
    element.removeChild(childElement);
    setTimeout(() => {
      element.appendChild(childElement);
      element.focus();
    }, 0);
  }
  function isRadioInput(input) {
    return input instanceof HTMLInputElement && input.type === "radio";
  }
  function isCheckboxInput(input) {
    return input instanceof HTMLInputElement && input.type === "checkbox";
  }
  function initForm(component) {
    if (!component) {
      console.error("Form component not found:", FORM_COMPONENT_SELECTOR);
      return false;
    }
    const form2 = component.querySelector(FORM_SELECTOR);
    if (!form2) {
      console.error(`The selected form component does not contain a HTMLFormElement. Perhaps you added ${FORM_COMPONENT_SELECTOR} to the form element itself rather than its parent element?

Form Component:`, component);
      return false;
    }
    initFormButtons(form2);
    initFormArray(component);
    initCustomInputs(component);
    initDecisions(component);
    const formSteps = new FormSteps(component);
    form2.setAttribute("novalidate", "");
    form2.dataset.state = "initialized";
    component.addEventListener("submit", (event) => {
      event.preventDefault();
      form2.dataset.state = "sending";
      handleSubmit(component, form2);
    });
    return true;
  }
  async function handleSubmit(component, form2) {
    function formSuccess() {
      successElement ? successElement.style.display = "block" : null;
      form2.style.display = "none";
      form2.dataset.state = "success";
      form2.dispatchEvent(new CustomEvent("formSuccess"));
    }
    function formError() {
      errorElement ? errorElement.style.display = "block" : null;
      form2.dataset.state = "error";
      form2.dispatchEvent(new CustomEvent("formError"));
    }
    let fields = [
      {
        id: "custom-submit",
        label: "Custom Submit",
        value: true,
        required: false
      }
    ];
    const allInputs = form2.querySelectorAll(FORM_INPUT_SELECTOR);
    const successElement = component.querySelector(FORM_SUCCESS_SELECTOR);
    const errorElement = component.querySelector(FORM_ERROR_SELECTOR);
    const submitButton = component.querySelector(FORM_SUBMIT_SELECTOR);
    if (!(submitButton instanceof HTMLInputElement) || submitButton.type !== "submit") {
      throw new Error('The submitButton element is not an HTML input element with type="submit".');
    }
    submitButton.dataset.defaultText = submitButton.value;
    submitButton.value = submitButton.dataset.wait || "Wird gesendet ...";
    allInputs.forEach((input, index) => {
      const entry = new Field(input, index);
      fields.push();
    });
    fields["people"] = personMapToObject(people);
    console.log("FORM FIELDS:", fields);
    window.PEAKPOINT.fields = fields;
    const recaptcha = form2.querySelector("#g-recaptcha-response").value;
    const formData = {
      name: form2.dataset.name,
      pageId,
      elementId: form2.dataset.wfElementId,
      source: window.location.href,
      test: false,
      fields: {
        fields: JSON.stringify({ fields }),
        "g-recaptcha-response": recaptcha
      },
      dolphin: false
    };
    submitButton.value = submitButton.dataset.defaultText;
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
  function validateFields(inputs) {
    let valid = true;
    for (const input of inputs) {
      if (!input.checkValidity()) {
        valid = false;
        input.reportValidity();
        input.classList.add("has-error");
        input.addEventListener("change", () => {
          input.classList.remove("has-error");
        });
        break;
      } else {
        input.classList.remove("has-error");
      }
    }
    return valid;
  }
  function initFormArray(component) {
    const ARRAY_LIST_SELECTOR = '[data-form-array-element="list"]';
    const ARRAY_TEMPLATE_SELECTOR = '[data-person-element="template"]';
    const ARRAY_EMPTY_STATE_SELECTOR = '[data-person-element="empty"]';
    const ARRAY_ADD_SELECTOR = '[data-person-element="add"]';
    const ARRAY_SAVE_SELECTOR = '[data-person-element="save"]';
    const ARRAY_CANCEL_SELECTOR = '[data-person-element="cancel"]';
    const ARRAY_MODAL_SELECTOR = '[data-form-element="modal"]';
    const ARRAY_GROUP_SELECTOR = "[data-person-data-group]";
    let editingKey = null;
    const list = component.querySelector(ARRAY_LIST_SELECTOR);
    const template = list.querySelector(ARRAY_TEMPLATE_SELECTOR);
    const emptyState = component.querySelector(ARRAY_EMPTY_STATE_SELECTOR);
    const addButton = component.querySelector(ARRAY_ADD_SELECTOR);
    const modal = document.querySelector(ARRAY_MODAL_SELECTOR);
    const modalForm = document.querySelector(FORM_SELECTOR);
    const saveButton = modal.querySelector(ARRAY_SAVE_SELECTOR);
    const cancelButtons = modal.querySelectorAll(ARRAY_CANCEL_SELECTOR);
    const modalInputs = modal.querySelectorAll(FORM_INPUT_SELECTOR);
    const groupElements = modal.querySelectorAll(ARRAY_GROUP_SELECTOR);
    cancelButtons.forEach((button, index) => {
      button.addEventListener("click", closeModal);
    });
    addButton.addEventListener("click", () => {
      clearModal();
      setLiveText("state", "Hinzuf\xFCgen");
      setLiveText("full-name", "Neue Person");
      openModal();
      editingKey = null;
    });
    saveButton.addEventListener("click", savePerson);
    function savePerson() {
      if (!validateModal()) {
        console.warn(`Couldn't save person. Please fill in all the values correctly.`);
        return null;
      }
      const person = extractData();
      if (editingKey !== null) {
        people.set(editingKey, person);
      } else {
        const newKey = `person${people.size + 1}`;
        people.set(newKey, person);
      }
      renderList();
      closeModal();
      return person;
    }
    function setLiveText(element, string) {
      const liveElements = modal.querySelectorAll(`[data-live-text="${element}"]`);
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
    function renderList() {
      list.innerHTML = "";
      list.dataset.length = people.size.toString();
      console.log(people.size.toString());
      if (people.size) {
        people.forEach((person, key) => renderPerson(person, key));
        emptyState.classList.add("hide");
      } else {
        emptyState.classList.remove("hide");
      }
    }
    function renderPerson(person, key) {
      const newElement = template.cloneNode(true);
      const props = ["first-name", "name", "phone", "email", "street", "zip", "city"];
      newElement.style.removeProperty("display");
      const editButton = newElement.querySelector('[data-person-action="edit"]');
      const deleteButton = newElement.querySelector('[data-person-action="delete"]');
      editButton.addEventListener("click", () => {
        setLiveText("state", "bearbeiten");
        setLiveText("full-name", person.getFullName() || "Neue Person");
        populateModal(person);
        openModal();
        editingKey = key;
      });
      deleteButton.addEventListener("click", () => {
        people.delete(key);
        renderList();
        closeModal();
      });
      props.forEach((prop) => {
        const propSelector = `[data-${prop}]`;
        const el = newElement.querySelector(propSelector);
        if (el) {
          const currentField = person.personalData.getField(prop);
          if (!currentField) {
            console.error(`Render person: A field for "${prop}" doesn't exist.`);
            return;
          }
          el.innerText = currentField.value || currentField.label;
        }
      });
      list.appendChild(newElement);
    }
    function populateModal(person) {
      groupElements.forEach((group) => {
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
            input.checked = true;
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
          if (isCheckboxInput(input) && input.value === field.value) {
            input.checked = true;
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
      });
    }
    function openModal() {
      const personalDataGroup = modal.querySelector('[data-person-data-group="personalData"]');
      const nameInputs = personalDataGroup.querySelectorAll("#first-name, #name");
      nameInputs.forEach((input) => {
        input.addEventListener("input", () => {
          const editingPerson = extractData();
          setLiveText("full-name", editingPerson.getFullName() || "Neue Person");
        });
      });
      emptyState.classList.remove("has-error");
      modal.classList.remove("is-closed");
      modal.dataset.state = "open";
    }
    function closeModal() {
      modal.classList.add("is-closed");
      modal.dataset.state = "closed";
      clearModal();
    }
    function clearModal() {
      setLiveText("state", "hinzuf\xFCgen");
      setLiveText("full-name", "Neue Person");
      modalInputs.forEach((input) => {
        if (isRadioInput(input)) {
          input.checked = false;
          clearRadioGroup(modal, input.name);
        } else if (isCheckboxInput(input)) {
          input.checked = false;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        } else {
          input.value = "";
        }
      });
    }
    function validateModal() {
      const allModalFields = modal.querySelectorAll(FORM_INPUT_SELECTOR);
      const valid = validateFields(allModalFields);
      return valid;
    }
    function extractData() {
      const personData = new Person();
      groupElements.forEach((group) => {
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
    closeModal();
  }
  window.PEAKPOINT = {};
  var people = /* @__PURE__ */ new Map();
  window.PEAKPOINT.people = people;
  var form = document.querySelector(FORM_COMPONENT_SELECTOR);
  form?.classList.remove("w-form");
  document.addEventListener("DOMContentLoaded", () => {
    const inizialized = initForm(form);
    console.log("Form initialized:", inizialized);
  });
})();

(() => {
  // assets/ts/sanavita-form.ts
  var FORM_COMPONENT_SELECTOR = '[data-form-element="component"]';
  var FORM_SELECTOR = "form";
  var FORM_SUCCESS_SELECTOR = '[data-form-element="success"]';
  var FORM_ERROR_SELECTOR = '[data-form-element="error"]';
  var FORM_SUBMIT_SELECTOR = '[data-form-element="submit"]';
  var FORM_INPUT_SELECTOR = '.w-input, .w-select, .w-radio input[type="radio"]';
  var STEPS_COMPONENT_SELECTOR = '[data-steps-element="component"]';
  var STEPS_LIST_SELECTOR = '[data-steps-element="list"]';
  var STEPS_SELECTOR = '[data-steps-element="step"]';
  var STEPS_PAGINATION_SELECTOR = '[data-steps-element="pagination"]';
  var STEPS_PAGINATION_ITEM_SELECTOR = "button[data-step-target]";
  var STEPS_PREV_SELECTOR = '[data-steps-nav="prev"]';
  var STEPS_NEXT_SELECTOR = '[data-steps-nav="next"]';
  var siteId = document.documentElement.dataset.wfSite || "";
  var pageId = document.documentElement.dataset.wfPage || "";
  var FieldGroup = class {
    fields;
    constructor(fields = []) {
      this.fields = fields;
    }
    // Method to retrieve a field by its id
    getField(fieldId) {
      return this.fields.find((field) => field.id === fieldId);
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
  function parameterize(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-");
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
    initFormSteps(component);
    initFormArray(component);
    initCustomInputs(component);
    initDecisions(component);
    form2.dataset.state = "initialized";
    component.addEventListener("submit", (event) => {
      event.preventDefault();
      form2.dataset.state = "sending";
      handleSubmit(component, form2);
    });
    component.querySelectorAll("h5").forEach((element) => {
      element.addEventListener("click", () => {
        handleSubmit(component, form2);
      });
    });
    return true;
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
    console.log("FORM FIELDS:", fields);
    window.PEAKPOINT.fields = fields;
    fields.push(people);
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
    const success = await sendFormData(formData);
    if (success) {
      formSuccess();
      submitButton.value = submitButton.dataset.defaultText;
    } else {
      formError();
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
  function initCustomInputs(container) {
    const checkboxClass = ".w-checkbox-input";
    const radioClass = ".w-radio-input";
    const checkedClass = "w--redirected-checked";
    const focusClass = "w--redirected-focus";
    const focusVisibleClass = "w--redirected-focus-visible";
    const focusVisibleSelector = ":focus-visible, [data-wf-focus-visible]";
    const inputTypes = [
      ["checkbox", checkboxClass],
      ["radio", radioClass]
    ];
    container.querySelectorAll('input[type="checkbox"]:not(.w-checkbox-input)').forEach((input) => {
      input.addEventListener("change", (event) => {
        const target = event.target;
        const customCheckbox = target.closest(".w-checkbox")?.querySelector(checkboxClass);
        if (customCheckbox) {
          customCheckbox.classList.toggle(checkedClass, target.checked);
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
          const customRadio = radio.closest(".w-radio")?.querySelector(radioClass);
          if (customRadio) {
            customRadio.classList.remove(checkedClass);
          }
        });
        const selectedCustomRadio = target.closest(".w-radio")?.querySelector(radioClass);
        if (selectedCustomRadio) {
          selectedCustomRadio.classList.add(checkedClass);
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
  function initFormSteps(component) {
    const hasSteps = component.getAttribute("data-steps-element") || "";
    if (!hasSteps) {
      console.error(`Form Steps: Component is not a steps component or is missing the attribute ${STEPS_COMPONENT_SELECTOR}.
Component:`, component);
      return;
    }
    const list = component.querySelector(STEPS_LIST_SELECTOR);
    if (!list) {
      console.error(`Form Steps: Component does not contain a step list "${STEPS_LIST_SELECTOR}"`);
      return;
    }
    const formSteps = component.querySelectorAll(STEPS_SELECTOR);
    if (!formSteps.length) {
      console.warn(`Form Steps: The selected list doesn't contain any steps. Skipping initialization. Provided List:`, list);
      return;
    }
    const pagination = component.querySelector(STEPS_PAGINATION_SELECTOR);
    const paginationItems = pagination.querySelectorAll(STEPS_PAGINATION_ITEM_SELECTOR);
    const buttonNext = component.querySelector(STEPS_NEXT_SELECTOR);
    const buttonPrev = component.querySelector(STEPS_PREV_SELECTOR);
    let currentStep = 0;
    formSteps.forEach((step, index) => {
      if (index === 0) {
        step.classList.remove("hide");
      } else {
        step.classList.add("hide");
      }
      step.dataset.stepId = index.toString();
    });
    function initPagination() {
      paginationItems.forEach((item, index) => {
        item.dataset.stepTarget = index.toString();
        item.addEventListener("click", (event) => {
          event.preventDefault();
          changeToStep(index);
        });
      });
    }
    initPagination();
    function changeToStep(target, init = false) {
      if (currentStep === target && !init) {
        console.log("Change Form Step: Target step equals current step.");
        return;
      }
      if (target === 0) {
        buttonPrev.style.opacity = "0";
        buttonNext.style.opacity = "1";
      } else if (target === formSteps.length - 1) {
        buttonPrev.style.opacity = "1";
        buttonNext.style.opacity = "0";
      } else {
        buttonPrev.style.opacity = "1";
        buttonNext.style.opacity = "1";
      }
      formSteps[currentStep].classList.add("hide");
      formSteps[target].classList.remove("hide");
      paginationItems.forEach((step, index) => {
        if (index < target) {
          step.classList.add("is-done");
          step.classList.remove("is-active");
        } else if (index === target) {
          step.classList.remove("is-done");
          step.classList.add("is-active");
        } else {
          step.classList.remove("is-done");
          step.classList.remove("is-active");
        }
      });
      currentStep = target;
    }
    changeToStep(currentStep, true);
    buttonNext.addEventListener("click", (event) => {
      event.preventDefault();
      if (currentStep < formSteps.length - 1) {
        changeToStep(currentStep + 1);
      }
    });
    buttonPrev.addEventListener("click", (event) => {
      event.preventDefault();
      if (currentStep > 0) {
        changeToStep(currentStep - 1);
      }
    });
  }
  function initFormArray(component) {
    const ARRAY_LIST_SELECTOR = '[data-form-array-element="list"]';
    const ARRAY_TEMPLATE_SELECTOR = '[data-person-element="template"]';
    const ARRAY_EMPTY_STATE_SELECTOR = '[data-person-element="empty"]';
    const ARRAY_ADD_SELECTOR = '[data-person-element="add"]';
    const ARRAY_SAVE_SELECTOR = '[data-person-element="save"]';
    const ARRAY_MODAL_SELECTOR = '[data-form-element="modal"]';
    const ARRAY_GROUP_SELECTOR = "[data-person-data-group]";
    let editingIndex = null;
    const list = component.querySelector(ARRAY_LIST_SELECTOR);
    const template = list.querySelector(ARRAY_TEMPLATE_SELECTOR);
    const emptyState = component.querySelector(ARRAY_EMPTY_STATE_SELECTOR);
    const addButton = component.querySelector(ARRAY_ADD_SELECTOR);
    const modal = document.querySelector(ARRAY_MODAL_SELECTOR);
    const modalForm = document.querySelector(FORM_SELECTOR);
    const saveButton = modal.querySelector(ARRAY_SAVE_SELECTOR);
    const modalInputs = modal.querySelectorAll(FORM_INPUT_SELECTOR);
    const groupElements = modal.querySelectorAll(ARRAY_GROUP_SELECTOR);
    addButton.addEventListener("click", () => {
      clearModal();
      openModal();
      editingIndex = null;
    });
    saveButton.addEventListener("click", () => {
      const person = extractData();
      if (editingIndex !== null) {
        people[editingIndex] = person;
      } else {
        people.push(person);
      }
      renderList();
      closeModal();
      console.log(`Saved person successfully!`, people);
    });
    function renderList() {
      list.innerHTML = "";
      if (people.length) {
        people.forEach((person, index) => renderPerson(person, index));
        emptyState.classList.add("hide");
      } else {
        emptyState.classList.remove("hide");
      }
    }
    function renderPerson(person, index) {
      const newElement = template.cloneNode(true);
      const props = ["first-name", "name", "phone", "email", "street", "zip", "city"];
      newElement.style.removeProperty("display");
      const editButton = newElement.querySelector('[data-person-action="edit"]');
      const deleteButton = newElement.querySelector('[data-person-action="delete"]');
      editButton.addEventListener("click", () => {
        openModal();
        populateModal(person);
        editingIndex = index;
      });
      deleteButton.addEventListener("click", () => {
        people.splice(index, 1);
        renderList();
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
          if (field) {
            input.value = field.value.trim();
          }
        });
      });
    }
    function openModal() {
      clearModal();
      modal.classList.remove("is-closed");
      modal.dataset.state = "open";
    }
    function closeModal() {
      modal.classList.add("is-closed");
      modal.dataset.state = "closed";
      clearModal();
    }
    function clearModal() {
      modalInputs.forEach((input) => {
        if (input.type !== "checkbox" && input.type !== "radio")
          input.value = "";
      });
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
            personData[groupName].fields.push(field);
          }
        });
      });
      return personData;
    }
    closeModal();
  }
  window.PEAKPOINT = {};
  var people = [];
  window.PEAKPOINT.people = people;
  var form = document.querySelector(FORM_COMPONENT_SELECTOR);
  form?.classList.remove("w-form");
  document.addEventListener("DOMContentLoaded", () => {
    const inizialized = initForm(form);
    console.log("Form initialized:", inizialized);
  });
})();

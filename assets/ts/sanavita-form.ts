const FORM_COMPONENT_SELECTOR: string = '[data-form-element="component"]';
const FORM_SELECTOR: string = 'form';
const FORM_SUCCESS_SELECTOR: string = '[data-form-element="success"]';
const FORM_ERROR_SELECTOR: string = '[data-form-element="error"]';
const FORM_SUBMIT_SELECTOR: string = '[data-form-element="submit"]';
const FORM_INPUT_SELECTOR: string = '.w-input, .w-select, .w-radio input[type="radio"]';

const STEPS_COMPONENT_SELECTOR: string = '[data-steps-element="component"]';
const STEPS_LIST_SELECTOR: string = '[data-steps-element="list"]';
const STEPS_SELECTOR: string = '[data-steps-element="step"]';
const STEPS_PAGINATION_SELECTOR: string = '[data-steps-element="pagination"]';
const STEPS_PAGINATION_ITEM_SELECTOR: string = 'button[data-step-target]';
const STEPS_PREV_SELECTOR: string = '[data-steps-nav="prev"]';
const STEPS_NEXT_SELECTOR: string = '[data-steps-nav="next"]';
const STEPS_TARGET_SELECTOR: string = '[data-step-target]';

// Unique key to store form data in localStorage
const STORAGE_KEY = 'person_data';

const siteId: string = document.documentElement.dataset.wfSite || '';
const pageId: string = document.documentElement.dataset.wfPage || '';

type FormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

interface Window {
  PEAKPOINT: any;
}

class FieldGroup {
  fields: Field[];

  constructor(
    fields: Field[] = [],
  ) {
    this.fields = fields
  }

  // Method to retrieve a field by its id
  getField(fieldId: string): Field | undefined {
    return this.fields.find(field => field.id === fieldId);
  }
}

class Person {
  personalData: FieldGroup;
  doctor: FieldGroup;
  health: FieldGroup;
  relatives: FieldGroup;

  constructor(
    personalData = new FieldGroup(),
    doctor = new FieldGroup(),
    health = new FieldGroup(),
    relatives = new FieldGroup()
  ) {
    this.personalData = personalData;
    this.doctor = doctor;
    this.health = health;
    this.relatives = relatives;
  }
}

class Field {
  id: string;
  label: string;
  value: any;
  required: boolean;

  constructor(input, index) {
    if (input.type === 'radio' && !(input as HTMLInputElement).checked) {
      return;
    }

    this.id = input.id || parameterize(input.dataset.name || `field ${index}`);
    this.label = input.dataset.name || `field ${index}`;
    this.value = input.value;
    this.required = input.required || false;
  }
}

function parameterize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")                       // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '')        // Remove diacritics (accent marks)
    .replace(/[^a-z0-9]+/g, '-')            // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, '')                // Trim hyphens from start and end
    .replace(/-+/g, '-');                   // Collapse multiple hyphens
}

function toDashCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

function toDataset(str) {
  return `${str.charAt(0).toUpperCase() + str.slice(1)}`;
}

function initForm(component: HTMLElement | null) {
  if (!component) {
    console.error('Form component not found:', FORM_COMPONENT_SELECTOR)
    return false;
  }

  const form = component.querySelector(FORM_SELECTOR) as HTMLFormElement | null; // Has to be a HTMLFormElement because its selector is the form tagname
  if (!form) {
    console.error(`The selected form component does not contain a HTMLFormElement. Perhaps you added ${FORM_COMPONENT_SELECTOR} to the form element itself rather than its parent element?\n\nForm Component:`, component);
    return false;
  }

  initFormButtons(form);
  initFormSteps(component);
  initFormArray(component);
  initCustomInputs(component);
  initDecisions(component);

  form.dataset.state = 'initialized';
  component.addEventListener('submit', (event) => {
    event.preventDefault();
    form.dataset.state = 'sending';
    handleSubmit(component, form);
  });

  component.querySelectorAll('h5')
    .forEach((element) => {
      element.addEventListener('click', () => {
        handleSubmit(component, form);
      });
    });

  return true;
}

async function sendFormData(formData): Promise<boolean> {
  const url = `https://webflow.com/api/v1/form/${siteId}`;
  const request: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/javascript, */*; q=0.01',
    },
    body: JSON.stringify(formData),
  };

  try {
    const response = await fetch(url, request);

    if (!response.ok) {
      throw new Error(`Network response "${response.status}" was not okay`);
    }
    console.log('Form submission success! Status', response.status);
    return true;
  } catch (error) {
    console.error('Form submission failed:', error);
    return false;
  }
}

async function handleSubmit(component: HTMLElement, form: HTMLFormElement) {
  function formSuccess() {
    successElement ? successElement.style.display = 'block' : null;
    form.style.display = 'none';
    form.dataset.state = 'success';
    form.dispatchEvent(new CustomEvent('formSuccess'));
  }

  function formError() {
    errorElement ? errorElement.style.display = 'block' : null;
    form.dataset.state = 'error';
    form.dispatchEvent(new CustomEvent('formError'));
  }

  let fields: Array<Field | Array<Person>> = [
    {
      id: "custom-submit",
      label: "Custom Submit",
      value: true,
      required: false
    } as Field
  ];

  // Form elements
  const allInputs: NodeListOf<FormElement> = form.querySelectorAll(FORM_INPUT_SELECTOR);
  const successElement: HTMLElement | null = component.querySelector(FORM_SUCCESS_SELECTOR);
  const errorElement: HTMLElement | null = component.querySelector(FORM_ERROR_SELECTOR);
  const submitButton: HTMLInputElement | null = component.querySelector(FORM_SUBMIT_SELECTOR);

  if (!(submitButton instanceof HTMLInputElement) || submitButton.type !== 'submit') {
    throw new Error('The submitButton element is not an HTML input element with type="submit".');
  }

  submitButton.dataset.defaultText = submitButton.value; // save default text
  submitButton.value = submitButton.dataset.wait || 'Wird gesendet ...';

  allInputs.forEach((input, index) => {
    const entry = new Field(input, index);
    fields.push();
  });
  console.log('FORM FIELDS:', fields);
  window.PEAKPOINT.fields = fields;
  fields.push(people);

  const recaptcha = (form.querySelector('#g-recaptcha-response') as FormElement).value;

  const formData = {
    name: form.dataset.name,
    pageId: pageId,
    elementId: form.dataset.wfElementId,
    source: window.location.href,
    test: false,
    fields: {
      fields: JSON.stringify({ fields }),
      "g-recaptcha-response": recaptcha
    },
    dolphin: false,
  };

  const success = await sendFormData(formData);

  if (success) {
    formSuccess();
    submitButton.value = submitButton.dataset.defaultText;
  } else {
    formError();
  }
}

function initFormButtons(form: HTMLFormElement) {
  const buttons = form.querySelectorAll('button');
  buttons.forEach((button) => {
    button.setAttribute('type', 'button');
    button.addEventListener('click', (event) => {
      // event.preventDefault();
    });
  });
}

function initCustomInputs(container: HTMLElement) {
  // Constants for selectors and classes
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

  // Add change event listener for checkboxes
  container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:not(.w-checkbox-input)').forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const customCheckbox = target.closest(".w-checkbox")?.querySelector(checkboxClass);
      if (customCheckbox) {
        customCheckbox.classList.toggle(checkedClass, target.checked);
      }
    });
  });

  // Add change event listener for radio buttons
  container.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      if (!target.checked) return;

      // Deselect other radios in the same group
      const name = target.name;
      container.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${name}"]`).forEach((radio) => {
        const customRadio = radio.closest(".w-radio")?.querySelector(radioClass);
        if (customRadio) {
          customRadio.classList.remove(checkedClass);
        }
      });

      // Add the checked class to the selected radio's custom container
      const selectedCustomRadio = target.closest(".w-radio")?.querySelector(radioClass);
      if (selectedCustomRadio) {
        selectedCustomRadio.classList.add(checkedClass);
      }
    });
  });

  // Add focus and blur event listeners for checkboxes and radios
  inputTypes.forEach(([type, customClass]) => {
    container.querySelectorAll<HTMLInputElement>(`input[type="${type}"]:not(${customClass})`).forEach((input) => {
      input.addEventListener("focus", (event) => {
        const target = event.target as HTMLInputElement;
        const customElement = target.closest(".w-checkbox, .w-radio")?.querySelector(customClass);
        if (customElement) {
          customElement.classList.add(focusClass);
          if (target.matches(focusVisibleSelector)) {
            customElement.classList.add(focusVisibleClass);
          }
        }
      });

      input.addEventListener("blur", (event) => {
        const target = event.target as HTMLInputElement;
        const customElement = target.closest(".w-checkbox, .w-radio")?.querySelector(customClass);
        if (customElement) {
          customElement.classList.remove(focusClass, focusVisibleClass);
        }
      });
    });
  });
}

function initDecisions(component: HTMLElement) {
  const decisionGroups = component.querySelectorAll<HTMLElement>('[data-decision-group]');

  decisionGroups.forEach(group => {
    const radios = group.querySelectorAll<HTMLInputElement>('input[data-decision]');
    const targetGroup = group.dataset.decisionGroup;
    const extraFieldsWrapper = document.querySelector<HTMLElement>(`[data-decision-extra-fields="${targetGroup}"]`);
    // const inputs: NodeListOf<FormElement> = group.querySelectorAll('input, textarea, select');

    if (radios.length === 0) {
      console.error(`Decision group "${targetGroup}" does not contain any decision input elements.`);
      return;
    }

    if (!extraFieldsWrapper) {
      console.error(`Extra fields container for decision group "${targetGroup}" not found.`);
      return;
    }

    // Initially hide the extra fields container
    extraFieldsWrapper.style.display = 'none';

    // Event delegation for all radios within the group
    group.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.matches('input[data-decision]') && target.dataset.decision === 'show') {
        extraFieldsWrapper.style.display = 'block';
      } else {
        extraFieldsWrapper.style.display = 'none';
      }
    });
  });
}

function initFormSteps(component: HTMLElement) {
  const hasSteps = component.getAttribute('data-steps-element') || '';
  if (!hasSteps) {
    console.error(`Form Steps: Component is not a steps component or is missing the attribute ${STEPS_COMPONENT_SELECTOR}.\nComponent:`, component);
    return;
  }
  const list: HTMLElement | null = component.querySelector(STEPS_LIST_SELECTOR);
  if (!list) {
    console.error(`Form Steps: Component does not contain a step list "${STEPS_LIST_SELECTOR}"`);
    return;
  }
  const formSteps: NodeListOf<HTMLElement> = component.querySelectorAll(STEPS_SELECTOR)!;
  if (!formSteps.length) {
    console.warn(`Form Steps: The selected list doesn't contain any steps. Skipping initialization. Provided List:`, list);
    return;
  }

  const pagination: HTMLElement = component.querySelector(STEPS_PAGINATION_SELECTOR)!;
  const paginationItems: NodeListOf<HTMLElement> = pagination.querySelectorAll(STEPS_PAGINATION_ITEM_SELECTOR)
  const buttonNext: HTMLElement = component.querySelector(STEPS_NEXT_SELECTOR)!;
  const buttonPrev: HTMLElement = component.querySelector(STEPS_PREV_SELECTOR)!;
  let currentStep: number = 0;

  formSteps.forEach((step, index) => {
    if (index === 0) {
      step.classList.remove('hide');
    } else {
      step.classList.add('hide');
    }
    step.dataset.stepId = index.toString();
  });

  function initPagination() {
    paginationItems.forEach((item, index) => {
      item.dataset.stepTarget = index.toString();
      item.addEventListener('click', (event) => {

        event.preventDefault();
        changeToStep(index);
      })
    })
  }
  initPagination();

  function changeToStep(target: number, init = false) {
    if (currentStep === target && !init) {
      console.log('Change Form Step: Target step equals current step.');
      return;
    }

    if (target === 0) {
      buttonPrev.style.opacity = '0';
      buttonNext.style.opacity = '1';
    } else if (target === formSteps.length - 1) {
      buttonPrev.style.opacity = '1';
      buttonNext.style.opacity = '0';
    } else {
      buttonPrev.style.opacity = '1';
      buttonNext.style.opacity = '1';
    }

    formSteps[currentStep].classList.add('hide');
    formSteps[target].classList.remove('hide');
    paginationItems.forEach((step, index) => {
      if (index < target) {
        step.classList.add('is-done');
        step.classList.remove('is-active');
      } else if (index === target) {
        step.classList.remove('is-done');
        step.classList.add('is-active')
      } else {
        step.classList.remove('is-done');
        step.classList.remove('is-active');
      }
    })
    currentStep = target;
  }

  changeToStep(currentStep, true);

  buttonNext.addEventListener('click', (event) => {
    event.preventDefault();
    if (currentStep < formSteps.length - 1) {
      changeToStep(currentStep + 1);
    }
  });

  buttonPrev.addEventListener('click', (event) => {
    event.preventDefault();
    if (currentStep > 0) {
      changeToStep(currentStep - 1);
    }
  });
}

function initFormArray(component: HTMLElement) {
  const ARRAY_LIST_SELECTOR: string = '[data-form-array-element="list"]';
  const ARRAY_TEMPLATE_SELECTOR: string = '[data-person-element="template"]';
  const ARRAY_EMPTY_STATE_SELECTOR: string = '[data-person-element="empty"]';
  const ARRAY_ADD_SELECTOR: string = '[data-person-element="add"]';
  const ARRAY_SAVE_SELECTOR: string = '[data-person-element="save"]';
  const ARRAY_MODAL_SELECTOR: string = '[data-form-element="modal"]';
  const ARRAY_GROUP_SELECTOR: string = '[data-person-data-group]';

  let editingIndex: number | null = null;

  const list: HTMLElement = component.querySelector(ARRAY_LIST_SELECTOR)!;
  const template: HTMLElement = list.querySelector(ARRAY_TEMPLATE_SELECTOR)!;
  const emptyState: HTMLElement = component.querySelector(ARRAY_EMPTY_STATE_SELECTOR)!;
  const addButton: HTMLElement = component.querySelector(ARRAY_ADD_SELECTOR)!;
  const modal: HTMLElement = document.querySelector(ARRAY_MODAL_SELECTOR)!;
  const modalForm: HTMLFormElement = document.querySelector(FORM_SELECTOR)!;
  const saveButton: HTMLElement = modal.querySelector(ARRAY_SAVE_SELECTOR)!;
  const modalInputs: NodeListOf<FormElement> = modal.querySelectorAll(FORM_INPUT_SELECTOR);
  const groupElements: NodeListOf<FormElement> = modal.querySelectorAll(ARRAY_GROUP_SELECTOR);

  addButton.addEventListener('click', () => {
    clearModal();
    openModal();
    editingIndex = null; // Reset editing state for adding a new person
  });

  saveButton.addEventListener('click', () => {
    const person: Person = extractData();

    if (editingIndex !== null) {
      // Update existing person
      people[editingIndex] = person;
    } else {
      // Add new person
      people.push(person);
    }

    renderList();
    closeModal();

    console.log(`Saved person successfully!`, people);

  });

  function renderList() {
    list.innerHTML = ''; // Clear the current list
    if (people.length) {
      people.forEach((person, index) => renderPerson(person, index));
      emptyState.classList.add('hide');
    } else {
      emptyState.classList.remove('hide');
    }
  }

  function renderPerson(person: Person, index: number) {
    const newElement: HTMLElement = template.cloneNode(true) as HTMLElement;
    const props = ['first-name', 'name', 'phone', 'email', 'street', 'zip', 'city'];
    newElement.style.removeProperty('display');

    // Add event listeners for editing and deleting
    const editButton = newElement.querySelector('[data-person-action="edit"]');
    const deleteButton = newElement.querySelector('[data-person-action="delete"]');

    editButton!.addEventListener('click', () => {
      openModal();
      populateModal(person);
      editingIndex = index; // Set editing index
    });

    deleteButton!.addEventListener('click', () => {
      people.splice(index, 1); // Remove the person from the array
      renderList(); // Re-render the list
    });

    props.forEach(prop => {
      const propSelector = `[data-${prop}]`;
      const el: HTMLElement | null = newElement.querySelector(propSelector);
      if (el) {
        const currentField = person.personalData.getField(prop);
        if (!currentField) { console.error(`Render person: A field for "${prop}" doesn't exist.`); return; }
        el.innerText = currentField.value || currentField.label;
      }
    });
    list.appendChild(newElement);
  }

  function populateModal(person: Person) {
    groupElements.forEach((group) => {
      const groupInputs: NodeListOf<FormElement> = group.querySelectorAll(FORM_INPUT_SELECTOR);
      const groupName = group.dataset.personDataGroup! as keyof Person;

      groupInputs.forEach(input => {
        const field = person[groupName].getField(input.id);
        if (field) {
          input.value = field.value.trim();
        }
      });
    });
  }

  function openModal() {
    clearModal();
    modal.classList.remove('is-closed');
    modal.dataset.state = 'open';
  }

  function closeModal() {
    modal.classList.add('is-closed');
    modal.dataset.state = 'closed';
    clearModal();
  }

  function clearModal() {
    modalInputs.forEach((input) => {
      if (input.type !== 'checkbox' && input.type !== 'radio')
        input.value = '';
    });
  }

  function extractData(): Person {
    const personData = new Person();

    groupElements.forEach((group) => {
      const groupInputs: NodeListOf<FormElement> = group.querySelectorAll(FORM_INPUT_SELECTOR);
      const groupName = group.dataset.personDataGroup! as keyof Person;

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

  // Initialize the modal on load
  closeModal();
}

window.PEAKPOINT = {}
let people: Array<Person> = [];
window.PEAKPOINT.people = people;

const form: HTMLElement | null = document.querySelector(FORM_COMPONENT_SELECTOR);
form?.classList.remove('w-form');

document.addEventListener('DOMContentLoaded', () => {
  const inizialized = initForm(form);
  console.log("Form initialized:", inizialized)
});

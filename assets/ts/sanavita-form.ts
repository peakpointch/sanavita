const W_CHECKBOX_CLASS = ".w-checkbox-input";
const W_RADIO_CLASS = ".w-radio-input";
const W_CHECKED_CLASS = "w--redirected-checked";

const FORM_COMPONENT_SELECTOR: string = '[data-form-element="component"]';
const FORM_SELECTOR: string = 'form';
const FORM_SUCCESS_SELECTOR: string = '[data-form-element="success"]';
const FORM_ERROR_SELECTOR: string = '[data-form-element="error"]';
const FORM_SUBMIT_SELECTOR: string = '[data-form-element="submit"]';
const CHECKBOX_INPUT_SELECTOR: string = `.w-checkbox input[type="checkbox"]:not(${W_CHECKBOX_CLASS})`;
const RADIO_INPUT_SELECTOR: string = '.w-radio input[type="radio"]';
const FORM_INPUT_SELECTOR: string = `.w-input, .w-select, ${RADIO_INPUT_SELECTOR}, ${CHECKBOX_INPUT_SELECTOR}`;

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
type GroupName = 'personalData' | 'doctor' | 'health' | 'relatives';

interface Window {
  PEAKPOINT: any;
}

class FieldGroup {
  fields: Map<string, Field>;

  constructor(
    fields: Map<string, Field> = new Map(),
  ) {
    this.fields = fields
  }

  // Method to retrieve a field by its id
  getField(fieldId: string): Field | undefined {
    return this.fields.get(fieldId);
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

  getFullName(): string {
    return `${this.personalData.getField('first-name')!.value} ${this.personalData.getField('name')!.value}`.trim()
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

class FormSteps {
  private component: HTMLElement;
  private formSteps: NodeListOf<HTMLElement>;
  private paginationItems: NodeListOf<HTMLElement>;
  private buttonNext: HTMLElement;
  private buttonPrev: HTMLElement;
  private currentStep: number = 0;

  constructor(component: HTMLElement) {
    this.component = component;
    this.formSteps = this.component.querySelectorAll(STEPS_SELECTOR);
    this.paginationItems = this.component.querySelectorAll(STEPS_PAGINATION_ITEM_SELECTOR);
    this.buttonNext = this.component.querySelector(STEPS_NEXT_SELECTOR)!;
    this.buttonPrev = this.component.querySelector(STEPS_PREV_SELECTOR)!;

    this.initialize();
  }

  private initialize(): void {
    if (!this.component.getAttribute('data-steps-element')) {
      console.error(`Form Steps: Component is not a steps component or is missing the attribute ${STEPS_COMPONENT_SELECTOR}.\nComponent:`, this.component);
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

  private setupSteps(): void {
    this.formSteps.forEach((step, index) => {
      step.dataset.stepId = index.toString();
      step.classList.toggle('hide', index !== 0);
    });
  }

  private initPagination(): void {
    this.paginationItems.forEach((item, index) => {
      item.dataset.stepTarget = index.toString();
      item.addEventListener('click', (event) => {
        event.preventDefault();
        this.changeToStep(index);
      });
    });

    this.buttonNext.addEventListener('click', (event) => {
      event.preventDefault();
      if (this.currentStep < this.formSteps.length - 1) {
        this.changeToStep(this.currentStep + 1);
      }
    });

    this.buttonPrev.addEventListener('click', (event) => {
      event.preventDefault();
      if (this.currentStep > 0) {
        this.changeToStep(this.currentStep - 1);
      }
    });
  }

  private changeToStep(target: number, init = false): void {
    if (this.currentStep === target && !init) {
      console.log('Change Form Step: Target step equals current step.');
      return;
    }

    if (target > this.currentStep && !init) {
      for (let step = this.currentStep; step < target; step++) {
        if (!this.validateCurrentStep(step)) {
          console.warn('Validation failed for step:', step + 1);
          this.changeToStep(step);
          return;
        }
      }
    }

    this.updateStepVisibility(target);
    this.updatePagination(target);
    this.currentStep = target;
  }

  private updateStepVisibility(target: number): void {
    this.formSteps[this.currentStep].classList.add('hide');
    this.formSteps[target].classList.remove('hide');
  }

  private updatePagination(target: number): void {
    this.buttonPrev.style.opacity = target === 0 ? '0' : '1';
    this.buttonNext.style.opacity = target === this.formSteps.length - 1 ? '0' : '1';

    this.paginationItems.forEach((step, index) => {
      step.classList.toggle('is-done', index < target);
      step.classList.toggle('is-active', index === target);
    });
  }

  private validateCurrentStep(step: number): boolean {
    const currentStepElement = this.formSteps[step];
    const inputs: NodeListOf<FormElement> = currentStepElement.querySelectorAll(FORM_INPUT_SELECTOR);
    let fieldsValid = validateFields(inputs);

    const formArrayListElement: HTMLElement | null = currentStepElement.querySelector('[data-form-array-element="list"]');
    if (!formArrayListElement) return fieldsValid;

    const listLength = parseInt(formArrayListElement.dataset.length!);
    const listValid = listLength > 0;

    if (!listValid) {
      console.warn(`Couldn't validate current step. Please add at least one person.`);
      const errorElement = formArrayListElement.parentElement!.querySelector('[data-person-element="empty"]') as HTMLElement;
      errorElement.setAttribute('aria-live', 'assertive');
      errorElement.setAttribute('role', 'alert');
      errorElement.setAttribute('tabindex', '-1');
      errorElement.classList.add('has-error');
      reinsertElement(errorElement);
    }

    return fieldsValid && listValid;
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

function mapToObject(map: Map<any, any>): any {
  // Convert a Map to a plain object
  const obj: any = {};
  for (const [key, value] of map) {
    obj[key] = value instanceof Map ? mapToObject(value) : value; // Recursively convert if value is a Map
  }
  return obj;
}

function personMapToObject(people: Map<string, Person>): any {
  // Convert a Person's structure, which contains FieldGroups with fields as Maps
  const peopleObj: any = {};
  for (const [key, person] of people) {
    peopleObj[key] = {
      personalData: {
        fields: mapToObject(person.personalData.fields),
      },
      doctor: {
        fields: mapToObject(person.doctor.fields),
      },
      health: {
        fields: mapToObject(person.health.fields),
      },
      relatives: {
        fields: mapToObject(person.relatives.fields),
      },
    };
  }
  return peopleObj;
}

function reinsertElement(element: HTMLElement): void {
  // Check if the element and its parent are defined
  if (!element || !element.firstElementChild) {
    console.warn('Element or its first element child is not defined.');
    return;
  }

  const childElement = element.firstElementChild;

  // Remove the element from its parent
  element.removeChild(childElement);

  // Use setTimeout to ensure the reinsert happens asynchronously
  setTimeout(() => {
    // Append the element back to the parent
    element.appendChild(childElement);

    // Focus the element if it's meant to be interactive
    element.focus();
  }, 0);
}

function isRadioInput(input: FormElement): input is HTMLInputElement {
  return input instanceof HTMLInputElement && input.type === 'radio';
}

function isCheckboxInput(input: FormElement): input is HTMLInputElement {
  return input instanceof HTMLInputElement && input.type === 'checkbox';
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
  initFormArray(component);
  initCustomInputs(component);
  initDecisions(component);

  const formSteps = new FormSteps(component);

  form.setAttribute('novalidate', '');
  form.dataset.state = 'initialized';
  component.addEventListener('submit', (event) => {
    event.preventDefault();
    form.dataset.state = 'sending';
    handleSubmit(component, form);
  });

  return true;
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
  fields["people"] = personMapToObject(people);
  console.log('FORM FIELDS:', fields);
  window.PEAKPOINT.fields = fields;

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

  submitButton.value = submitButton.dataset.defaultText;

  // const success = await sendFormData(formData);

  // if (success) {
  //   formSuccess();
  //   submitButton.value = submitButton.dataset.defaultText;
  // } else {
  //   formError();
  // }
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

function initFormButtons(form: HTMLFormElement) {
  const buttons = form.querySelectorAll('button');
  buttons.forEach((button) => {
    button.setAttribute('type', 'button');
    button.addEventListener('click', (event) => {
      // event.preventDefault();
    });
  });
}

function clearRadioGroup(container: HTMLElement, name: string) {
  container.querySelectorAll<HTMLInputElement>(`${RADIO_INPUT_SELECTOR}[name="${name}"]`).forEach((radio) => {
    radio.checked = false; // Uncheck all radios in the group
    const customRadio = radio.closest(".w-radio")?.querySelector(W_RADIO_CLASS);
    if (customRadio) {
      customRadio.classList.remove(W_CHECKED_CLASS); // Remove the checked styling
    }
  });
}

function initCustomInputs(container: HTMLElement) {
  // Constants for selectors and classes
  const focusClass = "w--redirected-focus";
  const focusVisibleClass = "w--redirected-focus-visible";
  const focusVisibleSelector = ":focus-visible, [data-wf-focus-visible]";
  const inputTypes = [
    ["checkbox", W_CHECKBOX_CLASS],
    ["radio", W_RADIO_CLASS]
  ];

  // Add change event listener for checkboxes
  container.querySelectorAll<HTMLInputElement>(CHECKBOX_INPUT_SELECTOR).forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const customCheckbox = target.closest(".w-checkbox")?.querySelector(W_CHECKBOX_CLASS);
      if (customCheckbox) {
        customCheckbox.classList.toggle(W_CHECKED_CLASS, target.checked);
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
        const customRadio = radio.closest(".w-radio")?.querySelector(W_RADIO_CLASS);
        if (customRadio) {
          customRadio.classList.remove(W_CHECKED_CLASS);
        }
      });

      // Add the checked class to the selected radio's custom container
      const selectedCustomRadio = target.closest(".w-radio")?.querySelector(W_RADIO_CLASS);
      if (selectedCustomRadio) {
        selectedCustomRadio.classList.add(W_CHECKED_CLASS);
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

function validateFields(inputs: NodeListOf<FormElement>): boolean {
  let valid = true; // Assume the step is valid unless we find a problem

  for (const input of inputs) {
    if (!input.checkValidity()) {
      valid = false;
      input.reportValidity();
      input.classList.add('has-error');
      input.addEventListener('change', () => {
        input.classList.remove('has-error')
      });
      break;
    } else {
      input.classList.remove('has-error');
    }
  }

  return valid;
}

function initFormArray(component: HTMLElement) {
  const ARRAY_LIST_SELECTOR: string = '[data-form-array-element="list"]';
  const ARRAY_TEMPLATE_SELECTOR: string = '[data-person-element="template"]';
  const ARRAY_EMPTY_STATE_SELECTOR: string = '[data-person-element="empty"]';
  const ARRAY_ADD_SELECTOR: string = '[data-person-element="add"]';
  const ARRAY_SAVE_SELECTOR: string = '[data-person-element="save"]';
  const ARRAY_CANCEL_SELECTOR: string = '[data-person-element="cancel"]';
  const ARRAY_MODAL_SELECTOR: string = '[data-form-element="modal"]';
  const ARRAY_GROUP_SELECTOR: string = '[data-person-data-group]';

  let editingKey: string | null = null;

  const list: HTMLElement = component.querySelector(ARRAY_LIST_SELECTOR)!;
  const template: HTMLElement = list.querySelector(ARRAY_TEMPLATE_SELECTOR)!;
  const emptyState: HTMLElement = component.querySelector(ARRAY_EMPTY_STATE_SELECTOR)!;
  const addButton: HTMLElement = component.querySelector(ARRAY_ADD_SELECTOR)!;
  const modal: HTMLElement = document.querySelector(ARRAY_MODAL_SELECTOR)!;
  const modalForm: HTMLFormElement = document.querySelector(FORM_SELECTOR)!;
  const saveButton: HTMLElement = modal.querySelector(ARRAY_SAVE_SELECTOR)!;
  const cancelButtons: NodeListOf<HTMLButtonElement> = modal.querySelectorAll(ARRAY_CANCEL_SELECTOR)!;
  const modalInputs: NodeListOf<FormElement> = modal.querySelectorAll(FORM_INPUT_SELECTOR);
  const groupElements: NodeListOf<FormElement> = modal.querySelectorAll(ARRAY_GROUP_SELECTOR);

  cancelButtons.forEach((button, index) => {
    button.addEventListener('click', closeModal)
  })

  addButton.addEventListener('click', () => {
    clearModal();
    setLiveText("state", "Hinzufügen");
    setLiveText("full-name", "Neue Person");
    openModal();
    editingKey = null; // Reset editing state for adding a new person
  });

  saveButton.addEventListener('click', savePerson);

  function savePerson(): Person | null {
    if (!validateModal()) {
      console.warn(`Couldn't save person. Please fill in all the values correctly.`);
      return null;
    }

    const person: Person = extractData();

    if (editingKey !== null) {
      // Update existing person
      people.set(editingKey, person);
    } else {
      // Generate a unique key for a new person, e.g., "person1", "person2"
      const newKey = `person${people.size + 1}`;
      people.set(newKey, person);
    }

    renderList();
    closeModal();

    return person;
  }

  function setLiveText(element: string, string: string): boolean {
    const liveElements: NodeListOf<HTMLElement> = modal.querySelectorAll(`[data-live-text="${element}"]`);
    let valid = true;
    for (const element of liveElements) {
      if (!element) {
        valid = false;
        break;
      }
      element.innerText = string;
    }
    return valid;
  }

  function renderList() {
    list.innerHTML = ''; // Clear the current list
    list.dataset.length = people.size.toString();
    console.log(people.size.toString());

    if (people.size) {
      people.forEach((person, key) => renderPerson(person, key));
      emptyState.classList.add('hide');
    } else {
      emptyState.classList.remove('hide');
    }
  }

  function renderPerson(person: Person, key: string) {
    const newElement: HTMLElement = template.cloneNode(true) as HTMLElement;
    const props = ['first-name', 'name', 'phone', 'email', 'street', 'zip', 'city'];
    newElement.style.removeProperty('display');

    // Add event listeners for editing and deleting
    const editButton = newElement.querySelector('[data-person-action="edit"]');
    const deleteButton = newElement.querySelector('[data-person-action="delete"]');

    editButton!.addEventListener('click', () => {
      setLiveText("state", "bearbeiten");
      setLiveText("full-name", person.getFullName() || 'Neue Person');
      populateModal(person);
      openModal();
      editingKey = key; // Set editing key
    });

    deleteButton!.addEventListener('click', () => {
      people.delete(key); // Remove the person from the map
      renderList(); // Re-render the list
      closeModal();
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
      const groupName = group.dataset.personDataGroup! as GroupName;

      groupInputs.forEach(input => {
        // Get field
        const field = person[groupName].getField(input.id);

        if (!field) {
          console.warn(`Field not found:`, field, input.id);
          return;
        }

        if (!isRadioInput(input) && !isCheckboxInput(input)) {
          // For text inputs, trim and set the value
          input.value = field.value.trim();
          return;
        }

        if (isRadioInput(input) && input.value === field.value) {
          input.checked = true;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (isCheckboxInput(input) && input.value === field.value) {
          input.checked = true;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });
  }

  function openModal() {
    // Live text for name
    const personalDataGroup = modal.querySelector('[data-person-data-group="personalData"]')!;
    const nameInputs: NodeListOf<HTMLFormElement> = personalDataGroup.querySelectorAll('#first-name, #name');
    nameInputs.forEach((input) => {
      input.addEventListener('input', () => {
        const editingPerson: Person = extractData();
        setLiveText('full-name', editingPerson.getFullName() || 'Neue Person');
      });
    });
    emptyState.classList.remove('has-error');

    // Open modal
    modal.classList.remove('is-closed');
    modal.dataset.state = 'open';
  }

  function closeModal() {
    modal.classList.add('is-closed');
    modal.dataset.state = 'closed';
    clearModal();
  }

  function clearModal() {
    setLiveText('state', 'hinzufügen');
    setLiveText('full-name', 'Neue Person');
    modalInputs.forEach((input) => {
      if (isRadioInput(input)) {
        input.checked = false;
        clearRadioGroup(modal, input.name)
      } else if (isCheckboxInput(input)) {
        input.checked = false;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        input.value = '';
      }
    });
  }

  function validateModal(): boolean {
    const allModalFields: NodeListOf<FormElement> = modal.querySelectorAll(FORM_INPUT_SELECTOR);
    const valid = validateFields(allModalFields);
    return valid; // CHANGE THIS FOR DEV
  }

  function extractData(): Person {
    const personData = new Person();

    groupElements.forEach((group) => {
      const groupInputs: NodeListOf<FormElement> = group.querySelectorAll(FORM_INPUT_SELECTOR);
      const groupName = group.dataset.personDataGroup! as GroupName;

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

  // Initialize the modal on load
  closeModal();
}

window.PEAKPOINT = {}
let people: Map<string, Person> = new Map();

window.PEAKPOINT.people = people;

const form: HTMLElement | null = document.querySelector(FORM_COMPONENT_SELECTOR);
form?.classList.remove('w-form');

document.addEventListener('DOMContentLoaded', () => {
  const inizialized = initForm(form);
  console.log("Form initialized:", inizialized)
});

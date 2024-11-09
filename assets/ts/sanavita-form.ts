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

const ARRAY_LIST_SELECTOR: string = '[data-form-array-element="list"]';
const ARRAY_TEMPLATE_SELECTOR: string = '[data-person-element="template"]';
const ARRAY_EMPTY_STATE_SELECTOR: string = '[data-person-element="empty"]';
const ARRAY_ADD_SELECTOR: string = '[data-person-element="add"]';
const ARRAY_SAVE_SELECTOR: string = '[data-person-element="save"]';
const ARRAY_CANCEL_SELECTOR: string = '[data-person-element="cancel"]';
const ARRAY_GROUP_SELECTOR: string = '[data-person-data-group]';
const MODAL_SELECTOR: string = '[data-form-element="modal"]';
const MODAL_SCROLL_SELECTOR: string = '[data-modal-element="scroll"]';

const ACCORDION_SELECTOR: string = `[data-animate="accordion"]`;

// Unique key to store form data in localStorage
const STORAGE_KEY = 'person_data';

const siteId: string = document.documentElement.dataset.wfSite || '';
const pageId: string = document.documentElement.dataset.wfPage || '';

type FormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
type GroupName = 'personalData' | 'doctor' | 'health' | 'relatives';

interface Window {
  PEAKPOINT: any;
}

class Accordion {
  public component: HTMLElement;
  public trigger: HTMLElement;
  public uiTrigger: HTMLElement;
  public isOpen: boolean = false;

  constructor(component: HTMLElement) {
    this.component = component;
    this.trigger = component.querySelector('[data-animate="trigger"]')!;
    this.uiTrigger = component.querySelector('[data-animate="ui-trigger"]')!;

    this.uiTrigger.addEventListener('click', () => {
      this.toggle();
      // console.log("ACCORDION TRIGGER; OPEN:", this.isOpen);
    });
  }

  public open() {
    if (!this.isOpen) {
      this.trigger.click();
      this.isOpen = true;
    }
  }

  public close() {
    if (this.isOpen) {
      this.trigger.click();
      this.isOpen = false;
    }
  }

  public toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public scrollIntoView(): void {
    let offset = 0;
    const scrollWrapper: HTMLElement | null = this.component.closest(MODAL_SCROLL_SELECTOR);
    const elementPosition = this.uiTrigger.getBoundingClientRect().top;

    // Check if there is a scrollable wrapper (like a modal)
    if (scrollWrapper) {
      const wrapperPosition = scrollWrapper.getBoundingClientRect().top;
      offset = scrollWrapper.querySelector('[data-scroll-child="sticky"]')!.clientHeight; // Height of sticky element

      scrollWrapper.scrollBy({
        top: (elementPosition - wrapperPosition) - offset - 2,
        behavior: 'smooth',
      });
    } else {
      // If no scrollable wrapper, scroll the window instead
      window.scrollTo({
        top: elementPosition + window.scrollY - offset - 2,
        behavior: 'smooth',
      });
    }
  }
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

  // This method will now validate the person
  public validate(): boolean {
    let valid = true;

    // Loop over the groups within the person object
    const groups = Object.keys(this) as (keyof Person)[];
    groups.forEach(groupName => {
      const group = this[groupName as GroupName];

      // Assuming the group has a `fields` property
      if (group.fields) {
        group.fields.forEach(field => {
          const fieldValid = field.validate(true);
          if (!fieldValid) {
            valid = false;
          }
        });
      }
    });

    return valid;
  }

  public getFullName(): string {
    return `${this.personalData.getField('first-name')!.value} ${this.personalData.getField('name')!.value}`.trim() || "Neue Person";
  }
}

class Field {
  public id: string;
  public label: string;
  public value: any;
  public required: boolean;
  public type: string;
  public checked: boolean;

  constructor(input, index) {
    if (input.type === 'radio' && !(input as HTMLInputElement).checked) {
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

  public validate(report: boolean = true): boolean {
    let valid = true;

    // If the field is required, check if it has a valid value
    if (this.required) {
      if (this.type === 'radio' || this.type === 'checkbox') {
        // For radio or checkbox, check if it is checked
        if (!this.checked) {
          valid = false;
        }
      } else {
        // For other types, check if the value is not empty
        if (!this.value.trim()) {
          valid = false;
        }
      }
    }

    // If the field is not valid and reporting is enabled, log an error
    if (!valid && report) {
      console.warn(`Field "${this.label}" is invalid.`);
    }

    return valid;
  }
}

class FormMessage {
  private messageFor: string;
  private component: HTMLElement;
  private messageElement: HTMLElement | null;

  constructor(componentName: string, messageFor: string) {
    this.messageFor = messageFor;
    const component: HTMLElement | null = document.querySelector(
      `[data-message-component="${componentName}"][data-message-for="${this.messageFor}"]`
    );

    if (!component) {
      console.warn('No FormMessage component was found.');
      return;
    }

    this.component = component;
    this.messageElement = this.component?.querySelector('[data-message-element="message"]') || null;
    this.reset();
  }

  // Method to display an info message
  public info(message: string | null = null): void {
    this.component.setAttribute('aria-live', 'polite');
    this.setMessage(message, 'info');
  }

  // Method to display an error message
  public error(message: string | null = null): void {
    this.component.setAttribute('role', 'alert');
    this.component.setAttribute('aria-live', 'assertive');
    this.setMessage(message, 'error');
  }

  // Method to reset/hide the message
  public reset(): void {
    this.component.classList.remove('info', 'error');
  }

  // Private method to set the message and style
  private setMessage(message: string | null = null, type: 'info' | 'error'): void {
    if (this.messageElement && message) {
      this.messageElement.textContent = message;
    } else if (!this.messageElement) {
      console.warn('Message text element not found.');
    }

    // Set class based on type
    this.component.classList.remove('info', 'error');
    this.component.classList.add(type);

    this.component.scrollIntoView({
      behavior: "smooth",
      block: "center"
    })
  }
}

class FormGroup {
  private form: HTMLFormElement;
  private container: HTMLElement;
  private groupNames: string[];
  private validationMessage: string;
  public formMessage: FormMessage;

  constructor(container: HTMLElement, groupNames: string[], validationMessage: string) {
    this.container = container;
    this.groupNames = groupNames;
    this.validationMessage = validationMessage;

    const formElement = this.getAllGroupFields()[0].closest('form');
    if (!formElement) {
      console.error(`Cannot construct a FormGroup that is not part of a form.`);
      return;
    }
    this.form = formElement;
    this.formMessage = new FormMessage("FormGroup", this.groupNames.join(','));

    // Initialize the form group by setting up event listeners
    this.initialize();
  }

  private initialize(): void {
    const allFields = this.getAllGroupFields();

    allFields.forEach((field) => {
      field.addEventListener('change', () => this.formMessage.reset());
    });
  }

  private getGroupFields(groupName: string): NodeListOf<FormElement> {
    return this.container.querySelectorAll(
      `[data-form-group="${groupName}"]`
    );
  }

  private getAllGroupFields(): NodeListOf<FormElement> {
    const selectorList = this.groupNames.map((groupName) => {
      return `[data-form-group="${groupName}"]`
    });
    let selector: string = selectorList.join(', ');
    return this.container.querySelectorAll(selector);
  }

  public validate(): boolean {
    console.log("VALIDATING FORM GROUPS: ", this.groupNames);

    // Validate the groups and get the result
    const anyGroupValid = this.checkGroupValidity();

    // Handle error messages based on validation result
    this.handleValidationMessages(anyGroupValid);
    console.log(anyGroupValid)

    return anyGroupValid;
  }

  private checkGroupValidity(): boolean {
    return this.groupNames.some((groupName) => {
      const groupFields = Array.from(this.getGroupFields(groupName));
      return groupFields.some((field) => {
        if (isCheckboxInput(field) || isRadioInput(field)) {
          return field.checked;
        }
        return field.value.trim() !== '';
      });
    });
  }

  private updateRequiredAttributes(anyGroupValid: boolean): void {
    const allFields = this.getAllGroupFields();
    allFields.forEach((field) => {
      field.required = !anyGroupValid;
    });
    this.formMessage.reset();
  }

  private handleValidationMessages(anyGroupValid: boolean): void {
    if (!anyGroupValid) {
      this.formMessage.error();
    } else {
      this.formMessage.reset();
    }
  }
}

class FormSteps {
  public component: HTMLElement;
  private formSteps: NodeListOf<HTMLElement>;
  private paginationItems: NodeListOf<HTMLElement>;
  private buttonNext: HTMLElement;
  private buttonPrev: HTMLElement;
  private currentStep: number = 0;
  private customValidators: Array<Array<() => boolean>> = [];

  constructor(component: HTMLElement) {
    this.component = component;
    this.formSteps = this.component.querySelectorAll(STEPS_SELECTOR);
    this.paginationItems = this.component.querySelectorAll(STEPS_PAGINATION_ITEM_SELECTOR);
    this.buttonNext = this.component.querySelector(STEPS_NEXT_SELECTOR)!;
    this.buttonPrev = this.component.querySelector(STEPS_PREV_SELECTOR)!;

    this.initialize();
  }

  public addCustomValidator(step: number, validator: () => boolean): void {
    if (!this.customValidators[step]) {
      this.customValidators[step] = [];
    }
    this.customValidators[step].push(validator);
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

      step.querySelectorAll<HTMLInputElement>(FORM_INPUT_SELECTOR) // Type necessary for keydown event
        .forEach((input) => {
          input.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              this.changeToNext();
            }
          });
        })
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
      this.changeToNext();
    });

    this.buttonPrev.addEventListener('click', (event) => {
      event.preventDefault();
      this.changeToPrevious();
    });
  }

  public changeToNext() {
    if (this.currentStep < this.formSteps.length - 1) {
      this.changeToStep(this.currentStep + 1);
    }
  }

  public changeToPrevious() {
    if (this.currentStep > 0) {
      this.changeToStep(this.currentStep - 1);
    }
  }

  public changeToStep(target: number, init = false): void {
    if (this.currentStep === target && !init) {
      console.log('Change Form Step: Target step equals current step.');
      return;
    }

    if (target > this.currentStep && !init) {
      for (let step = this.currentStep; step < target; step++) {
        // Validate standard fields in the current step
        if (!this.validateCurrentStep(step)) {
          console.warn('Standard validation failed for step:', step + 1);
          this.changeToStep(step);
          return;
        }
      }

      this.component.scrollIntoView({
        behavior: 'smooth',
        block: "start"
      });
    }

    // Fire custom event before updating the visibility
    const event = new CustomEvent("changeStep", {
      detail: { previousStep: this.currentStep, currentStep: target }
    });
    this.component.dispatchEvent(event);

    this.updateStepVisibility(target);
    this.updatePagination(target);
    this.currentStep = target;
  }

  private updateStepVisibility(target: number): void {
    this.formSteps[this.currentStep].classList.add('hide');
    this.formSteps[target].classList.remove('hide');
  }

  private updatePagination(target: number): void {
    if (target === 0) {
      this.buttonPrev.style.visibility = 'hidden';
      this.buttonPrev.style.opacity = '0';
    } else if (target === this.formSteps.length - 1) {
      this.buttonNext.style.visibility = 'hidden';
      this.buttonNext.style.opacity = '0';
    } else {
      this.buttonPrev.style.visibility = 'visible';
      this.buttonPrev.style.opacity = '1';
      this.buttonNext.style.visibility = 'visible';
      this.buttonNext.style.opacity = '1';
    }

    this.paginationItems.forEach((step, index) => {
      step.classList.toggle('is-done', index < target);
      step.classList.toggle('is-active', index === target);
    });
  }

  public validateAllSteps(): boolean {
    let allValid = true;

    this.formSteps.forEach((step, index) => {
      if (!this.validateCurrentStep(index)) {
        console.warn(`Step ${index + 1} is invalid.`);
        allValid = false; // Set the flag to false if any step is invalid
        this.changeToStep(index);
      }
    });

    return allValid;
  }

  public validateCurrentStep(step: number): boolean {
    const currentStepElement = this.formSteps[step];
    const inputs: NodeListOf<FormElement> = currentStepElement.querySelectorAll(FORM_INPUT_SELECTOR);
    let { valid, invalidField } = validateFields(inputs);

    if (!valid) {
      console.warn(`STANDARD VALIDATION: NOT VALID`);
      return valid;
    }

    // Custom validations
    const customValid = this.customValidators[step]?.every((validator) => validator()) ?? true;
    if (!customValid) {
      console.warn(`CUSTOM VALIDATION: NOT VALID`);
    }

    return valid && customValid;
  }

  public getFormDataForStep(step: number): Array<any> {
    let fields: Array<Field | Array<Person>> = [];

    const stepElement = this.formSteps[step];
    const stepInputs: NodeListOf<FormElement> = stepElement.querySelectorAll(FORM_INPUT_SELECTOR);
    stepInputs.forEach((input, inputIndex) => {
      const entry = new Field(input, inputIndex);
      if (entry.id) {
        fields.push(entry);
      }
    });

    return fields;
  }

  public getAllFormData(): Array<any> {
    let fields: Array<Field | Array<Person>> = [];

    this.formSteps.forEach((step, stepIndex) => {
      const stepData = this.getFormDataForStep(stepIndex);
      fields.push(...stepData);
    });

    return fields;
  }
}

class FormArray {
  public id: string | number;
  private container: HTMLElement;
  private list: HTMLElement;
  private template: HTMLElement;
  private formMessage: FormMessage;
  private addButton: HTMLElement;
  private modal: HTMLElement;
  private modalForm: HTMLFormElement;
  private saveButton: HTMLElement;
  private cancelButtons: NodeListOf<HTMLButtonElement>;
  private modalInputs: NodeListOf<FormElement>;
  private groupElements: NodeListOf<FormElement>;
  private accordionList: Accordion[] = [];

  private editingKey: string | null = null;

  constructor(container: HTMLElement, id: string | number) {
    this.id = id;
    this.container = container;
    this.list = this.container.querySelector(ARRAY_LIST_SELECTOR)!;
    this.template = this.list.querySelector(ARRAY_TEMPLATE_SELECTOR)!;
    this.addButton = this.container.querySelector(ARRAY_ADD_SELECTOR)!;
    this.formMessage = new FormMessage('FormArray', this.id.toString())
    this.modal = document.querySelector(MODAL_SELECTOR)!;
    this.modalForm = document.querySelector(FORM_SELECTOR)!;
    this.saveButton = this.modal.querySelector(ARRAY_SAVE_SELECTOR)!;
    this.cancelButtons = this.modal.querySelectorAll(ARRAY_CANCEL_SELECTOR)!;
    this.modalInputs = this.modal.querySelectorAll(FORM_INPUT_SELECTOR);
    this.groupElements = this.modal.querySelectorAll(ARRAY_GROUP_SELECTOR);

    this.initialize();
  }

  private initialize() {
    this.cancelButtons.forEach(button => {
      button.addEventListener('click', this.closeModal.bind(this));
    });

    (this.modalInputs as NodeListOf<HTMLInputElement>)
      .forEach((input) => {
        input.addEventListener('keydown', (event: KeyboardEvent) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            this.savePersonFromModal;
          }
        });
      })

    this.addButton.addEventListener('click', () => this.handleAddButtonClick());
    this.saveButton.addEventListener('click', () => this.savePersonFromModal(false)); // Change this for dev

    this.closeModal();
    this.savePersonFromModal(false);

    const accordionList: NodeListOf<HTMLElement> = this.container.querySelectorAll(ACCORDION_SELECTOR);
    for (let i = 0; i < accordionList.length; i++) {
      const accordionElement = accordionList[i];
      accordionElement.dataset.index = i.toString();
      const accordion = new Accordion(accordionElement);
      this.accordionList.push(accordion);
      accordion.uiTrigger.addEventListener('click', () => {
        this.openAccordion(i);
        setTimeout(() => {
          accordion.scrollIntoView();
        }, 500);
      });
    }

    this.openAccordion(0);
  }

  private openAccordion(index: number) {
    for (let i = 0; i < this.accordionList.length; i++) {
      const accordion = this.accordionList[i];
      if (i === index && !accordion.isOpen) {
        accordion.open();
      } else if (i !== index && accordion.isOpen) {
        accordion.close();
      }
    }
  }

  private handleAddButtonClick() {
    this.clearModal();
    this.setLiveText("state", "Hinzufügen");
    this.setLiveText("full-name", "Neue Person");
    this.openModal();
    this.editingKey = null; // Reset editing state for adding a new person
  }

  private savePersonFromModal(validate: boolean = true) {
    const listValid = this.validateModal(validate)
    if (!listValid) {
      console.warn(`Couldn't save person. Please fill in all the values correctly.`);
      if (validate) return null;
    }

    const person: Person = this.extractData();
    if (this.savePerson(person)) {
      this.renderList();
      this.closeModal();
    }
  }

  private savePerson(person: Person): boolean {
    if (this.editingKey !== null) {
      // Update existing person
      people.set(this.editingKey, person);
    } else {
      // Generate a truly unique key for a new person
      const uniqueSuffix = crypto.randomUUID();
      const newKey = `${parameterize(person.getFullName())}-${uniqueSuffix}`;
      people.set(newKey, person);
    }
    return true;
  }

  private setLiveText(element: string, string: string): boolean {
    const liveElements: NodeListOf<HTMLElement> = this.modal.querySelectorAll(`[data-live-text="${element}"]`);
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

  private renderList() {
    this.list.innerHTML = ''; // Clear the current list
    this.list.dataset.length = people.size.toString();

    if (people.size) {
      people.forEach((person, key) => this.renderPerson(person, key));
      this.formMessage.reset();
    } else {
      this.formMessage.info("Bitte fügen Sie die mietenden personen hinzu.");
    }
  }

  private renderPerson(person: Person, key: string) {
    const newElement: HTMLElement = this.template.cloneNode(true) as HTMLElement;
    const props = ['full-name', 'phone', 'email', 'street', 'zip', 'city'];
    newElement.style.removeProperty('display');

    // Add event listeners for editing and deleting
    const editButton = newElement.querySelector('[data-person-action="edit"]');
    const deleteButton = newElement.querySelector('[data-person-action="delete"]');

    editButton!.addEventListener('click', () => {
      this.setLiveText("state", "bearbeiten");
      this.setLiveText("full-name", person.getFullName() || 'Neue Person');
      this.populateModal(person);
      this.openModal();
      this.editingKey = key; // Set editing key
    });

    deleteButton!.addEventListener('click', () => {
      people.delete(key); // Remove the person from the map
      this.renderList(); // Re-render the list
      this.closeModal();
    });

    props.forEach(prop => {
      const propSelector = `[data-${prop}]`;
      const el: HTMLElement | null = newElement.querySelector(propSelector);
      if (el && prop === 'full-name') {
        el.innerText = person.getFullName();
      } else if (el) {
        const currentField = person.personalData.getField(prop);
        if (!currentField) { console.error(`Render person: A field for "${prop}" doesn't exist.`); return; }
        el.innerText = currentField.value || currentField.label;
      }
    });
    this.list.appendChild(newElement);
  }

  private populateModal(person: Person) {
    this.groupElements.forEach((group) => {
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
          input.checked = field.checked;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (isCheckboxInput(input)) {
          input.checked = field.checked;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });
  }

  public validateArray(): boolean {
    let valid = true;

    // Validate if there are any people in the array (check if the `people` map has any entries)
    if (people.size === 0) {
      console.warn("Bitte fügen Sie mindestens eine mietende Person hinzu.");
      this.formMessage.error(`Bitte fügen Sie mindestens eine mietende Person hinzu.`);
      valid = false;
    } else {
      // Check if each person in the people collection is valid
      people.forEach((person, key) => {
        if (!person.validate()) {
          console.warn(`Person with key "${key}" is invalid.`);
          this.formMessage.error(`Bitte füllen Sie alle Felder für "${person.getFullName()}" aus.`);

          // setTimeout(() => {
          //   this.populateModal(person);
          //   this.openModal();
          //   this.validateModal();
          // }, 0);
          valid = false;  // If any person is invalid, set valid to false
        }
      });
    }

    return valid;
  }

  public openModal() {
    // Live text for name
    const personalDataGroup = this.modal.querySelector('[data-person-data-group="personalData"]')!;
    const nameInputs: NodeListOf<HTMLFormElement> = personalDataGroup.querySelectorAll('#first-name, #name');
    nameInputs.forEach((input) => {
      input.addEventListener('input', () => {
        const editingPerson: Person = this.extractData();
        this.setLiveText('full-name', editingPerson.getFullName() || 'Neue Person');
      });
    });
    this.formMessage.info();

    this.openAccordion(0);

    // Open modal
    this.modal.style.removeProperty('display');
    this.modal.classList.remove('is-closed');
    this.modal.dataset.state = 'open';
    document.body.style.overflow = "hidden";
  }

  public closeModal() {
    document.body.style.removeProperty("overflow");
    this.modal.classList.add('is-closed');
    this.modal.dataset.state = 'closed';
    this.list.scrollIntoView({
      behavior: "smooth",
      block: "center"
    })
    setTimeout(() => {
      this.modal.style.display = 'none';
    }, 500);
    this.clearModal();
  }

  private clearModal() {
    this.setLiveText('state', 'hinzufügen');
    this.setLiveText('full-name', 'Neue Person');
    this.modalInputs.forEach((input) => {
      if (isRadioInput(input)) {
        input.checked = false;
        clearRadioGroup(this.modal, input.name)
      } else if (isCheckboxInput(input)) {
        input.checked = false;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        input.value = '';
      }
    });
  }

  private validateModal(report: boolean = true): boolean {
    const allModalFields: NodeListOf<FormElement> = this.modal.querySelectorAll(FORM_INPUT_SELECTOR);
    const { valid, invalidField } = validateFields(allModalFields, report);

    if (valid === true) {
      return true;
    } else if (invalidField) {
      // Find the index of the accordion that contains the invalid field
      const accordionIndex = this.accordionIndexOf(invalidField);

      if (accordionIndex !== -1) {
        // Open the accordion containing the invalid field using the index
        this.openAccordion(accordionIndex);
        // Optionally, you can scroll the accordion into view
        setTimeout(() => {
          invalidField.scrollIntoView({
            behavior: "smooth",
            block: "center"
          })
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
  private accordionIndexOf(field: FormElement): number {
    let parentElement: HTMLElement | null = field.closest('[data-animate="accordion"]');

    if (parentElement) {
      // Find the index of the accordion in the accordionList based on the component
      const accordionIndex = this.accordionList.findIndex(accordion => accordion.component === parentElement);
      return accordionIndex !== -1 ? accordionIndex : -1; // Return the index or -1 if not found
    }

    return -1; // Return -1 if no accordion is found
  }


  private extractData(): Person {
    const personData = new Person();

    this.groupElements.forEach((group) => {
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

function initForm(formComponent: HTMLElement | null) {
  if (!formComponent) {
    console.error('Form component not found:', FORM_COMPONENT_SELECTOR)
    return false;
  }

  const form = formComponent.querySelector(FORM_SELECTOR) as HTMLFormElement | null; // Has to be a HTMLFormElement because its selector is the form tagname
  if (!form) {
    console.error(`The selected form component does not contain a HTMLFormElement. Perhaps you added ${FORM_COMPONENT_SELECTOR} to the form element itself rather than its parent element?\n\nForm Component:`, formComponent);
    return false;
  }

  initFormButtons(form);
  initCustomInputs(formComponent);
  initDecisions(formComponent);

  const formSteps = new FormSteps(formComponent);
  const personArray = new FormArray(formComponent, 'personArray');
  const beilagenGroup = new FormGroup(formComponent, ['upload', 'post'], 'validation message');
  formSteps.addCustomValidator(2, () => beilagenGroup.validate());
  formSteps.addCustomValidator(1, () => personArray.validateArray())
  formSteps.component.addEventListener('changeStep', () => personArray.closeModal());

  console.log(formSteps.getAllFormData());

  form.setAttribute('novalidate', '');
  form.dataset.state = 'initialized';
  formComponent.addEventListener('submit', (event) => {
    event.preventDefault();
    beilagenGroup.validate();
    formSteps.validateAllSteps();
    form.dataset.state = 'sending';
    handleSubmit(formComponent, form);
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

  // Form elements
  const successElement: HTMLElement | null = component.querySelector(FORM_SUCCESS_SELECTOR);
  const errorElement: HTMLElement | null = component.querySelector(FORM_ERROR_SELECTOR);
  const submitButton: HTMLInputElement | null = component.querySelector(FORM_SUBMIT_SELECTOR);

  if (!(submitButton instanceof HTMLInputElement) || submitButton.type !== 'submit') {
    throw new Error('The submitButton element is not an HTML input element with type="submit".');
  }

  submitButton.dataset.defaultText = submitButton.value; // save default text
  submitButton.value = submitButton.dataset.wait || 'Wird gesendet ...';

  const fields = [];

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

function validateFields(
  inputs: NodeListOf<FormElement>,
  report: boolean = true
): {
  valid: boolean,
  invalidField: FormElement | null
} {
  let valid = true; // Assume the step is valid unless we find a problem
  let invalidField: FormElement | null = null;

  for (const input of inputs) {
    if (!input.checkValidity()) {
      valid = false;
      if (report && !invalidField) {
        input.reportValidity();
        input.classList.add('has-error');
        input.addEventListener('change', () => {
          input.classList.remove('has-error')
        }, { once: true });
        invalidField = input; // Store the first invalid field
      }
      break;
    } else {
      input.classList.remove('has-error');
    }
  }

  return { valid, invalidField }
}

window.PEAKPOINT = {}
let people: Map<string, Person> = new Map();

window.PEAKPOINT.people = people;

const form: HTMLElement | null = document.querySelector(FORM_COMPONENT_SELECTOR);
form?.classList.remove('w-form');

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const selectElement = document.querySelector('#wohnung') as HTMLInputElement;

    const wohnungValue = params.get('wohnung');
    const option = selectElement.querySelector(`option[value="${wohnungValue}"]`);
    if (wohnungValue && option) {
      // If you want to handle cases where the value doesn't exist
      selectElement.value = wohnungValue;
    } else {
      console.warn(`No matching option for value: ${wohnungValue}`);
    }
  }

  const inizialized = initForm(form);
  console.log("Form initialized:", inizialized)
});

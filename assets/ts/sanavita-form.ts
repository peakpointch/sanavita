const W_CHECKBOX_CLASS = ".w-checkbox-input";
const W_RADIO_CLASS = ".w-radio-input";
const W_CHECKED_CLASS = "w--redirected-checked";

const FORM_COMPONENT_SELECTOR: string = '[data-form-element="component"]';
const FORM_SELECTOR: string = "form";
const FORM_SUCCESS_SELECTOR: string = '[data-form-element="success"]';
const FORM_ERROR_SELECTOR: string = '[data-form-element="error"]';
const FORM_SUBMIT_SELECTOR: string = '[data-form-element="submit"]';
const CHECKBOX_INPUT_SELECTOR: string = `.w-checkbox input[type="checkbox"]:not(${W_CHECKBOX_CLASS})`;
const RADIO_INPUT_SELECTOR: string = '.w-radio input[type="radio"]';
const FORM_INPUT_SELECTOR_LIST: string[] = [
  ".w-input",
  ".w-select",
  RADIO_INPUT_SELECTOR,
  CHECKBOX_INPUT_SELECTOR,
];
const FORM_INPUT_SELECTOR: string = FORM_INPUT_SELECTOR_LIST.join(", ");

const STEPS_COMPONENT_SELECTOR: string = '[data-steps-element="component"]';
const STEPS_LIST_SELECTOR: string = '[data-steps-element="list"]';
const STEPS_SELECTOR: string = '[data-steps-element="step"]';
const STEPS_NAVIGATION_SELECTOR: string = '[data-steps-element="navigation"]';
const STEPS_PAGINATION_SELECTOR: string = '[data-steps-element="pagination"]';
const STEPS_PAGINATION_ITEM_SELECTOR: string = "button[data-step-target]";
const STEPS_PREV_SELECTOR: string = '[data-steps-nav="prev"]';
const STEPS_NEXT_SELECTOR: string = '[data-steps-nav="next"]';
const STEPS_TARGET_SELECTOR: string = "[data-step-target]";

const ARRAY_LIST_SELECTOR: string = '[data-form-array-element="list"]';
const ARRAY_TEMPLATE_SELECTOR: string = '[data-person-element="template"]';
const ARRAY_EMPTY_STATE_SELECTOR: string = '[data-person-element="empty"]';
const ARRAY_ADD_SELECTOR: string = '[data-person-element="add"]';
const ARRAY_SAVE_SELECTOR: string = '[data-person-element="save"]';
const ARRAY_CANCEL_SELECTOR: string = '[data-person-element="cancel"]';
const ARRAY_GROUP_SELECTOR: string = "[data-person-data-group]";
const MODAL_SELECTOR: string = '[data-form-element="modal"]';
const MODAL_SCROLL_SELECTOR: string = '[data-modal-element="scroll"]';
const MODAL_STICKY_TOP_SELECTOR: string = '[data-modal-element="sticky-top"]';
const MODAL_STICKY_BOTTOM_SELECTOR: string =
  '[data-modal-element="sticky-bottom"]';

const ACCORDION_SELECTOR: string = `[data-animate="accordion"]`;

// Unique key to store form data in localStorage
const STORAGE_KEY = "formProgress";

const siteId: string = document.documentElement.dataset.wfSite || "";
const pageId: string = document.documentElement.dataset.wfPage || "";

type FormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
type GroupName =
  | "personalData"
  | "doctor"
  | "health"
  | "primaryRelative"
  | "secondaryRelative";
type Validator = () => boolean;
type MutliStepFormSettings = {
  navigation: {
    hideInStep: number;
  };
  excludeInputSelectors: string[];
};
type CustomFormComponent = {
  step: number;
  instance: any;
  validator: Validator;
  getData?: () => {};
};

interface Window {
  PEAKPOINT: any;
}

class Accordion {
  public component: HTMLElement;
  public trigger: HTMLElement;
  public uiTrigger: HTMLElement;
  public isOpen: boolean = false;
  private icon: HTMLElement;

  constructor(component: HTMLElement) {
    this.component = component;
    this.trigger = component.querySelector('[data-animate="trigger"]')!;
    this.uiTrigger = component.querySelector('[data-animate="ui-trigger"]')!;
    this.icon = component.querySelector('[data-animate="icon"]')!;

    this.uiTrigger.addEventListener("click", () => {
      this.toggle();
      // console.log("ACCORDION TRIGGER; OPEN:", this.isOpen);
    });
  }

  public open() {
    if (!this.isOpen) {
      this.trigger.click();
      setTimeout(() => {
        this.icon.classList.add("is-open");
      }, 200);
      this.isOpen = true;
    }
  }

  public close() {
    if (this.isOpen) {
      this.trigger.click();
      setTimeout(() => {
        this.icon.classList.remove("is-open");
      }, 200);
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
    const scrollWrapper: HTMLElement | null = this.component.closest(
      MODAL_SCROLL_SELECTOR
    );
    const elementPosition = this.component.getBoundingClientRect().top;

    // Check if there is a scrollable wrapper (like a modal)
    if (scrollWrapper) {
      const wrapperPosition = scrollWrapper.getBoundingClientRect().top;
      offset = scrollWrapper.querySelector(
        '[data-scroll-child="sticky"]'
      )!.clientHeight; // Height of sticky element

      scrollWrapper.scrollBy({
        top: elementPosition - wrapperPosition - offset - 2,
        behavior: "smooth",
      });
    } else {
      // If no scrollable wrapper, scroll the window instead
      window.scrollTo({
        top: elementPosition + window.scrollY - offset - 2,
        behavior: "smooth",
      });
    }
  }
}

class FieldGroup {
  fields: Map<string, Field>;

  constructor(fields: Map<string, Field> = new Map()) {
    this.fields = fields;
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
  primaryRelative: FieldGroup;
  secondaryRelative: FieldGroup;

  constructor(
    personalData = new FieldGroup(),
    doctor = new FieldGroup(),
    health = new FieldGroup(),
    primaryRelative = new FieldGroup(),
    secondaryRelative = new FieldGroup()
  ) {
    this.personalData = personalData;
    this.doctor = doctor;
    this.health = health;
    this.primaryRelative = primaryRelative;
    this.secondaryRelative = secondaryRelative;
  }

  public validate(): boolean {
    let valid = true;

    // Loop over the groups within the person object
    const groups = Object.keys(this) as GroupName[];

    groups.forEach((groupName) => {
      const group = this[groupName] as FieldGroup;

      // Assuming the group has a `fields` property
      if (group.fields) {
        group.fields.forEach((field) => {
          if (!(field instanceof Field)) {
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

    return valid; // Change this for dev
  }

  public getFullName(): string {
    return (
      `${this.personalData.getField("first-name")!.value} ${
        this.personalData.getField("name")!.value
      }`.trim() || "Neue Person"
    );
  }

  public serialize(): object {
    return {
      personalData: mapToObject(this.personalData.fields),
      doctor: mapToObject(this.doctor.fields),
      health: mapToObject(this.health.fields),
      primaryRelative: mapToObject(this.primaryRelative.fields),
      secondaryRelative: mapToObject(this.secondaryRelative.fields),
    };
  }

  public flatten(prefix: string): object {
    const fields: any = {};

    const groupNames = Object.keys(this) as GroupName[];
    for (const groupName of groupNames) {
      const group = this[groupName];

      group.fields.forEach((field, index) => {
        const fieldName = `${prefix}_${groupName}_${field.id}`;
        fields[fieldName] = field.value;
      });
    }

    return fields;
  }
}

// Helper function to convert an object to a Map of Field instances
function convertObjectToFields(fieldsObj: any): Map<string, Field> {
  const fieldsMap = new Map<string, Field>();
  Object.entries(fieldsObj).forEach(([key, fieldData]) => {
    const field = new Field(fieldData as FieldData);
    fieldsMap.set(key, field);
  });
  return fieldsMap;
}

// Helper function to deserialize a FieldGroup
function deserializeFieldGroup(fieldGroupData: any): FieldGroup {
  const fieldsMap = convertObjectToFields(fieldGroupData); // Convert object fields to Field instances
  return new FieldGroup(fieldsMap); // Create a new FieldGroup with the fields
}

// Main function to deserialize a Person
function deserializePerson(data: any): Person {
  return new Person(
    deserializeFieldGroup(data.personalData),
    deserializeFieldGroup(data.doctor),
    deserializeFieldGroup(data.health),
    deserializeFieldGroup(data.primaryRelative),
    deserializeFieldGroup(data.secondaryRelative)
  );
}

interface FieldData {
  id: string;
  label: string;
  value: any;
  required?: boolean;
  type: string;
  checked?: boolean;
}

class Field {
  public id: string;
  public label: string;
  public value: any;
  public required: boolean;
  public type: string;
  public checked: boolean;

  constructor(data: FieldData | null = null) {
    if (!data) {
      return;
    }

    this.id = data.id || `field-${Math.random().toString(36).substring(2)}`; // Generating unique id if missing
    this.label = data.label || `Unnamed Field`;
    this.value = data.value || "";
    this.required = data.required || false;
    this.type = data.type || "text";

    if (this.type === "radio" || "checkbox") {
      this.checked = data.checked || false;
    }

    if (this.type === "checkbox" && !this.checked) {
      console.log(this.label, this.type, this.checked, data.checked);
      this.value = "Nicht angewählt";
    }
  }

  public validate(report: boolean = true): boolean {
    let valid = true;

    // If the field is required, check if it has a valid value
    if (this.required) {
      if (this.type === "radio" || this.type === "checkbox") {
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

function FieldFromInput(input: FormElement, index): Field {
  if (input.type === "radio" && !(input as HTMLInputElement).checked) {
    return new Field();
  }

  const field = new Field({
    id: input.id || parameterize(input.dataset.name || `field ${index}`),
    label: input.dataset.name || `field ${index}`,
    value: input.value,
    required: input.required || false,
    type: input.type,
    checked:
      isCheckboxInput(input) || isRadioInput(input) ? input.checked : undefined,
  });

  return field;
}

class FormMessage {
  private messageFor: string;
  private component: HTMLElement;
  private messageElement: HTMLElement | null;
  public initialized: boolean = false;

  constructor(componentName: string, messageFor: string) {
    this.messageFor = messageFor;
    const component: HTMLElement | null = document.querySelector(
      `[data-message-component="${componentName}"][data-message-for="${this.messageFor}"]`
    );

    if (!component) {
      console.warn(
        `No FormMessage component was found: ${componentName}, ${this.messageFor}`
      );
      return;
    }

    this.component = component;
    this.messageElement =
      this.component?.querySelector('[data-message-element="message"]') || null;
    this.reset();
    this.initialized = true;
  }

  // Method to display an info message
  public info(message: string | null = null, silent: boolean = false): void {
    if (!this.initialized) return;
    if (!silent) {
      this.component.setAttribute("aria-live", "polite");
    }
    this.setMessage(message, "info", silent);
  }

  // Method to display an error message
  public error(message: string | null = null, silent: boolean = false): void {
    if (!this.initialized) return;
    if (!silent) {
      this.component.setAttribute("role", "alert");
      this.component.setAttribute("aria-live", "assertive");
    }
    this.setMessage(message, "error", silent);
  }

  // Method to reset/hide the message
  public reset(): void {
    if (!this.initialized) return;
    this.component.classList.remove("info", "error");
  }

  // Private method to set the message and style
  private setMessage(
    message: string | null = null,
    type: "info" | "error",
    silent: boolean = false
  ): void {
    if (!this.initialized) return;
    if (this.messageElement && message) {
      this.messageElement.textContent = message;
    } else if (!this.messageElement) {
      console.warn("Message text element not found.");
    }

    // Set class based on type
    this.component.classList.remove("info", "error");
    this.component.classList.add(type);

    if (silent) return;

    this.component.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}

class FormGroup {
  private form: HTMLFormElement;
  private container: HTMLElement;
  private groupNames: string[];
  private validationMessage: string;
  public formMessage: FormMessage;

  constructor(
    container: HTMLElement,
    groupNames: string[],
    validationMessage: string
  ) {
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

    // Initialize the form group by setting up event listeners
    this.initialize();
  }

  private initialize(): void {
    const allFields = this.getAllGroupFields();

    allFields.forEach((field) => {
      field.addEventListener("change", () => this.formMessage.reset());
    });
  }

  private getGroupFields(groupName: string): NodeListOf<FormElement> {
    return this.container.querySelectorAll(`[data-form-group="${groupName}"]`);
  }

  private getAllGroupFields(): NodeListOf<FormElement> {
    const selectorList = this.groupNames.map((groupName) => {
      return `[data-form-group="${groupName}"]`;
    });
    let selector: string = selectorList.join(", ");
    return this.container.querySelectorAll(selector);
  }

  public validate(): boolean {
    console.log("VALIDATING FORM GROUPS: ", this.groupNames);

    // Validate the groups and get the result
    const anyGroupValid = this.checkGroupValidity();

    // Handle error messages based on validation result
    this.handleValidationMessages(anyGroupValid);
    console.log(anyGroupValid);

    return anyGroupValid;
  }

  private checkGroupValidity(): boolean {
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

class FormDecision {
  private component: HTMLElement;
  private paths: HTMLElement[] = [];
  private id: string;
  private formMessage: FormMessage;
  private decisionInputs: NodeListOf<HTMLInputElement>;
  private errorMessages: { [key: string]: string } = {};
  private defaultErrorMessage: string = "Please complete the required fields.";

  constructor(component: HTMLElement | null, id: string | undefined) {
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
    this.formMessage = new FormMessage("FormDecision", id); // Assuming you want to initialize a FormMessage
    this.initialize();
  }

  private initialize() {
    // Find the decision element wrapper
    const decisionFieldsWrapper: HTMLElement =
      this.component.querySelector('[data-decision-element="decision"]') ||
      this.component;
    this.decisionInputs =
      decisionFieldsWrapper.querySelectorAll<HTMLInputElement>(
        "input[data-decision-action]"
      );

    // Ensure there are decision inputs
    if (this.decisionInputs.length === 0) {
      console.warn(
        `Decision component "${this.id}" does not contain any decision input elements.`
      );
      return;
    }

    // Iterate through the decision inputs
    this.decisionInputs.forEach((input) => {
      const path: HTMLElement | null = this.component.querySelector(
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

  private handleChange(path: HTMLElement | null, event: Event) {
    this.paths.forEach((entry) => {
      entry.style.display = "none";
    });

    if (path) {
      path.style.removeProperty("display");
    }

    this.updateRequiredAttributes();
  }

  private getSelectedInput(): HTMLInputElement | undefined {
    return Array.from(this.decisionInputs).find((input) => input.checked);
  }

  public validate(): boolean {
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

    // If no corresponding path, consider it valid
    const isValid = pathIndex === -1 || this.checkPathValidity(pathIndex);
    this.handleValidationMessages(isValid);

    return isValid;
  }

  public setErrorMessages(
    messages: { [key: string]: string },
    defaultMessage?: string
  ): void {
    this.errorMessages = messages;
    if (defaultMessage) {
      this.defaultErrorMessage = defaultMessage;
    }
  }

  private checkPathValidity(pathIndex: number): boolean {
    // Get the path element and the form inputs inside it
    const pathElement = this.paths[pathIndex];
    const inputs: NodeListOf<FormElement> =
      pathElement.querySelectorAll(FORM_INPUT_SELECTOR);

    // Validate the fields within the path element
    const { valid, invalidField } = validateFields(inputs, true);

    return valid;
  }

  private updateRequiredAttributes() {
    // For all paths, make inputs non-required by default
    this.paths.forEach((path) => {
      const inputs: NodeListOf<FormElement> = path.querySelectorAll(
        "input, select, textarea"
      );
      inputs.forEach((input) => {
        input.required = false;
      });
    });

    // For the currently selected path, set inputs with [data-decision-required="required"] as required
    const selectedInput = this.component.querySelector<HTMLInputElement>(
      "input[data-decision-action]:checked"
    );
    if (selectedInput) {
      const pathId =
        selectedInput.dataset.decisionAction || selectedInput.value;
      const selectedPath = this.paths.find(
        (path) => path.dataset.decisionPath === pathId
      );

      if (selectedPath) {
        const requiredFields: NodeListOf<FormElement> =
          selectedPath.querySelectorAll(
            '[data-decision-required="required"], [data-decision-required="true"]'
          );
        requiredFields.forEach((input) => {
          input.required = true;
        });
      }
    }
  }

  private handleValidationMessages(currentGroupValid: boolean): void {
    if (!currentGroupValid) {
      const selectedInput = this.getSelectedInput();
      const pathId =
        selectedInput?.dataset.decisionAction || selectedInput?.value;
      const customMessage =
        this.errorMessages[pathId!] || this.defaultErrorMessage;
      this.formMessage.error(customMessage);
    } else {
      this.formMessage.reset();
    }
  }
}

class FormArray {
  public id: string | number;
  public people: Map<string, Person>;
  private container: HTMLElement;
  private list: HTMLElement;
  private template: HTMLElement;
  private formMessage: FormMessage;
  private addButton: HTMLElement;
  public modal: HTMLElement;
  private modalForm: HTMLFormElement;
  private saveButton: HTMLElement;
  private cancelButtons: NodeListOf<HTMLButtonElement>;
  private modalInputs: NodeListOf<FormElement>;
  private groupElements: NodeListOf<FormElement>;
  private accordionList: Accordion[] = [];
  public initialized: boolean = false;

  private editingKey: string | null = null;

  constructor(container: HTMLElement, id: string | number) {
    this.id = id;
    this.container = container;
    this.people = new Map();
    this.list = this.container.querySelector(ARRAY_LIST_SELECTOR)!;
    this.template = this.list.querySelector(ARRAY_TEMPLATE_SELECTOR)!;
    this.addButton = this.container.querySelector(ARRAY_ADD_SELECTOR)!;
    this.formMessage = new FormMessage("FormArray", this.id.toString());
    this.modal = document.querySelector(
      MODAL_SELECTOR + `[data-modal-for="person"]`
    )!;
    this.modalForm = document.querySelector(FORM_SELECTOR)!;
    this.saveButton = this.modal.querySelector(ARRAY_SAVE_SELECTOR)!;
    this.cancelButtons = this.modal.querySelectorAll(ARRAY_CANCEL_SELECTOR)!;
    this.modalInputs = this.modal.querySelectorAll(FORM_INPUT_SELECTOR);
    this.groupElements = this.modal.querySelectorAll(ARRAY_GROUP_SELECTOR);

    this.initialize();
  }

  private initialize() {
    this.cancelButtons.forEach((button) => {
      button.addEventListener("click", () => this.handleCancel());
    });

    (this.modalInputs as NodeListOf<HTMLInputElement>).forEach((input) => {
      input.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "Enter") {
          event.preventDefault();
          this.savePersonFromModal();
        }
      });
      input.addEventListener("focusin", () => {
        const accordionIndex = this.accordionIndexOf(input);
        const accordionInstance = this.accordionList[accordionIndex];
        if (!accordionInstance.isOpen) {
          this.openAccordion(accordionIndex);
          setTimeout(() => {
            input.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }, 500);
        }
      });
    });

    this.addButton.addEventListener("click", () => this.addPerson());
    this.saveButton.addEventListener("click", () => this.savePersonFromModal()); // Change this for dev, validate: false

    this.renderList();
    this.closeModal();

    const accordionList: NodeListOf<HTMLElement> =
      this.container.querySelectorAll(ACCORDION_SELECTOR);
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
    this.initModal();
    this.initialized = true;
  }

  private initModal() {
    const modalContent: HTMLElement = this.modal.querySelector(
      MODAL_SCROLL_SELECTOR
    )!;
    const stickyFooter: HTMLElement | null = this.modal.querySelector(
      MODAL_STICKY_BOTTOM_SELECTOR
    );

    if (!modalContent || !stickyFooter) {
      console.warn("Init modal: required scroll elements not found");
      return;
    }

    modalContent.addEventListener("scroll", () => {
      const scrollHeight = modalContent.scrollHeight;
      const scrollTop = modalContent.scrollTop;
      const clientHeight = modalContent.clientHeight;

      const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 1;

      if (isScrolledToBottom) {
        stickyFooter.classList.remove("modal-scroll-shadow");
      } else {
        stickyFooter.classList.add("modal-scroll-shadow");
      }
    });
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

  private handleCancel() {
    this.closeModal();
  }

  private addPerson() {
    if (this.people.size === 2) {
      this.formMessage.error("Sie können nur max. 2 Personen hinzufügen.");
      setTimeout(() => this.formMessage.reset(), 5000);
      return;
    }
    this.clearModal();
    this.setLiveText("state", "Hinzufügen");
    this.setLiveText("full-name", "Neue Person");
    this.openModal();
    this.editingKey = null; // Reset editing state for adding a new person
  }

  private savePersonFromModal(validate: boolean = true) {
    const listValid = this.validateModal(validate);
    if (!listValid) {
      console.warn(
        `Couldn't save person. Please fill in all the values correctly.`
      );
      if (validate) return null;
    }

    const person: Person = this.extractData();
    if (this.savePerson(person)) {
      this.renderList();
      this.closeModal();
    }

    this.saveProgress();
  }

  private savePerson(person: Person): boolean {
    if (this.editingKey !== null) {
      // Update existing person
      this.people.set(this.editingKey, person);
    } else {
      // Generate a truly unique key for a new person
      const uniqueSuffix = crypto.randomUUID();
      const newKey = `person-${uniqueSuffix}`;
      this.people.set(newKey, person);
    }
    return true;
  }

  private setLiveText(element: string, string: string): boolean {
    const liveElements: NodeListOf<HTMLElement> = this.modal.querySelectorAll(
      `[data-live-text="${element}"]`
    );
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
    this.list.innerHTML = ""; // Clear the current list
    this.list.dataset.length = this.people.size.toString();

    if (this.people.size) {
      this.people.forEach((person, key) => this.renderPerson(person, key));
      this.formMessage.reset();
    } else {
      this.formMessage.info(
        "Bitte fügen Sie die Mieter (max. 2 Personen) hinzu.",
        !this.initialized
      );
    }
  }

  private renderPerson(person: Person, key: string) {
    const newElement: HTMLElement = this.template.cloneNode(
      true
    ) as HTMLElement;
    const props = ["full-name", "phone", "email", "street", "zip", "city"];
    newElement.style.removeProperty("display");

    // Add event listeners for editing and deleting
    const editButton = newElement.querySelector('[data-person-action="edit"]');
    const deleteButton = newElement.querySelector(
      '[data-person-action="delete"]'
    );

    editButton!.addEventListener("click", () => {
      this.setLiveText("state", "bearbeiten");
      this.setLiveText("full-name", person.getFullName() || "Neue Person");
      this.populateModal(person);
      this.openModal();
      this.editingKey = key; // Set editing key
    });

    deleteButton!.addEventListener("click", () => {
      this.people.delete(key); // Remove the person from the map
      this.renderList(); // Re-render the list
      this.closeModal();
      this.saveProgress();
    });

    props.forEach((prop) => {
      const propSelector = `[data-${prop}]`;
      const el: HTMLElement | null = newElement.querySelector(propSelector);
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

  private populateModal(person: Person) {
    this.groupElements.forEach((group) => {
      const groupInputs: NodeListOf<FormElement> =
        group.querySelectorAll(FORM_INPUT_SELECTOR);
      const groupName = group.dataset.personDataGroup! as GroupName;

      groupInputs.forEach((input) => {
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
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }

        if (isCheckboxInput(input)) {
          input.checked = field.checked;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    });
  }

  public validate(): boolean {
    let valid = true;

    // Validate if there are any people in the array (check if the `people` map has any entries)
    if (this.people.size === 0) {
      console.warn("Bitte fügen Sie mindestens eine mietende Person hinzu.");
      this.formMessage.error(
        `Bitte fügen Sie mindestens eine mietende Person hinzu.`
      );
      setTimeout(
        () =>
          this.formMessage.info(
            "Bitte fügen Sie die Mieter (max. 2 Personen) hinzu.",
            true
          ),
        5000
      );
      valid = false;
    } else {
      // Check if each person in the people collection is valid
      this.people.forEach((person, key) => {
        if (!person.validate()) {
          console.warn(
            `Bitte füllen Sie alle Felder für "${person.getFullName()}" aus.`
          );
          this.formMessage.error(
            `Bitte füllen Sie alle Felder für "${person.getFullName()}" aus.`
          );

          // setTimeout(() => {
          //   this.populateModal(person);
          //   this.openModal();
          //   this.validateModal();
          // }, 0);
          valid = false; // If any person is invalid, set valid to false
        }
      });
    }

    return valid;
  }

  public openModal() {
    // Live text for name
    const personalDataGroup = this.modal.querySelector(
      '[data-person-data-group="personalData"]'
    )!;
    const nameInputs: NodeListOf<HTMLFormElement> =
      personalDataGroup.querySelectorAll("#first-name, #name");
    nameInputs.forEach((input) => {
      input.addEventListener("input", () => {
        const editingPerson: Person = this.extractData();
        this.setLiveText(
          "full-name",
          editingPerson.getFullName() || "Neue Person"
        );
      });
    });
    this.formMessage.reset();

    this.openAccordion(0);

    // Open modal
    this.modal.style.removeProperty("display");
    this.modal.classList.remove("is-closed");
    this.modal.dataset.state = "open";
    document.body.style.overflow = "hidden";
  }

  public closeModal() {
    document.body.style.removeProperty("overflow");
    this.modal.classList.add("is-closed");
    this.modal.dataset.state = "closed";
    if (this.initialized) {
      this.list.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    setTimeout(() => {
      this.modal.style.display = "none";
    }, 500);
    this.clearModal();
  }

  private clearModal() {
    this.setLiveText("state", "hinzufügen");
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

  private validateModal(report: boolean = true): boolean {
    const allModalFields: NodeListOf<FormElement> =
      this.modal.querySelectorAll(FORM_INPUT_SELECTOR);
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
            block: "center",
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
  private accordionIndexOf(field: FormElement): number {
    let parentElement: HTMLElement | null = field.closest(
      '[data-animate="accordion"]'
    );

    if (parentElement) {
      // Find the index of the accordion in the accordionList based on the component
      const accordionIndex = this.accordionList.findIndex(
        (accordion) => accordion.component === parentElement
      );
      return accordionIndex !== -1 ? accordionIndex : -1; // Return the index or -1 if not found
    }

    return -1; // Return -1 if no accordion is found
  }

  private extractData(): Person {
    const personData = new Person();

    this.groupElements.forEach((group) => {
      const groupInputs: NodeListOf<FormElement> =
        group.querySelectorAll(FORM_INPUT_SELECTOR);
      const groupName = group.dataset.personDataGroup! as GroupName;

      if (!personData[groupName]) {
        console.error(`The group "${groupName}" doesn't exist.`);
        return;
      }

      groupInputs.forEach((input, index) => {
        const field = FieldFromInput(input, index);
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
  public saveProgress(): void {
    // Serialize the people map to an object
    const serializedPeople = peopleMapToObject(this.people);

    // Store the serialized data in localStorage
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
  public clearProgress(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing form progress from localStorage:", error);
    }
  }

  /**
   * Load the saved progress from localStorage
   */
  public loadProgress(): void {
    // Check if there's any saved data in localStorage
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {
      try {
        const deserializedData = JSON.parse(savedData);

        // Loop through the deserialized data and create Person instances
        for (const key in deserializedData) {
          if (deserializedData.hasOwnProperty(key)) {
            const personData = deserializedData[key];
            const person = deserializePerson(personData); // Deserialize the person object
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
}

class MultiStepForm {
  public component: HTMLElement;
  public formElement: HTMLFormElement;
  public formSteps: NodeListOf<HTMLElement>;
  private navigationElement: HTMLElement;
  private paginationItems: NodeListOf<HTMLElement>;
  private buttonsNext: NodeListOf<HTMLElement>;
  private buttonsPrev: NodeListOf<HTMLElement>;
  private currentStep: number = 0;
  private customComponents: Array<CustomFormComponent> = [];
  private successElement: HTMLElement | null;
  private errorElement: HTMLElement | null;
  private submitButton: HTMLInputElement | null;
  private settings: MutliStepFormSettings;
  public initialized: boolean = false;

  constructor(component: HTMLElement, settings: MutliStepFormSettings) {
    this.component = component;
    this.formElement = this.component.querySelector(
      FORM_SELECTOR
    ) as HTMLFormElement;
    this.settings = settings;

    if (!this.formElement) {
      throw new Error("Form element not found within the specified component.");
    }

    this.formSteps = this.component.querySelectorAll(STEPS_SELECTOR);
    this.paginationItems = this.component.querySelectorAll(
      STEPS_PAGINATION_ITEM_SELECTOR
    );
    this.navigationElement = this.component.querySelector(
      STEPS_NAVIGATION_SELECTOR
    )!;
    this.buttonsNext = this.component.querySelectorAll(STEPS_NEXT_SELECTOR);
    this.buttonsPrev = this.component.querySelectorAll(STEPS_PREV_SELECTOR);

    // Handle optional UI elements
    this.successElement = this.component.querySelector(FORM_SUCCESS_SELECTOR);
    this.errorElement = this.component.querySelector(FORM_ERROR_SELECTOR);
    this.submitButton = this.component.querySelector(
      FORM_SUBMIT_SELECTOR
    ) as HTMLInputElement | null;

    this.initialize();
  }

  private initialize(): void {
    if (!this.component.getAttribute("data-steps-element")) {
      console.error(
        `Form Steps: Component is not a steps component or is missing the attribute ${STEPS_COMPONENT_SELECTOR}.\nComponent:`,
        this.component
      );
      return;
    }

    if (!this.formSteps.length) {
      console.warn(
        `Form Steps: The selected list doesn't contain any steps. Skipping initialization. Provided List:`,
        this.component.querySelector(STEPS_LIST_SELECTOR)
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

  public addCustomComponent(
    step: number,
    instance: any,
    validator: () => boolean,
    getData?: () => any
  ): void {
    const customComponent: CustomFormComponent = {
      step: step,
      instance: instance,
      validator: validator,
      getData: getData,
    };
    this.customComponents.push(customComponent);
  }

  private async submitToWebflow(): Promise<void> {
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
      this.submitButton.value =
        this.submitButton.dataset.wait || "Wird gesendet ...";
    }

    const formData = this.buildJsonForWebflow();
    console.log(formData);

    // Submit form
    const success = await sendFormData(formData);

    if (success) {
      this.onFormSuccess();
    } else {
      this.onFormError();
    }
  }

  private buildJsonForWebflow(): any {
    const recaptcha = (
      this.formElement.querySelector("#g-recaptcha-response") as FormElement
    ).value;
    let customFields = {};
    this.customComponents.map((entry) => {
      customFields = {
        ...customFields,
        ...(entry.getData ? entry.getData() : {}),
      };
    });

    return {
      name: this.formElement.dataset.name,
      pageId: pageId,
      elementId: this.formElement.dataset.wfElementId,
      source: window.location.href,
      test: false,
      fields: {
        ...mapToObject(this.getAllFormData(), false),
        ...customFields,
        "g-recaptcha-response": recaptcha,
      },
      dolphin: false,
    };
  }

  private onFormSuccess(): void {
    if (this.errorElement) this.errorElement.style.display = "none";
    if (this.successElement) this.successElement.style.display = "block";
    this.formElement.style.display = "none";
    this.formElement.dataset.state = "success";
    this.formElement.dispatchEvent(new CustomEvent("formSuccess"));

    if (this.submitButton) {
      this.submitButton.value =
        this.submitButton.dataset.defaultText || "Submit";
    }
  }

  private onFormError(): void {
    if (this.errorElement) this.errorElement.style.display = "block";
    if (this.successElement) this.successElement.style.display = "none";
    this.formElement.dataset.state = "error";
    this.formElement.dispatchEvent(new CustomEvent("formError"));

    if (this.submitButton) {
      this.submitButton.value =
        this.submitButton.dataset.defaultText || "Submit";
    }
  }

  private setupSteps(): void {
    this.formSteps.forEach((step, index) => {
      step.dataset.stepId = index.toString();
      step.classList.toggle("hide", index !== this.currentStep);

      step
        .querySelectorAll<HTMLInputElement>(FORM_INPUT_SELECTOR) // Type necessary for keydown event
        .forEach((input) => {
          input.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.key === "Enter") {
              event.preventDefault();
              this.changeToNext();
            }
          });
        });
    });
  }

  private initPagination(): void {
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

  public changeToStep(target: number): void {
    if (this.currentStep === target && this.initialized) {
      // console.log('Change Form Step: Target step equals current step.');
      // console.log(`Step ${this.currentStep + 1}/${this.formSteps.length}`);
      return;
    }

    if (target > this.currentStep && this.initialized) {
      for (let step = this.currentStep; step < target; step++) {
        // Validate standard fields in the current step
        if (!this.validateCurrentStep(step)) {
          this.changeToStep(step);
          return;
        }
      }

      this.component.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    // Fire custom event before updating the visibility
    const event = new CustomEvent("changeStep", {
      detail: { previousStep: this.currentStep, currentStep: target },
    });
    this.component.dispatchEvent(event);

    this.updateStepVisibility(target);
    this.updatePagination(target);
    this.currentStep = target;
    console.log(`Step ${this.currentStep + 1}/${this.formSteps.length}`);
  }

  private updateStepVisibility(target: number): void {
    this.formSteps[this.currentStep].classList.add("hide");
    this.formSteps[target].classList.remove("hide");
  }

  private updatePagination(target: number): void {
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

    if (target === this.settings.navigation.hideInStep) {
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
    const basicError = `Validation failed for step: ${step + 1}/${
      this.formSteps.length
    }`;
    const currentStepElement = this.formSteps[step];
    const inputs: NodeListOf<FormElement> =
      currentStepElement.querySelectorAll(FORM_INPUT_SELECTOR);

    const filteredInputs = Array.from(inputs).filter((input) => {
      // Check if the input matches any exclude selectors or is inside an excluded wrapper
      const isExcluded = this.settings.excludeInputSelectors.some(
        (selector) => {
          return (
            input.closest(`${selector}`) !== null || input.matches(selector)
          );
        }
      );
      return !isExcluded;
    });

    let { valid } = validateFields(filteredInputs);

    if (!valid) {
      console.warn(`${basicError}: Standard validation is not valid`);
      return valid;
    }

    const customValidators: Validator[] = this.customComponents
      .filter((entry) => entry.step === step)
      .map((entry) => () => entry.validator());

    // Custom validations
    const customValid =
      customValidators?.every((validator) => validator()) ?? true;
    if (!customValid) {
      console.warn(`${basicError}: Custom validation is not valid`);
    }

    return valid && customValid;
  }

  public getFormDataForStep(step: number): Map<string, Field> {
    let fields: Map<string, Field> = new Map();

    const stepElement = this.formSteps[step];
    const stepInputs: NodeListOf<FormElement> =
      stepElement.querySelectorAll(FORM_INPUT_SELECTOR);
    stepInputs.forEach((input, inputIndex) => {
      const entry = FieldFromInput(input, inputIndex);
      if (entry?.id) {
        fields.set(entry.id, entry.value);
      }
    });

    return fields;
  }

  public getAllFormData(): Map<string, Field> {
    let fields: Map<string, Field> = new Map();

    this.formSteps.forEach((step, stepIndex) => {
      const stepData = this.getFormDataForStep(stepIndex);
      fields = new Map([...fields, ...stepData]);
    });

    return fields;
  }
}

function parameterize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD") // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics (accent marks)
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, "") // Trim hyphens from start and end
    .replace(/-+/g, "-"); // Collapse multiple hyphens
}

function toDashCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function toDataset(str) {
  return `${str.charAt(0).toUpperCase() + str.slice(1)}`;
}

function mapToObject(map: Map<any, any>, stringify: boolean = false): any {
  // Convert a Map to a plain object
  const obj: any = {};
  for (const [key, value] of map) {
    obj[key] =
      value instanceof Map
        ? mapToObject(value, stringify)
        : stringify
        ? JSON.stringify(value)
        : value; // Recursively convert if value is a Map
  }
  return obj;
}

/**
 * Converts an object to a `Map`. The function can perform either shallow or deep conversion based on the `deep` argument.
 *
 * @param {any} obj - The object to be converted to a `Map`. It can be any type, including nested objects.
 * @param {boolean} [deep=false] - A flag that determines whether the conversion should be deep (recursive) or shallow.
 * If set to `true`, nested objects will be recursively converted into `Map` objects. If set to `false`, only the top-level
 * properties will be converted, and nested objects will remain as plain objects.
 *
 * @returns {Map<any, any>} A `Map` object representing the input `obj`, where keys are the same as the object's
 * properties and values are the corresponding values of those properties.
 */
function objectToMap(obj: any, deep: boolean = false): Map<any, any> {
  const map = new Map();
  for (const [key, value] of Object.entries(obj)) {
    // Check if deep conversion is requested
    if (deep && value instanceof Object && !(value instanceof Map)) {
      map.set(key, objectToMap(value, true)); // Recursively convert nested objects
    } else {
      map.set(key, value); // Set the value as is for shallow conversion or non-objects
    }
  }
  return map;
}

function peopleMapToObject(people: Map<string, Person>): any {
  // Convert a Person's structure, which contains FieldGroups with fields as Maps
  const peopleObj: any = {};
  for (const [key, person] of people) {
    peopleObj[key] = person.serialize();
  }
  return peopleObj;
}

function flattenPeople(people: Map<string, Person>): any {
  let peopleObj: any = {};
  let peopleArray = [...people.values()];
  for (let i = 0; i < peopleArray.length; i++) {
    let person = peopleArray[i];
    peopleObj = { ...peopleObj, ...person.flatten(`person${i + 1}`) };
  }
  return peopleObj;
}

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function reinsertElement(element: HTMLElement): void {
  // Check if the element and its parent are defined
  if (!element || !element.firstElementChild) {
    console.warn("Element or its first element child is not defined.");
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
  return input instanceof HTMLInputElement && input.type === "radio";
}

function isCheckboxInput(input: FormElement): input is HTMLInputElement {
  return input instanceof HTMLInputElement && input.type === "checkbox";
}

async function sendFormData(formData): Promise<boolean> {
  const url = `https://webflow.com/api/v1/form/${siteId}`;
  const request: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/javascript, */*; q=0.01",
    },
    body: JSON.stringify(formData),
  };

  // return true;

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

function initFormButtons(form: HTMLFormElement) {
  const buttons = form.querySelectorAll("button");
  buttons.forEach((button) => {
    button.setAttribute("type", "button");
    button.addEventListener("click", (event) => {
      // event.preventDefault();
    });
  });
}

function clearRadioGroup(container: HTMLElement, name: string) {
  container
    .querySelectorAll<HTMLInputElement>(
      `${RADIO_INPUT_SELECTOR}[name="${name}"]`
    )
    .forEach((radio) => {
      radio.checked = false; // Uncheck all radios in the group
      const customRadio = radio
        .closest(".w-radio")
        ?.querySelector(W_RADIO_CLASS);
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
    ["radio", W_RADIO_CLASS],
  ];

  // Add change event listener for checkboxes
  container
    .querySelectorAll<HTMLInputElement>(CHECKBOX_INPUT_SELECTOR)
    .forEach((input) => {
      input.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        const customCheckbox = target
          .closest(".w-checkbox")
          ?.querySelector(W_CHECKBOX_CLASS);
        if (customCheckbox) {
          customCheckbox.classList.toggle(W_CHECKED_CLASS, target.checked);
        }
      });
    });

  // Add change event listener for radio buttons
  container
    .querySelectorAll<HTMLInputElement>('input[type="radio"]')
    .forEach((input) => {
      input.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        if (!target.checked) return;

        // Deselect other radios in the same group
        const name = target.name;
        container
          .querySelectorAll<HTMLInputElement>(
            `input[type="radio"][name="${name}"]`
          )
          .forEach((radio) => {
            const customRadio = radio
              .closest(".w-radio")
              ?.querySelector(W_RADIO_CLASS);
            if (customRadio) {
              customRadio.classList.remove(W_CHECKED_CLASS);
            }
          });

        // Add the checked class to the selected radio's custom container
        const selectedCustomRadio = target
          .closest(".w-radio")
          ?.querySelector(W_RADIO_CLASS);
        if (selectedCustomRadio) {
          selectedCustomRadio.classList.add(W_CHECKED_CLASS);
        }
      });
    });

  // Add focus and blur event listeners for checkboxes and radios
  inputTypes.forEach(([type, customClass]) => {
    container
      .querySelectorAll<HTMLInputElement>(
        `input[type="${type}"]:not(${customClass})`
      )
      .forEach((input) => {
        input.addEventListener("focus", (event) => {
          const target = event.target as HTMLInputElement;
          const customElement = target
            .closest(".w-checkbox, .w-radio")
            ?.querySelector(customClass);
          if (customElement) {
            customElement.classList.add(focusClass);
            if (target.matches(focusVisibleSelector)) {
              customElement.classList.add(focusVisibleClass);
            }
          }
        });

        input.addEventListener("blur", (event) => {
          const target = event.target as HTMLInputElement;
          const customElement = target
            .closest(".w-checkbox, .w-radio")
            ?.querySelector(customClass);
          if (customElement) {
            customElement.classList.remove(focusClass, focusVisibleClass);
          }
        });
      });
  });
}

function validateFields(
  inputs: NodeListOf<FormElement> | FormElement[],
  report: boolean = true
): {
  valid: boolean;
  invalidField: FormElement | null;
} {
  let valid = true; // Assume the step is valid unless we find a problem
  let invalidField: FormElement | null = null;

  for (const input of inputs) {
    if (!input.checkValidity()) {
      valid = false;
      if (report && !invalidField) {
        input.reportValidity();
        input.classList.add("has-error");
        if (isCheckboxInput(input)) {
          input.parentElement
            ?.querySelector(W_CHECKBOX_CLASS)
            ?.classList.add("has-error");
        }
        input.addEventListener(
          "change",
          () => {
            input.classList.remove("has-error");
            if (isCheckboxInput(input)) {
              input.parentElement
                ?.querySelector(W_CHECKBOX_CLASS)
                ?.classList.remove("has-error");
            }
          },
          { once: true }
        );
        invalidField = input; // Store the first invalid field
      }
      break;
    } else {
      input.classList.remove("has-error");
    }
  }

  return { valid, invalidField };
}

function decisionSelector(id?: number | string) {
  return id ? `[data-decision-component="${id}"]` : `[data-decision-component]`;
}

function initializeFormDecisions(
  form: MultiStepForm,
  errorMessages: { [id: string]: { [key: string]: string } },
  defaultMessages: { [id: string]: string } = {}
): void {
  form.formSteps.forEach((step, stepIndex) => {
    const formDecisions = step.querySelectorAll<HTMLElement>(
      decisionSelector()
    );

    formDecisions.forEach((element) => {
      const id = element.dataset.decisionComponent;
      const decision = new FormDecision(element, id);

      // Set error messages for this FormDecision if available
      if (id && errorMessages[id]) {
        decision.setErrorMessages(errorMessages[id], defaultMessages[id]);
      }

      // Add the FormDecision as a custom component to the form
      form.addCustomComponent(stepIndex, decision, () => decision.validate());
    });
  });
}

function initializeOtherFormDecisions(
  form: HTMLElement,
  errorMessages: { [id: string]: { [key: string]: string } },
  defaultMessages: { [id: string]: string } = {}
): void {
  const formDecisions = form.querySelectorAll<HTMLElement>(decisionSelector());

  formDecisions.forEach((element) => {
    const id = element.dataset.decisionComponent;
    const decision = new FormDecision(element, id);

    // Set error messages for this FormDecision if available
    if (id && errorMessages[id]) {
      decision.setErrorMessages(errorMessages[id], defaultMessages[id]);
    }
  });
}

function insertSearchParamValues(): void {
  if (window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const selectElement = document.querySelector(
      "#wohnung"
    ) as HTMLInputElement;

    const wohnungValue = params.get("wohnung");
    const option = selectElement.querySelector(
      `option[value="${wohnungValue}"]`
    );
    if (wohnungValue && option) {
      // If you want to handle cases where the value doesn't exist
      selectElement.value = wohnungValue;
    } else {
      console.warn(`No matching option for value: ${wohnungValue}`);
    }
  }
}

window.PEAKPOINT = {};

const formElement: HTMLElement | null = document.querySelector(
  FORM_COMPONENT_SELECTOR
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
      hideInStep: 0,
    },
    excludeInputSelectors: [
      '[data-decision-path="upload"]',
      "[data-decision-component]",
    ],
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
      upload: "Bitte laden Sie alle Beilagen hoch.",
    },
  };

  const defaultMessages = {
    beilagenSenden: `Bitte laden Sie alle Beilagen hoch oder wählen Sie die Option "Beilagen per Post senden".`,
  };

  initializeOtherFormDecisions(
    peopleArray.modal,
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

// Imports
import createAttribute from "@peakflow/attributeselector";
import {
  isCheckboxInput,
  isRadioInput,
  initCustomInputs,
  clearRadioGroup,
  sendFormData,
  validateFields,
  formElementSelector,
  fieldFromInput
} from "@peakflow/form";
import wf from "@peakflow/webflow";
import { HTMLFormInput, CustomValidator } from "@peakflow/form";
import { FormMessage, FormDecision, FormField, FieldData, FieldGroup } from "@peakflow/form";
import Accordion from "@peakflow/accordion";
import Modal from "@peakflow/modal";

// Types
type GroupName =
  | "personalData"
  | "doctor"
  | "health"
  | "primaryRelative"
  | "secondaryRelative";
type FormOptions = {
  excludeInputSelectors: string[];
  recaptcha: boolean;
}
interface MultiStepFormOptions extends FormOptions {
  navigation: {
    hideInStep: number;
  };
};
type CustomFormComponent = {
  step: number;
  instance: any;
  validator: CustomValidator;
  getData?: () => {};
};
type StepsComponentElement = 'component' | 'list' | 'step' | 'navigation' | 'pagination';
type StepsNavElement = 'prev' | 'next';
type PersonElement = 'template' | 'empty' | 'add' | 'save' | 'cancel';

// Selector functions
const stepsElementSelector = createAttribute<StepsComponentElement>('data-steps-element');
const stepsTargetSelector = createAttribute<string>('data-step-target');
const stepsNavSelector = createAttribute<StepsNavElement>('data-steps-nav');
const personSelector = createAttribute<PersonElement>('data-person-element')

const STEPS_PAGINATION_ITEM_SELECTOR: string = `button${stepsTargetSelector()}`;
const ARRAY_LIST_SELECTOR: string = '[data-form-array-element="list"]';
const ARRAY_GROUP_SELECTOR: string = "[data-person-data-group]";
const ACCORDION_SELECTOR: string = `[data-animate="accordion"]`;

// Unique key to store form data in localStorage
const STORAGE_KEY = "formProgress";

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

  public getFullName(): string {
    return (
      `${this.personalData.getField("first-name")!.value} ${this.personalData.getField("name")!.value
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
function convertObjectToFields(fieldsObj: any): Map<string, FormField> {
  const fieldsMap = new Map<string, FormField>();
  Object.entries(fieldsObj).forEach(([key, fieldData]) => {
    const field = new FormField(fieldData as FieldData);
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

  private getGroupFields(groupName: string): NodeListOf<HTMLFormInput> {
    return this.container.querySelectorAll(`[data-form-group="${groupName}"]`);
  }

  private getAllGroupFields(): NodeListOf<HTMLFormInput> {
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

class FormModal extends Modal { }

class FormArray {
  public id: string | number;
  public people: Map<string, Person>;
  private container: HTMLElement;
  private list: HTMLElement;
  private template: HTMLElement;
  private formMessage: FormMessage;
  private addButton: HTMLElement;
  public modal: FormModal;
  public modalElement: HTMLElement;
  private modalForm: HTMLFormElement;
  private saveButton: HTMLElement;
  private cancelButtons: NodeListOf<HTMLButtonElement>;
  private modalInputs: NodeListOf<HTMLFormInput>;
  private groupElements: NodeListOf<HTMLFormInput>;
  private accordionList: Accordion[] = [];
  public initialized: boolean = false;

  private editingKey: string | null = null;

  constructor(container: HTMLElement, id: string | number) {
    this.id = id;
    this.container = container;
    this.people = new Map();
    this.list = this.container.querySelector(ARRAY_LIST_SELECTOR)!;
    this.template = this.list.querySelector(personSelector('template'))!;
    this.addButton = this.container.querySelector(personSelector('add'))!;
    this.formMessage = new FormMessage("FormArray", this.id.toString());
    this.modalForm = document.querySelector('form')!;

    // Form Modal
    this.modalElement = document.querySelector(
      formElementSelector('modal') + `[data-modal-for="person"]`
    )!;
    this.modal = new FormModal(this.modalElement);
    this.saveButton = this.modalElement.querySelector(personSelector('save'))!;
    this.cancelButtons = this.modalElement.querySelectorAll(
      personSelector('cancel')
    )!;
    this.modalInputs = this.modalElement.querySelectorAll(wf.select.formInput);
    this.groupElements =
      this.modalElement.querySelectorAll(ARRAY_GROUP_SELECTOR);

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
          this.openAccordion(accordionIndex, this.accordionList);
          setTimeout(() => {
            input.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }, 500);
        }
      });
    });

    this.saveButton.addEventListener("click", () => this.savePersonFromModal()); // Change this for dev, validate: false
    this.addButton.addEventListener("click", () => this.addPerson());

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
        this.openAccordion(i, this.accordionList);
        setTimeout(() => {
          accordion.scrollIntoView();
        }, 500);
      });
    }

    this.openAccordion(0, this.accordionList);
    this.initialized = true;
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
    const liveElements: NodeListOf<HTMLElement> =
      this.modalElement.querySelectorAll(`[data-live-text="${element}"]`);
    let valid = true;
    for (const element of Array.from(liveElements)) {
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
      const groupInputs: NodeListOf<HTMLFormInput> =
        group.querySelectorAll(wf.select.formInput);
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

    return valid; // Change this for dev: true | valid
  }

  public openModal(): void {
    // Live text for name
    const personalDataGroup = this.modalElement.querySelector(
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

    this.openAccordion(0, this.accordionList);

    this.modal.open();
  }

  public closeModal(): void {
    this.modal.close();
    if (this.initialized) {
      this.list.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    this.clearModal();
  }

  private clearModal() {
    this.setLiveText("state", "hinzufügen");
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

  private validateModal(report: boolean = true): boolean {
    const allModalFields: NodeListOf<HTMLFormInput> =
      this.modalElement.querySelectorAll(wf.select.formInput);
    const { valid, invalidField } = validateFields(allModalFields, report);

    if (valid === true) {
      return true;
    } else if (invalidField) {
      // Find the index of the accordion that contains the invalid field
      const accordionIndex = this.accordionIndexOf(invalidField);

      if (accordionIndex !== -1) {
        // Open the accordion containing the invalid field using the index
        this.openAccordion(accordionIndex, this.accordionList);
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

  private openAccordion(index: number, accordionList: Accordion[]) {
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
  private accordionIndexOf(field: HTMLFormInput): number {
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
      const groupInputs: NodeListOf<HTMLFormInput> =
        group.querySelectorAll(wf.select.formInput);
      const groupName = group.dataset.personDataGroup! as GroupName;

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
  public initialized: boolean = false;
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
  private options: MultiStepFormOptions;

  constructor(component: HTMLElement, options: MultiStepFormOptions) {
    this.component = component;
    this.formElement = this.component.querySelector<HTMLFormElement>('form');
    this.options = options;

    if (!this.formElement) {
      throw new Error("Form element not found within the specified component.");
    }

    this.formSteps = this.component.querySelectorAll(stepsElementSelector('step'));
    this.paginationItems = this.component.querySelectorAll(STEPS_PAGINATION_ITEM_SELECTOR);
    this.navigationElement = this.component.querySelector(stepsElementSelector('navigation'));
    this.buttonsNext = this.component.querySelectorAll(stepsNavSelector('next'));
    this.buttonsPrev = this.component.querySelectorAll(stepsNavSelector('prev'));

    // Handle optional UI elements
    this.successElement = this.component.querySelector(formElementSelector('success'));
    this.errorElement = this.component.querySelector(formElementSelector('error'));
    this.submitButton = this.component.querySelector<HTMLInputElement>(formElementSelector('submit'));

    this.initialize();
  }

  private initialize(): void {
    if (!this.component.getAttribute("data-steps-element")) {
      console.error(
        `Form Steps: Component is not a steps component or is missing the attribute ${stepsElementSelector('component')}.\nComponent:`,
        this.component
      );
      return;
    }

    if (!this.formSteps.length) {
      console.warn(
        `Form Steps: The selected list doesn't contain any steps. Skipping initialization. Provided List:`,
        this.component.querySelector(stepsElementSelector('list'))
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
    const customFields = this.customComponents.reduce((acc, entry) => {
      return {
        ...acc,
        ...(entry.getData ? entry.getData() : {}),
      };
    }, {});

    const fields = {
      ...mapToObject(this.getAllFormData(), false),
      ...customFields,
    }

    if (this.options.recaptcha) {
      const recaptcha = (this.formElement.querySelector("#g-recaptcha-response") as HTMLFormInput).value;
      fields["g-recaptcha-response"] = recaptcha;
    }

    return {
      name: this.formElement.dataset.name,
      pageId: wf.pageId,
      elementId: this.formElement.dataset.wfElementId,
      source: window.location.href,
      test: false,
      fields: fields,
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
        .querySelectorAll<HTMLInputElement>(wf.select.formInput) // Type necessary for keydown event
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
    const basicError = `Validation failed for step: ${step + 1}/${this.formSteps.length
      }`;
    const currentStepElement = this.formSteps[step];
    const inputs: NodeListOf<HTMLFormInput> =
      currentStepElement.querySelectorAll(wf.select.formInput);

    const filteredInputs = Array.from(inputs).filter((input) => {
      // Check if the input matches any exclude selectors or is inside an excluded wrapper
      const isExcluded = this.options.excludeInputSelectors.some(
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

    const customValidators: CustomValidator[] = this.customComponents
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

  public getFormDataForStep(step: number): Map<string, FormField> {
    let fields: Map<string, FormField> = new Map();

    const stepElement = this.formSteps[step];
    const stepInputs: NodeListOf<HTMLFormInput> =
      stepElement.querySelectorAll(wf.select.formInput);
    stepInputs.forEach((input, inputIndex) => {
      const entry = fieldFromInput(input, inputIndex);
      if (entry?.id) {
        fields.set(entry.id, entry.value);
      }
    });

    return fields;
  }

  public getAllFormData(): Map<string, FormField> {
    //let fields: Map<string, FormField> = new Map();
    //
    //this.formSteps.forEach((step, stepIndex) => {
    //  const stepData = this.getFormDataForStep(stepIndex);
    //  fields = new Map([...fields, ...stepData]);
    //});

    const fields = Array.from(this.formSteps).reduce((acc, entry, stepIndex) => {
      const stepData = this.getFormDataForStep(stepIndex);
      return new Map([
        ...acc,
        ...stepData
      ]);
    }, new Map());

    return fields;
  }
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

function initFormButtons(form: HTMLFormElement) {
  const buttons = form.querySelectorAll("button");
  buttons.forEach((button) => {
    button.setAttribute("type", "button");
    button.addEventListener("click", (event) => {
      // event.preventDefault();
    });
  });
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

const formElement: HTMLElement | null = document.querySelector(
  formElementSelector('component')
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
    recaptcha: true,
    excludeInputSelectors: [
      '[data-decision-path="upload"]',
      '[data-decision-component]',
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

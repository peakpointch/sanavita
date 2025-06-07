// Imports
import createAttribute, { exclude } from "@peakflow/attributeselector";
import {
  isCheckboxInput,
  isRadioInput,
  initWfInputs,
  clearRadioGroup,
  sendFormData,
  validateFields,
  formElementSelector,
  fieldFromInput,
  removeErrorClasses,
  enforceButtonTypes,
  FormFieldMap,
  isFormInput
} from "@peakflow/form";
import wf from "@peakflow/webflow";
import { HTMLFormInput, CustomValidator } from "@peakflow/form";
import { FormMessage, FormDecision } from "@peakflow/form";
import Accordion from "@peakflow/accordion";
import Modal from "@peakflow/modal";
import AlertDialog from "@peakflow/alertdialog";
import {
  ResidentProspect,
  GroupName,
  prospectMapToObject,
  flattenProspects,
} from "./residentprospect";
import mapToObject from "@peakflow/maptoobject"
import deepMerge from "@peakflow/deepmerge";

// Types
type FormOptions = {
  excludeInputSelectors: string[];
  recaptcha: boolean;
}
interface MultiStepFormOptions extends FormOptions {
  navigation: {
    hideInStep: number;
  };
  pagination: {
    doneClass: string;
    activeClass: string;
  }
  onStepChange?: StepChangeCallback;
  nested: boolean;
};
type StepChangeCallback = (options: {
  index: number;
  currentStep: HTMLElement;
  targetStep: HTMLElement;
}) => void;
type CustomFormComponent = {
  stepIndex: number;
  instance: any;
  validator: CustomValidator;
  getData?: () => {};
};
type StepsComponentElement = 'component' | 'list' | 'step' | 'navigation' | 'pagination' | 'custom-component';
type StepsNavElement = 'prev' | 'next';
type ProspectElement = 'template' | 'add' | 'edit' | 'delete' | 'save' | 'draft' | 'draft-badge' | 'cancel';

// Selector functions
const stepsElementSelector = createAttribute<StepsComponentElement>('data-steps-element', {
  defaultExclusions: ['[data-steps-element="component"] [data-steps-element="component"] *']
});
const stepsTargetSelector = createAttribute<string>('data-step-target');
const stepsNavSelector = createAttribute<StepsNavElement>('data-steps-nav');
const prospectSelector = createAttribute<ProspectElement>('data-prospect-element')

const LINK_FIELDS_ATTR = `data-link-fields`;
const FIELD_GROUP_ATTR = `data-prospect-field-group`;
const STEPS_PAGINATION_ITEM_SELECTOR: string = `button${stepsTargetSelector()}`;
const ARRAY_LIST_SELECTOR: string = '[data-form-array-element="list"]';
const FIELD_GROUP_SELECTOR: string = `[${FIELD_GROUP_ATTR}]`;
const ACCORDION_SELECTOR: string = `[data-animate="accordion"]`;

// Unique key to store form data in localStorage
const STORAGE_KEY = "formProgress";

class FormArray {
  public initialized: boolean = false;
  public id: string | number;
  public prospects: Map<string, ResidentProspect>;
  public modal: Modal;
  public modalElement: HTMLElement;
  public alertDialog: AlertDialog = getAlertDialog();
  private container: HTMLElement;
  private list: HTMLElement;
  private template: HTMLElement;
  private formMessage: FormMessage;
  private addButton: HTMLElement;
  private saveButton: HTMLElement;
  private draftButton: HTMLElement;
  private cancelButtons: NodeListOf<HTMLButtonElement>;
  private modalInputs: NodeListOf<HTMLFormInput>;
  private groupElements: NodeListOf<HTMLFormInput>;
  private accordionList: Accordion[] = [];

  private editingKey: string | null = null;
  private unsavedProspect: ResidentProspect | null = null;

  constructor(container: HTMLElement, id: string | number) {
    this.id = id;
    this.container = container;
    this.prospects = new Map();
    this.list = this.container.querySelector(ARRAY_LIST_SELECTOR)!;
    this.template = this.list.querySelector(prospectSelector('template'))!;
    this.addButton = this.container.querySelector(prospectSelector('add'))!;
    this.formMessage = new FormMessage("FormArray", this.id.toString());

    // Form Modal
    this.modalElement = Modal.select('component', 'resident-prospect');
    this.modal = new Modal(this.modalElement, {
      animation: {
        type: "growIn",
        duration: 300,
      },
      bodyScroll: {
        lock: true,
        smooth: true,
      }
    });
    this.saveButton = this.modalElement.querySelector(prospectSelector('save'))!;
    this.draftButton = this.modalElement.querySelector(prospectSelector('draft'))!;
    this.cancelButtons = this.modalElement.querySelectorAll(
      prospectSelector('cancel')
    )!;
    this.modalInputs = this.modalElement.querySelectorAll(wf.select.formInput);
    this.groupElements =
      this.modalElement.querySelectorAll(FIELD_GROUP_SELECTOR);

    this.initialize();
  }

  private initialize(): void {
    this.cancelButtons.forEach((button) => {
      button.addEventListener("click", () => this.discardChanges());
    });

    (this.modalInputs as NodeListOf<HTMLInputElement>).forEach((input) => {
      input.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "Enter") {
          event.preventDefault();
          this.saveProspectFromModal({ validate: true, report: true });
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

    this.saveButton.addEventListener("click", () => {
      this.saveProspectFromModal({ validate: true, report: true });
    });
    this.draftButton.addEventListener("click", () => {
      this.saveProspectFromModal({ validate: false, report: false });
    });
    this.addButton.addEventListener("click", () => this.startNewProspect());

    this.initializeLinkedFields();

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

  private initializeLinkedFields(): void {
    const links = this.modalElement.querySelectorAll<HTMLElement>(`[${LINK_FIELDS_ATTR}]`);

    links.forEach(link => {
      const checkbox: HTMLInputElement = link.querySelector(wf.select.checkboxInput);
      checkbox.addEventListener('change', () => {
        if (!this.initialized || !this.modal.opened) return;
        if (checkbox.checked) {
          this.linkFields(link);
        } else {
          this.unlinkFields(link);
        }
      })
    });
  }

  private linkFields(linkElement: HTMLElement): void {
    const checkbox: HTMLInputElement = linkElement.querySelector(wf.select.checkboxInput);
    checkbox.checked = true;

    const otherProspect = this.getOtherProspect();
    if (!otherProspect) throw new Error(`Couldn't get otherProspect.`);

    const inputIds = linkElement.getAttribute(LINK_FIELDS_ATTR)
      ?.split(',')
      .map(id => id.trim());

    if (inputIds.length === 0 || inputIds.some(id => id === '')) {
      throw new Error(`Please specify the ids of the fields you want to link. Ensure no ids are an empty string.`);
    }

    const fieldGroupElement = linkElement.closest(FIELD_GROUP_SELECTOR);
    const fieldGroupName = fieldGroupElement?.getAttribute(FIELD_GROUP_ATTR) as GroupName;
    const sourceFieldGroup = otherProspect[fieldGroupName];

    inputIds.forEach(id => {
      const input = fieldGroupElement.querySelector(`#${id}`);
      if (!input || !isFormInput(input)) {
        throw new TypeError(
          `FormArray "ResidentProspect": The selected input for field-link is not a "HTMLFormInput"`
        );
      }

      input.value = sourceFieldGroup.getField(id)?.value;
    });
  }

  private unlinkFields(linkElement: HTMLElement): void {
    const checkbox: HTMLInputElement = linkElement.querySelector(wf.select.checkboxInput);
    checkbox.checked = false;

    const inputIds = linkElement.getAttribute(LINK_FIELDS_ATTR)
      ?.split(',')
      .map(id => id.trim());

    if (inputIds.length === 0 || inputIds.some(id => id === '')) {
      throw new Error(`Please specify the ids of the fields you want to link. Ensure no ids are an empty string.`);
    }

    const fieldGroupElement = linkElement.closest(FIELD_GROUP_SELECTOR);

    inputIds.forEach(id => {
      const input = fieldGroupElement.querySelector(`#${id}`);
      if (!input ||
        !(input instanceof HTMLInputElement) &&
        !(input instanceof HTMLSelectElement) &&
        !(input instanceof HTMLTextAreaElement)
      ) {
        throw new TypeError(
          `FormArray "ResidentProspect": The selected input for field-link is not a "HTMLFormInput"`
        );
      }

      input.value = null;
    });
  }

  private unlinkAllProspects(): void {
    this.prospects.forEach(prospect => prospect.linkedFields.clear());
  }

  /**
   * Updates the values of the linked fields inside `target` with the ones from `source`.
   *
   * @param id The id of the group of the linked fields
   */
  private syncLinkedFields(id: string, source: ResidentProspect, target: ResidentProspect): void {
    if (!source || !target) throw new Error(`The source or target ResidentProspect is not defined.`);

    const linkedFields = source.linkedFields.get(id);
    target.linkFields(id, linkedFields.group, linkedFields.fields);
    linkedFields.fields.forEach((fieldId) => {
      const sourceValue = source[linkedFields.group].getField(fieldId).value;
      target[linkedFields.group].getField(fieldId).setValue(sourceValue);
    });
  }

  /**
   * Sync all linked fields of `target` with the ones from `source`.
   */
  private syncLinkedFieldsAll(source: ResidentProspect, target: ResidentProspect): void {
    if (!source || !target) throw new Error(`The source or target ResidentProspect is not defined.`);

    target.linkedFields.clear();
    Array.from(source.linkedFields.keys()).forEach((groupId) => {
      this.syncLinkedFields(groupId, source, target);
    });
  }

  private handleLinkedFieldsVisibility(): void {
    const length: number = this.unsavedProspect === null
      ? this.prospects.size
      : this.prospects.size + 1;

    const links = this.modalElement.querySelectorAll<HTMLElement>(`[${LINK_FIELDS_ATTR}]`);

    if (length < 2) {
      links.forEach(link => {
        link.style.display = 'none';
      });
    } else {
      const otherProspect = this.getOtherProspect();
      if (!otherProspect) throw new Error(`Couldn't get otherProspect.`);
      links.forEach(link => {
        this.setLiveText('other-prospect-full-name', otherProspect.getFullName());
        link.style.removeProperty('display');
      });
    }
  }

  /**
   * Retrieves a `ResidentProspect` instance from a given key or returns the provided `ResidentProspect` directly.
   * 
   * @param prospectOrKey - Either the key of the prospect or the prospect object itself.
   * @returns {ResidentProspect} The corresponding `ResidentProspect` object.
   * @throws Error if the prospect with the given key is not found.
   */
  private getProspect(prospectOrKey: ResidentProspect | string): ResidentProspect {
    const prospect = typeof prospectOrKey === "string"
      ? this.prospects.get(prospectOrKey)
      : prospectOrKey;

    if (!prospect) {
      throw new Error(`Prospect not found: ${prospectOrKey}`);
    }

    return prospect;
  }

  /**
   * Gets the ResidentProspect currently being edited via the `editingKey` property.
   */
  private getEditingProspect(): ResidentProspect | undefined {
    if (this.editingKey === null) {
      return undefined;
    } else if (this.editingKey.startsWith('unsaved')) {
      return this.unsavedProspect;
    } else {
      return this.prospects.get(this.editingKey);
    }
  }

  private getOtherProspect(): ResidentProspect | undefined {
    // TODO: Getting the prospect which is currently not being edited this way might not be accurate.
    // Update: is this done now @chatgpt?

    if (!this.editingKey) {
      throw new Error(`Can't get other prospect if no prospect is currently being edited.`);
    }

    const editingProspect = this.getEditingProspect();
    return Array.from(this.prospects.values())
      .find((prospect) => {
        return prospect.key !== editingProspect.key;
      });
  }

  /**
   * Opens an alert dialog to confirm canceling the changes made to the current ResidentProspect.
   */
  private async discardChanges(): Promise<void> {
    const lastSaved = this.getEditingProspect();
    const currentState = this.extractData();

    if (ResidentProspect.areEqual(lastSaved, currentState)) {
      this.unsavedProspect = null;
      this.closeModal();
      return;
    }

    const confirmed = await this.alertDialog.confirm({
      title: `Möchten Sie die Änderungen verwerfen?`,
      paragraph: `Mit dieser Aktion gehen alle Änderungen für "${this.getEditingProspect().getFullName()}" verworfen. Diese Aktion kann nicht rückgängig gemacht werden.`,
      cancel: 'abbrechen',
      confirm: 'Änderungen verwerfen'
    });

    if (confirmed) {
      this.unsavedProspect = null;
      this.closeModal();
    }
  }

  /**
   * Opens the modal form to start a new `ResidentProspect`. Creates an unsaved prospect.
   */
  private startNewProspect() {
    if (this.prospects.size === 2) {
      this.formMessage.error("Sie können nur max. 2 Personen hinzufügen.");
      this.formMessage.setTimedReset(5000);
      return;
    }
    this.clearModal();
    this.setLiveText("state", "Hinzufügen");
    this.setLiveText("full-name", "Neue Person");

    this.unsavedProspect = this.extractData(true);
    this.editingKey = `unsaved-${this.unsavedProspect.key}`;
    this.openModal();
  }

  private saveProspectFromModal(opts?: {
    validate?: boolean;
    report?: boolean;
  }): void {
    if (opts.validate ?? true) {
      const listValid = this.validateModal(opts.report ?? true);
      if (!listValid) {
        throw new Error(
          `Couldn't save ResidentProspect. Please fill in all the values correctly.`
        );
      }
    }

    const draft = !opts.validate;
    const prospect: ResidentProspect = this.extractData(draft);
    const otherProspect = this.getOtherProspect();
    if (!otherProspect) {
      this.unlinkAllProspects();
    } else {
      this.syncLinkedFieldsAll(prospect, otherProspect);
    }

    if (this.saveProspect(prospect)) {
      this.unsavedProspect = null;
      this.renderList();
      this.closeModal();
    }

    this.saveProgress();
  }

  private saveProspect(prospect: ResidentProspect): boolean {
    const prospectLimitError = new Error(`Sie können nur max. 2 Personen hinzufügen.`);

    if (!this.editingKey.startsWith('unsaved') && this.editingKey !== null) {
      if (this.prospects.size > 2) {
        throw prospectLimitError;
      }
      // Update existing prospect
      prospect.key = this.editingKey;
      this.prospects.set(this.editingKey, prospect);
    } else {
      if (this.prospects.size > 1) {
        throw prospectLimitError;
      }
      // Add the new prospect
      this.prospects.set(prospect.key, prospect);
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
    this.list.dataset.length = this.prospects.size.toString();

    if (this.prospects.size) {
      this.prospects.forEach((prospect) => this.renderProspect(prospect));
      this.formMessage.reset();
    } else {
      this.formMessage.info(
        "Bitte fügen Sie die Mieter (max. 2 Personen) hinzu.",
        !this.initialized
      );
    }
  }

  private renderProspect(key: string): void;
  private renderProspect(prospect: ResidentProspect): void;
  private renderProspect(prospectOrKey: ResidentProspect | string): void {
    const prospect = this.getProspect(prospectOrKey)
    const newElement: HTMLElement = this.template.cloneNode(true) as HTMLElement;
    const props = ["full-name", "phone", "email", "street", "zip", "city"];
    newElement.style.removeProperty("display");

    // Add event listeners for editing and deleting
    const editButton = newElement.querySelector(prospectSelector('edit'));
    const deleteButton = newElement.querySelector(prospectSelector('delete'));

    editButton!.addEventListener("click", () => this.editProspect(prospect));
    deleteButton!.addEventListener("click", async () => await this.onDeleteProspect(prospect));

    props.forEach((prop) => {
      const propSelector = `[data-${prop}]`;
      const el: HTMLElement | null = newElement.querySelector(propSelector);
      if (el && prop === "full-name") {
        el.innerText = prospect.getFullName();
      } else if (el) {
        const currentField = prospect.personalData.getField(prop);
        if (!currentField) {
          console.error(`Render ResidentProspect: A field for "${prop}" doesn't exist.`);
          return;
        }
        el.innerText = currentField.value || currentField.label;
      }
    });

    const badge = newElement.querySelector(prospectSelector('draft-badge'));
    badge.classList.toggle('hide', !prospect.draft);

    this.list.appendChild(newElement);
  }

  private editProspect(key: string): void;
  private editProspect(prospect: ResidentProspect): void;
  private editProspect(prospectOrKey: ResidentProspect | string): void {
    const prospect = this.getProspect(prospectOrKey);
    this.setLiveText("state", "bearbeiten");
    this.setLiveText("full-name", prospect.getFullName() || "Neue Person");
    this.editingKey = prospect.key; // Set editing key
    this.populateModal(prospect);
    this.openModal();
  }

  private async onDeleteProspect(key: string): Promise<void>;
  private async onDeleteProspect(prospect: ResidentProspect): Promise<void>;
  private async onDeleteProspect(prospectOrKey: ResidentProspect | string): Promise<void> {
    const prospect = this.getProspect(prospectOrKey);
    const confirmed = await this.alertDialog.confirm({
      title: `Möchten Sie die Person "${prospect.getFullName()}" wirklich löschen?`,
      paragraph: `Mit dieser Aktion wird die Person "${prospect.getFullName()}" gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.`,
      cancel: 'Abbrechen',
      confirm: 'Person löschen'
    });

    if (confirmed) this.deleteProspect(prospect);
  }

  private deleteProspect(key: string): void;
  private deleteProspect(prospect: ResidentProspect): void;
  private deleteProspect(prospectOrKey: ResidentProspect | string): void {
    const prospect = this.getProspect(prospectOrKey);
    this.prospects.delete(prospect.key); // Remove the ResidentProspect from the map

    // Unlink all fields for all prospects.
    // Since there can only be 2 prospects total, and one was just deleted,
    // there are no other prospects left to link fields to.
    this.unlinkAllProspects();
    this.renderList(); // Re-render the list
    this.closeModal();
    this.saveProgress();
  }

  private populateModal(prospect: ResidentProspect) {
    for (const [id] of prospect.linkedFields.entries()) {
      const linkElement = this.modalElement.querySelector<HTMLElement>(`[${LINK_FIELDS_ATTR}][data-id="${id}"]`);
      if (!linkElement) return;
      const linkCheckbox = linkElement.querySelector<HTMLInputElement>(wf.select.checkboxInput);
      linkCheckbox.checked = true;
      linkCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
    }

    this.groupElements.forEach((group) => {
      const selector = exclude(wf.select.formInput, `[${LINK_FIELDS_ATTR}] *`);
      const groupInputs: NodeListOf<HTMLFormInput> = group.querySelectorAll(selector);
      const groupName = group.dataset.prospectFieldGroup! as GroupName;

      if (!prospect[groupName]) {
        console.error(`The group "${groupName}" doesn't exist.`);
        return;
      }

      groupInputs.forEach((input) => {
        // Get field
        const field = prospect[groupName].getField(input.id);

        if (!field) {
          console.warn(`Field not found:`, input.id);
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

    // Validate if there are any prospects in the array (check if the `prospects` map has any entries)
    if (this.prospects.size === 0) {
      console.warn("Bitte fügen Sie mindestens eine mietende Person hinzu.");
      this.formMessage.error(`Bitte fügen Sie mindestens eine mietende Person hinzu.`);
      this.formMessage.setTimedReset(5000, () => {
        this.formMessage.info("Bitte fügen Sie die Mieter (max. 2 Personen) hinzu.", true)
      });
      valid = false;
    } else {
      // Check if each ResidentProspect in the prospects collection is valid
      this.prospects.forEach((prospect) => {
        if (prospect.draft) {
          console.warn(
            `Die Person "${prospect.getFullName()}" ist als Entwurf gespeichert. Bitte finalisieren oder löschen Sie diese Person.`
          );
          this.formMessage.error(
            `Die Person "${prospect.getFullName()}" ist als Entwurf gespeichert. Bitte finalisieren oder löschen Sie diese Person.`
          );

          this.formMessage.setTimedReset(8000);
          valid = false; // If any ResidentProspect is invalid, set valid to false
        } else if (!prospect.validate()) {
          console.warn(
            `Bitte füllen Sie alle Felder für "${prospect.getFullName()}" aus.`
          );
          this.formMessage.error(
            `Bitte füllen Sie alle Felder für "${prospect.getFullName()}" aus.`
          );

          this.formMessage.setTimedReset(5000);

          // setTimeout(() => {
          //   this.populateModal(prospect);
          //   this.openModal();
          //   this.validateModal();
          // }, 0);
          valid = false; // If any ResidentProspect is invalid, set valid to false
        }
      });
    }

    return valid;
  }

  public openModal(): void {
    // Live text for name
    const personalDataGroup = this.modalElement.querySelector(
      '[data-prospect-field-group="personalData"]'
    )!;
    const nameInputs: NodeListOf<HTMLFormElement> =
      personalDataGroup.querySelectorAll("#first-name, #name");
    nameInputs.forEach((input) => {
      input.addEventListener("input", () => {
        const editingProspect = this.extractData(this.editingKey.startsWith('unsaved'));
        this.setLiveText(
          "full-name",
          editingProspect.getFullName() || "Neue Person"
        );
      });
    });

    this.handleLinkedFieldsVisibility();
    this.openAccordion(0, this.accordionList);

    this.modal.open();
  }

  public async closeModal(): Promise<void> {
    await this.modal.close();
    if (this.initialized) {
      this.list.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    this.clearModal();
    this.editingKey = null;
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
      removeErrorClasses(input);
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

  private extractData(draft: boolean = false): ResidentProspect {
    const prospectData = new ResidentProspect({ draft: draft });

    this.groupElements.forEach((group) => {
      const groupInputs = group.querySelectorAll<HTMLFormInput>(wf.select.formInput);
      const groupName = group.dataset.prospectFieldGroup! as GroupName;
      const linkElements = group.querySelectorAll<HTMLElement>(`[${LINK_FIELDS_ATTR}]`);

      if (!prospectData[groupName]) {
        console.error(`The group "${groupName}" doesn't exist.`);
        return;
      }

      groupInputs.forEach((input, index) => {
        const field = fieldFromInput(input, index);
        if (field?.id) {
          prospectData[groupName].fields.set(field.id, field);
        }
      });

      linkElements.forEach((linkElement) => {
        const linkCheckbox = linkElement.querySelector<HTMLInputElement>(wf.select.checkboxInput);

        const id = linkCheckbox.dataset.name;
        const fieldsToLink = linkElement.getAttribute(LINK_FIELDS_ATTR);
        if (linkCheckbox.checked) {
          prospectData.linkFields(id, groupName, fieldsToLink);
        }
      });
    });

    return prospectData;
  }

  /**
   * Save the progress to localStorage
   */
  public saveProgress(): void {
    // Serialize the prospect map to an object
    const serializedProspects = prospectMapToObject(this.prospects);

    // Store the serialized data in localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedProspects));
      console.info("Form progress saved.");
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

        // Loop through the deserialized data and create `ResidentProspect` instances
        for (const key in deserializedData) {
          if (deserializedData.hasOwnProperty(key)) {
            const prospectData = deserializedData[key];
            const prospect = ResidentProspect.deserialize(prospectData); // Deserialize the ResidentProspect object
            prospect.key = key;
            this.prospects.set(key, prospect);
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

class SaveOptionsComponent {
  constructor() {

  }
}

class MultiStepForm {
  public options: MultiStepFormOptions = {
    recaptcha: false,
    navigation: {
      hideInStep: -1,
    },
    excludeInputSelectors: [],
    nested: false,
    pagination: {
      doneClass: "is-done",
      activeClass: "is-active"
    }
  };

  public initialized: boolean = false;
  public component: HTMLElement;
  public formElement: HTMLFormElement | HTMLElement;
  public formSteps: NodeListOf<HTMLElement>;
  public currentStep: number = 0;
  private navigationElement: HTMLElement;
  private paginationItems: NodeListOf<HTMLElement>;
  private buttonsNext: NodeListOf<HTMLElement>;
  private buttonsPrev: NodeListOf<HTMLElement>;
  private customComponents: Array<CustomFormComponent> = [];
  private successElement: HTMLElement | null;
  private errorElement: HTMLElement | null;
  private submitButton: HTMLInputElement | null;

  constructor(component: HTMLElement, options: Partial<MultiStepFormOptions>) {
    this.component = component;
    this.options = deepMerge(this.options, options);

    this.validateComponent();
    this.cacheDomElements();
    this.setupForm();
    this.setupEventListeners();
    this.initialized = true;
  }

  private validateComponent(): void {
    if (!this.component.getAttribute("data-steps-element")) {
      console.error(
        `Form Steps: Component is not a steps component or is missing the attribute ${stepsElementSelector('component')}.\nComponent:`,
        this.component
      );
      throw new Error("Component is not a valid multi-step form component.");
    }
  }

  private cacheDomElements(): void {
    this.formElement = this.component.querySelector<HTMLFormElement>('form');
    if (!this.options.nested && !this.formElement) {
      throw new Error("Form element not found within the specified component.");
    }

    if (this.options.nested) {
      this.formElement = this.component;
    }

    this.formSteps = this.component.querySelectorAll(stepsElementSelector('step'));
    this.paginationItems = this.component.querySelectorAll(STEPS_PAGINATION_ITEM_SELECTOR);
    this.navigationElement = this.component.querySelector(stepsElementSelector('navigation'));
    this.buttonsNext = this.component.querySelectorAll(stepsNavSelector('next'));
    this.buttonsPrev = this.component.querySelectorAll(stepsNavSelector('prev'));

    this.successElement = this.component.querySelector(formElementSelector('success'));
    this.errorElement = this.component.querySelector(formElementSelector('error'));
    this.submitButton = this.component.querySelector<HTMLInputElement>(formElementSelector('submit'));
  }

  private setupForm(): void {
    if (!this.formSteps.length) {
      console.warn(
        `Form Steps: The selected list doesn't contain any steps. Skipping initialization. Provided List:`,
        this.component.querySelector(stepsElementSelector('list'))
      );
      return;
    }

    if (!this.options.nested) {
      enforceButtonTypes(this.formElement as HTMLFormElement);
      this.formElement.setAttribute("novalidate", "");
    }

    this.formElement.dataset.state = "initialized";

    initWfInputs(this.component);

    this.changeToStep(this.currentStep);
  }

  private setupEventListeners(): void {
    if (!this.options.nested) {
      this.formElement.addEventListener("submit", (event) => {
        event.preventDefault();
        this.submitToWebflow();
      });
    }

    this.initPagination();
    this.initChangeStepOnKeydown();
  }

  public addCustomComponent(component: CustomFormComponent): void {
    this.customComponents.push(component);
  }

  private async submitToWebflow(): Promise<void> {
    if (this.options.nested) {
      throw new Error(`Can't submit a nested MultiStepForm.`);
    }

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
    if (this.options.nested) {
      throw new Error(`Can't get FormData for a nested MultiStepForm.`);
    }

    const fields = this.getFormData();

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

  private initChangeStepOnKeydown(): void {
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

  /**
   * Change to the next step.
   */
  public changeToNext() {
    if (this.currentStep < this.formSteps.length - 1) {
      this.changeToStep(this.currentStep + 1);
    }
  }

  /**
   * Change to the previous step.
   */
  public changeToPrevious() {
    if (this.currentStep > 0) {
      this.changeToStep(this.currentStep - 1);
    }
  }

  /**
   * Change to the specified step by `index`.
   *
   * If moving forward, the method will validate all intermediate steps before
   * allowing navigation. If validation fails on any step, it will halt and move
   * to the invalid step instead.
   *
   * Use the CustomEvent "changeStep" to hook into step changes.
   *
   * @param index - The zero-based index of the step to navigate to.
   */
  public changeToStep(index: number): void {
    if (this.currentStep === index && this.initialized) {
      // console.log('Change Form Step: Target step equals current step.');
      // console.log(`Step ${this.currentStep + 1}/${this.formSteps.length}`);
      return;
    }

    if (index > this.currentStep && this.initialized) {
      for (let step = this.currentStep; step < index; step++) {
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
      detail: { previousStep: this.currentStep, currentStep: index },
    });
    this.component.dispatchEvent(event);

    this.updateStepVisibility(index);
    this.updatePagination(index);
    this.currentStep = index;
    console.log(`Step ${this.currentStep + 1}/${this.formSteps.length}`);
  }

  private updateStepVisibility(target: number): void {
    const current = this.formSteps[this.currentStep];
    const next = this.formSteps[target];

    // Call user-defined handler if set
    if (this.options.onStepChange) {
      this.options.onStepChange({
        index: target,
        currentStep: current,
        targetStep: next,
      });
    } else {
      // Default behavior
      current.classList.add("hide");
      next.classList.remove("hide");
    }
  }

  public set onChangeStep(callback: StepChangeCallback) {
    this.options.onStepChange = callback;
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
      step.classList.toggle(this.options.pagination.doneClass, index < target);
      step.classList.toggle(this.options.pagination.activeClass, index === target);
    });
  }

  public validateAllSteps(): boolean {
    let allValid = true;

    this.formSteps.forEach((_, index) => {
      if (!this.validateCurrentStep(index)) {
        console.warn(`Step ${index + 1} is invalid.`);
        allValid = false; // Set the flag to false if any step is invalid
        this.changeToStep(index);
      }
    });

    return allValid;
  }

  public validateCurrentStep(stepIndex: number): boolean {
    // return true; // Change this for dev
    const basicError = `Validation failed for step: ${stepIndex + 1}/${this.formSteps.length
      }`;
    const currentStepElement = this.formSteps[stepIndex];
    const inputs: NodeListOf<HTMLFormInput> =
      currentStepElement.querySelectorAll(wf.select.formInput);

    // TODO: Fix this overkill approach
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
      .filter((entry) => entry.stepIndex === stepIndex)
      .map((entry) => () => entry.validator());

    // Custom validations
    const customValid =
      customValidators?.every((validator) => validator()) ?? true;
    if (!customValid) {
      console.warn(`${basicError}: Custom validation is not valid`);
    }

    return valid && customValid;
  }

  /**
   * Gets data of all form fields in a `FormFieldMap`.
   *
   * @step Step index of the multi step form
   * @returns `FormFieldMap` - A map of field id (string) to a `FormField` class instance
   *
   * Fields that are a descendant of '[data-steps-element="custom-component"]' are excluded.
   */
  public getFieldMapForStep(step: number): FormFieldMap {
    let fields: FormFieldMap = new Map();

    const stepElement = this.formSteps[step];
    const stepInputs: NodeListOf<HTMLFormInput> =
      stepElement.querySelectorAll(exclude(wf.select.formInput, `${stepsElementSelector("custom-component")} ${wf.select.formInput}`));
    stepInputs.forEach((input, inputIndex) => {
      const entry = fieldFromInput(input, inputIndex);
      if (entry?.id) {
        fields.set(entry.id, entry.value);
      }
    });

    return fields;
  }

  public getFieldMap(): FormFieldMap {
    const fields = Array.from(this.formSteps).reduce((acc, _, stepIndex) => {
      const stepData = this.getFieldMapForStep(stepIndex);
      return new Map([
        ...acc,
        ...stepData
      ]);
    }, new Map() as FormFieldMap);

    return fields;
  }

  public getFormData(): any {
    const customFields = this.customComponents.reduce((acc, entry) => {
      return {
        ...acc,
        ...(entry.getData ? entry.getData() : {}),
      };
    }, {});

    const fields = {
      ...mapToObject(this.getFieldMap(), false),
      ...customFields,
    }

    return fields;
  }
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
      form.addCustomComponent({
        stepIndex,
        instance: decision,
        validator: () => decision.validate(),
      });
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

function getAlertDialog(): AlertDialog {
  const modalElement = AlertDialog.select('component', 'alert-dialog');
  const modal = new AlertDialog(modalElement, {
    animation: {
      type: 'growIn',
      duration: 200,
    },
    bodyScroll: {
      lock: true,
      smooth: true,
    },
  });

  return modal;
}

const formElement: HTMLElement | null = document.querySelector(
  formElementSelector('component', { exclusions: [] })
);
formElement?.classList.remove("w-form");

document.addEventListener("DOMContentLoaded", () => {
  if (!formElement) {
    console.error("Form not found.");
    return;
  }

  const prospectArray = new FormArray(formElement, "resident-prospects");
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

  // @ts-ignore
  window.prospectArray = prospectArray;

  FORM.addCustomComponent({
    stepIndex: 2,
    instance: prospectArray,
    validator: () => prospectArray.validate(),
    getData: () => flattenProspects(prospectArray.prospects)
  });
  FORM.component.addEventListener("changeStep", () => {
    if (prospectArray.modal.opened) prospectArray.closeModal();
  });

  const errorMessages = {
    beilagenSenden: {
      upload: "Bitte laden Sie alle Beilagen hoch.",
    },
  };

  const defaultMessages = {
    beilagenSenden: `Bitte laden Sie alle Beilagen hoch oder wählen Sie die Option "Beilagen per Post senden".`,
  };

  initializeOtherFormDecisions(
    prospectArray.modalElement,
    errorMessages,
    defaultMessages
  );
  initializeFormDecisions(FORM, errorMessages, defaultMessages);
  insertSearchParamValues();
  prospectArray.loadProgress();
  FORM.formElement.addEventListener("formSuccess", () => {
    prospectArray.clearProgress();
  });

  console.log("Form initialized:", FORM.initialized, FORM);
});

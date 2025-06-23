import createAttribute, { exclude, AttributeSelector } from "@peakflow/attributeselector";
import {
  isCheckboxInput,
  isRadioInput,
  clearRadioGroup,
  validateFields,
  fieldFromInput,
  removeErrorClasses,
  isFormInput,
  findFormInput,
  FieldGroupValidation,
  reportValidity,
  FormDecision
} from "@peakflow/form";
import {
  ResidentProspect,
  GroupName,
  prospectMapToObject,
} from "./resident-prospect";
import wf from "@peakflow/webflow";
import { HTMLFormInput } from "@peakflow/form";
import { FormMessage } from "@peakflow/form";
import Accordion from "@peakflow/accordion";
import Modal from "@peakflow/modal";
import AlertDialog from "@peakflow/alertdialog";
import SaveOptions from "./save-options";
import { getAlertDialog } from "./alert-dialog";
import type { ScrollPosition } from "@peakflow/scroll";

type ProspectElement =
  'template'
  | 'add'
  | 'edit'
  | 'delete'
  | 'save'
  | 'draft'
  | 'draft-badge'
  | 'cancel'
  | 'circle';

const prospectSelector = createAttribute<ProspectElement>('data-prospect-element')

const LINK_FIELDS_ATTR = `data-link-fields`;
const FIELD_GROUP_ATTR = `data-prospect-field-group`;
const ARRAY_LIST_SELECTOR = '[data-form-array-element="list"]';
const FIELD_GROUP_SELECTOR = `[${FIELD_GROUP_ATTR}]`;
const ACCORDION_SELECTOR = `[data-animate="accordion"]`;

// Unique key to store form data in localStorage
const STORAGE_KEY = "formProgress";

type OnOpenCallback = (prospect?: ResidentProspect) => void;
type OnCloseCallback = () => void;

export default class ProspectArray {
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
  private cancelButtons: NodeListOf<HTMLButtonElement>;
  private saveOptions: SaveOptions<'draft' | 'save'>;
  private modalInputs: NodeListOf<HTMLFormInput>;
  private groupElements: NodeListOf<HTMLElement>;
  private accordionList: Accordion[] = [];
  private onOpenCallbacks: Map<string, OnOpenCallback> = new Map();
  private onCloseCallbacks: Map<string, OnCloseCallback> = new Map();

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
    this.saveOptions = new SaveOptions(SaveOptions.select('component', 'save-prospect'));
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

    let keyboardFocused = false;
    this.modalInputs.forEach((input) => {
      input.addEventListener("keydown", (event: KeyboardEvent) => {
        if (!this.modal.opened) return;
        if (event.key === "Enter") {
          event.preventDefault();
          this.saveProspectFromModal({ validate: true, report: true });
        }

        if (event.key === "Tab" || event.key === "ArrowDown" || event.key === "ArrowUp") {
          keyboardFocused = true;
        }
      });
      input.addEventListener("focusin", (event) => {
        if (!this.modal.opened) return;
        event.preventDefault();
        const accordionIndex = this.accordionIndexOf(input);
        const accordionInstance = this.accordionList[accordionIndex];
        if (!accordionInstance.isOpen) {
          this.toggleAccordion(accordionIndex);
        }

        let position: ScrollPosition = "nearest";
        if (keyboardFocused) {
          keyboardFocused = false;
          position = "center";
        }

        this.modal.scrollTo(input, {
          delay: 500,
          position: position,
        });
      });
      const groupEl = this.getClosestGroup(input);
      input.addEventListener("input", () => {
        if (input.matches(FormDecision.selector("input"))) return;
        this.validateModalGroup(groupEl);
        // Never report invalid fields here
      });
    });

    this.saveOptions.setActionHandler('save', () => {
      this.saveProspectFromModal({ validate: true, report: true });
    });
    this.saveOptions.setActionHandler('draft', () => {
      this.saveProspectFromModal({ validate: false, report: false });
    });
    this.addButton.addEventListener("click", () => this.startNewProspect());

    this.initializeLinkedFields();

    this.renderList();
    this.closeModal();

    this.initAccordions();
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
  public startNewProspect() {
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
    this.saveOptions.setAction('save')
    this.openModal();
  }

  private saveProspectFromModal(opts?: {
    validate?: boolean;
    report?: boolean;
  }): void {
    if (opts.validate ?? true) {
      const listValid = this.validateModal(opts.report ?? true);
      if (!listValid) {
        console.warn(
          `Couldn't save ResidentProspect. Please fill in all the values correctly.`
        );
        return;
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

  public editProspect(key: string): void;
  public editProspect(prospect: ResidentProspect): void;
  public editProspect(prospectOrKey: ResidentProspect | string): void {
    const prospect = this.getProspect(prospectOrKey);
    this.setLiveText("state", "bearbeiten");
    this.setLiveText("full-name", prospect.getFullName() || "Neue Person");
    this.editingKey = prospect.key; // Set editing key
    this.populateModal(prospect);
    this.saveOptions.setAction(prospect.draft ? 'draft' : 'save');
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

  public onOpen(name: string, callback: OnOpenCallback): void {
    this.onOpenCallbacks.set(name, callback);
  }

  public clearOnOpen(name: string): void {
    this.onOpenCallbacks.delete(name);
  }

  public triggerOnOpen(): void {
    const editingProspect = this.getEditingProspect();
    for (const callback of this.onOpenCallbacks.values()) {
      callback(editingProspect);
    }
  }

  public onClose(name: string, callback: OnOpenCallback): void {
    this.onCloseCallbacks.set(name, callback);
  }

  public clearOnClose(name: string): void {
    this.onCloseCallbacks.delete(name);
  }

  public triggerOnClose(): void {
    for (const callback of this.onCloseCallbacks.values()) {
      callback();
    }
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
            `Bitte füllen Sie alle Pflichtfelder für "${prospect.getFullName()}" aus.`
          );
          this.formMessage.error(
            `Bitte füllen Sie alle Pflichtfelder für "${prospect.getFullName()}" aus.`
          );

          this.formMessage.setTimedReset(7000);

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

  public validateModalGroup(groupEl: HTMLElement): FieldGroupValidation {
    const groupName = groupEl.dataset.prospectFieldGroup! as GroupName;
    const groupInputs = groupEl.querySelectorAll<HTMLFormInput>(wf.select.formInput);
    const validation = validateFields(groupInputs, false);

    const circle = groupEl.querySelector(prospectSelector('circle'));
    if (!circle) console.warn(`Circle element not found inside group "${groupName}"`);
    if (validation.isValid) {
      circle.classList.add('is-valid');
    } else {
      circle.classList.remove('is-valid');
    }

    return validation;
  }

  private validateModal(report: boolean = true): boolean {
    // return true; // Change this for dev
    let valid = true;
    const invalidFields: HTMLFormInput[] = [];

    this.groupElements.forEach(groupEl => {
      const groupValid = this.validateModalGroup(groupEl);
      invalidFields.push(...groupValid.invalidFields);
      if (groupValid.isValid) return;
      valid = false;
    });

    if (!valid && invalidFields.length && report && this.modal.opened) {
      this.reportInvalidField(invalidFields[0]);
    }
    return valid;
  }

  private async reportInvalidField(field: HTMLFormInput): Promise<void>;
  private async reportInvalidField(fieldId: string, groupName: GroupName): Promise<void>;
  private async reportInvalidField(fieldOrId: HTMLFormInput | string, groupName?: GroupName | undefined): Promise<void> {
    const input = this.getFormInput(fieldOrId, groupName);

    const accordionIndex = this.accordionIndexOf(input);
    if (accordionIndex !== -1) {
      let delay = 0;

      // Open the accordion containing the invalid field using the index
      const accordion = this.accordionList[accordionIndex];
      if (!accordion.isOpen) {
        this.openAccordion(accordionIndex);
        delay = 800;
      }

      await this.modal.scrollTo(input, {
        delay: delay,
        position: "center"
      });

      reportValidity(input);
    }
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

    this.validateModal(false);
    this.handleLinkedFieldsVisibility();
    this.openAccordion(0);
    this.triggerOnOpen();

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
    this.triggerOnClose();
    this.editingKey = null;
  }

  private initAccordions(): void {
    const accordionElements: HTMLElement[] = Array.from(
      this.container.querySelectorAll(ACCORDION_SELECTOR)
    );

    const accordionList: Accordion[] = accordionElements.reduce(
      (acc, accordionEl) => {
        return [...acc, new Accordion(accordionEl)];
      }, []);

    this.accordionList = accordionList;
    this.initAccordionListeners();
  }

  private initAccordionListeners(): void {
    for (let i = 0; i < this.accordionList.length; i++) {
      const accordion = this.accordionList[i];
      accordion.component.dataset.index = i.toString();
      accordion.onClick(() => {
        this.toggleAccordion(i);
        if (!accordion.isOpen) return;
        setTimeout(() => {
          accordion.scrollIntoView(this.modal.select('modal'), 0);
        }, 500);
      });
    }
  }

  private toggleAccordion(index: number) {
    for (let i = 0; i < this.accordionList.length; i++) {
      const accordion = this.accordionList[i];
      if (i === index) {
        accordion.toggle();
      } else {
        accordion.close();
      }
    }
  }

  private openAccordion(index: number) {
    for (let i = 0; i < this.accordionList.length; i++) {
      const accordion = this.accordionList[i];
      if (i === index) {
        accordion.open();
      } else {
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

  public getClosestGroup(element: HTMLElement): HTMLElement {
    const groupEl: HTMLElement | null = element.closest(FIELD_GROUP_SELECTOR);
    if (!groupEl) {
      throw new Error(`The given element is not part of a group element.`);
    }
    return groupEl;
  }

  private getGroupsByName(groupName: GroupName): HTMLElement[] {
    return Array.from(
      this.modal.component.querySelectorAll<HTMLElement>(`[${FIELD_GROUP_ATTR}="${groupName}"]`)
    );
  }

  private getFormInput<T extends HTMLFormInput = HTMLFormInput>(
    field: T
  ): T;
  private getFormInput<T extends HTMLFormInput = HTMLFormInput>(
    fieldId: string,
    groupName: GroupName
  ): T;
  private getFormInput<T extends HTMLFormInput = HTMLFormInput>(
    fieldOrId: T | string,
    groupName?: GroupName | undefined
  ): T;
  private getFormInput<T extends HTMLFormInput = HTMLFormInput>(
    fieldOrId: T | string,
    groupName?: GroupName | undefined
  ): T {
    if (isFormInput(fieldOrId)) {
      return fieldOrId as T;
    }
    const groupElements = this.getGroupsByName(groupName);
    return findFormInput<T>(groupElements, fieldOrId);
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
        if (field.id) {
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

import { FieldGroup, HTMLFormInput, formQuery, fieldFromInput } from ".";
import createAttribute from "@library/attributeselector";

type Action = (filters?: FieldGroup) => any;
type ActionElement = 'download' | 'save';

const actionSelector = createAttribute<ActionElement>('data-action');

export class FilterForm {
  public container: HTMLElement;
  private data: FieldGroup;
  private filterFields: NodeListOf<HTMLFormInput>;
  private formFields: NodeListOf<HTMLFormInput>;
  private beforeChangeActions: Action[] = [];
  private changeActions: Action[] = [];
  private defaultDayRange: number = 7;
  private resizeResetFields: Map<string, () => string | number | Date> = new Map();

  constructor(container: HTMLElement | null) {
    if (!container) throw new Error(`FilterForm container can't be null`)
    container = container;
    if (container.tagName === 'form') {
      container = container.querySelector('form');
    }
    if (!container) {
      throw new Error(`Form cannot be undefined.`);
    }
    container.classList.remove("w-form");
    container.addEventListener('submit', (event) => {
      event.preventDefault();
    });

    this.container = container;
    this.filterFields = container.querySelectorAll(formQuery.filters);
    this.formFields = container.querySelectorAll(formQuery.input);

    this.attachChangeListeners();
  }

  /**
   * Returns the `HTMLElement` of a specific filter input.
   */
  public getFilterInput(fieldId: string): HTMLFormInput {
    const existingFields = this.getFieldIds(this.filterFields)
    if (!this.fieldExists(fieldId, existingFields)) {
      throw new Error(`Field with ID "${fieldId}" was not found`);
    }

    return Array.from(this.filterFields).find(field => field.id === fieldId);
  }

  /**
   * Get all the field-ids inside the current instance.
   */
  private getFieldIds(fields: NodeListOf<HTMLFormInput>): string[] {
    return Array.from(fields).map(input => input.id);
  }

  /**
   * Check if a field-id exists in a list of field-ids.
   */
  private fieldExists(fieldId: string, fieldIds: string[]): boolean {
    const matches = fieldIds.filter(id => id === fieldId);
    if (matches.length === 1) {
      return true;
    } else if (matches.length > 1) {
      throw new Error(`FieldId ${fieldId} was found more than once!`)
    }
    return false;
  }

  /**
   * Attach all the event listeners needed for the form to function.
   * These event listeners ensure the instance is always in sync with the
   * current state of the FilterForm.
   */
  private attachChangeListeners(): void {
    this.formFields.forEach(field => {
      field.addEventListener("input", this.onChange.bind(this));
    });
    const saveBtn = this.container.querySelector(actionSelector('save'));
    saveBtn.addEventListener('click', this.onChange.bind(this));
  }

  /**
   * Add an action to be exectued before all the onChange actions get called.
   * Use this function to validate or modify inputs if needed.
   */
  public addBeforeChange(action: Action): void {
    this.beforeChangeActions.push(action);
  }

  /**
   * Add an action to be executed when the filters change.
   */
  public addOnChange(action: Action) {
    this.changeActions.push(action);
  }

  /**
   * Execute all onChange actions.
   */
  private onChange(): void {
    this.beforeChangeActions.forEach(action => action());
    const filters: FieldGroup = this.getFieldGroup(this.filterFields);
    this.changeActions.forEach(action => action(filters));
  }

  /**
   * Simulate an onChange event by invoking all the changeActions.
   * Use this method to trigger the filter logic and initialize rendering 
   * based on pre-defined or externally set default values.
   */
  public invokeOnChange(): void {
    this.onChange();
  }

  /**
   * Get the FieldGroup from current form state.
   * Use this method to get all the form field values as structured data 
   * alongside field metadata.
   */
  public getFieldGroup(fields: NodeListOf<HTMLFormInput> | HTMLFormInput[]): FieldGroup {
    this.data = new FieldGroup();
    fields = fields as NodeListOf<HTMLFormInput>;
    fields.forEach((input, index) => {
      const field = fieldFromInput(input, index);
      if (field?.id) {
        this.data.fields.set(field.id, field);
      }
    });
    return this.data;
  }

  /**
   * Reset a field to a specific value on `window.resize` event.
   */
  public addResizeReset(fieldId: string, getValue: () => string | number | Date): void {
    const existingFields = this.getFieldIds(this.filterFields);
    if (!this.fieldExists(fieldId, existingFields)) {
      throw new Error(`Field with ID "${fieldId}" was not found`);
    }

    // Store the function that provides the reset value
    this.resizeResetFields.set(fieldId, getValue);

    // Attach resize event listener only once
    if (this.resizeResetFields.size === 1) {
      window.addEventListener('resize', () => this.applyResizeResets());
    }
  }

  /**
   * Remove a field from the reset on resize list. This will no longer reset the field on resize.
   */
  public removeResizeReset(fieldId: string): void {
    this.resizeResetFields.delete(fieldId);

    // Detach event listener if no fields remain to reset on resize
    if (this.resizeResetFields.size === 0) {
      window.removeEventListener('resize', this.applyResizeResets);
    }
  }

  /**
   * Applies the reset values to the fields.
   */
  public applyResizeResets(): void {
    this.resizeResetFields.forEach((getValue, fieldId) => {
      let value = getValue();

      if (value instanceof Date) {
        value = value.toISOString().split('T')[0]; // Format Date to YYYY-MM-DD
      }

      this.getFilterInput(fieldId).value = value.toString();
    });
  }

  /**
   * Set a custom day range for validation.
   * If no custom range is needed, revert to default.
   */
  public setDayRange(dayRange: number): number {
    if (dayRange <= 0) {
      throw new Error(`Day range must be at least "1".`);
    }
    this.defaultDayRange = dayRange;
    return this.defaultDayRange;
  }

  /**
   * Validate the date range between startDate and endDate.
   * Ensure they remain within the chosen day range.
   *
   * @param startDateFieldId The field id of the startdate `HTMLFormInput`
   * @param endDateFieldId The field id of the enddate `HTMLFormInput`
   */
  public validateDateRange(startDateFieldId: string, endDateFieldId: string, customDayRange?: number): void {
    const startDateInput = this.getFilterInput(startDateFieldId) as HTMLInputElement;
    const endDateInput = this.getFilterInput(endDateFieldId) as HTMLInputElement;

    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    let activeRange: number = customDayRange ?? this.defaultDayRange;
    activeRange -= 1;

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const diffInDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

      // Determine which field was changed (by checking focus or value)
      let activeField = 'other';
      if (document.activeElement === startDateInput) {
        activeField = 'startDate';
      } else if (document.activeElement === endDateInput) {
        activeField = 'endDate';
      }

      if (activeField === 'startDate' || activeField === 'other') {
        // Adjust `endDate` based on `startDate`
        if (diffInDays !== activeRange) {
          const newEndDate = new Date(startDate);
          newEndDate.setDate(startDate.getDate() + activeRange);
          endDateInput.value = newEndDate.toISOString().split('T')[0];
        } else if (diffInDays < 0) {
          endDateInput.value = startDate.toISOString().split('T')[0];
        }
      } else if (activeField === 'endDate') {
        // Adjust `startDate` based on `endDate`
        if (diffInDays !== activeRange) {
          const newStartDate = new Date(endDate);
          newStartDate.setDate(endDate.getDate() - activeRange);
          startDateInput.value = newStartDate.toISOString().split('T')[0];
        } else if (diffInDays < 0) {
          startDateInput.value = endDate.toISOString().split('T')[0];
        }
      }
    }
  }
}

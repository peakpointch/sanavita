// Imports
import { CollectionList, wfCollections } from '@library/wfcollection';
import createAttribute, { AttributeSelector } from '@library/attributeselector';
import html2canvas from 'html2canvas';
import EditableCanvas from '@library/canvas';
import jsPDF, { Html2CanvasOptions } from 'jspdf';
import { FieldFromInput, filterFormSelector, FormField, FormInput, formQuery } from '@library/form';
import FieldGroup from '@library/form/fieldgroup';
import Renderer from '@library/renderer';
import { RenderData, RenderElement, RenderField } from '@library/renderer';

// Types
type PdfFieldName = string | 'dishName' | 'dishDescription' | 'price' | 'priceSmall';
type PdfElement = 'dish' | 'page';
type ActionElement = 'download' | 'save';
type Action = (filters: FieldGroup) => any;
type MenuDataCondition = ((menuData: RenderElement | RenderField) => boolean);

// Selector functions
const pdfFieldSelector = createAttribute<PdfFieldName>('data-pdf-field');
const pdfElementSelector = createAttribute<PdfElement>('data-pdf-element');
const wfCollectionSelector = createAttribute<string>('wf-collection');
const actionSelector = createAttribute<ActionElement>('data-action');

class DailyMenuCollection extends CollectionList {

  constructor(container: HTMLElement | null) {
    super(container, 'pdf');

    // Initialize Collection Data
    this.renderer.addFilterAttributes(['date', 'end-date', 'weekly-hit-boolean']);
    this.readCollectionData();
  }

  public filterByDate(
    startDate: Date,
    endDate: Date,
    ...additionalConditions: MenuDataCondition[]
  ): RenderData {
    return [...this.collectionData].filter(
      (weekday) => {
        // Base conditions
        const baseCondition =
          weekday.date >= startDate &&
          weekday.date <= endDate;

        // Check all additional conditions
        const allAdditionalConditions = additionalConditions.every((condition) => condition(weekday));

        return baseCondition && allAdditionalConditions;
      }
    );
  }

  public filterByRange(
    startDate: Date,
    dayRange: number = 7,
    ...conditions: MenuDataCondition[]
  ): RenderData {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + dayRange - 1);
    return this.filterByDate(startDate, endDate, ...conditions);
  }
}

class PDF {
  private canvas: HTMLElement;
  public renderer: Renderer;

  constructor(canvas: HTMLElement | null) {
    if (!canvas) throw new Error('PDF Element not found.');
    this.canvas = canvas;
    this.renderer = new Renderer(canvas, 'pdf');
  }

  public render(data: RenderData): void {
    console.log("Render Pdf");
    this.renderer.render(data);
  }

  public async create(filename?: string | undefined): Promise<void> {
    if (!filename || typeof filename !== 'string') {
      filename = `Menuplan generiert am ${new Date().toLocaleDateString('de-DE')}`;
    }
    filename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    try {
      const options: Html2CanvasOptions = { scale: 4 };
      // Convert HTML element to canvas
      const canvas = await html2canvas(this.canvas, options);

      // Generate the PDF
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      // Calculate dimensions to fit the A4 page
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Save the PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error creating PDF:', error);
    }
  }
}

class FilterForm {
  public container: HTMLElement;
  private data: FieldGroup;
  private filterFields: NodeListOf<FormInput>;
  private formFields: NodeListOf<FormInput>;
  private changeActions: Action[] = [];
  private defaultDayRange: number = 7;

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
    })

    this.container = container;
    this.filterFields = container.querySelectorAll(formQuery.filters);
    this.formFields = container.querySelectorAll(formQuery.input);

    this.attachChangeListeners();
  }

  public getFilterInput(fieldId: string): FormInput {
    const existingFields = this.getFieldIds(this.filterFields)
    if (!this.fieldExists(fieldId, existingFields)) {
      throw new Error(`Field with ID ${fieldId} was not found`);
    }

    return Array.from(this.filterFields).find(field => field.id === fieldId);
  }

  private getFieldIds(fields: NodeListOf<FormInput>): string[] {
    return Array.from(fields).map(input => input.id);
  }

  private fieldExists(fieldId: string, fieldIds: string[]): boolean {
    const matches = fieldIds.filter(id => id === fieldId);
    if (matches.length === 1) {
      return true;
    } else if (matches.length > 1) {
      throw new Error(`FieldId ${fieldId} was found more than once!`)
    }
    return false;
  }

  private attachChangeListeners(): void {
    this.formFields.forEach(field => {
      field.addEventListener("input", this.onChange.bind(this));

      if (field.id === 'startDate' || field.id === 'endDate') {
        field.addEventListener("input", () => this.validateDateRange());
      }
    });
    const saveBtn = this.container.querySelector(actionSelector('save'));
    saveBtn.addEventListener('click', this.onChange.bind(this));
  }

  /**
   * Add an action to be executed when the filters change.
   */
  public addOnChange(action: Action) {
    this.changeActions.push(action);
  }

  private onChange(): void {
    const filters: FieldGroup = this.extractData(this.filterFields);
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

  public extractData(fields: NodeListOf<FormInput> | FormInput[]): FieldGroup {
    this.data = new FieldGroup();
    fields = fields as NodeListOf<FormInput>;
    fields.forEach((input, index) => {
      const field = FieldFromInput(input, index);
      if (field?.id) {
        this.data.fields.set(field.id, field);
      }
    });
    return this.data;
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
   */
  private validateDateRange(customDayRange?: number): void {
    const startDateInput = this.getFilterInput('startDate') as HTMLInputElement;
    const endDateInput = this.getFilterInput('endDate') as HTMLInputElement;

    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    const activeRange: number = customDayRange ?? this.defaultDayRange;

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const diffInDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

      // Determine which field was changed (by checking focus or value)
      const activeField = document.activeElement === startDateInput ? 'startDate' : 'endDate';

      if (activeField === 'startDate') {
        // Adjust `endDate` based on `startDate`
        if (diffInDays > activeRange) {
          const newEndDate = new Date(startDate);
          newEndDate.setDate(startDate.getDate() + activeRange);
          endDateInput.value = newEndDate.toISOString().split('T')[0];
        } else if (diffInDays < 0) {
          endDateInput.value = startDate.toISOString().split('T')[0];
        }
      } else if (activeField === 'endDate') {
        // Adjust `startDate` based on `endDate`
        if (diffInDays > activeRange) {
          const newStartDate = new Date(endDate);
          newStartDate.setDate(endDate.getDate() - activeRange);
          startDateInput.value = newStartDate.toISOString().split('T')[0];
        } else if (diffInDays < 0) {
          startDateInput.value = endDate.toISOString().split('T')[0];
        }
      }

      // Trigger a change event to update the UI and filters
      this.onChange();
    }
  }
}

const filterMenuData = (filters: FieldGroup, menuList: DailyMenuCollection): RenderData => {
  const startDateValue: string = filters.getField('startDate').value;
  const startDate: Date = new Date(startDateValue);
  const endDateValue: string = filters.getField('endDate').value;
  const endDate: Date = new Date(endDateValue);
  const filteredDays: RenderData = menuList.filterByDate(startDate, endDate);

  console.log(startDateValue, endDateValue, `Filtered Data:\n`, filteredDays);
  return filteredDays;
}

function addDays(date: Date = new Date(), days: number): Date {
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getMonday(date: Date = new Date(), week: number = 0): Date {
  let dayOfWeek = date.getDay();
  let daysToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);

  date.setDate(date.getDate() - daysToMonday);
  date.setDate(date.getDate() + week * 7);
  date.setHours(0, 0, 0, 0);

  return date;
}

function onSave(): void {

}

function initDownload(pdf: PDF): void {
  const button = document.querySelector(actionSelector('download'));
  if (!button) throw new Error('Download button does not exist');
  button.addEventListener('click', () => {
    pdf.create();
  });
}

function initSave(): void {
  const button = document.querySelector(actionSelector('save'));
  if (!button) throw new Error('Save button does not exist');
  button.addEventListener('click', () => onSave());
}

function setDefaultFilters(form: FilterForm, data: RenderData): void {
  const nextMonday: Date = getMonday(new Date(), 1);
  const startDateInput = form.getFilterInput('startDate')
  const endDateInput = form.getFilterInput('endDate')
  const dayRangeInput = form.getFilterInput('dayRange')

  startDateInput.value = nextMonday.toLocaleDateString('en-CA');
  endDateInput.value = addDays(nextMonday, 6).toLocaleDateString('en-CA');
  dayRangeInput.value = form.setDayRange(7).toString();

  const dates = data.map(weekday => weekday.date.getTime());
  const minDate = new Date(Math.min(...dates)).toISOString().split('T')[0];
  const maxDate = new Date(Math.max(...dates)).toISOString().split('T')[0];

  startDateInput.setAttribute('min', minDate)
  startDateInput.setAttribute('max', maxDate)
  endDateInput.setAttribute('min', minDate)
  endDateInput.setAttribute('max', maxDate)
}

const isWeeklyHit: MenuDataCondition = (menuData) => {
  return menuData.weeklyHit;
}

function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions): string {
  return new Date(date).toLocaleDateString('de-CH', options);
}

type DateOptionsObject = {
  [key: string]: Intl.DateTimeFormatOptions;
}

const dateOptions: DateOptionsObject = {
  day: {
    day: "numeric"
  },
  weekday: {
    weekday: "long"
  },
  title: {
    month: "long",
    year: "numeric"
  }
}

function initialize(): void {
  const dailyMenuListElement: HTMLElement | null = document.querySelector(wfCollectionSelector('daily'));
  const pdfElement: HTMLElement | null = document.querySelector(pdfElementSelector('page'));
  const filterFormElement: HTMLElement | null = document.querySelector(filterFormSelector('component'));

  const menuList = new DailyMenuCollection(dailyMenuListElement);
  const pdf = new PDF(pdfElement);
  const filterForm = new FilterForm(filterFormElement);

  setDefaultFilters(filterForm, menuList.getCollectionData());

  filterForm.addOnChange((filters) => {
    const startDate = new Date(filters.getField('startDate').value);
    const endDate = filters.getField('endDate').value;

    const renderFields: RenderField[] = [
      {
        element: 'title',
        value: `Menüplan ${formatDate(startDate, dateOptions.day)}. – ${formatDate(endDate, dateOptions.day)}. ${formatDate(startDate, dateOptions.title)}`,
      } as RenderField,
    ];

    const renderElements: RenderData = filterMenuData(filters, menuList);
    const data: RenderData = [
      ...renderFields,
      ...renderElements,
    ];
    console.log("RENDER DATA", data);
    pdf.render(data);
  });
  filterForm.invokeOnChange(); // Initialize the filter with it's default values

  const canvas = new EditableCanvas(pdfElement, '.pdf-h3');

  initDownload(pdf);
  initSave();
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    initialize();
  } catch (e) {
    console.error(e);
  }
});

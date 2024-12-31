// Imports
import { CollectionList } from '@library/wfcollection';
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
type DailyMenuCollectionData = Array<DailyMenuData>;
type PdfElement = 'dish' | 'page';
type ActionElement = 'download' | 'save';
type Action = (filters: FieldGroup) => any;
type MenuDataCondition = ((menuData: DailyMenuData) => boolean);

// Selector functions
const pdfFieldSelector = createAttribute<PdfFieldName>('data-pdf-field');
const pdfElementSelector = createAttribute<PdfElement>('data-pdf-element');
const wfCollectionSelector = createAttribute<string>('wf-collection');
const actionSelector = createAttribute<ActionElement>('data-action');

class DailyMenuData {
  date: Date;
  endDate: Date | null;
  weekday: string;
  weeklyHit: boolean;
  courses: { [key: string]: any };

  constructor(date: Date, endDate: Date, weeklyHit: boolean, courses: { [key: string]: any }) {
    this.date = date;
    this.endDate = weeklyHit ? endDate : null;
    this.weekday = this.getWeekdayEn();
    this.courses = courses;
    this.weeklyHit = weeklyHit;
  }

  getWeekdayEn(): string {
    return this.date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  }

  toJSON() {
    return {
      date: this.date,
      endDate: this.endDate,
      weeklyHit: this.weeklyHit,
      weekday: this.getWeekdayEn(),
      courses: this.courses,
    };
  }
}

class DailyMenuCollection extends CollectionList {
  private collectionData: DailyMenuData[] = [];

  constructor(container: HTMLElement | null) {
    super(container);

    // Initialize Collection Data
    this.getCollectionData();
  }

  public getCollectionData(): DailyMenuData[] {
    const listItems: NodeListOf<HTMLElement> = this.getListItems();
    let weeklyHit: boolean = false;
    this.collectionData = Array.from(listItems).map((menuElement) => {
      const dateString = menuElement.dataset.wfDate || '';
      const date = new Date(dateString);
      const endDateString = menuElement.dataset.wfEndDate || '';
      const endDate = new Date(endDateString);
      const courses = this.getCourses(menuElement);
      weeklyHit = JSON.parse(this.getConditionalValue('weekly-hit', menuElement).toString());

      return new DailyMenuData(date, endDate, weeklyHit, courses);
    });

    return this.collectionData;
  }

  private getConditionalValue(name: string, container: HTMLElement = this.container): Boolean | string {
    const conditionalElement: HTMLElement | null = container.querySelector(`[data-wf-${name}]`);
    if (!conditionalElement) return false;
    const attributeValue = conditionalElement.getAttribute(`data-wf-${name}`);
    return attributeValue;
  }

  /**
   * Get the courses from a daily menu / collection item / from one day.
   * Courses: starter, main, mainVegetarian, dessert.
   *
   * Parameters:
   * @param menuElement The Daily Menu - This element contains all the courses from a specific day.
   *
   * @returns The courses as an object.
   */
  public getCourses(menuElement: HTMLElement): { [key: string]: any } {
    const courses: NodeListOf<HTMLElement> = menuElement.querySelectorAll(pdfElementSelector('dish'));
    const menuData: { [key: string]: any } = {};

    courses.forEach((dish) => {
      const courseData: { [key: string]: any } = {};
      const fields: PdfFieldName[] = ['dishName', 'dishDescription'];
      fields.forEach((field) => {
        const pdfFieldElement: HTMLElement | null = dish.querySelector(pdfFieldSelector(field));
        courseData[field] = pdfFieldElement?.innerHTML || pdfFieldElement?.innerText || '';
      });
      menuData[dish.dataset.dishCourse || 'default'] = courseData;
    });

    return menuData;
  }

  public filterByDate(
    startDate: Date,
    endDate: Date,
    ...additionalConditions: MenuDataCondition[]
  ): DailyMenuData[] {
    return this.collectionData.filter(
      (menuData) => {
        // Base conditions
        const baseCondition =
          menuData.date >= startDate &&
          menuData.date <= endDate;

        // Check all additional conditions
        const allAdditionalConditions = additionalConditions.every((condition) => condition(menuData));

        return baseCondition && allAdditionalConditions;
      }
    );
  }

  public filterByRange(
    startDate: Date,
    dayRange: number = 7,
    ...conditions: MenuDataCondition[]
  ): DailyMenuData[] {
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

  constructor(container: HTMLElement | null) {
    if (!container) throw new Error(`FilterForm container can't be null`)
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
}

const filterMenuData = (filters: FieldGroup, menuList: DailyMenuCollection): DailyMenuData[] => {
  const startDateValue: string = filters.getField('startDate').value;
  const startDate: Date = new Date(startDateValue);
  const endDateValue: string = filters.getField('endDate').value;
  const endDate: Date = new Date(endDateValue);
  const filteredDays: DailyMenuData[] = menuList.filterByDate(startDate, endDate);

  console.log(`Filtered Data:\n`, filteredDays);
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

function setDefaultFilters(form: FilterForm): void {
  const nextMonday: Date = getMonday(new Date(), 1);
  form.getFilterInput('startDate').value = nextMonday.toLocaleDateString('en-CA');
  form.getFilterInput('endDate').value = addDays(nextMonday, 6).toLocaleDateString('en-CA');
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

function parseDailyMenuData(data: DailyMenuData[]): RenderData {
  const renderElements: RenderElement[] = data.map(day => {
    const fields: RenderElement[] = Object.entries(day.courses).map(([course, courseValue]) => ({
      element: 'dish',
      instance: course, // e.g., "starter", "main", etc.
      hideControl: {
        hideSelf: true
      },
      fields: [
        {
          element: 'dishName',
          value: courseValue.dishName || '', // Default to empty string if no value
        },
        {
          element: 'dishDescription',
          value: courseValue.dishDescription || '',
          type: 'html',
          hideControl: {
            hideSelf: false,
            ancestorToHide: '.conditional-visibility'
          }
        },
      ],
    }));

    return {
      element: 'weekday',
      instance: day.weekday, // e.g., "monday", "tuesday", etc.
      fields: [
        ...fields,
        {
          element: 'day',
          value: `${formatDate(day.date, dateOptions.weekday)}, ${formatDate(day.date, { day: "numeric", month: "long" })}`,
        }
      ], // All the courses for the day
    };
  });

  return [
    {
      element: 'dish-list',
      fields: renderElements,
    },
  ];
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
  const canvas = new EditableCanvas(pdfElement);
  const filterForm = new FilterForm(filterFormElement);
  setDefaultFilters(filterForm);
  filterForm.addOnChange((filters) => {
    const result = filterMenuData(filters, menuList);
    const startDate = getMonday(new Date(filters.getField('startDate').value));
    const endDate = filters.getField('endDate').value;

    const renderFields: RenderField[] = [
      {
        element: 'title',
        value: `Menüplan ${formatDate(startDate, dateOptions.day)}.–${formatDate(endDate, dateOptions.day)}. ${formatDate(startDate, dateOptions.title)}`,
      } as RenderField,
    ];

    const renderElements: RenderData = parseDailyMenuData(result);
    const data: RenderData = [
      ...renderFields,
      ...renderElements,
    ];
    console.log("RENDER DATA", data);
    pdf.render(data);
  });
  filterForm.invokeOnChange(); // Initialize the filter with it's default values

  //console.log("Collection Data:", dailyMenuList.getCollectionData());

  pdf.renderer.addFilterAttributes(['wf-date', 'wf-end-date', 'weekly-hit-boolean']);
  const read = pdf.renderer.read(dailyMenuListElement, []);
  console.log("READ", read);

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

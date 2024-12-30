// Imports
import CollectionList from '@library/wfcollection';
import createAttribute from '@library/attributeselector';
import html2canvas from 'html2canvas';
import jsPDF, { Html2CanvasOptions } from 'jspdf';
import { FieldFromInput, filterFormSelector, FormField, FormInput, formQuery } from '@library/form';
import FieldGroup from '@library/form/fieldgroup';

// Types
type PdfFieldName = string | 'dishName' | 'dishDescription' | 'price' | 'priceSmall';
type DailyMenuCollectionData = Array<DailyMenuData>;
type PdfElement = 'dish' | 'page';
type ActionElement = 'download' | 'save';
type Action = (data: FieldGroup) => any;

// Selector functions
const pdfFieldSelector = createAttribute<PdfFieldName>('data-pdf-field');
const pdfElementSelector = createAttribute<PdfElement>('data-pdf-element');
const wfCollectionSelector = createAttribute<string>('wf-collection');
const actionSelector = createAttribute<ActionElement>('data-action');

class DailyMenuData {
  date: Date;
  weekday: string;
  courses: { [key: string]: any };

  constructor(date: Date, courses: { [key: string]: any }) {
    this.date = date;
    this.weekday = date.toLocaleDateString('de-DE', { weekday: 'long' });
    this.courses = courses;
  }

  getWeekdayEn(): string {
    return this.date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  }

  toJSON() {
    return {
      date: this.date,
      weekday: this.weekday,
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
    this.collectionData = Array.from(listItems).map((menuElement) => {
      const courses = this.getCourses(menuElement);
      const dateString = menuElement.dataset.wfDate || '';
      const date = new Date(dateString);
      return new DailyMenuData(date, courses);
    });

    return this.collectionData;
  }

  /**
   * Get the courses from a daily menu / collection item / from one day.
   * Courses: starter, main, mainVegetarian, dessert.
   *
   * Parameters:
   * @param menuElement The Daily Menu - This element contains all the courses from a specific day.
   *
   * @returns The courses as an object.
   * */
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

  public filterByDate(startDate: Date, endDate: Date): DailyMenuData[] {
    return this.collectionData.filter(
      (menuData) => menuData.date >= startDate && menuData.date <= endDate
    );
  }

  public filterByRange(startDate: Date, dayRange: number = 7): DailyMenuData[] {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + dayRange - 1);
    return this.filterByDate(startDate, endDate);
  }
}

class PDF {
  private canvas: HTMLElement;
  private renderer: Renderer;

  constructor(canvas: HTMLElement | null) {
    if (!canvas) throw new Error('PDF Element not found.');
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
  }

  public render(
    data: any,
    attributePrefix: string,
    options: { useINnerHTML?: boolean; nestedKeySeparator?: string } = {}
  ): void {
    this.renderer.render(data, attributePrefix, options);
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
  }

  public addOnChange(action: Action) {
    this.changeActions.push(action);
  }

  private onChange(): void {
    const data = {};
    this.changeActions.forEach(action => action(data));
  }

  private extractData(fields: NodeListOf<FormInput> | FormInput[]): FieldGroup {
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

function addDays(date: Date = new Date(), days: number): Date {
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getMondayFrom(date: Date): Date {
  if (date.getDay() != 1) {
    return new Date(date.setDate(date.getDate() - (date.getDay() + 6) % 7));
  } else {
    return date;
  }
}

function filterDailyMenuCollection(collectionData: DailyMenuCollectionData) {
  const startDate = new Date('2024-12-30');
  const endDate = new Date('2025-01-05');
  return collectionData.filter(dailyMenu => startDate <= dailyMenu.date && dailyMenu.date <= endDate);
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

function initialize(): void {
  const dailyMenuListElement: HTMLElement | null = document.querySelector(wfCollectionSelector('daily'));
  const hitMenuListElement: HTMLElement | null = document.querySelector(wfCollectionSelector('hit'))
  const pdfElement: HTMLElement | null = document.querySelector(pdfElementSelector('page'));
  const filterFormElement: HTMLElement | null = document.querySelector(filterFormSelector('component'));

  const dailyMenuList = new DailyMenuCollection(dailyMenuListElement);
  const hitMenuList = new DailyMenuCollection(hitMenuListElement);
  const pdf = new PDF(pdfElement);
  const filterForm = new FilterForm(filterFormElement);


  // Example: Filter the data
  const startDate = new Date('2024-12-31');
  const filteredData = dailyMenuList.filterByRange(startDate, 4);

  console.log("Collection Data:", dailyMenuList.getCollectionData());
  console.log("Filtered Data:", filteredData);

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

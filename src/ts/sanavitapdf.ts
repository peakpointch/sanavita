// Imports
import EditableCanvas from '@library/canvas';
import Pdf, { pdfElementSelector } from '@library/pdf';
import { CollectionList } from '@library/wfcollection';
import { RenderData, RenderElement, RenderField } from '@library/renderer';
import { FilterForm, FieldGroup, filterFormSelector } from '@library/form';
import createAttribute from '@library/attributeselector';

// Types
type ActionElement = 'download' | 'save';
type MenuDataCondition = ((menuData: RenderElement | RenderField) => boolean);

// Selector functions
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

const filterMenuData = (filters: FieldGroup, menuList: DailyMenuCollection): RenderData => {
  const startDateValue: string = filters.getField('startDate').value;
  const startDate: Date = new Date(startDateValue);
  const endDateValue: string = filters.getField('endDate').value;
  const endDate: Date = new Date(endDateValue);
  const filteredDays: RenderData = menuList.filterByDate(startDate, endDate);

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

function initDownload(pdf: Pdf): void {
  const button = document.querySelector(actionSelector('download'));
  if (!button) throw new Error('Download button does not exist');
  button.addEventListener('click', async () => {
    pdf.scale(1, false);
    setTimeout(async () => {
      await pdf.create();
      pdf.resetScale();
    }, 0);
  });
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

function tagWeeklyHit(list: HTMLElement): void {
  const weeklyHitElements: NodeListOf<HTMLElement> = list.querySelectorAll(`.w-dyn-item:has([data-weekly-hit-boolean="true"])`);
  weeklyHitElements.forEach(hit => {
    hit.setAttribute("data-pdf-element", "weekly-hit");
  });
}

function initialize(): void {
  const dailyMenuListElement: HTMLElement | null = document.querySelector(wfCollectionSelector('daily'));
  const pdfContainer: HTMLElement | null = document.querySelector(pdfElementSelector('container'));
  const filterFormElement: HTMLElement | null = document.querySelector(filterFormSelector('component'));

  tagWeeklyHit(dailyMenuListElement);

  const menuList = new DailyMenuCollection(dailyMenuListElement);
  const pdf = new Pdf(pdfContainer);

  const filterForm = new FilterForm(filterFormElement);
  setDefaultFilters(filterForm, menuList.getCollectionData());
  filterForm.addOnChange((filters) => {
    const startDate = new Date(filters.getField('startDate').value);
    const endDate = filters.getField('endDate').value;
    const scale = parseFloat(filters.getField('scale').value)
    pdf.scale(scale);
    filterForm.setDayRange(parseFloat(filters.getField('dayRange').value));

    const renderFields: RenderField[] = [
      {
        element: 'title',
        value: `${formatDate(startDate, dateOptions.day)}. – ${formatDate(endDate, dateOptions.day)}. ${formatDate(startDate, dateOptions.title)}`,
      } as RenderField,
    ];

    const renderElements: RenderData = filterMenuData(filters, menuList);
    const data: RenderData = [
      ...renderFields,
      ...renderElements,
    ];
    pdf.render(data);
  });

  const resetScaleToBreakpointDefault = (): void => {
    const defaultScale = pdf.getDefaultScale();
    filterForm.getFilterInput('scale').value = defaultScale.toString();
    pdf.scale(defaultScale);
  };
  resetScaleToBreakpointDefault();

  window.addEventListener('resize', () => {
    resetScaleToBreakpointDefault();
  })

  const canvas = new EditableCanvas(pdfContainer, '.pdf-h3');

  filterForm.invokeOnChange(); // Initialize the filter with it's default values

  initDownload(pdf);
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    initialize();
  } catch (e) {
    console.error(e);
  }
});

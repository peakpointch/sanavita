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

class FilterCollection extends CollectionList {
  constructor(container: HTMLElement | null) {
    super(container, 'pdf');

    this.renderer.addFilterAttributes(['date', 'end-date']);
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

function setMinMaxDate(form: FilterForm, data: RenderData): void {
  const dates = data.map(weekday => weekday.date.getTime());
  const minDate = new Date(Math.min(...dates)).toISOString().split('T')[0];
  const maxDate = new Date(Math.max(...dates)).toISOString().split('T')[0];

  form.getFilterInput('startDate').setAttribute('min', minDate)
  form.getFilterInput('startDate').setAttribute('max', maxDate)
  form.getFilterInput('endDate').setAttribute('min', minDate)
  form.getFilterInput('endDate').setAttribute('max', maxDate)
}

function setDefaultFilters(form: FilterForm): void {
  const nextMonday: Date = getMonday(new Date(), 1);

  form.getFilterInput('startDate').value = nextMonday.toLocaleDateString('en-CA');
  form.getFilterInput('endDate').value = addDays(nextMonday, 6).toLocaleDateString('en-CA');
  form.getFilterInput('dayRange').value = form.setDayRange(7).toString();
}

type DateOptionsObject = {
  [key: string]: Intl.DateTimeFormatOptions;
}

function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions): string {
  return new Date(date).toLocaleDateString('de-CH', options);
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

/**
 * Tag the weekly hit elements in the cms list with 
 * a different attribute value, so that the render engine 
 * can effectively differentiate them as two different 
 * render elements.
 */
function tagWeeklyHit(list: HTMLElement): void {
  const weeklyHitElements: NodeListOf<HTMLElement> = list.querySelectorAll(`.w-dyn-item:has([data-weekly-hit-boolean="true"])`);
  weeklyHitElements.forEach(hit => {
    hit.setAttribute("data-pdf-element", "weekly-hit");
  });
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
  const pdfContainer: HTMLElement | null = document.querySelector(pdfElementSelector('container'));
  const filterFormElement: HTMLElement | null = document.querySelector(filterFormSelector('component'));

  // Before initialization
  tagWeeklyHit(dailyMenuListElement);

  // Initialize collection list and pdf
  const filterCollection = new FilterCollection(dailyMenuListElement);
  const pdf = new Pdf(pdfContainer);
  const filterForm = new FilterForm(filterFormElement);
  const canvas = new EditableCanvas(pdfContainer, '.pdf-h3');

  filterCollection.renderer.addFilterAttributes(['weekly-hit-boolean']);
  filterCollection.readCollectionData();
  setDefaultFilters(filterForm);
  setMinMaxDate(filterForm, filterCollection.getCollectionData());

  filterForm.addBeforeChange(() => {
    filterForm.validateDateRange('startDate', 'endDate');
  });
  filterForm.addOnChange((filters) => {
    // Get FilterForm values
    const startDate = new Date(filters.getField('startDate').value);
    const endDate = new Date(filters.getField('endDate').value);
    const dayRange = parseFloat(filters.getField('dayRange').value);
    const scale = parseFloat(filters.getField('scale').value)

    // Use FilterForm values
    filterForm.setDayRange(dayRange);
    const staticRenderFields: RenderField[] = [
      {
        element: 'title',
        value: `${formatDate(startDate, dateOptions.day)}. – ${formatDate(endDate, dateOptions.day)}. ${formatDate(startDate, dateOptions.title)}`,
      } as RenderField,
    ];

    pdf.scale(scale);
    pdf.render([
      ...staticRenderFields,
      ...filterCollection.filterByDate(startDate, endDate),
    ]);
  });

  filterForm.addResizeReset('scale', () => {
    const defaultScale = pdf.getDefaultScale();
    pdf.scale(defaultScale);
    return defaultScale;
  });

  filterForm.applyResizeResets();
  filterForm.invokeOnChange(); // Initialize the filter with it's default values
  pdf.initDownload(document.querySelector(actionSelector('download')));
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    initialize();
  } catch (e) {
    console.error(e);
  }
});

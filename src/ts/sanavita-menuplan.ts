// Imports
import EditableCanvas from '@library/canvas';
import Pdf, { pdfElementSelector } from '@library/pdf';
import { FilterCollection } from '@library/wfcollection';
import { RenderData, RenderElement, RenderField } from '@library/renderer';
import { FilterForm, FieldGroup, filterFormSelector } from '@library/form';
import { addDays, getMonday, formatDate, DateOptionsObject } from '@library/dateutils';
import createAttribute from '@library/attributeselector';

// Types
type ActionElement = 'download' | 'save';

// Selector functions
const wfCollectionSelector = createAttribute<string>('wf-collection');
const actionSelector = createAttribute<ActionElement>('data-action');

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

  filterForm.addBeforeChange(() => filterForm.validateDateRange('startDate', 'endDate'));
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

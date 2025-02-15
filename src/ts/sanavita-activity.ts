// Imports
import EditableCanvas from '@library/canvas';
import Pdf from '@library/pdf';
import { FilterCollection } from '@library/wfcollection';
import { RenderData, RenderField } from '@library/renderer';
import { FilterForm, filterFormSelector } from '@library/form';

// Utility functions
import createAttribute from '@library/attributeselector';
import { addDays, getMonday, formatDate, DateOptionsObject } from '@library/dateutils';

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
  const filterCollectionListElement: HTMLElement | null = document.querySelector(wfCollectionSelector('activity'));
  const pdfContainer: HTMLElement | null = document.querySelector(Pdf.select('container'));
  const filterFormElement: HTMLElement | null = document.querySelector(filterFormSelector('component'));

  // Initialize collection list and pdf
  const filterCollection = new FilterCollection(filterCollectionListElement);
  const pdf = new Pdf(pdfContainer);
  const filterForm = new FilterForm(filterFormElement);
  const canvas = new EditableCanvas(pdfContainer, '.pdf-h3');


  filterCollection.readCollectionData();
  setDefaultFilters(filterForm);
  setMinMaxDate(filterForm, filterCollection.getCollectionData());

  filterForm.addBeforeChange(() => filterForm.validateDateRange('startDate', 'endDate', 5));
  filterForm.addOnChange(['scale'], (filters) => {
    const scale = parseFloat(filters.getField('scale').value);
    pdf.scale(scale);
  });
  filterForm.addOnChange(['save'], () => {
    filterForm.invokeOnChange(['startDate']);
  });
  filterForm.addOnChange(['startDate', 'endDate', 'dayRange'], (filters) => {
    // Get FilterForm values
    const startDate = new Date(filters.getField('startDate').value);
    const endDate = new Date(filters.getField('endDate').value);
    const dayRange = parseFloat(filters.getField('dayRange').value);

    // Use FilterForm values
    filterForm.setDayRange(dayRange);
    const staticRenderFields: RenderField[] = [
      {
        element: 'title',
        value: `${formatDate(startDate, dateOptions.day)}. – ${formatDate(endDate, dateOptions.day)}. ${formatDate(startDate, dateOptions.title)}`,
        visibility: true,
      } as RenderField,
    ];

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
  filterForm.invokeOnChange("*"); // Initialize the filter with it's default values
  pdf.initDownload(document.querySelector(actionSelector('download')));
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    initialize();
  } catch (e) {
    console.error(e);
  }
});

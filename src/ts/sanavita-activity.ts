// Imports
import EditableCanvas from '@library/canvas';
import Pdf from '@library/pdf';
import { FilterCollection } from '@library/wfcollection';
import { RenderData, RenderElement, RenderField } from '@library/renderer';
import { FilterForm, CalendarweekComponent, filterFormSelector } from '@library/form';

// Utility functions
import createAttribute from '@library/attributeselector';
import { addDays, startOfWeek, format, getWeek, addWeeks, startOfYear, getYear, getISOWeeksInYear, StartOfWeekOptions, WeekOptions } from 'date-fns';
import { de } from 'date-fns/locale';

// Types
type ActionElement = 'download' | 'save';

const formatDE = (date: Date, formatStr: string) => format(date, formatStr, { locale: de });

// Selector functions
const wfCollectionSelector = createAttribute<string>('wf-collection');
const actionSelector = createAttribute<ActionElement>('data-action');

function setMinMaxDate(form: FilterForm, data: RenderData): Date[] {
  const dates = data.map(weekday => weekday.date.getTime());
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  const minDateStr = formatDE(minDate, "yyyy-MM-dd");
  const maxDateStr = formatDE(maxDate, "yyyy-MM-dd");

  form.getFilterInput('startDate').setAttribute('min', minDateStr)
  form.getFilterInput('startDate').setAttribute('max', maxDateStr)
  form.getFilterInput('endDate').setAttribute('min', minDateStr)
  form.getFilterInput('endDate').setAttribute('max', maxDateStr)

  return [minDate, maxDate];
}

function setDefaultFilters(form: FilterForm, minDate: Date, maxDate: Date): void {
  const currentMonday: Date = startOfWeek(new Date(), startOfWeekOptions);
  let nextMonday: Date = addWeeks(currentMonday, 1);
  if (nextMonday >= maxDate) {
    nextMonday = currentMonday;
  }

  form.getFilterInput('year').value = getYear(new Date()).toString();
  form.getFilterInput('calendarweek').value = getWeek(nextMonday, weekOptions).toString();
  form.getFilterInput('startDate').value = formatDE(nextMonday, "yyyy-MM-dd");
  form.getFilterInput('endDate').value = formatDE(addDays(nextMonday, 6), "yyyy-MM-dd");
  form.getFilterInput('dayRange').value = form.setDayRange(7).toString();
}

const weekOptions: WeekOptions = {
  weekStartsOn: 1,
}
const startOfWeekOptions: StartOfWeekOptions = {
  ...weekOptions,
}

function initialize(): void {
  const filterCollectionListElement: HTMLElement | null = document.querySelector(wfCollectionSelector('activity'));
  const pdfContainer: HTMLElement | null = document.querySelector(Pdf.select('container'));
  const filterFormElement: HTMLElement | null = document.querySelector(filterFormSelector('component'));
  const calendarweekElement: HTMLElement | null = document.querySelector(CalendarweekComponent.select('component'));

  // Initialize collection list and pdf
  const filterCollection = new FilterCollection(filterCollectionListElement);
  const pdf = new Pdf(pdfContainer);
  const filterForm = new FilterForm(filterFormElement);
  const canvas = new EditableCanvas(pdfContainer, '.pdf-h3');


  filterCollection.readCollectionData();
  const [minDate, maxDate] = setMinMaxDate(filterForm, filterCollection.getCollectionData());
  setDefaultFilters(filterForm, minDate, maxDate);
  const calendarweekComponent = new CalendarweekComponent(calendarweekElement, "continuous");
  calendarweekComponent.setMinMaxDates(minDate, maxDate);
  calendarweekComponent.addOnChange((week, year, date) => {
    filterForm.getFilterInput('startDate').value = format(date, "yyyy-MM-dd");
    filterForm.invokeOnChange(['startDate']);
  });

  filterForm.addBeforeChange(() => filterForm.validateDateRange('startDate', 'endDate', 5));
  filterForm.addOnChange(['design'], (filters) => {
    const pages = pdf.getPageWrappers();
    const selectedDesign = filters.getField('design').value;
    pages.forEach((page) => {
      const design = page.getAttribute("data-pdf-design");
      if (design === selectedDesign) {
        page.classList.remove('hide');
      } else {
        page.classList.add('hide');
      }
    });

  });
  filterForm.addOnChange(['scale'], (filters) => {
    const scale = parseFloat(filters.getField('scale').value);
    pdf.scale(scale);
  });
  filterForm.addOnChange(['save'], () => {
    filterForm.invokeOnChange(['startDate']);
  });
  filterForm.addOnChange(['startDate', 'endDate', 'dayRange'], (filters, invokedBy) => {
    // Get FilterForm values
    const startDate = new Date(filters.getField('startDate').value);
    const endDate = new Date(filters.getField('endDate').value);
    const dayRange = parseFloat(filters.getField('dayRange').value);

    // Use FilterForm values
    filterForm.setDayRange(dayRange);
    calendarweekComponent.setDate(invokedBy === "endDate" ? endDate : startDate, true);

    // Static render fields
    const staticRenderFields: RenderField[] = [
      {
        element: 'title',
        value: `${formatDE(startDate, 'd')}. – ${formatDE(endDate, 'd')}. ${formatDE(startDate, 'MMMM yyyy')}`,
        visibility: true,
      }
    ];
    const staticRenderElements: RenderElement[] = [
      {
        element: 'activitySpecial',
        visibility: true,
        fields: [
          {
            element: 'title',
            value: `Spezialprogramm`,
            visibility: true,
          },
          {
            element: 'time',
            value: `Uhrzeit`,
            visibility: true,
          },
          {
            element: 'paragraph',
            value: `Lorem ipsum dolor sit amet, consetetur sadipscing elitir, sed diam nonumy eirmod tempor invidungt ut labore et dolore magna aliquayam erat, sed diam voluptua. at vero eos et accusam et justo dua dolores et ea rebum. Stet cilita kasd gubergren, no sea takimata sanctus.`,
            visibility: true,
          }
        ]
      }
    ]

    pdf.render([
      ...staticRenderFields,
      ...staticRenderElements,
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

// Imports
import EditableCanvas from '@library/canvas';
import Pdf from '@library/pdf';
import { FilterCollection } from '@library/wfcollection';
import { RenderData, RenderElement, RenderField } from '@library/renderer';
import { FilterForm, CalendarweekComponent, filterFormSelector } from '@library/form';

// Utility functions
import createAttribute from '@library/attributeselector';
import { addDays, startOfWeek, format, getWeek, addWeeks, getYear, WeekOptions, getISOWeek, getISOWeekYear, StartOfWeekOptions, parse } from 'date-fns';
import { de } from 'date-fns/locale';

// Types
type ActionElement = 'download' | 'save';
type FieldIds = 'startDate' | 'endDate' | 'dayRange' | 'design' | 'scale' | 'calendarweek' | 'calendaryear' | ActionElement;

/**
 * Metadata representing a `Pdf` instance.
 */
interface LocalStoragePdfInstance {
  design: string;
}

/**
 * LocalStorage object representing the list of existing pdf metadata.
 */
interface LocalStoragePdf {
  activity?: LocalStoragePdfInstance;
  menuplan?: LocalStoragePdfInstance;
}

const formatDE = (date: Date, formatStr: string) => format(date, formatStr, { locale: de });

// Selector functions
const wfCollectionSelector = createAttribute<string>('wf-collection');
const actionSelector = createAttribute<ActionElement>('data-action');

const weekOptions: WeekOptions = {
  weekStartsOn: 1,
}

const sowOptions: StartOfWeekOptions = {
  ...weekOptions,
  locale: de,
}

function setMinMaxDate(form: FilterForm<FieldIds>, data: RenderData): Date[] {
  const dates = data.map(weekday => weekday.date.getTime());
  let minDate = new Date(Math.min(...dates));
  let maxDate = new Date(Math.max(...dates));
  if (startOfWeek(minDate, sowOptions).getTime() !== minDate.getTime()) {
    minDate = startOfWeek(addDays(minDate, 7), sowOptions);
  }
  const minDateStr = formatDE(minDate, 'yyyy-MM-dd');
  const maxDateStr = formatDE(maxDate, 'yyyy-MM-dd');

  form.getFilterInput('startDate').setAttribute('min', minDateStr)
  form.getFilterInput('startDate').setAttribute('max', maxDateStr)
  form.getFilterInput('endDate').setAttribute('min', minDateStr)
  form.getFilterInput('endDate').setAttribute('max', maxDateStr)

  return [minDate, maxDate];
}

function setDefaultFilters(form: FilterForm<FieldIds>, minDate: Date, maxDate: Date): void {
  let currentMonday: Date = startOfWeek(new Date(), sowOptions);
  let nextMonday: Date = addWeeks(currentMonday, 1);
  if (nextMonday >= maxDate) {
    nextMonday = currentMonday;
  }

  form.getFilterInput('calendaryear').value = getYear(nextMonday).toString();
  form.getFilterInput('calendarweek').value = getWeek(nextMonday, weekOptions).toString();
  form.getFilterInput('startDate').value = formatDE(nextMonday, 'yyyy-MM-dd');
  form.getFilterInput('endDate').value = formatDE(addDays(nextMonday, 6), 'yyyy-MM-dd');
  form.getFilterInput('dayRange').value = form.setDayRange(7).toString();

  const pdfStorage = parsePdfLocalStorage();
  const design = pdfStorage.activity.design;
  if (design) {
    form.getFilterInput('design').value = design;
  }
}

/**
 * Tag the special activity elements in the cms list with 
 * a different attribute value, so that the render engine 
 * can effectively differentiate them as two different 
 * render elements.
 */
function tagActivitySpecial(list: HTMLElement): void {
  const activityElements: NodeListOf<HTMLElement> = list.querySelectorAll(`.w-dyn-item`);
  activityElements.forEach(item => {
    const normalItem = item.children[0] as HTMLElement;
    const specialItem = item.children[1] as HTMLElement;

    const type = normalItem.matches('.w-condition-invisible') ? 'special' : 'normal';
    switch (type) {
      case 'normal':
        specialItem.remove();
        break;

      case 'special':
        normalItem.remove();
        item.setAttribute('data-pdf-element', 'activitySpecial');
        break;
    }
  });
}

function parsePdfLocalStorage(): LocalStoragePdf {
  const parsed: LocalStoragePdf = JSON.parse(localStorage.getItem('pdf') || '{}');

  const pdfStorage: LocalStoragePdf = {
    menuplan: {
      design: parsed.menuplan?.design || '',
    },
    activity: {
      design: parsed.activity?.design || '',
    }
  };

  return pdfStorage;
}

function getStartDateFormat(startDate: Date, endDate: Date): string {
  let formatString = `d.`;

  if (startDate.getMonth() < endDate.getMonth()) {
    formatString += ` MMMM`;
  }

  if (getISOWeekYear(startDate) !== getISOWeekYear(endDate)) {
    formatString += ` yyyy`;
  }

  return formatString;
}

function initialize(): void {
  const filterCollectionListElement = document.querySelector<HTMLElement>(wfCollectionSelector('activity'));
  const pdfContainer = document.querySelector<HTMLElement>(Pdf.select('container'));
  const filterFormElement = document.querySelector<HTMLElement>(filterFormSelector('component'));
  const calendarweekElement = document.querySelector<HTMLElement>(CalendarweekComponent.select('component'));

  // Before initialization
  tagActivitySpecial(filterCollectionListElement);

  /**
   * The `localStorage` object for `Pdf`.
   */
  const pdfStorage = parsePdfLocalStorage();

  // Initialize collection list and pdf
  const filterCollection = new FilterCollection(filterCollectionListElement, 'Aktivitäten', 'pdf');
  const pdf = new Pdf(pdfContainer);
  const filterForm = new FilterForm<FieldIds>(filterFormElement);
  const canvas = new EditableCanvas(pdfContainer, '.pdf-h3');

  filterCollection.readData();
  const [minDate, maxDate] = setMinMaxDate(filterForm, filterCollection.getData());
  setDefaultFilters(filterForm, minDate, maxDate);

  const cweek = new CalendarweekComponent(calendarweekElement);
  cweek.setMinMaxDates(minDate, maxDate);
  cweek.addOnChange((week, year, date) => {
    filterForm.getFilterInput('startDate').value = format(date, 'yyyy-MM-dd');
    filterForm.invokeOnChange(['startDate']);
  });

  //filterCollection.debug = true;
  filterForm.addBeforeChange(() => filterForm.validateDateRange('startDate', 'endDate', 7));

  filterForm.addOnChange(['design'], (filters) => {
    const pages = pdf.getPageWrappers();
    const selectedDesign = filters.getField('design').value;
    pdfStorage.activity.design = selectedDesign;
    localStorage.setItem('pdf', JSON.stringify(pdfStorage));
    pages.forEach((page) => {
      const design = page.getAttribute('data-pdf-design');
      if (design === selectedDesign) {
        page.classList.remove('hide');
      } else {
        page.classList.add('hide');
      }
    });
  });

  filterForm.addOnChange(['startDate', 'endDate', 'save'], (filters, invokedBy) => {
    // Get FilterForm values
    const startDate = parse(filters.getField('startDate').value, 'yyyy-MM-dd', new Date());
    const endDate = parse(filters.getField('endDate').value, 'yyyy-MM-dd', new Date());

    // Use FilterForm values
    cweek.setDate(invokedBy === 'endDate' ? endDate : startDate, true);

    const startDateTitleFormat = getStartDateFormat(startDate, endDate);

    // Static render fields
    const staticRenderFields: RenderField[] = [
      {
        element: 'title',
        value: `${formatDE(startDate, startDateTitleFormat)} – ${formatDE(endDate, 'd. MMMM yyyy')}`,
        visibility: true,
      },
    ];

    pdf.render([
      ...staticRenderFields,
      ...filterCollection.filterByDate(startDate, endDate),
    ]);

    canvas.showHiddenElements();
  });

  filterForm.addOnChange(['scale'], (filters) => {
    const scale = parseFloat(filters.getField('scale').value);
    pdf.scale(scale);
  });

  filterForm.addOnChange('*', () => {
    document.querySelectorAll<HTMLElement>(".pdf-image").forEach(el => {
      el.style.removeProperty('display');
      if (el.offsetHeight < 80) {
        el.style.display = "none";
      }
    });
  });

  filterForm.addResizeReset('scale', () => {
    const defaultScale = pdf.getDefaultScale();
    pdf.scale(defaultScale);
    return defaultScale;
  });

  filterForm.applyResizeResets();
  filterForm.invokeOnChange('*'); // Initialize the filter with it's default values

  const downloadBtn = document.querySelector(actionSelector('download'));
  downloadBtn.addEventListener('click', () => {
    const startDate = new Date(filterForm.getFilterInput('startDate').value);
    let filename = `Wochenprogramm ${getISOWeekYear(startDate)} KW${getISOWeek(startDate)}`;

    pdf.save(filename, 4.17);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    initialize();
  } catch (e) {
    console.error(e);
  }
});

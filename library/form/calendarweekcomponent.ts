import { getWeek, getYear, startOfYear, addWeeks, getISOWeeksInYear, min } from 'date-fns';
import createAttribute from '@library/attributeselector';

export class CalendarweekComponent {
  private container: HTMLElement;
  private calendarweekInput: HTMLInputElement;
  private yearInput: HTMLInputElement;
  private minDate: Date;
  private maxDate: Date;

  constructor(container: HTMLElement) {
    this.container = container;
    this.calendarweekInput = container.querySelector('input[name="calendarweek"]') as HTMLInputElement;
    this.yearInput = container.querySelector('input[name="year"]') as HTMLInputElement;

    // Read min and max dates from the data attributes
    const minDateStr = container.getAttribute('data-min');
    const maxDateStr = container.getAttribute('data-max');

    if (minDateStr && maxDateStr) {
      this.minDate = new Date(minDateStr);
      this.maxDate = new Date(maxDateStr);
    } else {
      throw new Error('Min and max dates are required in data-min and data-max attributes');
    }

    // Initialize the input fields based on the date range
    this.updateCalendarweekRange();
    this.yearInput.min = this.minDate.getFullYear().toString();
    this.yearInput.max = this.maxDate.getFullYear().toString();

    // Bind event listeners
    this.calendarweekInput.addEventListener('input', this.onCalendarweekChange.bind(this));
    this.yearInput.addEventListener('input', this.onYearChange.bind(this));
  }

  public static select = createAttribute<'component' | 'week' | 'year'>('data-cweek-element');

  private updateCalendarweekRange(): void {
    const currentYear = parseInt(this.yearInput.value);

    let minCalendarWeek = 1;
    let maxCalendarWeek = getISOWeeksInYear(new Date(currentYear, 0, 1));

    if (getYear(this.minDate) === currentYear) {
      minCalendarWeek = getWeek(this.minDate);
    }

    if (getYear(this.maxDate) === currentYear) {
      maxCalendarWeek = getWeek(this.maxDate);
    }

    // Set min/max attributes for calendarweek input
    this.calendarweekInput.setAttribute('data-min-val', minCalendarWeek.toString());
    this.calendarweekInput.setAttribute('data-max-val', maxCalendarWeek.toString());

    if (minCalendarWeek === 1) {
      this.calendarweekInput.removeAttribute('min');
    } else {
      this.calendarweekInput.setAttribute('min', minCalendarWeek.toString());
    }
    if (maxCalendarWeek === getISOWeeksInYear(new Date(currentYear, 0, 1))) {
      this.calendarweekInput.removeAttribute('max');
    } else {
      this.calendarweekInput.setAttribute('max', maxCalendarWeek.toString());
    }
  }

  private onCalendarweekChange(event: Event): void {
    let currentWeek = parseInt(this.calendarweekInput.value);
    let currentYear = parseInt(this.yearInput.value);

    // Get min and max calendar week values
    const minCalendarWeek = parseInt(this.calendarweekInput.dataset.minVal!);
    const maxCalendarWeek = parseInt(this.calendarweekInput.dataset.maxVal!);

    if (currentWeek < minCalendarWeek) {
      currentWeek = getISOWeeksInYear(new Date(currentYear, 0, 1));
      currentYear -= 1;
      this.calendarweekInput.value = currentWeek.toString();
      this.yearInput.value = currentYear.toString();
    } else if (currentWeek > maxCalendarWeek) {
      currentWeek = 1;
      currentYear += 1;
      this.calendarweekInput.value = currentWeek.toString();
      this.yearInput.value = currentYear.toString();
    }

    this.updateCalendarweekRange();
  }

  private onYearChange(event: Event): void {
    this.updateCalendarweekRange();

    let currentWeek = parseInt(this.calendarweekInput.value);

    // Get min and max calendar week values
    const minCalendarWeek = parseInt(this.calendarweekInput.dataset.minVal!);
    const maxCalendarWeek = parseInt(this.calendarweekInput.dataset.maxVal!);

    if (currentWeek < minCalendarWeek) {
      this.calendarweekInput.value = minCalendarWeek.toString();
    } else if (currentWeek > maxCalendarWeek) {
      this.calendarweekInput.value = maxCalendarWeek.toString();
    }
  }
}


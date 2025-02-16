import { getISOWeek, getISOWeeksInYear, WeekOptions, getISOWeekYear } from 'date-fns';
import createAttribute from '@library/attributeselector';

export type UXMode = 'continuous' | 'loop' | 'fixed';

export class CalendarweekComponent {
  private container: HTMLElement;
  private calendarweekInput: HTMLInputElement;
  private yearInput: HTMLInputElement;
  private minDate: Date | null = null;
  private maxDate: Date | null = null;
  private mode: UXMode = 'continuous';

  constructor(container: HTMLElement, mode?: UXMode) {
    this.container = container;
    this.calendarweekInput = container.querySelector('input[name="calendarweek"]') as HTMLInputElement;
    this.yearInput = container.querySelector('input[name="year"]') as HTMLInputElement;

    // Read the mode from a data attribute (defaults to 'continuous' if not set)
    if (!mode) {
      mode = container.getAttribute('data-mode') as UXMode;
    }
    switch (mode) {
      case "continuous":
      case "loop":
      case "fixed":
        this.mode = mode;
        break;
      default:
        throw new Error(`"${mode}" is not a valid mode.`);
    }

    console.info(`Mode is set to "${this.mode}".`);

    // Read min and max dates from the data attributes
    const minDateStr = container.getAttribute('data-min');
    const maxDateStr = container.getAttribute('data-max');

    if (minDateStr) {
      this.minDate = new Date(minDateStr);
      if (this.mode !== "loop") {
        this.yearInput.min = getISOWeekYear(this.minDate).toString();
      }
    }
    if (maxDateStr) {
      this.maxDate = new Date(maxDateStr);
      if (this.mode !== "loop") {
        this.yearInput.max = getISOWeekYear(this.maxDate).toString();
      }
    }

    // If in loop mode and there is only minDate or maxDate, set yearInput min or max
    if (this.mode === 'loop') {
      if (this.minDate && !this.maxDate) {
        this.yearInput.min = getISOWeekYear(this.minDate).toString();
      } else if (!this.minDate && this.maxDate) {
        this.yearInput.max = getISOWeekYear(this.maxDate).toString();
      }
    }

    // Bind event listeners
    this.calendarweekInput.addEventListener('input', () => this.onCalendarweekChange());
    this.yearInput.addEventListener('input', () => this.onYearChange());

    this.updateCalendarweekRange();
  }

  public static select = createAttribute<'component' | 'week' | 'year'>('data-cweek-element');

  private updateCalendarweekRange(): void {
    const currentYear = parseInt(this.yearInput.value);

    const maxWeeksOfCurrentYear = getISOWeeksInYear(new Date(currentYear, 0, 1));
    let minCalendarWeek = 1;
    let maxCalendarWeek = maxWeeksOfCurrentYear;

    if (this.minDate !== null && getISOWeekYear(this.minDate) === currentYear) {
      minCalendarWeek = getISOWeek(this.minDate);
    }

    if (this.maxDate !== null && getISOWeekYear(this.maxDate) === currentYear) {
      maxCalendarWeek = getISOWeek(this.maxDate);
    }

    // Set min/max attributes for calendarweek input
    this.calendarweekInput.setAttribute('data-min-val', minCalendarWeek.toString());
    this.calendarweekInput.setAttribute('data-max-val', maxCalendarWeek.toString());

    switch (this.mode) {
      case "continuous":
        if (currentYear !== getISOWeekYear(this.minDate) && minCalendarWeek === 1) {
          this.calendarweekInput.removeAttribute('min');
        } else {
          this.calendarweekInput.min = minCalendarWeek.toString();
        }
        if (currentYear !== getISOWeekYear(this.maxDate) && maxCalendarWeek === maxWeeksOfCurrentYear) {
          this.calendarweekInput.removeAttribute('max');
        } else {
          this.calendarweekInput.max = maxCalendarWeek.toString();
        }
        break;

      case "loop":
        this.calendarweekInput.removeAttribute('min');
        this.calendarweekInput.removeAttribute('max');
        break;

      case "fixed":
        this.calendarweekInput.min = minCalendarWeek.toString();
        this.calendarweekInput.max = maxCalendarWeek.toString();
        break;
    }
  }

  private onCalendarweekChange(): void {
    let currentWeek = parseInt(this.calendarweekInput.value);
    let currentYear = parseInt(this.yearInput.value);

    // Get min and max calendar week values
    const minCalendarWeek = parseInt(this.calendarweekInput.dataset.minVal!);
    const maxCalendarWeek = parseInt(this.calendarweekInput.dataset.maxVal!);

    switch (this.mode) {
      case "continuous":
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
        break;

      case "loop":
        if (currentWeek < minCalendarWeek) {
          currentWeek = maxCalendarWeek;
          this.calendarweekInput.value = currentWeek.toString();
        } else if (currentWeek > maxCalendarWeek) {
          currentWeek = minCalendarWeek;
          this.calendarweekInput.value = currentWeek.toString();
        }
        break;

      case "fixed":
        break;

    }

    this.updateCalendarweekRange();
  }

  private onYearChange(): void {
    let currentWeek = parseInt(this.calendarweekInput.value);
    let currentYear = parseInt(this.yearInput.value);
    if (this.mode === 'loop') {
      if (this.minDate && currentYear < getISOWeekYear(this.minDate)) {
        this.yearInput.value = getISOWeekYear(this.maxDate).toString();
      } else if (this.maxDate && currentYear > getISOWeekYear(this.maxDate)) {
        this.yearInput.value = getISOWeekYear(this.minDate).toString();
      }
    }
    this.updateCalendarweekRange();

    currentWeek = parseInt(this.calendarweekInput.value);
    currentYear = parseInt(this.yearInput.value);

    // Get min and max calendar week values
    const minCalendarWeek = parseInt(this.calendarweekInput.dataset.minVal!);
    const maxCalendarWeek = parseInt(this.calendarweekInput.dataset.maxVal!);

    // Ensure the selected calendar week is within range for continuous mode
    if (currentWeek < minCalendarWeek) {
      this.calendarweekInput.value = minCalendarWeek.toString();
    } else if (currentWeek > maxCalendarWeek) {
      this.calendarweekInput.value = maxCalendarWeek.toString();
    }

  }
}


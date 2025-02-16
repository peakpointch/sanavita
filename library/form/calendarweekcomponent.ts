import { getISOWeek, getISOWeeksInYear, getISOWeekYear, setISOWeekYear, setISOWeek, startOfISOWeek, format } from 'date-fns';
import createAttribute from '@library/attributeselector';

export type UXMode = 'continuous' | 'loop' | 'fixed';
export type CalendarweekElements = 'component' | 'week' | 'year';

function getISOWeeksOfYear(year: number): number {
  return getISOWeeksInYear(new Date(year, 5, 1));
}

export class CalendarweekComponent {
  private container: HTMLElement;
  private weekInput: HTMLInputElement;
  private yearInput: HTMLInputElement;
  private week: number | null;
  private year: number | null;
  private minDate: Date | null = null;
  private maxDate: Date | null = null;
  private minDateYear: number | null;
  private maxDateYear: number | null;
  private minDateWeek: number | null;
  private maxDateWeek: number | null;
  private mode: UXMode = 'continuous';

  constructor(container: HTMLElement, mode?: UXMode) {
    this.container = container;
    this.weekInput = container.querySelector('input[name="calendarweek"]') as HTMLInputElement;
    this.yearInput = container.querySelector('input[name="year"]') as HTMLInputElement;

    // Read the mode from a data attribute (defaults to 'continuous' if not set)
    if (!mode) {
      mode = container.getAttribute('data-mode') as UXMode;
      if (!["continuous", "loop", "fixed"].some((validMode) => validMode === mode)) {
        mode = "continuous";
        console.info(`Mode parsed from attribute was invalid. Mode was set to "${mode}".`);
      }
    }

    this.setMode(mode);

    // Read min and max dates from the data attributes
    const minDateStr = container.getAttribute('data-min-date');
    const maxDateStr = container.getAttribute('data-max-date');
    this.setMinMaxDates(new Date(minDateStr), new Date(maxDateStr));
    this.updateWeekMinMax();

    // Bind event listeners
    this.weekInput.addEventListener('keydown', (event) => this.onWeekKeydown(event));
    this.yearInput.addEventListener('keydown', (event) => this.onYearKeydown(event));
    this.yearInput.addEventListener('input', () => this.onYearChange());
  }

  public static select = createAttribute<CalendarweekElements>('data-cweek-element');

  public setDate(date: Date): void {
    const year = getISOWeekYear(date);
    const week = getISOWeek(date);

    // Ensure that the date is within the valid range (minDate and maxDate)
    if (
      (this.minDate && date < this.minDate) ||
      (this.maxDate && date > this.maxDate)
    ) {
      throw new Error('The provided date is out of range.');
    }

    // Set the year and calendar week
    this.year = year;
    this.week = week;
    this.yearInput.value = this.year.toString();
    this.weekInput.value = this.week.toString();

    // Update the range based on the new year and week
    this.updateWeekMinMax();
    this.onChange();
  }

  public setMode(mode: UXMode): void {
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
  }

  public setMinMaxDates(newMinDate: Date | null, newMaxDate: Date | null): void {
    if (newMinDate instanceof Date) {
      this.minDate = newMinDate;
      this.minDateYear = getISOWeekYear(newMinDate);
      this.minDateWeek = getISOWeek(newMinDate);
      this.yearInput.min = this.minDateYear.toString();
      this.container.dataset.minDate = format(newMinDate, "yyyy-MM-dd");
    } else {
      this.minDate = null;
      this.minDateYear = null;
      this.minDateWeek = null;
      this.yearInput.min = null;
      this.container.dataset.minDate = null;
    }

    if (newMaxDate instanceof Date) {
      this.maxDate = newMaxDate;
      this.maxDateYear = getISOWeekYear(newMaxDate);
      this.maxDateWeek = getISOWeek(newMaxDate);
      this.yearInput.max = this.maxDateYear.toString();
      this.container.dataset.maxDate = format(newMaxDate, "yyyy-MM-dd");
    } else {
      this.maxDate = null;
      this.maxDateYear = null;
      this.maxDateWeek = null;
      this.yearInput.max = null;
      this.container.dataset.maxDate = null;
    }

    this.updateWeekMinMax();
  }

  public getCurrentDate(): Date | null {
    this.parseWeekAndYear();

    if (isNaN(this.year) || isNaN(this.week)) return null;

    // Create a date representing the given ISO year and week
    let date = setISOWeekYear(new Date(0), this.year);
    date = setISOWeek(date, this.week);

    // Ensure date is within valid range
    if (this.minDate && date < this.minDate) return null;
    if (this.maxDate && date > this.maxDate) return null;

    // Get the first day (Monday) of that week
    return startOfISOWeek(date);
  }

  private parseWeekAndYear(): void {
    const parsedYear = parseInt(this.yearInput.value, 10);
    const parsedWeek = parseInt(this.weekInput.value, 10);

    if (isNaN(parsedYear) || isNaN(parsedWeek)) {
      this.year = null;
      this.week = null;
      return;
    }

    const maxWeeksInParsedYear = getISOWeeksOfYear(parsedYear);

    if (
      (this.minDateYear && parsedYear < this.minDateYear) ||
      (this.maxDateYear && parsedYear > this.maxDateYear) ||
      parsedWeek < 1 ||
      parsedWeek > maxWeeksInParsedYear
    ) {
      this.year = null;
      this.week = null;
      return;
    }

    this.year = parsedYear;
    this.week = parsedWeek;
  }


  private onChange(): void {
    console.log("ON CHANGE");
  }

  private onYearChange(): void {
    this.validateWeekInBounds();
    this.onChange();
  }

  private updateWeekMinMax(): void {
    const currentYear = parseInt(this.yearInput.value);

    const maxWeeksOfCurrentYear = getISOWeeksOfYear(currentYear);
    let minCalendarWeek = 1;
    let maxCalendarWeek = maxWeeksOfCurrentYear;

    if (this.minDate !== null && this.minDateYear === currentYear) {
      minCalendarWeek = this.minDateWeek;
    }

    if (this.maxDate !== null && this.maxDateYear === currentYear) {
      maxCalendarWeek = this.maxDateWeek;
    }

    // Set min/max attributes for calendarweek input
    this.weekInput.min = minCalendarWeek.toString();
    this.weekInput.max = maxCalendarWeek.toString();
  }

  private onWeekKeydown(event: KeyboardEvent): void {
    let currentWeek = parseInt(this.weekInput.value);
    let currentYear = parseInt(this.yearInput.value);

    // Get min and max calendar week values
    const minCalendarWeek = parseInt(this.weekInput.min);
    const maxCalendarWeek = parseInt(this.weekInput.max);
    let changed: boolean = false;

    if (event.key === "ArrowUp" && currentWeek >= maxCalendarWeek) {
      event.preventDefault();
      switch (this.mode) {
        case "continuous":
          if (currentYear === this.maxDateYear) break;
          currentYear += 1;
          currentWeek = 1;
          this.yearInput.value = currentYear.toString();
          this.updateWeekMinMax();
          this.weekInput.value = currentWeek.toString();
          changed = true
          break;

        case "loop":
          currentWeek = minCalendarWeek;
          this.weekInput.value = currentWeek.toString();
          changed = true
          break;
      }
    } else if (event.key === "ArrowDown" && currentWeek <= minCalendarWeek) {
      event.preventDefault();
      switch (this.mode) {
        case "continuous":
          if (currentYear === this.minDateYear) break;
          currentYear -= 1;
          currentWeek = getISOWeeksOfYear(currentYear);
          this.yearInput.value = currentYear.toString();
          this.updateWeekMinMax();
          this.weekInput.value = currentWeek.toString();
          changed = true
          break;

        case "loop":
          currentWeek = maxCalendarWeek;
          this.weekInput.value = currentWeek.toString();
          changed = true
          break;
      }
    }

    if (changed && this.getCurrentDate() !== null) {
      this.updateWeekMinMax();
      this.validateWeekInBounds();
      this.onChange();
    }
  }

  private validateWeekInBounds(): void {
    let currentWeek = parseInt(this.weekInput.value);

    // Get min and max calendar week values
    const minCalendarWeek = parseInt(this.weekInput.min);
    const maxCalendarWeek = parseInt(this.weekInput.max);

    // Ensure the selected calendar week is within range for continuous mode
    if (currentWeek < minCalendarWeek) {
      this.weekInput.value = minCalendarWeek.toString();
    } else if (currentWeek > maxCalendarWeek) {
      this.weekInput.value = maxCalendarWeek.toString();
    }
  }

  private onYearKeydown(event: KeyboardEvent): void {
    if (this.mode !== "loop" || !this.minDate || !this.maxDate) return;
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;

    const isArrowUp = event.key === "ArrowUp";
    const isArrowDown = event.key === "ArrowDown";
    let currentYear = parseInt(this.yearInput.value);

    if ((isArrowUp && currentYear === this.maxDateYear) || (isArrowDown && currentYear === this.minDateYear)) {
      event.preventDefault();
      this.yearInput.value = (isArrowUp ? this.minDateYear : this.maxDateYear).toString();

      this.validateWeekInBounds();
      this.onChange();
    }
  }
}


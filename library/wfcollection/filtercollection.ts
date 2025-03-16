import { CollectionList } from '@library/wfcollection';
import { RenderData, RenderElement, RenderField } from '@library/renderer';

type MenuDataCondition = ((menuData: RenderElement | RenderField) => boolean);

export class FilterCollection extends CollectionList {
  constructor(container: HTMLElement | null, name?: string) {
    super(container, name);

    this.renderer.addFilterAttributes({
      "date": "date",
      "end-date": "date",
    });
  }

  public filterByDate(
    startDate: Date,
    endDate: Date,
    ...additionalConditions: MenuDataCondition[]
  ): RenderData {
    const filtered = [...this.collectionData].filter(
      (weekday) => {
        // Base conditions
        const baseCondition =
          weekday.date.getTime() >= startDate.getTime() &&
          weekday.date.getTime() <= endDate.getTime();

        // Check all additional conditions
        const allAdditionalConditions = additionalConditions.every((condition) => condition(weekday));

        return baseCondition && allAdditionalConditions;
      }
    );

    this.log('Filtered Data:', filtered);

    return filtered;
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


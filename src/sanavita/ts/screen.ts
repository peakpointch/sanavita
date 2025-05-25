import createAttribute from "@peakflow/attributeselector";
import { FilterCollection } from "@peakflow/wfcollection";
import Renderer, { RenderData } from "@peakflow/renderer";
import Swiper from "swiper";
import { Autoplay, Navigation, Pagination, Manipulation } from "swiper/modules";
import { readSwiperOptions } from "../../ts/swiper";
import { SwiperOptions } from "swiper/types";

type WfCollection = "screen";
type SwiperInstance = "news" | "tagesmenu" | "wochenhit" | "activity";

const wfCollectionSelector = createAttribute<WfCollection>("wf-collection");
const swiperSelector = createAttribute<SwiperInstance>("custom-swiper-component");

const filterAttributes = Renderer.defineAttributes({
  ...FilterCollection.defaultAttributes,
  "screen": "string",
  "use-time-of-day-range": "boolean",
});

type OverlayFilterAttrs = typeof filterAttributes;

function getScreen(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || '';
}

class ElementManager {
  public data: RenderData<OverlayFilterAttrs>; // All available elements
  public screen: string;
  private filteredData: typeof this.data; // Elements currently visible in the swiper
  private swiper: Swiper; // Assuming swiper is a valid instance.
  private collectionElement: HTMLElement; // Global element containing all possible HTMLElements (hidden designs)
  private insertedElements: Map<string, HTMLElement>; // To track inserted elements

  /**
   * Count of elements overlaying the swiper. Does not include 'birthday' elements.
   */
  private overlaycount: number = 0;

  constructor(allElements: RenderData<OverlayFilterAttrs>, swiper: Swiper, collectionElement: HTMLElement) {
    this.data = allElements;
    this.screen = getScreen();
    this.filteredData = []; // Track currently visible elements
    this.swiper = swiper;
    this.collectionElement = collectionElement; // Global element where HTMLElements are located (hidden)
    this.insertedElements = new Map(); // Initialize map to track inserted elements
  }

  // Filters the RenderData and returns the elements that should be shown
  private filterElements(): RenderData {
    this.filteredData = [...this.data].filter((entry) => {
      if (!entry.props.screen) entry.props.screen = '';
      entry.props.screen = entry.props.screen.toLowerCase();

      let matchScreen = entry.props.screen === this.screen;
      if (!entry.props.screen || !this.screen) {
        matchScreen = true;
      }

      const startDate = entry.props.startDate;
      const endDate = entry.props.endDate;

      const now = new Date();

      const inRange = startDate <= now && now <= endDate;

      if (entry.props.useTimeOfDayRange) {
        const inTimeRange = isNowInTimeOfDayRange(startDate, endDate);
        return matchScreen && inRange && inTimeRange;
      } else {
        return matchScreen && inRange;
      }
    });

    return this.filteredData;
  }

  private sortByDate(data: RenderData<OverlayFilterAttrs>): RenderData<OverlayFilterAttrs> {
    return data.sort((a, b) => a.props.startDate.getTime() - b.props.startDate.getTime());
  }

  // Finds the original HTMLElement for a given entry in the collectionElement (hidden designs)
  private findElement(entry: RenderData[number]): HTMLElement | null {
    const selector = `[slug="${entry.instance}"]`;
    const elementFound = this.collectionElement.querySelector<HTMLElement>(selector).firstElementChild;

    if (!elementFound) {
      throw new Error(`The element "selector" doesn't exist inside the webflow collection list it was parsed from.`);
    }

    return elementFound as HTMLElement;
  }

  // Inserts elements into the swiper (the visible area)
  private insertElement(element: RenderData[number]): void {
    const designToInsert = this.findElement(element);
    const elementToInsert = designToInsert.cloneNode(true) as HTMLElement;
    const wfElementId = elementToInsert.getAttribute("data-wf-element")

    if (element.element === 'birthday') {
      // Insert the cloned element into the visible swiper area for birthday elements
      elementToInsert.classList.add("swiper-slide");
      this.swiper.prependSlide(elementToInsert); // Assuming automatic call to swiper.update() by library
      this.swiper.autoplay.pause();
      this.swiper.slideTo(0);
    } else {
      if (this.overlaycount >= 1) {
        console.info(`insertElement: One or more overlays are already active. Skipping "${wfElementId}"`);
        return;
      }
      // Insert the cloned element into the visible swiper area for event/memorial elements
      this.swiper.el.parentNode.insertBefore(elementToInsert, this.swiper.el);
      this.overlaycount++;
    }

    console.log(`insertElement: Inserted "${wfElementId}"`);

    // Track the inserted element by its instance to remove it later
    this.insertedElements.set(element.instance, elementToInsert);
  }

  // Removes elements from the swiper (the visible area)
  private removeElement(element: RenderData[number]): void {
    const clonedElementToRemove = this.insertedElements.get(element.instance);
    const wfElementId = clonedElementToRemove.getAttribute("data-wf-element")

    if (clonedElementToRemove) {
      console.log(`Remove "${wfElementId}"`);
      // Remove the cloned element from the swiper
      clonedElementToRemove.remove();
      this.swiper.update();
      this.swiper.autoplay.start();

      // Remove from the tracked inserted elements map
      this.insertedElements.delete(element.instance);

      if (element.element !== 'birthday') {
        this.overlaycount--;
      } else {
        this.swiper.autoplay.resume();
      }
    } else {
      console.warn(`Element to remove with key "${element.instance}" was not found inside "this.insertedElements". Check for unnecessary calls of this method.`);
    }
  }

  // Updates the swiper with the current visible elements
  public update(): void {
    this.filterElements();
    this.filteredData = this.sortByDate(this.filteredData);
    let changed = false;

    // Add new elements that should be shown
    this.filteredData.forEach((filteredEl) => {
      if (!this.insertedElements.has(filteredEl.instance)) {
        this.insertElement(filteredEl);
        changed = true;
      }
    });

    // Remove elements that should no longer be shown
    this.insertedElements.forEach((insertedHTML, insertedKey) => {
      const insertedEl = this.data.find(entry => entry.instance === insertedKey);
      if (!this.filteredData.includes(insertedEl)) {
        this.removeElement(insertedEl);
        changed = true;
      }
    });

    //// Shut up, I know it's inefficient to do this on every update.
    //const insertedRenderElements = Array.from(this.insertedElements.keys()).map(instance => this.data.find(element => element.instance === instance));

    if (!changed) return;

    if (this.overlaycount > 0) {
      this.swiper.el.classList.add("hide");
      this.swiper.autoplay.pause();
    } else if (this.overlaycount === 0 || this.overlaycount < 0) {
      this.swiper.el.classList.remove("hide");
    }
  }
}

function isNowInTimeOfDayRange(startDate: Date, endDate: Date): boolean {
  const now = new Date();

  const todayStart = new Date();
  todayStart.setHours(
    startDate.getHours(),
    startDate.getMinutes(),
    startDate.getSeconds(),
    startDate.getMilliseconds()
  );

  const todayEnd = new Date();
  todayEnd.setHours(
    endDate.getHours(),
    endDate.getMinutes(),
    endDate.getSeconds(),
    endDate.getMilliseconds()
  );

  if (todayEnd >= todayStart) {
    // Normal case
    return todayStart <= now && now <= todayEnd;
  } else {
    // Wrap-around midnight case e.g. 22:00-02:00
    return todayStart <= now || now <= todayEnd;
  }
}

interface TimeOffset {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

interface TestItemConfig {
  index: number;
  startTimeOffset: TimeOffset;
  endTimeOffset: TimeOffset;
  timeOfDayRange: boolean;
}

function applyOffset(base: Date, offset: TimeOffset): Date {
  const d = new Date(base);
  if (offset.days) d.setDate(d.getDate() + offset.days);
  if (offset.hours) d.setHours(d.getHours() + offset.hours);
  if (offset.minutes) d.setMinutes(d.getMinutes() + offset.minutes);
  if (offset.seconds) d.setSeconds(d.getSeconds() + offset.seconds);
  d.setMilliseconds(0);
  return d;
}

function setTestItem(data: RenderData<OverlayFilterAttrs>, config: TestItemConfig): void {
  const item = data[config.index];
  const now = new Date();

  item.props.startDate = applyOffset(now, config.startTimeOffset);
  item.props.endDate = applyOffset(now, config.endTimeOffset);
  item.props.useTimeOfDayRange = config.timeOfDayRange;

  console.log("TestItem:", item.props);
}

function initialize() {
  const collectionElement = document.body.querySelector<HTMLElement>(wfCollectionSelector("screen"));

  const collection = new FilterCollection(collectionElement, {
    name: "Overlays",
    rendererOptions: {
      attributeName: 'wf',
      filterAttributes: filterAttributes,
      timezone: "Europe/Zurich"
    }
  });
  collection.removeInvisibleElements();
  collection.readData();

  const newsSwiperEl = document.body.querySelector<HTMLElement>(swiperSelector("news"));
  const swiperOptions: SwiperOptions = {
    ...readSwiperOptions(newsSwiperEl),
    modules: [Autoplay, Navigation, Pagination, Manipulation]
  }
  const swiper = new Swiper(newsSwiperEl, swiperOptions);
  swiper.autoplay.stop();

  if (swiperOptions.autoplay !== false) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          swiper.autoplay.start();
        } else {
          swiper.autoplay.stop();
        }
      });
    }, {
      threshold: 0.2
    });

    observer.observe(swiper.el);
  }

  const manager = new ElementManager(collection.getData(), swiper, collectionElement);
  setInterval(() => {
    manager.update();
  }, 3000);

  //@ts-ignore
  window.newscollection = collection;
  //@ts-ignore
  window.elementManager = manager;
}

document.addEventListener("DOMContentLoaded", () => {
  initialize();
});

import createAttribute from "@peakflow/attributeselector";
import { FilterCollection } from "@peakflow/wfcollection";
import { RenderData } from "@peakflow/renderer";
import Swiper from "swiper";
import { Autoplay, Navigation, Pagination, Manipulation } from "swiper/modules";
import { readSwiperOptions } from "../../ts/swiper";
import { SwiperOptions } from "swiper/types";

type WfCollection = "screen";
type SwiperInstance = "news" | "tagesmenu" | "wochenhit" | "activity";

const wfCollectionSelector = createAttribute<WfCollection>("wf-collection");
const swiperSelector = createAttribute<SwiperInstance>("custom-swiper-component");

function getScreen(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || '';
}

class ElementManager {
  public data: RenderData; // All available elements
  public screen: string;
  private filteredData: RenderData; // Elements currently visible in the swiper
  private swiper: Swiper; // Assuming swiper is a valid instance.
  private collectionElement: HTMLElement; // Global element containing all possible HTMLElements (hidden designs)
  private insertedElements: Map<string, HTMLElement>; // To track inserted elements

  /**
   * Count of elements overlaying the swiper. Does not include 'birthday' elements.
   */
  private overlaycount: number = 0;

  constructor(allElements: RenderData, swiper: Swiper, collectionElement: HTMLElement) {
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
      let start = {
        hours: Math.floor(entry.starttime),
        minutes: Math.round(entry.starttime * 100) % 10 ** 2,
        sec: 0,
        ms: 0,
      };
      let end = {
        hours: Math.floor(entry.endtime),
        minutes: Math.round(entry.endtime * 100) % 10 ** 2,
        sec: 0,
        ms: 0,
      };

      if (!entry.screen) entry.screen = '';
      entry.screen = entry.screen.toLowerCase();

      let matchScreen = entry.screen === this.screen;
      if (!entry.screen || !this.screen) {
        matchScreen = true;
      }
      // console.log(`"${this.screen}" "${entry.screen}" ${matchScreen}`);

      const date = new Date(entry.date);
      const startdate = new Date(new Date(date).setHours(start.hours, start.minutes, start.sec, start.ms));
      const enddate = new Date(new Date(date).setHours(end.hours, end.minutes, end.sec, end.ms));
      const now = new Date();

      return startdate <= now && now <= enddate && matchScreen;
    });

    return this.filteredData;
  }

  private sortByDate(data: RenderData): RenderData {
    return data.sort((a, b) => {
      if (a.date.getTime() < b.date.getTime()) {
        return -1;
      } else if (a.date.getTime() === b.date.getTime()) {
        return 0;
      } else {
        return 1;
      }
    });
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

interface TestItemConfig {
  index: number;
  starttimeOffset: number;
  endtimeOffset: number;
}

function setTestItem(data: RenderData, config: TestItemConfig): void {
  const firstItem = data[config.index];
  const now = new Date();
  now.setSeconds(0, 0);
  firstItem.date = now;
  firstItem.starttime = parseFloat(`${now.getHours()}.${now.getMinutes() + config.starttimeOffset}`);
  firstItem.endtime = parseFloat(`${now.getHours()}.${now.getMinutes() + config.endtimeOffset}`);
}

function initialize() {
  const collectionElement = document.body.querySelector<HTMLElement>(wfCollectionSelector("screen"));
  let lastElement: HTMLElement | null = null;

  const collection = new FilterCollection(collectionElement);
  collection.removeInvisibleElements();
  collection.renderer.addFilterAttributes({
    "date": "date",
    starttime: "number",
    endtime: "number",
    screen: "string",
  });
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

  const manager = new ElementManager(collection.getData(), swiper, collectionElement)
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

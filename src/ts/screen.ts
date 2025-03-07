import createAttribute from "@library/attributeselector";
import { FilterCollection } from "@library/wfcollection";
import { RenderData } from "@library/renderer";
import Swiper from "swiper";
import { Autoplay, Navigation, Pagination, Manipulation } from "swiper/modules";
import { readSwiperOptions } from "./swiper";
import { SwiperOptions } from "swiper/types";

type WfCollection = "screen";
type SwiperInstance = "news" | "tagesmenu" | "wochenhit" | "activity";

const wfCollectionSelector = createAttribute<WfCollection>("wf-collection");
const swiperSelector = createAttribute<SwiperInstance>("custom-swiper-component");

class ElementManager {
  public data: RenderData; // All available elements
  private filteredData: RenderData; // Elements currently visible in the swiper
  private swiper: Swiper; // Assuming swiper is a valid instance.
  private collectionElement: HTMLElement; // Global element containing all possible HTMLElements (hidden designs)
  private insertedElements: Map<string, HTMLElement>; // To track inserted elements

  /**
   * Count of elements overlaying the swiper
   */
  private uecount: number = 0;

  constructor(allElements: RenderData, swiper: Swiper, collectionElement: HTMLElement) {
    this.data = allElements;
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
      };
      let end = {
        hours: Math.floor(entry.endtime),
        minutes: Math.round(entry.endtime * 100) % 10 ** 2,
      };

      const date = new Date(entry.date);
      const startdate = new Date(new Date(date).setHours(start.hours, start.minutes));
      const enddate = new Date(new Date(date).setHours(end.hours, end.minutes));
      const now = new Date();

      return startdate <= now && now <= enddate;
    });

    return this.filteredData;
  }

  private sort(data: RenderData = this.data): RenderData {
    return data.sort((a, b) => {
      if (a.date < b.date) {
        return -1;
      } else if (a.date === b.date) {
        return 0;
      } else {
        return 1;
      }
    });
  }

  // Finds the original HTMLElement for a given entry in the collectionElement (hidden designs)
  private findElement(entry: RenderData[number]): HTMLElement | null {
    const selector = `[slug="${entry.instance}"]`;
    return this.collectionElement.querySelector<HTMLElement>(selector).firstChild as HTMLElement;
  }

  // Inserts elements into the swiper (the visible area)
  private insertElement(element: RenderData[number]): void {
    const designToInsert = this.findElement(element);

    if (designToInsert) {
      const elementToInsert = designToInsert.cloneNode(true) as HTMLElement;
      console.log(`Add "${elementToInsert.getAttribute("data-wf-element")}"`);

      if (element.element === 'birthday') {
        // Insert the cloned element into the visible swiper area for birthday elements
        elementToInsert.classList.add("swiper-slide");
        this.swiper.appendSlide(elementToInsert);
      } else if (element.element === 'event' || element.element === 'memorial') {
        if (this.uecount === 1) return;
        // Insert the cloned element into the visible swiper area for event/memorial elements
        this.swiper.el.parentNode.insertBefore(elementToInsert, this.swiper.el);
        this.uecount++;
      }

      // Track the inserted element by its instance to remove it later
      this.insertedElements.set(element.instance, elementToInsert);
    }
  }

  // Removes elements from the swiper (the visible area)
  private removeElement(element: RenderData[number]): void {
    const clonedElementToRemove = this.insertedElements.get(element.instance);

    if (clonedElementToRemove) {
      console.log(`Remove "${clonedElementToRemove.getAttribute("data-wf-element")}"`);
      // Remove the cloned element from the swiper
      clonedElementToRemove.remove();
      this.swiper.update();

      // Remove from the tracked inserted elements map
      this.insertedElements.delete(element.instance);
    }
  }

  // Updates the swiper with the current visible elements
  public update(): void {
    this.filterElements();
    this.sort(this.filteredData);
    let changed = false;

    // Add new elements that should be shown
    this.filteredData.forEach((element) => {
      if (!this.insertedElements.has(element.instance)) {
        this.insertElement(element);
        this.filteredData.push(element);
        changed = true;
      }
    });

    // Remove elements that should no longer be shown
    this.insertedElements.forEach((insertedEl, insertedKey) => {
      const renderElement = this.data.find(entry => entry.instance === insertedKey);
      if (!this.filteredData.includes(renderElement)) {
        this.removeElement(renderElement);
        changed = true;
      }
    });

    //// Shut up, I know it's inefficient to do this on every update.
    //const insertedRenderElements = Array.from(this.insertedElements.keys()).map(instance => this.data.find(element => element.instance === instance));

    if (changed && this.uecount) {
      this.swiper.el.classList.add("hide");
      this.swiper.autoplay.pause();
    } else if (changed) {
      this.swiper.el.classList.remove("hide");
      this.swiper.autoplay.resume();
    }
  }
}

function initialize() {
  const collectionElement = document.body.querySelector<HTMLElement>(wfCollectionSelector("screen"));
  let lastElement: HTMLElement | null = null;

  const collection = new FilterCollection(collectionElement);
  collection.removeInvisibleElements();
  collection.renderer.addFilterAttributes({
    "date": "date",
    starttime: "number",
    endtime: "number"
  });
  collection.readData();


  const newsSwiperEl = document.body.querySelector<HTMLElement>(swiperSelector("news"));
  const swiperOptions: SwiperOptions = {
    ...readSwiperOptions(newsSwiperEl),
    modules: [Autoplay, Navigation, Pagination, Manipulation]
  }
  const swiper = new Swiper(newsSwiperEl, swiperOptions);
  swiper.autoplay.start();

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

  const manager = new ElementManager(collection.getData(), swiper, collectionElement)
  setInterval(() => {
    manager.update();
  }, 1000);

  //@ts-ignore
  window.newscollection = collection;
  //@ts-ignore
  window.elementManager = manager;
}

document.addEventListener("DOMContentLoaded", () => {
  initialize();
});

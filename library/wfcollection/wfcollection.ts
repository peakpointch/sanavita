import Renderer, { RenderData } from "@library/renderer";

type GlobalWfCollections = {
  initialized: boolean;
  [key: string]: GlobalCollection | CollectionList | boolean;  // Enforces array values for all other keys
};

type GlobalCollection = Array<object>;

class CollectionList {
  public name: string
  public container: HTMLElement;
  public renderer: Renderer;
  public collectionData: RenderData = [];
  private listElement: HTMLElement;
  private items: NodeListOf<HTMLElement>;

  constructor(container: HTMLElement | null, name?: string) {
    if (!container || !container.classList.contains('w-dyn-list')) throw new Error(`Container can't be undefined.`);

    this.name = name || 'wf';
    this.container = container;
    this.listElement = container.querySelector('.w-dyn-items');
    this.items = container.querySelectorAll('.w-dyn-item');
    this.renderer = new Renderer(container, this.name);

    // Invoke first read to initialize `this.collectionData`
    this.readData();
  }

  public readData(): void {
    this.collectionData = this.renderer.read(this.container);
  }

  public getData(): RenderData {
    return this.collectionData;
  }

  public getItems(): NodeListOf<HTMLElement> {
    return this.items;
  }

  /**
   * This method removes every element that was hidden by Webflow's conditional visibility.
   */
  public removeInvisibleElements(): void {
    this.listElement.querySelectorAll(".w-condition-invisible")
      .forEach(element => element.remove());
  }

  public getAttributeData(): any {
    let data: any[] = [];

    this.items.forEach(item => {
      const itemData: Map<string, any> = new Map(Object.entries(item.dataset));
      itemData.forEach((value, key) => {
        if (!key.startsWith('wf')) {
          itemData.delete(key);
        }
      });

      data.push(itemData);
    });

    return data;
  }
}

var wfCollections: GlobalWfCollections = {
  initialized: false,
};

var initWfCollections = (collections: Set<string>): void => {
  if (wfCollections.initialized) return;

  wfCollections.initialized = true;

  collections.forEach((collection) => {
    wfCollections[collection] = [] as GlobalCollection;
  });
};

export { CollectionList, initWfCollections, wfCollections };
export type { GlobalCollection, GlobalWfCollections };

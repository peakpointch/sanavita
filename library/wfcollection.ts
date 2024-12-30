type GlobalWfCollections = {
  initialized: boolean;
  [key: string]: GlobalCollection | boolean;  // Enforces array values for all other keys
};

type GlobalCollection = Array<object>;

class CollectionList {
  public container: HTMLElement;
  private listElement: HTMLElement;
  private listItems: NodeListOf<HTMLElement>;

  constructor(container: HTMLElement | null) {
    if (!container || !container.classList.contains('w-dyn-list')) throw new Error(`Container can't be undefined.`);

    this.container = container;
    this.listElement = container.querySelector('.w-dyn-items');
    this.listItems = container.querySelectorAll('.w-dyn-item');
  }

  public getListItems(): NodeListOf<HTMLElement> {
    return this.listItems;
  }

  public getAttributeData(): any {
    let data: any[] = [];

    this.listItems.forEach(item => {
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

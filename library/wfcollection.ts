declare global {
  interface Window {
    wfCollection: WfCollectionGlobal;
  }
}

type WfCollectionGlobal = {
  initialized: boolean;
  [key: string]: WindowCollection | boolean;  // Enforces array values for all other keys
};

type WindowCollection = Array<object>;

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

function initWfCollections(collections: Set<string>): void {
  if (!window) return;
  if (window.wfCollection.initialized) return;
  window.wfCollection = {
    initialized: true
  }
  collections.forEach(collection => {
    window.wfCollection[collection] = [] as WindowCollection;
  })
}

export { CollectionList, initWfCollections };
export type { WindowCollection, WfCollectionGlobal };

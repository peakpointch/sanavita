// library/wfcollection.ts
var CollectionList = class {
  constructor(container) {
    if (!container || !container.classList.contains("w-dyn-list"))
      throw new Error(`Container can't be undefined.`);
    this.container = container;
    this.listElement = container.querySelector(".w-dyn-items");
    this.listItems = container.querySelectorAll(".w-dyn-item");
  }
  getListItems() {
    return this.listItems;
  }
  getAttributeData() {
    let data = [];
    this.listItems.forEach((item) => {
      const itemData = new Map(Object.entries(item.dataset));
      itemData.forEach((value, key) => {
        if (!key.startsWith("wf")) {
          itemData.delete(key);
        }
      });
      data.push(itemData);
    });
    return data;
  }
};
function initWfCollections(collections) {
  if (!window)
    return;
  if (window.wfCollection.initialized)
    return;
  window.wfCollection = {
    initialized: true
  };
  collections.forEach((collection) => {
    window.wfCollection[collection] = [];
  });
}
export {
  CollectionList,
  initWfCollections
};

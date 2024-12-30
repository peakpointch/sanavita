(() => {
  // library/wfcollection.ts
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

  // src/ts/sanavita-wfcollections.ts
  var sanavitaCollections = /* @__PURE__ */ new Set([
    "hit",
    "dailyMenu",
    "news"
  ]);
  initWfCollections(sanavitaCollections);
})();

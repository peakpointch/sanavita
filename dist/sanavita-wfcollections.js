(() => {
  // library/wfcollection/wfcollection.ts
  var wfCollections = {
    initialized: false
  };
  var initWfCollections = (collections) => {
    if (wfCollections.initialized) return;
    wfCollections.initialized = true;
    collections.forEach((collection) => {
      wfCollections[collection] = [];
    });
  };

  // src/ts/sanavita-wfcollections.ts
  var sanavitaCollections = /* @__PURE__ */ new Set([
    "hit",
    "dailyMenu",
    "news"
  ]);
  initWfCollections(sanavitaCollections);
})();

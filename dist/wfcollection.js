(() => {
  // library/wfcollection.ts
  var wfCollections = {
    initialized: false
  };
  var initWfCollections = (collections) => {
    if (wfCollections.initialized)
      return;
    wfCollections.initialized = true;
    collections.forEach((collection) => {
      wfCollections[collection] = [];
    });
  };

  // src/js/wfcollection.js
  window.initWfCollections = initWfCollections;
  window.wfCollections = wfCollections;
})();

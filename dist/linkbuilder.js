(() => {
  // src/ts/linkbuilder.ts
  var LINKBUILDER_SELECTOR = `a[data-linkbuilder-component]`;
  function initLinkBuilders() {
    const allLinks = document.querySelectorAll(LINKBUILDER_SELECTOR);
    for (let link of allLinks) {
      const path = link.dataset.path;
      const paramWohnung = link.dataset.paramWohnung;
      if (path && paramWohnung) {
        const encodedParamWohnung = encodeURIComponent(paramWohnung);
        link.href = `${path}?wohnung=${encodedParamWohnung}`;
      } else {
        console.warn("Missing data attributes for link:", link);
      }
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    initLinkBuilders();
  });
})();
//# sourceMappingURL=linkbuilder.js.map

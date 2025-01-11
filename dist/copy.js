(() => {
  // src/js/copy.js
  var allComponents = page.querySelectorAll("[copy-component]");
  allComponents.forEach((component) => {
    const button = component.querySelector("button");
    const copyData = component.dataset.copyText;
    button.addEventListener("click", () => {
      navigator.clipboard.writeText(copyData);
    });
  });
})();

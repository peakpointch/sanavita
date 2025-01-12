// library/selectorstring.ts
function getUniqueSelectorString(element) {
  return `${element.tagName}${element.id ? "#" + element.id : ""}${element.className ? "." + element.className.replace(" ", ".") : ""}`;
}
export {
  getUniqueSelectorString as default
};

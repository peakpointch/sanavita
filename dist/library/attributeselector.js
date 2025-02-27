// library/attributeselector.ts
function exclude(selector, ...exclusions) {
  if (exclusions.length === 0)
    return selector;
  return selector.split(", ").reduce((acc, str) => {
    let separator = acc === "" ? "" : ", ";
    return acc + separator + `${str}:not(${exclusions.join(", ")})`;
  }, "");
}
var createAttribute = (attrName, defaultValue = null, ...exclusions) => {
  return (name = defaultValue) => {
    if (!name) {
      return exclude(`[${attrName}]`, ...exclusions);
    }
    return exclude(`[${attrName}="${name}"]`, ...exclusions);
  };
};
var attributeselector_default = createAttribute;
export {
  attributeselector_default as default
};

// library/attributeselector.ts
function exclude(selector, ...exclusions) {
  if (exclusions.length === 0) return selector;
  return selector.split(", ").reduce((acc, str) => {
    let separator = acc === "" ? "" : ", ";
    return acc + separator + `${str}:not(${exclusions.join(", ")})`;
  }, "");
}
var createAttribute = (attrName, options = {
  defaultType: "exact",
  defaultValue: null,
  exclusions: []
}) => {
  return (name = options.defaultValue, type = options.defaultType) => {
    if (!name) {
      return exclude(`[${attrName}]`, ...options.exclusions);
    }
    const value = String(name);
    let selector;
    switch (type) {
      case "startsWith":
        selector = `[${attrName}^="${value}"]`;
        break;
      case "endsWith":
        selector = `[${attrName}$="${value}"]`;
        break;
      case "includes":
        selector = `[${attrName}*="${value}"]`;
        break;
      case "whitespace":
        selector = `[${attrName}~="${value}"]`;
        break;
      case "hyphen":
        selector = `[${attrName}|="${value}"]`;
        break;
      case "exact":
      default:
        selector = `[${attrName}="${value}"]`;
        break;
    }
    return exclude(selector, ...options.exclusions ?? []);
  };
};
var attributeselector_default = createAttribute;
export {
  attributeselector_default as default
};

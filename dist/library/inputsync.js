// library/attributeselector.ts
var attrMatchTypes = {
  startsWith: "^",
  endsWith: "$",
  includes: "*",
  whitespace: "~",
  hyphen: "|",
  exact: ""
};
function getOperator(type) {
  return attrMatchTypes[type] || "";
}
function exclude(selector, ...exclusions) {
  if (exclusions.length === 0) return selector;
  return selector.split(", ").reduce((acc, str) => {
    let separator = acc === "" ? "" : ", ";
    return acc + separator + `${str}:not(${exclusions.join(", ")})`;
  }, "");
}
var createAttribute = (attrName, options = {
  defaultType: "exact",
  defaultValue: void 0,
  exclusions: []
}) => {
  return (name = options.defaultValue, type = options.defaultType) => {
    if (!name) {
      return exclude(`[${attrName}]`, ...options.exclusions);
    }
    const value = String(name);
    const selector = `[${attrName}${getOperator(type)}="${value}"]`;
    return exclude(selector, ...options.exclusions ?? []);
  };
};
var attributeselector_default = createAttribute;

// library/inputsync.ts
var syncSelector = attributeselector_default("input-sync");
function constructInputMap(inputs) {
  const inputMap = /* @__PURE__ */ new Map();
  inputs.forEach((input) => {
    const value = input.getAttribute("input-sync");
    if (inputMap.has(value)) {
      inputMap.get(value).push(input);
    } else {
      inputMap.set(value, [input]);
    }
  });
  return inputMap;
}
function syncGroup(input, groupInputs) {
  groupInputs.filter((otherInput) => otherInput !== input).forEach((otherInput) => otherInput.value = input.value);
}
function inputSync(container = document.body) {
  if (!container) throw new Error(`Container cannot be undefined.`);
  const inputs = Array.from(container.querySelectorAll(syncSelector()));
  const inputMap = constructInputMap(inputs);
  const inputGroups = Array.from(inputMap.entries());
  inputGroups.forEach(([groupName, groupInputs]) => {
    if (groupInputs.length < 2) {
      console.warn(`Input group "${groupName}" has less than 2 inputs. Skipping group.`);
      return;
    }
    groupInputs.forEach((currentInput) => {
      currentInput.addEventListener("change", () => {
        syncGroup(currentInput, groupInputs);
      });
    });
  });
}
export {
  inputSync,
  syncSelector
};

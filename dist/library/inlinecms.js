// library/findelements.ts
function findElements(input, multiple = false) {
  if (typeof input === "string") {
    const elements = multiple ? Array.from(document.querySelectorAll(input)) : [document.querySelector(input)].filter(Boolean);
    if (elements.length === 0) {
      throw new Error(`No elements found matching selector: ${input}`);
    }
    return elements;
  } else if (input instanceof HTMLElement) {
    return [input];
  } else if (Array.isArray(input)) {
    return input;
  }
  throw new Error("Invalid input provided: must be a string, HTMLElement, or array.");
}

// library/inlinecms.ts
function validateContainer(container) {
  if (!container.classList.contains("w-dyn-list")) {
    throw new Error("The element given is not a CMS list: " + container);
  }
}
function processItems(container, target) {
  const items = container.querySelectorAll(".w-dyn-item");
  if (items.length === 0) {
    console.warn(`The container doesn't contain any items: ${container}`);
  }
  container.remove();
  items.forEach((item) => {
    item.classList.remove("w-dyn-item");
    target.appendChild(item);
  });
}
function extractTargetFromAttribute(container) {
  const targetSelector = container.getAttribute("inlinecms-target");
  if (!targetSelector) {
    throw new Error(
      `Container is missing data-inlinecms-target attribute: ${container}`
    );
  }
  const target = document.querySelector(targetSelector);
  if (!target) {
    throw new Error(`Target element not found for selector: ${targetSelector}`);
  }
  return target;
}
function inlineCms(container, target) {
  const containers = findElements(container, true);
  containers.forEach((containerEl) => {
    validateContainer(containerEl);
    const targetEl = target ? findElements(target)[0] : containerEl.parentElement;
    if (!targetEl) {
      throw new Error("Target element not found or specified.");
    }
    processItems(containerEl, targetEl);
  });
}
function inlineCmsWithAutoTarget(containers) {
  let containerElements;
  if (typeof containers === "string") {
    containerElements = findElements(containers, true);
  } else {
    containerElements = Array.from(containers);
  }
  if (containerElements.length === 0) {
    throw new Error(`No containers found matching: ${containers}`);
  }
  containerElements.forEach((container) => {
    validateContainer(container);
    const targetElement = extractTargetFromAttribute(container);
    processItems(container, targetElement);
  });
}
export {
  inlineCms,
  inlineCmsWithAutoTarget
};

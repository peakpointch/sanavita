(() => {
  // node_modules/peakflow/src/utils/getelements.ts
  function getAllElements(input, single = false) {
    if (typeof input === "string") {
      const elements = Array.from(document.querySelectorAll(input)).filter(Boolean);
      if (elements.length === 0) {
        throw new Error(`No elements found matching selector: ${input}`);
      } else if (single) {
        return [elements[0]];
      } else {
        return elements;
      }
    } else if (input instanceof HTMLElement) {
      return [input];
    } else if (Array.isArray(input)) {
      return input;
    } else if (input instanceof NodeList) {
      return Array.from(input);
    } else {
      throw new Error("Invalid input provided: must be a string, HTMLElement, array or node list.");
    }
  }

  // node_modules/peakflow/src/inlinecms.ts
  var INLINECMS_TARGET_ATTR = `data-inlinecms-target`;
  var INLINECMS_COMPONENT_ATTR = `data-inlinecms-component`;
  function validateContainer(container) {
    if (!container.classList.contains("w-dyn-list")) {
      throw new Error("The element given is not a CMS list: " + container);
    }
  }
  function processItems(container, target) {
    const items = container.querySelectorAll(".w-dyn-item");
    if (items.length === 0) {
      throw new Error(`The container doesn't contain any cms-items.`);
    }
    container.remove();
    items.forEach((item) => {
      item.classList.remove("w-dyn-item");
      target.appendChild(item);
    });
  }
  function extractTargetFromAttribute(container) {
    const targetSelector = container.getAttribute(INLINECMS_TARGET_ATTR);
    if (!targetSelector) {
      throw new Error(`Container is missing ${INLINECMS_TARGET_ATTR} attribute.`);
    }
    let target;
    if (targetSelector === "parentNode" || targetSelector === "parent" || targetSelector === "parentElement") {
      target = container.parentElement;
    } else {
      target = document.querySelector(targetSelector);
    }
    if (!target) {
      throw new Error(`Target element not found with specified selector: "${targetSelector}".`);
    }
    return target;
  }
  function inlineCms(containers) {
    let containerElements;
    if (typeof containers === "string") {
      containerElements = getAllElements(containers);
    } else {
      containerElements = Array.from(containers);
    }
    if (containerElements.length === 0) {
      throw new Error(`No containers found matching: ${typeof containers === "string" ? containers : ""} `);
    }
    containerElements.forEach((container, index) => {
      const componentName = container.getAttribute(INLINECMS_COMPONENT_ATTR) || `index ${index}`;
      validateContainer(container);
      let targetElement;
      try {
        targetElement = extractTargetFromAttribute(container);
      } catch (e) {
        console.warn(`Inlinecms "${componentName}":`, e.message, `Setting target to the containers parent.`);
        targetElement = container.parentElement;
      }
      try {
        processItems(container, targetElement);
      } catch (e) {
        console.warn(`Inlinecms "${componentName}":`, e.message);
      }
    });
  }

  // src/ts/inlinecms.ts
  inlineCms("[inlinecms], [data-inlinecms-component], [data-inlinecms], [data-cms-unpack]");
})();
//# sourceMappingURL=inlinecms.js.map

import { findElements } from "./findelements";

/**
 * Ensures the given container is a valid CMS container.
 * @param container - The container to validate.
 */
function validateContainer(container: HTMLElement): void {
  if (!container.classList.contains("w-dyn-list")) {
    throw new Error("The element given is not a CMS list: " + container);
  }
}

/**
 * Extracts and appends items from a CMS container to a target element.
 * @param container - The container element to extract items from.
 * @param target - The target element to append items to.
 */
function processItems(container: HTMLElement, target: HTMLElement): void {
  const items: NodeListOf<HTMLElement> =
    container.querySelectorAll(".w-dyn-item");

  if (items.length === 0) {
    console.warn(`The container doesn't contain any items: ${container}`);
  }

  container.remove();
  items.forEach((item) => {
    item.classList.remove("w-dyn-item");
    target.appendChild(item);
  });
}

/**
 * Extracts the target element from the `data-inlinecms-target` attribute.
 * @param container - The container with the attribute.
 * @returns The target HTMLElement (or throws an error if not found).
 */
function extractTargetFromAttribute(container: HTMLElement): HTMLElement {
  const targetSelector = container.getAttribute("inlinecms-target");
  if (!targetSelector) {
    throw new Error(
      `Container is missing data-inlinecms-target attribute: ${container}`
    );
  }

  const target: HTMLElement | null = document.querySelector(targetSelector);
  if (!target) {
    throw new Error(`Target element not found for selector: ${targetSelector}`);
  }

  return target;
}

/**
 * General-purpose function to inline CMS items into a target element.
 * @param container - CSS selector or HTMLElement(s) for the container(s).
 * @param target - CSS selector or HTMLElement for the target. If omitted, parent of the container is used.
 */
export function inlineCms(
  container: string | HTMLElement,
  target?: string | HTMLElement
): void {
  // Find all container elements
  const containers = findElements(container, true);

  containers.forEach((containerEl) => {
    validateContainer(containerEl);

    // Determine the target element
    const targetEl = target
      ? findElements(target)[0]
      : containerEl.parentElement;

    if (!targetEl) {
      throw new Error("Target element not found or specified.");
    }

    processItems(containerEl, targetEl);
  });
}

/**
 * Processes a NodeList of CMS containers or a CSS selector that matches multiple CMS containers,
 * extracting items into their respective targets.
 * Each container must have a `data-inlinecms-target` attribute.
 * @param containers - A NodeListOf<HTMLElement> or a CSS selector string for CMS container elements.
 */
export function inlineCmsWithAutoTarget(
  containers: string | NodeListOf<HTMLElement>
): void {
  let containerElements: HTMLElement[];

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

    // Extract the target from the container's attribute
    const targetElement = extractTargetFromAttribute(container);

    // Process the container and append items to the target
    processItems(container, targetElement);
  });
}

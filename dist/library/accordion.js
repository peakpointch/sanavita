// library/attributeselector.ts
function exclude(selector, ...exclusions) {
  if (exclusions.length === 0) return selector;
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

// library/accordion.ts
var modalSelector = attributeselector_default("data-modal-element");
var Accordion = class {
  constructor(component) {
    this.isOpen = false;
    this.component = component;
    this.trigger = component.querySelector('[data-animate="trigger"]');
    this.uiTrigger = component.querySelector('[data-animate="ui-trigger"]');
    this.icon = component.querySelector('[data-animate="icon"]');
    this.uiTrigger.addEventListener("click", () => {
      this.toggle();
    });
  }
  open() {
    if (!this.isOpen) {
      this.trigger.click();
      setTimeout(() => {
        this.icon.classList.add("is-open");
      }, 200);
      this.isOpen = true;
    }
  }
  close() {
    if (this.isOpen) {
      this.trigger.click();
      setTimeout(() => {
        this.icon.classList.remove("is-open");
      }, 200);
      this.isOpen = false;
    }
  }
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  scrollIntoView() {
    let offset = 0;
    const scrollWrapper = this.component.closest(
      modalSelector("scroll")
    );
    const elementPosition = this.component.getBoundingClientRect().top;
    if (scrollWrapper) {
      const wrapperPosition = scrollWrapper.getBoundingClientRect().top;
      offset = scrollWrapper.querySelector('[data-scroll-child="sticky"]').clientHeight;
      scrollWrapper.scrollBy({
        top: elementPosition - wrapperPosition - offset - 2,
        behavior: "smooth"
      });
    } else {
      window.scrollTo({
        top: elementPosition + window.scrollY - offset - 2,
        behavior: "smooth"
      });
    }
  }
};
export {
  Accordion as default
};

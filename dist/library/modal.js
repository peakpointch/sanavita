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

// library/modal.ts
var defaultModalAnimation = {
  type: "none",
  duration: 0,
  className: "is-closed"
};
var defaultModalSettings = {
  animation: defaultModalAnimation,
  stickyFooter: false,
  stickyHeader: false
};
var Modal = class _Modal {
  constructor(component, settings = defaultModalSettings) {
    this.settings = settings;
    this.initialized = false;
    if (!component) {
      throw new Error(`The component's HTMLElement cannot be undefined.`);
    }
    this.component = component;
    this.setInitialState();
    this.setupStickyFooter();
    this.initialized = true;
  }
  static {
    this.select = attributeselector_default("data-modal-element");
  }
  setupStickyFooter() {
    const modalContent = this.component.querySelector(_Modal.select("scroll"));
    const stickyFooter = this.component.querySelector(_Modal.select("sticky-bottom"));
    if (!modalContent || !stickyFooter) {
      console.warn("Initialize modal: skip sticky footer");
    } else {
      this.setupScrollEvent(modalContent, stickyFooter);
    }
  }
  setupScrollEvent(modalContent, stickyFooter) {
    modalContent.addEventListener("scroll", () => {
      const { scrollHeight, scrollTop, clientHeight } = modalContent;
      const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 1;
      if (isScrolledToBottom) {
        stickyFooter.classList.remove("modal-scroll-shadow");
      } else {
        stickyFooter.classList.add("modal-scroll-shadow");
      }
    });
  }
  setInitialState() {
    this.component.style.display = "none";
    this.hide();
    switch (this.settings.animation.type) {
      case "fade":
        this.component.style.willChange = "opacity";
        this.component.style.transitionProperty = "opacity";
        this.component.style.transitionDuration = this.settings.animation.duration.toString();
        break;
      case "slideUp":
        this.component.style.willChange = "opacity, translate";
        this.component.style.transitionProperty = "opacity, translate";
        this.component.style.transitionDuration = this.settings.animation.duration.toString();
        break;
      case "none":
        break;
    }
    this.component.dataset.state = "closed";
  }
  show() {
    this.component.dataset.state = "opening";
    this.component.style.removeProperty("display");
    switch (this.settings.animation.type) {
      case "fade":
        this.component.style.opacity = "1";
        break;
      case "slideUp":
        this.component.style.opacity = "1";
        this.component.style.translate = "0px 0vh0;";
        break;
      default:
        this.component.classList.remove("is-closed");
    }
    this.component.dataset.state = "open";
  }
  hide() {
    this.component.dataset.state = "closing";
    switch (this.settings.animation.type) {
      case "fade":
        this.component.style.opacity = "0";
        break;
      case "slideUp":
        this.component.style.opacity = "0";
        this.component.style.translate = "0px 20vh";
        break;
      default:
        break;
    }
    setTimeout(() => {
      this.component.style.display = "none";
    }, this.settings.animation.duration);
    this.component.dataset.state = "closed";
  }
  /**
   * Opens the modal instance.
   *
   * This method calls the `show` method and locks the scroll of the document body.
   */
  open() {
    this.show();
    lockBodyScroll();
  }
  /**
   * Closes the modal instance.
   *
   * This method calls the `hide` method and unlocks the scroll of the document body.
   */
  close() {
    unlockBodyScroll();
    this.hide();
  }
};
function lockBodyScroll() {
  document.body.style.overflow = "hidden";
}
function unlockBodyScroll() {
  document.body.style.removeProperty("overflow");
}
export {
  Modal as default,
  defaultModalAnimation,
  defaultModalSettings
};

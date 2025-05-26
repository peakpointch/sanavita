(() => {
  // ../peakflow/src/cal/loader.ts
  async function loadCal(namespace) {
    if (typeof window.Cal !== "undefined") return window.Cal;
    (function(windw, embedJS, action) {
      const p = (api, args) => {
        api.q.push(args);
      };
      const doc = windw.document;
      windw.Cal = function() {
        const cal = windw.Cal;
        const ar = arguments;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          const script = doc.createElement("script");
          script.src = embedJS;
          doc.head.appendChild(script);
          cal.loaded = true;
        }
        if (ar[0] === action) {
          const api = function() {
            p(api, arguments);
          };
          const namespace2 = ar[1];
          api.q = api.q || [];
          if (typeof namespace2 === "string") {
            cal.ns[namespace2] = cal.ns[namespace2] || api;
            p(cal.ns[namespace2], ar);
            p(cal, ["initNamespace", namespace2]);
          } else {
            p(cal, ar);
          }
          return;
        }
        p(cal, ar);
      };
    })(window, "https://app.cal.com/embed/embed.js", "init");
    const Cal = window.Cal;
    Cal("init", namespace, { origin: "https://cal.com" });
    return Cal;
  }

  // ../peakflow/src/attributeselector.ts
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

  // ../peakflow/src/webflow/webflow.ts
  var siteId = document.documentElement.dataset.wfSite || "";
  var pageId = document.documentElement.dataset.wfPage || "";
  var wfclass = {
    invisible: "w-condition-invisible",
    input: "w-input",
    select: "w-select",
    wradio: "w-radio",
    radio: "w-radio-input",
    wcheckbox: "w-checkbox",
    checkbox: "w-checkbox-input",
    checked: "w--redirected-checked"
  };
  var inputSelectorList = [
    `.${wfclass.input}`,
    `.${wfclass.select}`,
    `.${wfclass.wradio} input[type="radio"]`,
    `.${wfclass.wcheckbox} input[type="checkbox"]:not(.${wfclass.checkbox})`
  ];
  var wfselect = {
    invisible: `.${wfclass.invisible}`,
    input: `.${wfclass.input}`,
    select: `.${wfclass.select}`,
    wradio: `.${wfclass.wradio}`,
    radio: `.${wfclass.radio}`,
    wcheckbox: `.${wfclass.wcheckbox}`,
    checkbox: `.${wfclass.checkbox}`,
    checked: `.${wfclass.checked}`,
    formInput: inputSelectorList.join(", "),
    radioInput: `.${wfclass.wradio} input[type="radio"]`,
    checkboxInput: `.${wfclass.wcheckbox} input[type="checkbox"]:not(.${wfclass.checkbox})`,
    inputSelectorList
  };
  var wf = {
    siteId,
    pageId,
    class: wfclass,
    select: wfselect
  };

  // ../peakflow/src/form/utility.ts
  var formElementSelector = attributeselector_default("data-form-element");
  var filterFormSelector = attributeselector_default("data-filter-form");
  function getWfFormData(form, fields, test = false) {
    if (!(form instanceof HTMLFormElement)) {
      form = form.querySelector("form");
    }
    if (!form || !(form instanceof HTMLFormElement)) {
      throw new TypeError(`The passed "form" is not a form.`);
    }
    return {
      name: form.dataset.name,
      pageId: wf.pageId,
      elementId: form.dataset.wfElementId,
      source: window.location.href,
      fields,
      test,
      dolphin: false
    };
  }
  async function sendFormData(formData) {
    const url = `https://webflow.com/api/v1/form/${wf.siteId}`;
    const request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/javascript, */*; q=0.01"
      },
      body: JSON.stringify(formData)
    };
    try {
      const response = await fetch(url, request);
      if (!response.ok) {
        throw new Error(`Network response "${response.status}" was not okay`);
      }
      console.log("Form submission success! Status", response.status);
      return true;
    } catch (error) {
      console.error("Form submission failed:", error);
      return false;
    }
  }
  function disableWebflowForm(form) {
    form?.classList.remove("w-form");
    form.parentElement.classList.remove("w-form");
  }

  // ../peakflow/src/deepmerge.ts
  function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key], source[key]);
      } else if (source[key] !== void 0) {
        result[key] = source[key];
      }
    }
    return result;
  }

  // ../peakflow/src/modal.ts
  var defaultModalAnimation = {
    type: "none",
    duration: 0,
    className: "is-closed"
  };
  var defaultModalSettings = {
    id: void 0,
    animation: defaultModalAnimation,
    stickyFooter: false,
    stickyHeader: false,
    lockBodyScroll: true
  };
  var Modal = class _Modal {
    constructor(component, settings = {}) {
      this.initialized = false;
      if (!component) {
        throw new Error(`The component HTMLElement cannot be undefined.`);
      }
      this.component = component;
      this.settings = deepMerge(defaultModalSettings, settings);
      this.modal = this.getModalElement();
      this.instance = this.settings.id || component.getAttribute(_Modal.attr.id);
      component.setAttribute(_Modal.attr.id, this.instance);
      this.component.setAttribute("role", "dialog");
      this.component.setAttribute("aria-modal", "true");
      this.setInitialState();
      this.setupStickyFooter();
      if (this.modal === this.component) {
        console.warn(`Modal: The modal instance was successfully initialized, but the "modal" element is equal to the "component" element, which will affect the modal animations. To fix this, add the "${_Modal.selector("modal")}" attribute to a descendant of the component element. Find out more about the difference between the "component" and the "modal" element in the documentation.`);
      }
      this.initialized = true;
    }
    static {
      this.attr = {
        id: "data-modal-id",
        element: "data-modal-element"
      };
    }
    static {
      this.attributeSelector = attributeselector_default(_Modal.attr.element);
    }
    /**
     * Static selector
     */
    static selector(element, instance) {
      const base = _Modal.attributeSelector(element);
      return instance ? `${base}[${_Modal.attr.id}="${instance}"]` : base;
    }
    /**
     * Instance selector
     */
    selector(element, local = true) {
      return local ? _Modal.selector(element, this.instance) : _Modal.selector(element);
    }
    static select(element, instance) {
      return document.querySelector(_Modal.selector(element, instance));
    }
    static selectAll(element, instance) {
      return document.querySelectorAll(_Modal.selector(element, instance));
    }
    select(element, local = true) {
      return local ? this.component.querySelector(_Modal.selector(element)) : document.querySelector(_Modal.selector(element, this.instance));
    }
    selectAll(element, local = true) {
      return local ? this.component.querySelectorAll(_Modal.selector(element)) : document.querySelectorAll(_Modal.selector(element, this.instance));
    }
    getModalElement() {
      if (this.component.matches(_Modal.selector("modal"))) {
        this.modal = this.component;
      } else {
        this.modal = this.component.querySelector(this.selector("modal"));
      }
      if (!this.modal) this.modal = this.component;
      return this.modal;
    }
    setupStickyFooter() {
      const modalContent = this.component.querySelector(_Modal.selector("scroll"));
      const stickyFooter = this.component.querySelector(_Modal.selector("sticky-bottom"));
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
      this.component.classList.remove("hide");
      this.hide();
      switch (this.settings.animation.type) {
        case "growIn":
        case "slideUp":
          this.modal.style.willChange = "transform";
          this.modal.style.transitionProperty = "transform";
          this.modal.style.transitionDuration = `${this.settings.animation.duration.toString()}ms`;
        case "fade":
          this.component.style.willChange = "opacity";
          this.component.style.transitionProperty = "opacity";
          this.component.style.transitionDuration = `${this.settings.animation.duration.toString()}ms`;
          break;
        case "none":
          break;
      }
      this.component.dataset.state = "closed";
    }
    async show() {
      this.component.dataset.state = "opening";
      this.component.style.removeProperty("display");
      await new Promise((resolve) => setTimeout(resolve, 0));
      await animationFrame();
      switch (this.settings.animation.type) {
        case "fade":
          this.component.style.opacity = "1";
          break;
        case "slideUp":
          this.component.style.opacity = "1";
          this.modal.style.transform = "translateY(0vh)";
          break;
        case "growIn":
          this.component.style.opacity = "1";
          this.modal.style.transform = "scale(1)";
          break;
        default:
          this.component.classList.remove("is-closed");
      }
      setTimeout(() => {
        this.component.dataset.state = "open";
      }, this.settings.animation.duration);
    }
    async hide() {
      this.component.dataset.state = "closing";
      switch (this.settings.animation.type) {
        case "fade":
          this.component.style.opacity = "0";
          break;
        case "slideUp":
          this.component.style.opacity = "0";
          this.modal.style.transform = "translateY(10vh)";
          break;
        case "growIn":
          this.component.style.opacity = "0";
          this.modal.style.transform = "scale(0.9)";
          break;
        default:
          break;
      }
      const finish = new Promise((resolve) => {
        setTimeout(() => {
          this.component.style.display = "none";
          this.component.dataset.state = "closed";
          resolve();
        }, this.settings.animation.duration);
      });
      await finish;
    }
    /**
     * Opens the modal instance.
     *
     * This method calls the `show` method and locks the scroll of the document body.
     */
    open() {
      this.show();
      if (this.settings.lockBodyScroll) {
        lockBodyScroll();
      }
    }
    /**
     * Closes the modal instance.
     *
     * This method calls the `hide` method and unlocks the scroll of the document body.
     */
    close() {
      if (this.settings.lockBodyScroll) {
        unlockBodyScroll();
      }
      this.hide();
    }
  };
  function lockBodyScroll() {
    document.body.style.overflow = "hidden";
  }
  function unlockBodyScroll() {
    document.body.style.removeProperty("overflow");
  }
  function animationFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  // src/peakpoint/cal-prototype.ts
  var modal = Modal.select("component", "prototype");
  var prototypeForm = modal.querySelector("form");
  disableWebflowForm(prototypeForm);
  prototypeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formBlock = prototypeForm.parentElement;
    const fields = Object.fromEntries(new FormData(prototypeForm).entries());
    const wfFormData = getWfFormData(prototypeForm, fields);
    const success = await sendFormData(wfFormData);
    if (success) {
      const successEl = formBlock.querySelector(formElementSelector("success"));
      successEl.classList.remove("hide");
      successEl.style.display = "block";
    } else {
      const errorEl = formBlock.querySelector(formElementSelector("error"));
      errorEl.classList.remove("hide");
      errorEl.style.display = "block";
      errorEl.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  });
  loadCal("prototyp").then((Cal) => {
    const element = document.querySelector('[calcom-embed="inline"]');
    if (!element) throw new Error("Embed container not found");
    Cal.ns["prototyp"]("inline", {
      elementOrSelector: element,
      config: { layout: "month_view" },
      calLink: "peakpoint/prototyp"
    });
    Cal.ns["prototyp"]("ui", {
      hideEventTypeDetails: true,
      layout: "month_view",
      cssVarsPerTheme: {
        light: { "cal-brand": "#333" },
        dark: { "cal-brand": "#eee" }
      }
    });
    Cal.ns.prototyp("on", {
      action: "bookingSuccessfulV2",
      callback: () => {
        console.log("BOOKING SUCCESSFUL WORKS");
        const event = new Event("submit", { bubbles: true, cancelable: true });
        prototypeForm.dispatchEvent(event);
      }
    });
  });
})();
//# sourceMappingURL=cal-prototype.js.map

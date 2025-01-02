// library/attributeselector.ts
var createAttribute = (attrName, defaultValue = null) => {
  return (name = defaultValue) => {
    if (!name) {
      return `[${attrName}]`;
    }
    return `[${attrName}="${name}"]`;
  };
};
var attributeselector_default = createAttribute;

// library/parameterize.ts
function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

// library/date.ts
function formatDate(date, format, locale = "de-CH") {
  const tokens = {
    "DDDD": date.toLocaleDateString(locale, { weekday: "long" }),
    "DDD": date.toLocaleDateString(locale, { weekday: "short" }),
    "dd": date.getDate().toLocaleString(locale, { minimumIntegerDigits: 2 }),
    "d": date.getDate().toLocaleString(locale, { minimumIntegerDigits: 1 }),
    "MMMM": date.toLocaleDateString(locale, { month: "long" }),
    "MMM": date.toLocaleDateString(locale, { month: "short" }),
    "MM": date.toLocaleDateString(locale, { month: "2-digit" }),
    "m": date.toLocaleDateString(locale, { month: "numeric" }),
    "YYYY": date.toLocaleDateString(locale, { year: "numeric" }),
    "YY": date.toLocaleDateString(locale, { year: "2-digit" })
  };
  return format.replace(/DDDD|DDD|dd|d|MMMM|MMM|MM|m|YYYY|YY/g, (match) => tokens[match]);
}

// library/renderer.ts
var Renderer = class _Renderer {
  constructor(canvas, attributeName = "render") {
    this.attributeName = attributeName;
    this.filterAttributes = /* @__PURE__ */ new Set([
      "data-filter",
      "data-category",
      "data-visibility"
    ]);
    if (!canvas)
      throw new Error(`Canvas can't be undefined.`);
    this.canvas = canvas;
    this.elementAttr = `data-${attributeName}-element`;
    this.fieldAttr = `data-${attributeName}-field`;
  }
  render(data, canvas = this.canvas) {
    this.clear();
    this.renderRecursive(data, canvas);
  }
  renderRecursive(data, canvas = this.canvas) {
    this.data = data;
    this.data.forEach((renderItem) => {
      if (_Renderer.isRenderElement(renderItem)) {
        const selector = this.elementSelector(renderItem);
        const newCanvases = canvas.querySelectorAll(selector);
        if (!newCanvases.length) {
          console.warn(`Element "${selector}" was not found.`);
          return;
        }
        newCanvases.forEach((newCanvas) => {
          if (renderItem.visibilityControl && this.shouldHideElement(renderItem)) {
            this.hideElement(newCanvas, renderItem.visibilityControl);
          } else {
            this.renderRecursive(renderItem.fields, newCanvas);
          }
        });
      }
      if (_Renderer.isRenderField(renderItem)) {
        this.renderField(renderItem, canvas);
      }
    });
  }
  /**
   * Recursively reads the DOM node and its descendants to build a structured RenderData.
   * It identifies elements with `data-${elementAttr}-element` and `data-${fieldAttr}-field` attributes,
   * and processes them into RenderElement and RenderField objects.
   *
   * @param {HTMLElement} node - The root node to start reading from.
   * @returns {RenderData} An array of RenderElement and RenderField objects representing the node structure.
   */
  read(node, stopRecursionMatches = []) {
    const renderData = [];
    Array.from(node.children).forEach((child) => {
      if (stopRecursionMatches.some((selector) => child.matches(selector))) {
        return;
      }
      if (child.hasAttribute(this.elementAttr)) {
        renderData.push(this.readRenderElement(child, stopRecursionMatches));
      } else if (child.hasAttribute(this.fieldAttr)) {
        renderData.push(this.readRenderField(child));
      } else {
        const hasRenderableChild = child.querySelectorAll(`[${this.elementAttr}], [${this.fieldAttr}]`).length > 0;
        if (hasRenderableChild) {
          renderData.push(...this.read(child, stopRecursionMatches));
        }
      }
    });
    return renderData;
  }
  clear(node = this.canvas) {
    node.querySelectorAll(this.fieldSelector()).forEach((field) => field.innerText = "");
  }
  readRenderElement(child, stopRecursionAttributes) {
    const elementName = child.getAttribute(this.elementAttr);
    const instance = child.getAttribute(`data-${elementName}-instance`);
    const fields = this.read(child, stopRecursionAttributes);
    const element = {
      element: elementName,
      fields
    };
    element.instance = instance || void 0;
    this.readFilteringProperties(child, element);
    this.readVisibilityControl(child, element);
    return element;
  }
  readRenderField(child) {
    const fieldName = child.getAttribute(this.fieldAttr);
    const instance = child.getAttribute(`data-${fieldName}-instance`);
    let value = child.innerHTML.trim();
    const type = child.children.length > 0 ? "html" : child.hasAttribute("data-date") ? "date" : "text";
    switch (type) {
      case "date":
        value = value;
        break;
      default:
        break;
    }
    const field = {
      element: fieldName,
      value,
      type
    };
    field.instance = instance || void 0;
    this.readFilteringProperties(child, field);
    this.readVisibilityControl(child, field);
    return field;
  }
  readFilteringProperties(child, field) {
    this.filterAttributes.forEach((attr) => {
      if (!child.hasAttribute(attr)) {
        return;
      }
      let value = child.getAttribute(attr);
      if (!value) {
        return;
      }
      if (attr.toLowerCase().includes("date")) {
        const parsedDate = new Date(value);
        value = isNaN(parsedDate.getTime()) ? null : parsedDate;
      }
      if (attr.toLowerCase().includes("boolean")) {
        if (value === "select") {
          const booleanValue = child.querySelector(value);
          value = booleanValue ? JSON.parse(booleanValue.getAttribute(attr) || "false") : false;
        } else {
          value = JSON.parse(value);
        }
      }
      field[toCamelCase(attr)] = value;
    });
  }
  readVisibilityControl(child, elementOrField) {
    const visibilityControlAttr = child.getAttribute(`data-${this.attributeName}-visibility-control`)?.trim();
    elementOrField.visibilityControl = JSON.parse(visibilityControlAttr ?? "false") || false;
  }
  renderField(field, canvas) {
    const selector = this.fieldSelector(field);
    const fields = canvas.querySelectorAll(selector);
    fields.forEach((fieldElement) => {
      if (!field.value.trim()) {
        this.hideElement(fieldElement, field.visibilityControl);
      } else {
        switch (field.type) {
          case "html":
            fieldElement.innerHTML = field.value;
            break;
          case "date":
            fieldElement.innerText = formatDate(new Date(field.value), fieldElement.dataset.dateFormat || "d.m.YYYY");
            break;
          default:
            fieldElement.innerText = field.value;
        }
      }
    });
  }
  shouldHideElement(element) {
    return element.fields.every((child) => {
      if (_Renderer.isRenderField(child)) {
        return !child.value.trim();
      }
      if (_Renderer.isRenderElement(child)) {
        return this.shouldHideElement(child);
      }
      return false;
    });
  }
  hideElement(element, hideControl) {
    const hideSelf = JSON.parse(element.getAttribute(`data-${this.attributeName}-hide-self`) || "false");
    const ancestorToHide = element.getAttribute(`data-${this.attributeName}-hide-ancestor`);
    if (!hideControl) {
      return;
    }
    if (hideSelf) {
      element.style.display = "none";
    } else if (ancestorToHide) {
      const ancestor = element.closest(ancestorToHide);
      if (ancestor) {
        ancestor.style.display = "none";
      } else {
        console.warn(`Ancestor "${ancestorToHide}" not found for element.`);
      }
    }
  }
  // Method to add filter attributes
  addFilterAttributes(newAttributes) {
    newAttributes.forEach((attr) => {
      this.filterAttributes.add(attr);
    });
  }
  // Method to remove filter attributes
  removeFilterAttributes(attributesToRemove) {
    attributesToRemove.forEach((attr) => {
      this.filterAttributes.delete(attr);
    });
  }
  elementSelector(element) {
    const elementAttrSelector = attributeselector_default(this.elementAttr);
    let selectorString = elementAttrSelector(element.element);
    if (element.instance) {
      selectorString += this.instanceSelector(element.element, element.instance);
    }
    return selectorString;
  }
  fieldSelector(field) {
    const fieldAttrSelector = attributeselector_default(this.fieldAttr);
    if (!field) {
      return fieldAttrSelector();
    }
    let selectorString = fieldAttrSelector(field.element);
    if (field.instance) {
      selectorString += this.instanceSelector(field.element, field.instance);
    }
    return selectorString;
  }
  instanceSelector(element, instanceId) {
    return `[data-${element}-instance="${instanceId}"]`;
  }
  // Type Guard for RenderElement
  static isRenderElement(item) {
    return item.fields !== void 0;
  }
  // Type Guard for RenderField
  static isRenderField(item) {
    return item.value !== void 0;
  }
};
var renderer_default = Renderer;
export {
  renderer_default as default
};

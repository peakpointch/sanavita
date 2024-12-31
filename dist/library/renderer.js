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

// library/renderer.ts
var Renderer = class _Renderer {
  constructor(canvas, attributeName = "render") {
    if (!canvas)
      throw new Error(`Canvas can't be undefined.`);
    this.canvas = canvas;
    this.elementAttr = `data-${attributeName}-element`;
    this.fieldAttr = `data-${attributeName}-field`;
  }
  render(data, canvas = this.canvas) {
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
          const shouldHide = this.shouldHideElement(renderItem);
          if (shouldHide) {
            this.hideElement(newCanvas, renderItem.hideControl);
          } else {
            this.render(renderItem.fields, newCanvas);
          }
        });
      }
      if (_Renderer.isRenderField(renderItem)) {
        this.renderField(renderItem, canvas);
      }
    });
  }
  renderField(field, canvas) {
    const selector = this.fieldSelector(field);
    const fields = canvas.querySelectorAll(selector);
    fields.forEach((fieldElement) => {
      if (!field.value.trim()) {
        this.hideElement(fieldElement, field.hideControl);
      } else {
        switch (field.type) {
          case "html":
            fieldElement.innerHTML = field.value;
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
    if (!hideControl || hideControl.hideSelf) {
      element.style.display = "none";
    } else if (hideControl.ancestorToHide) {
      const ancestor = element.closest(hideControl.ancestorToHide);
      if (ancestor) {
        ancestor.style.display = "none";
      } else {
        console.warn(`Ancestor "${hideControl.ancestorToHide}" not found for element.`);
      }
    }
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

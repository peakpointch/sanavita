import createAttribute from "@library/attributeselector";

type HideControl = {
  hideSelf: boolean; // Whether to hide the element itself
  ancestorToHide?: string; // Specify the ancestor to hide (identified by an attribute selector or tag)
};

type RenderField = {
  element: string;
  instance?: string;
  value: string;
  type: 'text' | 'html';
  hideControl?: HideControl;
};

type RenderElement = {
  element: string;
  instance?: string;
  fields: RenderData;
  hideControl?: HideControl;
};

type RenderData = Array<RenderElement | RenderField>;

class Renderer {
  private canvas: HTMLElement;
  private data: RenderData;
  private fieldAttr: string;
  private elementAttr: string;

  constructor(canvas: HTMLElement | null, attributeName: string = 'render') {
    if (!canvas) throw new Error(`Canvas can't be undefined.`);
    this.canvas = canvas;
    this.elementAttr = `data-${attributeName}-element`;
    this.fieldAttr = `data-${attributeName}-field`;
  }

  public render(data: RenderData, canvas: HTMLElement = this.canvas): void {
    this.data = data;

    this.data.forEach((renderItem) => {
      // Render Elements
      if (Renderer.isRenderElement(renderItem)) {
        const selector = this.elementSelector(renderItem);

        // Get the current canvas for rendering nested elements
        const newCanvases: NodeListOf<HTMLElement> = canvas.querySelectorAll(selector);
        if (!newCanvases.length) {
          console.warn(`Element "${selector}" was not found.`);
          return;
        }

        // Recursion with visibility check
        newCanvases.forEach((newCanvas) => {
          const shouldHide = this.shouldHideElement(renderItem);
          if (shouldHide) {
            this.hideElement(newCanvas, renderItem.hideControl);
          } else {
            this.render(renderItem.fields, newCanvas); // Recursively render children
          }
        });
      }

      // Render Fields
      if (Renderer.isRenderField(renderItem)) {
        this.renderField(renderItem, canvas);
      }
    });
  }

  private renderField(field: RenderField, canvas: HTMLElement) {
    const selector = this.fieldSelector(field);
    const fields: NodeListOf<HTMLElement> = canvas.querySelectorAll(selector);
    fields.forEach((fieldElement) => {
      if (!field.value.trim()) {
        this.hideElement(fieldElement, field.hideControl); // Hide empty field
      } else {
        switch (field.type) {
          case 'html':
            fieldElement.innerHTML = field.value;
            break;
          default:
            fieldElement.innerText = field.value;
        }
      }
    });
  }

  private shouldHideElement(element: RenderElement): boolean {
    // Check if all child fields and elements are empty
    return element.fields.every((child) => {
      if (Renderer.isRenderField(child)) {
        return !child.value.trim(); // Empty field
      }
      if (Renderer.isRenderElement(child)) {
        return this.shouldHideElement(child); // Recursively check child elements
      }
      return false; // Default case
    });
  }

  private hideElement(element: HTMLElement, hideControl?: HideControl): void {
    if (!hideControl || hideControl.hideSelf) {
      // Hide the element itself
      element.style.display = 'none';
    } else if (hideControl.ancestorToHide) {
      // Hide the specified ancestor
      const ancestor: HTMLElement = element.closest(hideControl.ancestorToHide);
      if (ancestor) {
        ancestor.style.display = 'none';
      } else {
        console.warn(`Ancestor "${hideControl.ancestorToHide}" not found for element.`);
      }
    }
  }

  private elementSelector(element: RenderElement): string {
    const elementAttrSelector = createAttribute(this.elementAttr);
    let selectorString = elementAttrSelector(element.element);
    if (element.instance) {
      selectorString += this.instanceSelector(element.element, element.instance);
    }
    return selectorString;
  }

  private fieldSelector(field: RenderField): string {
    const fieldAttrSelector = createAttribute(this.fieldAttr);
    let selectorString = fieldAttrSelector(field.element);
    if (field.instance) {
      selectorString += this.instanceSelector(field.element, field.instance);
    }
    return selectorString;
  }

  private instanceSelector(element: string, instanceId: string): string {
    return `[data-${element}-instance="${instanceId}"]`;
  }

  // Type Guard for RenderElement
  private static isRenderElement(item: RenderElement | RenderField): item is RenderElement {
    return (item as RenderElement).fields !== undefined;
  }

  // Type Guard for RenderField
  private static isRenderField(item: RenderElement | RenderField): item is RenderField {
    return (item as RenderField).value !== undefined;
  }
}

export default Renderer;
export type { RenderData, RenderElement, RenderField };

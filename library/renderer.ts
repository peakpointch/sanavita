import createAttribute from "@library/attributeselector";
import { toCamelCase } from "./parameterize";
import formatDate from "./date";

type VisibilityControl = boolean;

type RenderField = {
  element: string;
  instance?: string;
  value: string;
  type?: 'text' | 'html' | 'date';
  visibilityControl?: VisibilityControl;
  [key: string]: any;
};

type RenderElement = {
  element: string;
  instance?: string;
  fields: RenderData;
  visibilityControl?: VisibilityControl;
  [key: string]: any;
};

type RenderData = Array<RenderElement | RenderField>;

class Renderer {
  private canvas: HTMLElement;
  private data: RenderData;
  private fieldAttr: string;
  private elementAttr: string;
  private filterAttributes: Set<string> = new Set([
    'data-filter',
    'data-category',
    'data-visibility'
  ]);

  constructor(canvas: HTMLElement | null, private attributeName: string = 'render') {
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
          if (renderItem.visibilityControl && this.shouldHideElement(renderItem)) {
            this.hideElement(newCanvas, renderItem.visibilityControl);
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

  /**
   * Recursively reads the DOM node and its descendants to build a structured RenderData.
   * It identifies elements with `data-${elementAttr}-element` and `data-${fieldAttr}-field` attributes,
   * and processes them into RenderElement and RenderField objects.
   *
   * @param {HTMLElement} node - The root node to start reading from.
   * @returns {RenderData} An array of RenderElement and RenderField objects representing the node structure.
   */
  public read(node: HTMLElement, stopRecursionMatches: string[] = []): RenderData {
    const renderData: RenderData = [];

    Array.from(node.children).forEach((child) => {
      if (stopRecursionMatches.some(selector => child.matches(selector))) {
        return; // Stop recursion for this element
      }

      // If it's a RenderElement
      if (child.hasAttribute(this.elementAttr)) {
        renderData.push(this.readRenderElement(child as HTMLElement, stopRecursionMatches));
      }
      // If it's a RenderField
      else if (child.hasAttribute(this.fieldAttr)) {
        renderData.push(this.readRenderField(child as HTMLElement));
      }
      // If it's neither, check if any descendants are renderable
      else {
        const hasRenderableChild = child.querySelectorAll(`[${this.elementAttr}], [${this.fieldAttr}]`).length > 0;

        // If there are renderable children, recurse on this child
        if (hasRenderableChild) {
          renderData.push(...this.read(child as HTMLElement, stopRecursionMatches));
        }
      }
    });

    return renderData;
  }

  private readRenderElement(child: HTMLElement, stopRecursionAttributes: string[]): RenderElement {
    const elementName = child.getAttribute(this.elementAttr);
    const instance = child.getAttribute(`data-${elementName}-instance`);

    // Recursively read child elements
    const fields = this.read(child as HTMLElement, stopRecursionAttributes); // Recurse on children

    const element: RenderElement = {
      element: elementName!,
      instance: instance || undefined,
      fields,
    };

    this.readFilteringProperties(child, element);
    this.readVisibilityControl(child, element);

    return element;
  }

  private readRenderField(child: HTMLElement): RenderField {
    const fieldName = child.getAttribute(this.fieldAttr);
    const instance = child.getAttribute(`data-${fieldName}-instance`);

    // Determine field type (handle date, text, html)
    let value: string = child.innerHTML.trim();
    const type = child.children.length > 0 ? 'html' : (child.hasAttribute('data-date') ? 'date' : 'text');

    switch (type) {
      case 'date':
        value = value;
        break;
      default:
        break;
    }

    const field: RenderField = {
      element: fieldName!,
      instance: instance || undefined,
      value,
      type,
    };

    // Optionally, handle additional properties for filtering purposes
    this.readFilteringProperties(child, field);
    this.readVisibilityControl(child, field);

    return field;
  }

  private readFilteringProperties(child: HTMLElement, field: RenderField | RenderElement): void {
    this.filterAttributes.forEach(attr => {
      if (!child.hasAttribute(attr)) { return }

      let value: any = child.getAttribute(attr);
      if (!value) { return }

      // Handle Date attributes
      if (attr.toLowerCase().includes('date')) {
        const parsedDate = new Date(value);
        value = isNaN(parsedDate.getTime()) ? null : parsedDate;  // Ensure valid date
      }

      // Handle Boolean attributes
      if (attr.toLowerCase().includes('boolean')) {
        if (value === 'select') {
          // If value is 'select', attempt to parse a child element's attribute as boolean
          const booleanValue = child.querySelector(value);
          value = booleanValue ? JSON.parse(booleanValue.getAttribute(attr) || 'false') : false;
        } else {
          value = JSON.parse(value);
        }
      }

      field[toCamelCase(attr)] = value;
    });
  }


  private readVisibilityControl(child: HTMLElement, elementOrField: RenderField | RenderElement): void {
    const visibilityControlAttr = child.getAttribute(`data-${this.attributeName}-visibility-control`);
    elementOrField.visibilityControl = JSON.parse(visibilityControlAttr || 'false');
  }

  private renderField(field: RenderField, canvas: HTMLElement) {
    const selector = this.fieldSelector(field);
    const fields: NodeListOf<HTMLElement> = canvas.querySelectorAll(selector);
    fields.forEach((fieldElement) => {
      if (!field.value.trim()) {
        this.hideElement(fieldElement, field.visibilityControl); // Hide empty field
      } else {
        switch (field.type) {
          case 'html':
            fieldElement.innerHTML = field.value;
            break;
          case 'date':
            fieldElement.innerText = formatDate(new Date(field.value), fieldElement.dataset.dateFormat || 'd.m.YYYY');
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

  private hideElement(element: HTMLElement, hideControl?: VisibilityControl): void {
    const hideSelf = JSON.parse(element.getAttribute(`data-${this.attributeName}-hide-self`) || 'false');
    const ancestorToHide = element.getAttribute(`data-${this.attributeName}-hide-ancestor`);
    if (hideControl || hideSelf) {
      // Hide the element itself
      element.style.display = 'none';
    } else if (ancestorToHide) {
      // Hide the specified ancestor
      const ancestor: HTMLElement = element.closest(ancestorToHide);
      if (ancestor) {
        ancestor.style.display = 'none';
      } else {
        console.warn(`Ancestor "${ancestorToHide}" not found for element.`);
      }
    }
  }

  // Method to add filter attributes
  public addFilterAttributes(newAttributes: string[]): void {
    newAttributes.forEach(attr => {
      this.filterAttributes.add(attr);
    });
  }

  // Method to remove filter attributes
  public removeFilterAttributes(attributesToRemove: string[]): void {
    attributesToRemove.forEach(attr => {
      this.filterAttributes.delete(attr);
    });
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

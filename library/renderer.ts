import createAttribute from "@library/attributeselector";
import { toCamelCase } from "./parameterize";
import formatDate from "./date";

type VisibilityControl = boolean | 'emptyState';
type UnparsedBoolean<T> = Exclude<T, boolean> | "true" | "false";

type RenderField = {
  element: string;
  instance?: string;
  value: string;
  type?: 'text' | 'html' | 'date';
  visibility: boolean;
  [key: string]: any;
};

type RenderElement = {
  element: string;
  instance?: string;
  fields: RenderData;
  visibility: boolean;
  [key: string]: any;
};

type RenderData = Array<RenderElement | RenderField>;
type FilterAttribute = Record<string, "string" | "number" | "date" | "boolean">;

class Renderer {
  private canvas: HTMLElement;
  private data: RenderData;
  private fieldAttr: string;
  private elementAttr: string;
  private emptyStateAttr: string;
  private filterAttributes: FilterAttribute = {
    "data-filter": "string",
    "data-category": "string",
  };

  constructor(canvas: HTMLElement | null, private attributeName: string = 'render') {
    if (!canvas) throw new Error(`Canvas can't be undefined.`);
    this.canvas = canvas;
    this.elementAttr = `data-${attributeName}-element`;
    this.fieldAttr = `data-${attributeName}-field`;
    this.emptyStateAttr = `data-${attributeName}-empty-state`;
  }

  public render(data: RenderData, canvas: HTMLElement = this.canvas): void {
    this.clear();
    this.renderRecursive(data, canvas);
  }

  private renderRecursive(data: RenderData, canvas: HTMLElement = this.canvas): void {
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
          if (newCanvas.style.display === "none") {
            newCanvas.style.removeProperty('display');
          }
          if (newCanvas.classList.contains('hide')) {
            newCanvas.classList.remove('hide');
          }

          switch (this.readVisibilityControl(newCanvas)) {
            case "emptyState":
              const emptyStateElement = newCanvas.querySelector<HTMLElement>(`[${this.emptyStateAttr}]`);
              if (this.shouldHideElement(renderItem)) {
                emptyStateElement.classList.remove('hide');
                if (emptyStateElement.style.display === "none") {
                  emptyStateElement.style.removeProperty('display');
                }
              } else {
                emptyStateElement.classList.add('hide');
                emptyStateElement.style.display = "none";
              }
              // For both cases since the children have to be hidden if the empty state is shown.
              this.renderRecursive(renderItem.fields, newCanvas);
              break;
            case true:
              if (this.shouldHideElement(renderItem)) {
                this.hideElement(newCanvas);
              } else {
                this.renderRecursive(renderItem.fields, newCanvas); // Recursively render children
              }
              break;
            default:
              this.renderRecursive(renderItem.fields, newCanvas); // Recursively render children
              break;
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
   * @param node The root node to start reading from.
   * @returns `RenderData` An array of RenderElement and RenderField objects representing the node structure.
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

  public clear(node: HTMLElement = this.canvas): void {
    node.querySelectorAll<HTMLElement>(this.fieldSelector())
      .forEach(field => field.innerText = "");
  }

  private readRenderElement(child: HTMLElement, stopRecursionAttributes: string[]): RenderElement {
    const elementName = child.getAttribute(this.elementAttr);
    const instance = child.getAttribute(`data-${elementName}-instance`);

    // Recursively read child elements
    const fields = this.read(child as HTMLElement, stopRecursionAttributes); // Recurse on children

    const element: RenderElement = {
      element: elementName!,
      fields,
      visibility: true,
    };

    element.instance = instance || undefined;
    if (child.closest(`.w-condition-invisible`)) {
      element.visibility = false;
    } else {
      element.visibility = true;
    }

    this.readFilteringProperties(element, child);

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
      value,
      type,
      visibility: true,
    };

    field.instance = instance || undefined;
    if (child.closest(`.w-condition-invisible`)) {
      field.visibility = false;
    } else {
      field.visibility = true;
    }

    // Optionally, handle additional properties for filtering purposes
    this.readFilteringProperties(field, child);

    return field;
  }

  /**
   * Modifies the `field` properties based on the filtering attributes from `child`.
   * Handles `date` and `boolean` attributes.
   */
  private readFilteringProperties(field: RenderField | RenderElement, child: HTMLElement): void {
    for (let [attr, type] of Object.entries(this.filterAttributes)) {
      if (!child.hasAttribute(attr)) { continue }

      let value: any = child.getAttribute(attr);
      if (!value) { continue }

      switch (type) {
        case "date":
          const parsedDate = new Date(value);
          value = isNaN(parsedDate.getTime()) ? null : parsedDate;  // Ensure valid date
          break;

        case "boolean":
          if (value === 'select') {
            // Translate webflows conditional visibility to boolean
            const targetElement = child.querySelector(`[${attr}]`);
            if (!targetElement) {
              throw new Error(`Can't parse boolean filter: No element found with attribute "[${attr}]". Perhaps you misspelled the attribute?`);
            }

            value = Boolean(!targetElement.classList.contains('w-condition-invisible'));
          } else {
            // Handles attribute values directly
            value = JSON.parse(value);
          }
          break;

        case "number":
          value = parseFloat(value);
          break;

        case "string":
        default:
          break;
      }

      field[toCamelCase(attr)] = value;
    };
  }

  /**
   * Parse the visibility control attribute value of a Render-`child`.
   *
   * ### "VisibilityControl" tells the `Renderer` wether it should mess with a `RenderElement`'s or `RenderField`'s visibility
   * - `emptyState`: Shows an empty state if the children are hidden
   * - `true`: Hides the element if there is no content to be shown.
   * - `false`: Disable visibility control, do not mess with the element's visibility.
   */
  private readVisibilityControl(child: HTMLElement): VisibilityControl {
    const visibilityControlAttr = child.getAttribute(`data-${this.attributeName}-visibility-control`)?.trim() as UnparsedBoolean<VisibilityControl>;
    switch (visibilityControlAttr) {
      case "emptyState":
        return "emptyState";
      default:
        return JSON.parse(visibilityControlAttr ?? 'false') || false;
    }
  }

  private renderField(field: RenderField, canvas: HTMLElement) {
    const selector = this.fieldSelector(field);
    const fields: NodeListOf<HTMLElement> = canvas.querySelectorAll(selector);
    fields.forEach((fieldElement) => {
      if (!field.visibility || !field.value.trim()) {
        switch (this.readVisibilityControl(fieldElement)) {
          case "emptyState":
            this.hideElement(fieldElement); // Hide empty field
            console.log(canvas);
            break;
          case true:
            this.hideElement(fieldElement); // Hide empty field
            break;
          case false:
            break;
          default:
            break;
        }
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
    if (element.visibility === false) return true;
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

  private hideElement(element: HTMLElement): void {
    const hideSelf = JSON.parse(element.getAttribute(`data-${this.attributeName}-hide-self`) || 'false');
    const ancestorToHide = element.getAttribute(`data-${this.attributeName}-hide-ancestor`);

    if (hideSelf) {
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
  public addFilterAttributes(newAttributes: FilterAttribute): void {
    Object.assign(this.filterAttributes, newAttributes)
  }

  // Method to remove filter attributes
  public removeFilterAttributes(...attributesToRemove: string[]): void {
    attributesToRemove.forEach(attr => {
      delete this.filterAttributes[attr]
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

  private fieldSelector(field?: RenderField): string {
    const fieldAttrSelector = createAttribute(this.fieldAttr);
    if (!field) {
      return fieldAttrSelector();
    }

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

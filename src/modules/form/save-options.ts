import Selector from "peakflow/attributeselector";
import { deepMerge } from "peakflow/utils";

type SaveOptionsElement =
  | "component"
  | "button"
  | "trigger"
  | "list"
  | "option";

interface SaveOptionsAttributes {
  id: string;
  element: string;
  key: string;
  label: string;
}

export type SaveAction = {
  label: string;
  element: HTMLElement;
  handler: () => void;
};

interface SaveOptionsSettings {
  id?: string;
  hideSelectedAction: boolean;
}

export default class SaveOptions<ActionKey extends string = string> {
  public static get attr(): SaveOptionsAttributes {
    return {
      id: "data-save-options-id",
      element: "data-save-options-element",
      key: "data-save-options-key",
      label: "data-save-options-label",
    };
  }
  public static get defaultSettings(): SaveOptionsSettings {
    return {
      id: undefined,
      hideSelectedAction: true,
    };
  }
  public instance: string;
  public settings: SaveOptionsSettings;
  private component: HTMLElement;
  private saveButton: HTMLButtonElement;
  private actions: Map<ActionKey, SaveAction> = new Map();
  private currentActionKey: ActionKey | null = null;
  private renderButtonContent: (action: SaveAction) => void = (action) => {
    this.saveButton.textContent = action.label;
  };

  constructor(
    component: HTMLElement,
    settings: Partial<SaveOptionsSettings> = {},
  ) {
    this.component = component;
    this.settings = deepMerge(SaveOptions.defaultSettings, settings);
    this.instance =
      this.settings.id || component.getAttribute(SaveOptions.attr.id);
    component.setAttribute(SaveOptions.attr.id, this.instance);

    // Find main save button
    this.saveButton = this.select("button");
    // Find all dropdown options
    const dropdownOptions = this.selectAll("option");

    dropdownOptions.forEach((optionEl) => {
      const key = optionEl.getAttribute(SaveOptions.attr.key) as ActionKey;
      const label =
        optionEl.getAttribute(SaveOptions.attr.label) ||
        optionEl.textContent?.trim() ||
        "";
      if (!key) return;

      // Placeholder handler (can be overridden)
      this.actions.set(key, {
        label,
        element: optionEl,
        handler: () => {},
      });

      optionEl.addEventListener("click", () => {
        this.setAction(key);
        this.executeAction();
      });
    });

    this.saveButton.addEventListener("click", () => {
      this.executeAction();
    });
  }

  private static attributeSelector = Selector.attr<SaveOptionsElement>(
    SaveOptions.attr.element,
  );

  /**
   * Static selector
   */
  public static selector(
    element: SaveOptionsElement,
    instance?: string,
  ): string {
    const base = SaveOptions.attributeSelector(element);
    return instance ? `${base}[${SaveOptions.attr.id}="${instance}"]` : base;
  }

  /**
   * Instance selector
   */
  public selector(element: SaveOptionsElement, local = true): string {
    return local
      ? SaveOptions.selector(element, this.instance)
      : SaveOptions.selector(element);
  }

  public static select<T extends Element = HTMLElement>(
    element: SaveOptionsElement,
    instance?: string,
  ): T {
    return document.querySelector<T>(SaveOptions.selector(element, instance));
  }

  public static selectAll<T extends Element = HTMLElement>(
    element: SaveOptionsElement,
    instance?: string,
  ): NodeListOf<T> {
    return document.querySelectorAll<T>(
      SaveOptions.selector(element, instance),
    );
  }

  public select<T extends Element = HTMLElement>(
    element: SaveOptionsElement,
    local: boolean = true,
  ): T {
    return local
      ? this.component.querySelector<T>(SaveOptions.selector(element))
      : document.querySelector<T>(SaveOptions.selector(element, this.instance));
  }

  public selectAll<T extends Element = HTMLElement>(
    element: SaveOptionsElement,
    local: boolean = true,
  ): NodeListOf<T> {
    return local
      ? this.component.querySelectorAll<T>(SaveOptions.selector(element))
      : document.querySelectorAll<T>(
          SaveOptions.selector(element, this.instance),
        );
  }

  public setRenderButtonContent(renderer: (action: SaveAction) => void) {
    this.renderButtonContent = renderer;
  }

  public setAction(key: ActionKey) {
    if (!this.actions.has(key)) {
      throw new Error(`Save action '${key}' not found`);
    }
    const action = this.actions.get(key);
    if (this.settings.hideSelectedAction) {
      this.actions.get(this.currentActionKey)?.element.classList.remove("hide");
      action.element.classList.add("hide");
    }
    this.currentActionKey = key;
    this.renderButtonContent(action);
  }

  public setActionHandler(key: ActionKey, handler: () => void) {
    const action = this.actions.get(key);
    if (!action) {
      throw new Error(`Cannot set handler, action '${key}' not found`);
    }
    action.handler = handler;
  }

  public executeAction() {
    if (!this.currentActionKey) {
      throw new Error(`No save action selected`);
    }

    const action = this.actions.get(this.currentActionKey);
    if (!action) {
      throw new Error(`Save action '${this.currentActionKey}' not found`);
    }

    action.handler();
  }

  public showAllActionElements(): void {
    for (const action of this.actions.values()) {
      action.element.classList.remove("hide");
    }
  }
}

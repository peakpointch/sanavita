import createAttribute from "./attributeselector";

type ModalElement = 'modal' | 'open' | 'close' | 'scroll' | 'sticky-top' | 'sticky-bottom';
type ModalAnimationType = 'fade' | 'slideUp' | 'custom' | 'none';

interface ModalAnimation {
  type: ModalAnimationType;
  duration: number;
  className?: string;
}

interface ModalSettings {
  animation: ModalAnimation;
  stickyFooter: boolean;
  stickyHeader: boolean;
}

export const defaultModalAnimation: ModalAnimation = {
  type: 'none',
  duration: 0,
  className: 'is-closed'
}

export const defaultModalSettings: ModalSettings = {
  animation: defaultModalAnimation,
  stickyFooter: false,
  stickyHeader: false,
}

export default class Modal {
  public component: HTMLElement;
  public initialized: boolean = false;
  public settings: ModalSettings;

  constructor(component: HTMLElement | null, settings: Partial<ModalSettings> = {}) {
    if (!component) {
      throw new Error(`The component's HTMLElement cannot be undefined.`);
    }
    this.component = component;
    this.settings = deepMerge(defaultModalSettings, settings);

    this.setInitialState();
    this.setupStickyFooter();

    this.initialized = true;
  }

  public static select = createAttribute<ModalElement>('data-modal-element');

  private setupStickyFooter(): void {
    const modalContent = this.component.querySelector<HTMLElement>(Modal.select('scroll'));
    const stickyFooter = this.component.querySelector<HTMLElement>(Modal.select('sticky-bottom'));

    if (!modalContent || !stickyFooter) {
      console.warn("Initialize modal: skip sticky footer");
    } else {
      this.setupScrollEvent(modalContent, stickyFooter);
    }
  }

  private setupScrollEvent(
    modalContent: HTMLElement,
    stickyFooter: HTMLElement
  ): void {
    modalContent.addEventListener("scroll", () => {
      const { scrollHeight, scrollTop, clientHeight } = modalContent;
      const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 1;

      if (isScrolledToBottom) {
        // Remove scroll shadow
        stickyFooter.classList.remove("modal-scroll-shadow");
      } else {
        // If not scrolled to bottom, add scroll shadow
        stickyFooter.classList.add("modal-scroll-shadow");
      }
    });
  }

  private setInitialState(): void {
    this.component.style.display = 'none';
    this.hide();

    switch (this.settings.animation.type) {
      case 'fade':
        this.component.style.willChange = 'opacity';
        this.component.style.transitionProperty = 'opacity';
        this.component.style.transitionDuration = `${this.settings.animation.duration.toString()}ms`
        break;

      case 'slideUp':
        this.component.style.willChange = 'opacity, translate';
        this.component.style.transitionProperty = 'opacity, translate';
        this.component.style.transitionDuration = `${this.settings.animation.duration.toString()}ms`
        break;

      case 'none':
        break;
    }

    this.component.dataset.state = "closed";
  }

  private show(): void {
    this.component.dataset.state = "opening";
    this.component.style.removeProperty('display');
    switch (this.settings.animation.type) {
      case 'fade':
        this.component.style.opacity = '1';
        break;

      case 'slideUp':
        this.component.style.opacity = '1';
        this.component.style.translate = '0px 0vh;'
        break;

      default:
        this.component.classList.remove("is-closed");
    }

    this.component.dataset.state = "open";
  }

  private hide(): void {
    this.component.dataset.state = "closing";
    switch (this.settings.animation.type) {
      case 'fade':
        this.component.style.opacity = '0';
        break;

      case 'slideUp':
        this.component.style.opacity = '0';
        this.component.style.translate = '0px 20vh';
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
  public open() {
    this.show();
    lockBodyScroll();
  }

  /**
   * Closes the modal instance.
   *
   * This method calls the `hide` method and unlocks the scroll of the document body.
   */
  public close() {
    unlockBodyScroll();
    this.hide();
  }
}

/**
 * Locks the scroll on the document body.
 *
 * This function sets the `overflow` style of the `body` element to `"hidden"`,
 * preventing the user from scrolling the page. Commonly used when displaying
 * modals, overlays, or other components that require the page to remain static.
 */
function lockBodyScroll(): void {
  document.body.style.overflow = "hidden";
}

/**
 * Unlocks the scroll on the document body.
 *
 * This function removes the `overflow` style from the `body` element,
 * allowing the user to scroll the page again. Typically used when hiding
 * modals, overlays, or other components that previously locked scrolling.
 */
function unlockBodyScroll(): void {
  document.body.style.removeProperty("overflow");
}

/**
 * Deeply merges two objects, giving precedence to the properties in the `source` object.
 * 
 * This function is particularly useful when working with configuration objects
 * where you want to provide defaults and allow overrides at any level of nesting.
 *
 * @template T The type of the target and resulting merged object.
 * @param {T} target - The base object containing default values.
 * @param {Partial<T>} source - An object with partial overrides to apply to the target.
 * @returns {T} A new object resulting from deeply merging `source` into `target`.
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(target[key], source[key] as any);
    } else if (source[key] !== undefined) {
      result[key] = source[key] as T[Extract<keyof T, string>];
    }
  }

  return result;
}


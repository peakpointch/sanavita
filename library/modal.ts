import createAttribute from "./attributeselector";

type ModalElement = 'scroll' | 'sticky-top' | 'sticky-bottom';

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

export default class Modal {
  public component: HTMLElement;
  public initialized: boolean = false;
  private onOpenFunctions: [() => any];

  constructor(component: HTMLElement | null) {
    if (!component) {
      throw new Error(`The passed component doesn't exist.`);
    }
    this.component = component;

    const modalContent = this.getModalContent();
    const stickyFooter = this.getStickyFooter();

    if (!modalContent || !stickyFooter) {
      console.warn("Initialize modal: skip sticky footer");
    } else {
      this.setupScrollEvent(modalContent, stickyFooter);
    }

    this.initialized = true;
  }

  public static select = createAttribute<ModalElement>('data-modal-element');

  private getModalContent(): HTMLElement | null {
    return this.component.querySelector(Modal.select('scroll'));
  }

  private getStickyFooter(): HTMLElement | null {
    return this.component.querySelector(Modal.select('sticky-bottom'));
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

  private showComponent(): void {
    this.component.style.removeProperty("display");
    this.component.classList.remove("is-closed");
    this.component.dataset.state = "open";
  }

  private hideComponent(): void {
    this.component.classList.add("is-closed");
    this.component.dataset.state = "closed";
    setTimeout(() => {
      this.component.style.display = "none";
    }, 500);
  }

  /**
   * Opens the modal instance.
   *
   * This method calls the `showComponent` method and locks the scroll of the document body.
   */
  public open() {
    this.showComponent();
    lockBodyScroll();
  }

  /**
   * Closes the modal instance.
   *
   * This method calls the `hideComponent` method and unlocks the scroll of the document body.
   */
  public close() {
    unlockBodyScroll();
    this.hideComponent();
  }

  public addCustomAction(action: () => any): void { }
}

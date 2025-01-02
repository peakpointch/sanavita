export default class EditableCanvas {
  private canvas: HTMLElement;
  private editableElements: NodeListOf<HTMLElement>;
  private defaultSelector: string = '[data-canvas-editable="true"]';
  private selectAll: string = this.defaultSelector;

  constructor(canvas: HTMLElement | null, ...customSelectors: string[]) {
    if (!canvas) throw new Error(`Canvas can't be undefined.`);
    this.canvas = canvas;

    // Prepeare custom selectors
    if (customSelectors && customSelectors.length) {
      this.selectAll = `${this.selectAll}, ${customSelectors.join(', ')}`;
    }

    this.editableElements = this.canvas.querySelectorAll<HTMLElement>(this.selectAll);
    this.canvas.querySelectorAll<HTMLElement>(`[data-canvas-editable]:not(${this.defaultSelector})`)
      .forEach(element => element.classList.remove('canvas-editable'));

    this.initialize();
  }

  private initialize() {
    // Initialize all editable elements
    this.editableElements.forEach(element => {
      element.classList.add('canvas-editable');
      this.attachEditListener(element);
    });

    // Attach document-wide click listener to disable editing
    this.attachDocumentListener();
  }

  /**
   * Enable editing for a specific element.
   */
  private enableEditing(element: HTMLElement): void {
    element.contentEditable = 'true';

    // Attach Escape key listener dynamically
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.disableEditing(element);
      }
    };

    element.addEventListener('keydown', handleEscape, { once: true });

    // Store the handleEscape function for later removal
    (element as any)._escapeListener = handleEscape;
  }

  /**
   * Disable editing for a specific element.
   */
  private disableEditing(element: HTMLElement): void {
    element.contentEditable = 'false';

    // Remove the Escape key listener if it exists
    const handleEscape = (element as any)._escapeListener;
    if (handleEscape) {
      element.removeEventListener('keydown', handleEscape);
      delete (element as any)._escapeListener; // Clean up the reference
    }
  }

  /**
   * Attach a click listener to enable editing for an element.
   */
  private attachEditListener(element: HTMLElement): void {
    const handleClick = () => this.enableEditing(element);
    element.addEventListener('click', handleClick);

    // Store the click listener for potential cleanup if needed
    (element as any)._clickListener = handleClick;
  }

  /**
   * Attach a document-wide listener to disable editing when clicking outside editable elements.
   */
  private attachDocumentListener(): void {
    const handleDocumentClick = (event: MouseEvent) => {
      if (
        !event.target ||
        !(event.target instanceof HTMLElement) ||
        !event.target.closest(this.selectAll)
      ) {
        // Disable content editing for all editable elements
        this.editableElements.forEach(element => this.disableEditing(element));
      }
    };

    document.addEventListener('click', handleDocumentClick);

    // Store the document click listener for potential cleanup
    (this as any)._documentClickListener = handleDocumentClick;
  }

  /**
   * Cleanup method to remove all dynamically added listeners.
   * Call this method if the instance is being destroyed.
   */
  private cleanupListeners(): void {
    // Remove listeners from editable elements
    this.editableElements.forEach(element => {
      const clickListener = (element as any)._clickListener;
      const escapeListener = (element as any)._escapeListener;

      if (clickListener) element.removeEventListener('click', clickListener);
      if (escapeListener) element.removeEventListener('keydown', escapeListener);
    });

    // Remove document click listener
    const documentClickListener = (this as any)._documentClickListener;
    if (documentClickListener) document.removeEventListener('click', documentClickListener);
  }
}

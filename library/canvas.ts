export default class EditableCanvas {
  private canvas: HTMLElement;
  private editableElements: NodeListOf<HTMLElement>;

  constructor(canvas: HTMLElement | null) {
    if (!canvas) throw new Error(`Canvas can't be undefined.`);
    this.canvas = canvas;
    this.editableElements = this.canvas.querySelectorAll<HTMLElement>('[data-canvas-editable="true"]');

    this.initialize();
  }

  private initialize() {
    // Add double-click event listener to each editable element
    this.editableElements.forEach(element => {
      element.addEventListener('click', () => {
        element.contentEditable = 'true'; // Make the element editable on click
      });
    });

    // Add click event listener to document to detect when to disable editing
    document.addEventListener('click', (event: MouseEvent) => {
      // Check if the clicked element is not part of the editable elements
      if (!event.target || !(event.target instanceof HTMLElement) || !event.target.closest('[data-canvas-editable="true"]')) {
        // Disable content editing for all elements
        this.editableElements.forEach(element => {
          element.contentEditable = 'false';
        });
      }
    });
  }
}

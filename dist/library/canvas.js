// library/canvas.ts
var EditableCanvas = class {
  constructor(canvas) {
    if (!canvas)
      throw new Error(`Canvas can't be undefined.`);
    this.canvas = canvas;
    this.editableElements = this.canvas.querySelectorAll('[data-canvas-editable="true"]');
    this.initialize();
  }
  initialize() {
    this.editableElements.forEach((element) => {
      element.addEventListener("click", () => {
        element.contentEditable = "true";
      });
    });
    document.addEventListener("click", (event) => {
      if (!event.target || !(event.target instanceof HTMLElement) || !event.target.closest('[data-canvas-editable="true"]')) {
        this.editableElements.forEach((element) => {
          element.contentEditable = "false";
        });
      }
    });
  }
};
export {
  EditableCanvas as default
};

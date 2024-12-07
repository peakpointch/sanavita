// library/script.ts
var Script = class {
  constructor(src) {
    this.element = document.createElement("script");
    this.element.src = src;
  }
  addAttribute(name, value) {
    this.element.setAttribute(name, value);
  }
};
var Stylesheet = class {
  constructor(href) {
    this.element = document.createElement("link");
    this.element.setAttribute("rel", "stylesheet");
    this.element.href = href;
  }
  addAttribute(name, value) {
    this.element.setAttribute(name, value);
  }
};
export {
  Script,
  Stylesheet
};

import { FormArray, FormArrayItem } from "peakflow";

export function disableAdd<T extends FormArray<FormArrayItem>>(array: T) {
  const addButton = array.select("add");
  if (array.items.size === array.settings.limit) {
    addButton.setAttribute("disabled", "");
  } else {
    addButton.removeAttribute("disabled");
  }
}

export function hideAdd<T extends FormArray<FormArrayItem>>(array: T) {
  const addButton = array.select("add").parentElement;
  if (array.items.size === array.settings.limit) {
    addButton.classList.add("hide");
  } else {
    addButton.classList.remove("hide");
  }
}

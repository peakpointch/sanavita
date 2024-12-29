import createAttribute from "./attributeselector";

// Types
type FormInput = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
type Validator = () => boolean;
type FormComponentElement = 'component' | 'success' | 'error' | 'submit' | 'modal';

// Webflow environment
const siteId: string = document.documentElement.dataset.wfSite || "";
const pageId: string = document.documentElement.dataset.wfPage || "";

// Webflow classes
const W_CHECKBOX_CLASS = ".w-checkbox-input";
const W_RADIO_CLASS = ".w-radio-input";
const W_CHECKED_CLASS = "w--redirected-checked";

// Form selector functions
const formElementSelector = createAttribute<FormComponentElement>('data-form-element');

// Form selectors
const FORM_SELECTOR: string = "form";
const CHECKBOX_INPUT_SELECTOR: string = `.w-checkbox input[type="checkbox"]:not(${W_CHECKBOX_CLASS})`;
const RADIO_INPUT_SELECTOR: string = '.w-radio input[type="radio"]';
const FORM_INPUT_SELECTOR_LIST: string[] = [
  ".w-input",
  ".w-select",
  RADIO_INPUT_SELECTOR,
  CHECKBOX_INPUT_SELECTOR,
];
const FORM_INPUT_SELECTOR: string = FORM_INPUT_SELECTOR_LIST.join(", ");

/**
 * Check if a FormElement is a radio input.
 * @param {FormInput} input - The input that is to be checked.
 * @returns {boolean} True if the input is a radio button, otherwise false.
 */
export function isRadioInput(input: FormInput): input is HTMLInputElement {
  return input instanceof HTMLInputElement && input.type === "radio";
}

/**
 * Check if a FormElement is a checkbox input.
 * @param {FormInput} input - The input that is to be checked.
 * @returns {boolean} True if the input is a checkbox, otherwise false.
 */
export function isCheckboxInput(input: FormInput): input is HTMLInputElement {
  return input instanceof HTMLInputElement && input.type === "checkbox";
}

/**
 * Submit any form data to a Webflow site.
 *
 * @param formData The data submitted to the Webflow form api endpoint.
 *     Make sure the formData is an object, ready for JSON.stringify()
 */
export async function sendFormData(formData: any): Promise<boolean> {
  const url = `https://webflow.com/api/v1/form/${siteId}`;
  const request: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/javascript, */*; q=0.01",
    },
    body: JSON.stringify(formData),
  };

  try {
    const response = await fetch(url, request);

    if (!response.ok) {
      throw new Error(`Network response "${response.status}" was not okay`);
    }
    console.log("Form submission success! Status", response.status);
    return true;
  } catch (error) {
    console.error("Form submission failed:", error);
    return false;
  }
}

export function clearRadioGroup(container: HTMLElement, name: string) {
  container
    .querySelectorAll<HTMLInputElement>(
      `${RADIO_INPUT_SELECTOR}[name="${name}"]`
    )
    .forEach((radio) => {
      radio.checked = false; // Uncheck all radios in the group
      const customRadio = radio
        .closest(".w-radio")
        ?.querySelector(W_RADIO_CLASS);
      if (customRadio) {
        customRadio.classList.remove(W_CHECKED_CLASS); // Remove the checked styling
      }
    });
}

export function initCustomInputs(container: HTMLElement) {
  // Constants for selectors and classes
  const focusClass = "w--redirected-focus";
  const focusVisibleClass = "w--redirected-focus-visible";
  const focusVisibleSelector = ":focus-visible, [data-wf-focus-visible]";
  const inputTypes = [
    ["checkbox", W_CHECKBOX_CLASS],
    ["radio", W_RADIO_CLASS],
  ];

  // Add change event listener for checkboxes
  container
    .querySelectorAll<HTMLInputElement>(CHECKBOX_INPUT_SELECTOR)
    .forEach((input) => {
      input.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        const customCheckbox = target
          .closest(".w-checkbox")
          ?.querySelector(W_CHECKBOX_CLASS);
        if (customCheckbox) {
          customCheckbox.classList.toggle(W_CHECKED_CLASS, target.checked);
        }
      });
    });

  // Add change event listener for radio buttons
  container
    .querySelectorAll<HTMLInputElement>('input[type="radio"]')
    .forEach((input) => {
      input.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        if (!target.checked) return;

        // Deselect other radios in the same group
        const name = target.name;
        container
          .querySelectorAll<HTMLInputElement>(
            `input[type="radio"][name="${name}"]`
          )
          .forEach((radio) => {
            const customRadio = radio
              .closest(".w-radio")
              ?.querySelector(W_RADIO_CLASS);
            if (customRadio) {
              customRadio.classList.remove(W_CHECKED_CLASS);
            }
          });

        // Add the checked class to the selected radio's custom container
        const selectedCustomRadio = target
          .closest(".w-radio")
          ?.querySelector(W_RADIO_CLASS);
        if (selectedCustomRadio) {
          selectedCustomRadio.classList.add(W_CHECKED_CLASS);
        }
      });
    });

  // Add focus and blur event listeners for checkboxes and radios
  inputTypes.forEach(([type, customClass]) => {
    container
      .querySelectorAll<HTMLInputElement>(
        `input[type="${type}"]:not(${customClass})`
      )
      .forEach((input) => {
        input.addEventListener("focus", (event) => {
          const target = event.target as HTMLInputElement;
          const customElement = target
            .closest(".w-checkbox, .w-radio")
            ?.querySelector(customClass);
          if (customElement) {
            customElement.classList.add(focusClass);
            if (target.matches(focusVisibleSelector)) {
              customElement.classList.add(focusVisibleClass);
            }
          }
        });

        input.addEventListener("blur", (event) => {
          const target = event.target as HTMLInputElement;
          const customElement = target
            .closest(".w-checkbox, .w-radio")
            ?.querySelector(customClass);
          if (customElement) {
            customElement.classList.remove(focusClass, focusVisibleClass);
          }
        });
      });
  });
}

export function validateFields(
  inputs: NodeListOf<FormInput> | FormInput[],
  report: boolean = true
): {
  valid: boolean;
  invalidField: FormInput | null;
} {
  let valid = true; // Assume the step is valid unless we find a problem
  let invalidField: FormInput | null = null;

  for (const input of Array.from(inputs)) {
    if (!input.checkValidity()) {
      valid = false;
      if (report && !invalidField) {
        input.reportValidity();
        input.classList.add("has-error");
        if (isCheckboxInput(input)) {
          input.parentElement
            ?.querySelector(W_CHECKBOX_CLASS)
            ?.classList.add("has-error");
        }
        input.addEventListener(
          "change",
          () => {
            input.classList.remove("has-error");
            if (isCheckboxInput(input)) {
              input.parentElement
                ?.querySelector(W_CHECKBOX_CLASS)
                ?.classList.remove("has-error");
            }
          },
          { once: true }
        );
        invalidField = input; // Store the first invalid field
      }
      break;
    } else {
      input.classList.remove("has-error");
    }
  }

  return { valid, invalidField };
}

export const wf = {
  siteId: siteId,
  pageId: pageId
};

export const wfclasses = {
  W_CHECKBOX_CLASS: W_CHECKBOX_CLASS,
  W_RADIO_CLASS: W_RADIO_CLASS,
  W_CHECKED_CLASS: W_CHECKED_CLASS,
};

export const formSelectors = {
  FORM_SELECTOR: FORM_SELECTOR,
  CHECKBOX_INPUT_SELECTOR: CHECKBOX_INPUT_SELECTOR,
  RADIO_INPUT_SELECTOR: RADIO_INPUT_SELECTOR,
  FORM_INPUT_SELECTOR_LIST: FORM_INPUT_SELECTOR_LIST,
  FORM_INPUT_SELECTOR: FORM_INPUT_SELECTOR,
};

export {
  formElementSelector,
}

export type { FormInput, FormComponentElement, Validator };

const COMPONENT_SELECTOR: string = '[data-form-element="component"]';
const FORM_SELECTOR: string = 'form';
const SUCCESS_SELECTOR: string = '[data-form-element="success"]';
const ERROR_SELECTOR: string = '[data-form-element="error"]';
const SUBMIT_SELECTOR: string = '[data-form-element="submit"]';
const INPUT_SELECTOR: string = '.w-input, .w-select';

const STEPS_COMPONENT_SELECTOR: string = '[data-steps-element="component"]';
const STEP_LIST_SELECTOR: string = '[data-steps-element="list"]';
const STEP_SELECTOR: string = '[data-steps-element="step"]';
const STEP_PAGINATION_SELECTOR: string = '[data-steps-element="pagination"]';
const STEP_PAGINATION_ITEM_SELECTOR: string = 'button[data-step-target]';
const STEP_PREV_SELECTOR: string = '[data-steps-nav="prev"]';
const STEP_NEXT_SELECTOR: string = '[data-steps-nav="next"]';
const STEP_TARGET_SELECTOR: string = '[data-step-target]';

const siteId: string = document.documentElement.dataset.wfSite || '';
const pageId: string = document.documentElement.dataset.wfPage || '';

type FormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function removeAllEventListeners(element: HTMLElement): HTMLElement {
  element.style.height = element.offsetHeight.toString(); // Temporarily set height to avoid document reflow
  const newElement = element.cloneNode(true) as HTMLElement;
  newElement.dataset.replaced = 'true'; // Make the replace action visible in the browser

  element.parentNode!.replaceChild(newElement, element); // Replace the old element with the new one
  newElement.style.removeProperty('height');
  return newElement;
}

function initForm(component: HTMLElement | null) {
  if (!component) {
    console.error('Form component not found:', COMPONENT_SELECTOR)
    return false;
  }

  component = removeAllEventListeners(component);
  component.classList.remove('w-form');

  const form = component.querySelector(FORM_SELECTOR) as HTMLFormElement | null; // Has to be a HTMLFormElement because its selector is the form tagname
  if (!form) {
    console.error(`The selected form component does not contain a HTMLFormElement. Perhaps you added ${COMPONENT_SELECTOR} to the form element itself rather than its parent element?\n\nForm Component:`, component);
    return false;
  }

  disableButtons(form);
  initFormSteps(component);
  initCustomInputs(component);
  initDecisions(component);

  form.dataset.state = 'initialized';
  component.addEventListener('submit', (event) => {
    event.preventDefault();
    form.dataset.state = 'sending';
    handleSubmit(component, form);
  });

  return true;
}

async function sendFormData(formData): Promise<boolean> {
  const url = `https://webflow.com/api/v1/form/${siteId}`;
  const request: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/javascript, */*; q=0.01',
    },
    body: JSON.stringify(formData),
  };

  try {
    const response = await fetch(url, request);

    if (!response.ok) {
      throw new Error(`Network response "${response.status}" was not okay`);
    }
    console.log('Form submission success! Status', response.status);
    return true;
  } catch (error) {
    console.error('Form submission failed:', error);
    return false;
  }
}

async function handleSubmit(component: HTMLElement, form: HTMLFormElement) {
  function formSuccess() {
    successElement ? successElement.style.display = 'block' : null;
    form.style.display = 'none';
    form.dataset.state = 'success';
    form.dispatchEvent(new CustomEvent('formSuccess'));
  }

  function formError() {
    errorElement ? errorElement.style.display = 'block' : null;
    form.dataset.state = 'error';
    form.dispatchEvent(new CustomEvent('formError'));
  }

  let fields = { "customSubmit": true };

  // Form elements
  const allInputs: NodeListOf<FormElement> = form.querySelectorAll(INPUT_SELECTOR);
  const successElement: HTMLElement | null = component.querySelector(SUCCESS_SELECTOR);
  const errorElement: HTMLElement | null = component.querySelector(ERROR_SELECTOR);
  const submitButton: HTMLInputElement | null = component.querySelector(SUBMIT_SELECTOR);

  if (!(submitButton instanceof HTMLInputElement) || submitButton.type !== 'submit') {
    throw new Error('The submitButton element is not an HTML input element with type="submit".');
  }

  submitButton.dataset.defaultText = submitButton.value; // save default text
  submitButton.value = submitButton.dataset.wait || 'Wird gesendet ...';

  allInputs.forEach((input, index) => {
    fields[input.dataset.name || `Field ${index}`] = input.value;
  });

  const formData = {
    name: form.dataset.name,
    pageId: pageId,
    elementId: form.dataset.wfElementId,
    source: window.location.href,
    test: false,
    fields: fields,
    dolphin: false,
  };

  const success = await sendFormData(formData);

  if (success) {
    formSuccess();
    submitButton.value = submitButton.dataset.defaultText;
  } else {
    formError();
  }
}

function disableButtons(form: HTMLFormElement) {
  const buttons = form.querySelectorAll('button');
  buttons.forEach((button) => {
    button.setAttribute('type', 'button');
    button.addEventListener('click', (event) => {
      // event.preventDefault();
    });
  });
}

function initCustomInputs(container: HTMLElement) {
  // Constants for selectors and classes
  const checkboxClass = ".w-checkbox-input";
  const radioClass = ".w-radio-input";
  const checkedClass = "w--redirected-checked";
  const focusClass = "w--redirected-focus";
  const focusVisibleClass = "w--redirected-focus-visible";
  const focusVisibleSelector = ":focus-visible, [data-wf-focus-visible]";
  const inputTypes = [
    ["checkbox", checkboxClass],
    ["radio", radioClass]
  ];

  // Add change event listener for checkboxes
  container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:not(.w-checkbox-input)').forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const customCheckbox = target.closest(".w-checkbox")?.querySelector(checkboxClass);
      if (customCheckbox) {
        customCheckbox.classList.toggle(checkedClass, target.checked);
      }
    });
  });

  // Add change event listener for radio buttons
  container.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((input) => {
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      if (!target.checked) return;

      // Deselect other radios in the same group
      const name = target.name;
      container.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${name}"]`).forEach((radio) => {
        const customRadio = radio.closest(".w-radio")?.querySelector(radioClass);
        if (customRadio) {
          customRadio.classList.remove(checkedClass);
        }
      });

      // Add the checked class to the selected radio's custom container
      const selectedCustomRadio = target.closest(".w-radio")?.querySelector(radioClass);
      if (selectedCustomRadio) {
        selectedCustomRadio.classList.add(checkedClass);
      }
    });
  });

  // Add focus and blur event listeners for checkboxes and radios
  inputTypes.forEach(([type, customClass]) => {
    container.querySelectorAll<HTMLInputElement>(`input[type="${type}"]:not(${customClass})`).forEach((input) => {
      input.addEventListener("focus", (event) => {
        const target = event.target as HTMLInputElement;
        const customElement = target.closest(".w-checkbox, .w-radio")?.querySelector(customClass);
        if (customElement) {
          customElement.classList.add(focusClass);
          if (target.matches(focusVisibleSelector)) {
            customElement.classList.add(focusVisibleClass);
          }
        }
      });

      input.addEventListener("blur", (event) => {
        const target = event.target as HTMLInputElement;
        const customElement = target.closest(".w-checkbox, .w-radio")?.querySelector(customClass);
        if (customElement) {
          customElement.classList.remove(focusClass, focusVisibleClass);
        }
      });
    });
  });
}

function initDecisions(component: HTMLElement) {
  const decisionGroups = component.querySelectorAll<HTMLElement>('[data-decision-group]');

  decisionGroups.forEach(group => {
    const radios = group.querySelectorAll<HTMLInputElement>('input[data-decision]');
    const targetGroup = group.dataset.decisionGroup;
    const extraFieldsWrapper = document.querySelector<HTMLElement>(`[data-decision-extra-fields="${targetGroup}"]`);
    // const inputs: NodeListOf<FormElement> = group.querySelectorAll('input, textarea, select');

    if (radios.length === 0) {
      console.error(`Decision group "${targetGroup}" does not contain any decision input elements.`);
      return;
    }

    if (!extraFieldsWrapper) {
      console.error(`Extra fields container for decision group "${targetGroup}" not found.`);
      return;
    }

    // Initially hide the extra fields container
    extraFieldsWrapper.style.display = 'none';

    // Event delegation for all radios within the group
    group.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.matches('input[data-decision]') && target.dataset.decision === 'show') {
        extraFieldsWrapper.style.display = 'block';
      } else {
        extraFieldsWrapper.style.display = 'none';
      }
    });
  });
}

function initFormSteps(component: HTMLElement) {
  const hasSteps = component.getAttribute('data-steps-element') || '';
  if (!hasSteps) {
    console.error(`Form Steps: Component is not a steps component or is missing the attribute ${STEPS_COMPONENT_SELECTOR}.\nComponent:`, component);
    return;
  }
  const list: HTMLElement | null = component.querySelector(STEP_LIST_SELECTOR);
  if (!list) {
    console.error(`Form Steps: Component does not contain a step list "${STEP_LIST_SELECTOR}"`);
    return;
  }
  const formSteps: NodeListOf<HTMLElement> = component.querySelectorAll(STEP_SELECTOR)!;
  if (!formSteps.length) {
    console.warn(`Form Steps: The selected list doesn't contain any steps. Skipping initialization. Provided List:`, list);
    return;
  }

  const pagination: HTMLElement = component.querySelector(STEP_PAGINATION_SELECTOR)!;
  const paginationItems: NodeListOf<HTMLElement> = pagination.querySelectorAll(STEP_PAGINATION_ITEM_SELECTOR)
  const buttonNext: HTMLElement = component.querySelector(STEP_NEXT_SELECTOR)!;
  const buttonPrev: HTMLElement = component.querySelector(STEP_PREV_SELECTOR)!;
  let currentStep: number = 0;

  formSteps.forEach((step, index) => {
    if (index === 0) {
      step.classList.remove('hide');
    } else {
      step.classList.add('hide');
    }
    step.dataset.stepId = index.toString();
  });

  function initPagination() {
    paginationItems.forEach((item, index) => {
      item.dataset.stepTarget = index.toString();
      item.addEventListener('click', (event) => {

        event.preventDefault();
        changeToStep(index);
      })
    })
  }
  initPagination();

  function changeToStep(target: number, init = false) {
    if (currentStep === target && !init) {
      console.log('Change Form Step: Target step equals current step.');
      return;
    }

    if (target === 0) {
      buttonPrev.style.opacity = '0';
      buttonNext.style.opacity = '1';
    } else if (target === formSteps.length - 1) {
      buttonPrev.style.opacity = '1';
      buttonNext.style.opacity = '0';
    } else {
      buttonPrev.style.opacity = '1';
      buttonNext.style.opacity = '1';
    }

    formSteps[currentStep].classList.add('hide');
    formSteps[target].classList.remove('hide');
    paginationItems.forEach((step, index) => {
      if (index < target) {
        step.classList.add('is-done');
        step.classList.remove('is-active');
      } else if (index === target) {
        step.classList.remove('is-done');
        step.classList.add('is-active')
      } else {
        step.classList.remove('is-done');
        step.classList.remove('is-active');
      }
    })
    currentStep = target;
  }

  changeToStep(currentStep, true);

  buttonNext.addEventListener('click', (event) => {
    event.preventDefault();
    if (currentStep < formSteps.length - 1) {
      changeToStep(currentStep + 1);
    }
  });

  buttonPrev.addEventListener('click', (event) => {
    event.preventDefault();
    if (currentStep > 0) {
      changeToStep(currentStep - 1);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const form: HTMLElement | null = document.querySelector(COMPONENT_SELECTOR);

  const inizialized = initForm(form);
  console.log("Form initialized:", inizialized)
});

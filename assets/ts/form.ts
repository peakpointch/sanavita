import { initialize } from "esbuild";

const COMPONENT_SELECTOR: string = '[data-form-element="component"]';
const FORM_SELECTOR: string = 'form';
const SUCCESS_SELECTOR: string = '[data-form-element="success"]';
const ERROR_SELECTOR: string = '[data-form-element="error"]';
const SUBMIT_SELECTOR: string = '[data-form-element="submit"]';
const INPUT_SELECTOR: string = '.w-input, .w-select';

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
  const submitButton: HTMLInputElement = component.querySelector(SUBMIT_SELECTOR)!; // Not null because this form can't be submitted without a submit button

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


document.addEventListener('DOMContentLoaded', () => {
  const form: HTMLElement | null = document.querySelector(COMPONENT_SELECTOR);

  const inizialized = initForm(form);
  console.log("Form Initialized:", inizialized)
});

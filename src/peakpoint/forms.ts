import { initCal } from "peakflow/cal";
import { disableWebflowForm, formElementSelector, reportValidity, getWfFormData, sendFormData } from "peakflow/form";
import { Modal } from "peakflow/modal";
import { inputSync, syncSelector } from "peakflow/inputsync";
import isURL from "validator/lib/isURL";

/**
 * Set up a hook form on the peakpoint website.
 *
 * - Set up the open and close event listeners for the modal
 * - Validate the 'enter-website' input and report its validity
 */
function setupHookForm(form: HTMLFormElement, modal: Modal): void {
  disableWebflowForm(form);

  const closeModalButtons = modal.selectAll('close');
  const openModalButton = form.querySelector<HTMLButtonElement>(Modal.selector('open'));

  const enterWebsiteInput = form.querySelector<HTMLInputElement>(syncSelector('enter-website'));

  function tryOpenModal(): void {
    if (!enterWebsiteInput.required) {
      modal.open();
    } else if (isURL(enterWebsiteInput.value)) {

      // Add close event listeners
      closeModalButtons.forEach((closebtn) => {
        closebtn.addEventListener('click', () => {
          modal.close();
        }, { once: true });
      });

      modal.open();
    } else {
      reportValidity(enterWebsiteInput);
      enterWebsiteInput.focus();
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    tryOpenModal();
  });

  openModalButton.addEventListener('click', () => tryOpenModal());
}

/**
 * Set up the submit event for `form`, a child of a `Modal` with custom error and success states.
 *
 * 1. Parse the form data
 * 2. Submit the form data to the current Webflow site
 * 3. Depending ot the response, show a custom success or error state:
 *    <div data-form-element="success" />
 *    or
 *    <div data-form-element="error" />
 */
function setupFormSubmit(form: HTMLFormElement): void {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formBlock = form.parentElement;

    const fields = Object.fromEntries((new FormData(form) as any).entries());
    const wfFormData = getWfFormData(form, fields);

    const success = await sendFormData(wfFormData);

    if (success) {
      const successEl = formBlock.querySelector<HTMLElement>(formElementSelector('success'));
      successEl.classList.remove("hide");
      successEl.style.display = "block";
    } else {
      const errorEl = formBlock.querySelector<HTMLElement>(formElementSelector('error'));
      errorEl.classList.remove("hide");
      errorEl.style.display = "block";
      errorEl.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  });
}

/**
 * Initialize the nav form Modal, a Modal that opens up a contact form, shared across all pages.
 */
function initNavFormModal(): void {
  const navModalElement = Modal.select('component', 'nav');
  const navModal = new Modal(navModalElement, {
    animation: {
      type: 'growIn',
      duration: 300,
    },
    bodyScroll: {
      lock: true,
      smooth: true,
    }
  });
  const openNavModalBtns = navModal.selectAll<HTMLButtonElement>('open', false);
  const closeNavModalBtns = navModal.selectAll<HTMLButtonElement>('close', true);
  openNavModalBtns.forEach(button => {
    button.addEventListener('click', () => {
      navModal.open();
    });
  });
  closeNavModalBtns.forEach((closeBtn) => {
    closeBtn.addEventListener('click', () => {
      navModal.close();
    });
  });
}

/**
 * Initialize lead magnet forms that consist of a `HookForm`, a `Modal`, and a `Cal` component, all of which share the same `id`.
 *
 * @param formIds The `id` list of the lead magnet forms you want to initialize.
 */
async function initLeadForms(...formIds: string[]): Promise<void> {
  formIds.forEach(async (formId) => {
    const modalElement = Modal.select('component', formId);
    if (!modalElement) return;

    const modal = new Modal(modalElement, {
      animation: {
        type: 'growIn',
        duration: 300,
      },
      bodyScroll: {
        lock: true,
        smooth: true,
      },
    });

    const modalForm = modal.component.querySelector<HTMLFormElement>("form");
    disableWebflowForm(modalForm);
    setupFormSubmit(modalForm);

    const Cal = await initCal(formId);

    Cal.ns[formId]("on", {
      action: "bookingSuccessfulV2",
      callback: () => {
        console.log("BOOKING SUCCESSFUL WORKS");

        const event = new Event("submit", { bubbles: true, cancelable: true });
        modalForm.dispatchEvent(event);
      }
    });

    const hookForms = document.querySelectorAll<HTMLFormElement>(`form[formstack-element="hook:${formId}"]`);
    hookForms.forEach(form => {
      setupHookForm(form, modal);
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  inputSync();
  initLeadForms("analysis", "prototype");
  initNavFormModal();
});

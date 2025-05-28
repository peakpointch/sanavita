import { loadCal } from "@peakflow/cal/loader";
import { disableWebflowForm, formElementSelector, reportValidity, getWfFormData, sendFormData } from "@peakflow/form/utility";
import Modal from "@peakflow/modal";
import { inputSync, syncSelector } from "@peakflow/inputsync";
import isURL from "validator/lib/isURL";

type CalEmbedOptions = 'inline' | 'floatingButton';
interface CalDOMOptions {
  link: string,
  embed: CalEmbedOptions,
}

function setupForm(form: HTMLFormElement, modal: Modal): void {
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

function setupModalFormWCal(form: HTMLFormElement): void {
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

document.addEventListener('DOMContentLoaded', () => {
  inputSync();

  const modalElement = Modal.select('component', 'analysis');
  const modal = new Modal(modalElement, {
    animation: {
      type: 'slideUp',
      duration: 300,
    },
    lockBodyScroll: true,
  });

  const analysisForm = modal.component.querySelector<HTMLFormElement>("form");
  disableWebflowForm(analysisForm);
  setupModalFormWCal(analysisForm);

  loadCal("analyse").then((Cal) => {
    const element = document.querySelector<HTMLElement>('[cal-id="analysis"]');
    if (!element) throw new Error("Embed container not found");

    const calDOMOptions: CalDOMOptions = {
      link: element.getAttribute('cal-link') || 'peakpoint/analyse',
      embed: element.getAttribute('cal-embed') as CalEmbedOptions || 'inline',
    }

    Cal.ns.analyse(calDOMOptions.embed, {
      elementOrSelector: element,
      config: { layout: "month_view" },
      calLink: calDOMOptions.link,
    });

    Cal.ns.analyse("ui", {
      hideEventTypeDetails: true,
      layout: "month_view",
      cssVarsPerTheme: {
        light: { "cal-brand": "#333" },
        dark: { "cal-brand": "#eee" },
      },
    });

    Cal.ns.analyse("on", {
      action: "bookingSuccessfulV2",
      callback: () => {
        console.log("BOOKING SUCCESSFUL WORKS");

        const event = new Event("submit", { bubbles: true, cancelable: true });
        analysisForm.dispatchEvent(event);
      }
    });
  });

  const hookForms = document.querySelectorAll<HTMLFormElement>(`form[formstack-element="form:analysis-hook"]`);
  hookForms.forEach(form => {
    setupForm(form, modal);
  });
});

import createAttribute from "@library/attributeselector";
import { disableWebflowForm, reportValidity } from "@library/form";
import { inputSync, syncSelector } from "@library/inputsync";
import Modal from "@library/modal";
import isURL from "validator/lib/isURL";

function disableButton(button: HTMLInputElement | HTMLButtonElement | HTMLAnchorElement, silent: boolean = false): void {
  if (!silent) {
    button.classList.add('is-disabled');
  }
  button.style.pointerEvents = "none";
  button.style.cursor = "not-allowed";
  button.style.userSelect = "none";
  button.addEventListener('click', event => event.preventDefault());
}

function enableButton(button: HTMLInputElement | HTMLButtonElement | HTMLAnchorElement): void {
  button.removeEventListener('click', event => event.preventDefault());
  button.style.removeProperty('pointer-events');
  button.style.removeProperty('cursor');
  button.style.removeProperty('user-select');
  button.classList.remove('is-disabled');
}

function setupForm(form: HTMLFormElement, modal: Modal): void {
  disableWebflowForm(form);

  const closeModalButtons = document.querySelectorAll<HTMLElement>(Modal.select('close'));
  const openModalButton = form.querySelector<HTMLButtonElement>(Modal.select('open'));
  // disableButton(openModalButton, true);

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

// const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+(com|org|net|io|ch|de|co|us|uk|info|biz|app)$/;

document.addEventListener('DOMContentLoaded', () => {
  inputSync();

  const modalElement = document.querySelector<HTMLElement>(Modal.select('component'));
  const modal = new Modal(modalElement, {
    animation: {
      type: 'slideUp',
      duration: 300,
    },
    lockBodyScroll: false,
  });

  const forms = document.querySelectorAll<HTMLFormElement>(`form[formstack-element="form:prototype-hook"]`);
  forms.forEach(form => {
    setupForm(form, modal);
  });
});

import { disableWebflowForm, reportValidity } from "@library/form";
import { inputSync, syncSelector } from "@library/inputsync";
import Modal from "@library/modal";
import isURL from "validator/lib/isURL";

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

document.addEventListener('DOMContentLoaded', () => {
  inputSync();

  const modalElement = Modal.select('component', 'prototype');
  const modal = new Modal(modalElement, {
    animation: {
      type: 'slideUp',
      duration: 300,
    },
    lockBodyScroll: true,
  });

  const hookForms = document.querySelectorAll<HTMLFormElement>(`form[formstack-element="form:prototype-hook"]`);
  hookForms.forEach(form => {
    setupForm(form, modal);
  });

  const navModalElement = Modal.select('component', 'nav');
  const navModal = new Modal(navModalElement, {
    animation: {
      type: 'slideUp',
      duration: 300,
    },
    lockBodyScroll: true,
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
});

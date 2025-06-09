// Imports
import {
  formElementSelector,
  MultiStepForm,
  FormDecision
} from "@peakflow/form";
import ProspectArray from "./form/prospect-array";
import createAttribute from "@peakflow/attributeselector";
import { flattenProspects } from "./form/resident-prospect";

const decisionSelector = createAttribute('data-decision-component');

function initializeFormDecisions(
  form: MultiStepForm,
  errorMessages: { [id: string]: { [key: string]: string } },
  defaultMessages: { [id: string]: string } = {}
): void {
  form.formSteps.forEach((step, stepIndex) => {
    const formDecisions = step.querySelectorAll<HTMLElement>(decisionSelector());

    formDecisions.forEach((element) => {
      const id = element.dataset.decisionComponent;
      const decision = new FormDecision(element, id);

      // Set error messages for this FormDecision if available
      if (id && errorMessages[id]) {
        decision.setErrorMessages(errorMessages[id], defaultMessages[id]);
      }

      // Add the FormDecision as a custom component to the form
      form.addCustomComponent({
        stepIndex,
        instance: decision,
        validator: () => decision.validate(),
      });
    });
  });
}

function initializeOtherFormDecisions(
  form: HTMLElement,
  errorMessages: { [id: string]: { [key: string]: string } },
  defaultMessages: { [id: string]: string } = {}
): void {
  const formDecisions = form.querySelectorAll<HTMLElement>(decisionSelector());

  formDecisions.forEach((element) => {
    const id = element.dataset.decisionComponent;
    const decision = new FormDecision(element, id);

    // Set error messages for this FormDecision if available
    if (id && errorMessages[id]) {
      decision.setErrorMessages(errorMessages[id], defaultMessages[id]);
    }
  });
}

function insertSearchParamValues(): void {
  if (window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const selectElement = document.querySelector(
      "#wohnung"
    ) as HTMLInputElement;

    const wohnungValue = params.get("wohnung");
    const option = selectElement.querySelector(
      `option[value="${wohnungValue}"]`
    );
    if (wohnungValue && option) {
      // If you want to handle cases where the value doesn't exist
      selectElement.value = wohnungValue;
    } else {
      console.warn(`No matching option for value: ${wohnungValue}`);
    }
  }
}

const formElement: HTMLElement | null = document.querySelector(
  formElementSelector('component', { exclusions: [] })
);
formElement?.classList.remove("w-form");

document.addEventListener("DOMContentLoaded", async () => {
  if (!formElement) {
    console.error("Form not found.");
    return;
  }

  const prospectArray = new ProspectArray(formElement, "resident-prospects");
  const FORM = new MultiStepForm(formElement, {
    navigation: {
      hideInStep: 0,
    },
    recaptcha: true,
    excludeInputSelectors: [
      '[data-decision-path="upload"]',
      '[data-decision-component]',
    ],
  });

  // @ts-ignore
  window.prospectArray = prospectArray;

  FORM.addCustomComponent({
    stepIndex: 2,
    instance: prospectArray,
    validator: () => prospectArray.validate(),
    getData: () => flattenProspects(prospectArray.prospects)
  });
  FORM.component.addEventListener("changeStep", () => {
    if (prospectArray.modal.opened) prospectArray.closeModal();
  });

  const errorMessages = {
    beilagenSenden: {
      upload: "Bitte laden Sie alle Beilagen hoch.",
    },
  };

  const defaultMessages = {
    beilagenSenden: `Bitte laden Sie alle Beilagen hoch oder wählen Sie die Option "Beilagen per Post senden".`,
  };

  initializeOtherFormDecisions(
    prospectArray.modalElement,
    errorMessages,
    defaultMessages
  );
  initializeFormDecisions(FORM, errorMessages, defaultMessages);
  insertSearchParamValues();
  prospectArray.loadProgress();
  FORM.formElement.addEventListener("formSuccess", () => {
    prospectArray.clearProgress();
  });

  FORM.options.validation.validate = false;
  FORM.changeToStep(2);
  await new Promise(resolve => setTimeout(resolve, 600));
  const prospectToEdit = Array.from(prospectArray.prospects.values())[1];
  prospectArray.editProspect(prospectToEdit);

  console.log("Form initialized:", FORM.initialized, FORM);
});

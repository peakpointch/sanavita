// Imports
import {
  FormArray,
  MultiStepForm,
  FormDecision,
  FormProgressManager,
  formElementSelector,
} from "peakflow/form";
import { createAttribute } from "peakflow/attributeselector";
import { flattenPeople } from "./form/tenant";
import { Resident } from "./form/resident";
import { ContactPerson } from "./form/contact-person";
import { getAlertDialog } from "./form/alert-dialog";
import { FormProgressComponent } from "peakflow";

const decisionSelector = createAttribute("data-decision-component");

function initializeFormDecisions(
  form: MultiStepForm,
  errorMessages: { [id: string]: { [key: string]: string } },
  defaultMessages: { [id: string]: string } = {},
): void {
  form.formSteps.forEach((step, stepIndex) => {
    const formDecisions =
      step.querySelectorAll<HTMLElement>(decisionSelector());

    formDecisions.forEach((element) => {
      const id = element.dataset.decisionComponent;
      const decision = new FormDecision(element, { id });

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

type PathId = string & ("show" | "hide");

function initializeProspectDecisions<T extends string = string>(
  prospectArray: FormArray<Resident>,
  errorMessages: { [id: string]: { [key: string]: string } },
  defaultMessages: { [id: string]: string } = {},
): Map<T, FormDecision<PathId>> {
  const decisionElements =
    prospectArray.modalElement.querySelectorAll<HTMLElement>(
      decisionSelector(),
    );
  const formDecisions: Map<T, FormDecision<PathId>> = new Map();

  decisionElements.forEach((element, index) => {
    const id =
      element.getAttribute(FormDecision.attr.component) || index.toString();
    const decision = new FormDecision<PathId>(element, {
      id,
      clearPathOnChange: false,
    });
    formDecisions.set(decision.opts.id as T, decision);

    const group = prospectArray.getClosestGroup(decision.component);
    decision.onChange(() => {
      prospectArray.validateModalGroup(group);
      const valid = prospectArray.groups.every(
        (group) => group.isValid === true,
      );
      prospectArray.splitButton.setAction(valid ? "save" : "draft");
    });

    prospectArray.onOpen(`decision-${id}`, () => decision.sync());
    prospectArray.onClose(`decision-${id}`, () => decision.reset());

    // Set error messages for this FormDecision if available
    if (id && errorMessages[id]) {
      decision.setErrorMessages(errorMessages[id], defaultMessages[id]);
    }
  });

  return formDecisions;
}

function insertSearchParamValues(): void {
  if (window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const selectElement = document.querySelector(
      "#wohnung",
    ) as HTMLInputElement;

    const wohnungValue = params.get("wohnung");
    const option = selectElement.querySelector(
      `option[value="${wohnungValue}"]`,
    );
    if (wohnungValue && option) {
      // If you want to handle cases where the value doesn't exist
      selectElement.value = wohnungValue;
    } else {
      console.warn(`No matching option for value: ${wohnungValue}`);
    }
  }
}

export function initRoomRegistrationForm(): void {
  const version = "1.0.0";
  const formId = "lindenpark-anmeldung-zimmer";
  const formElement: HTMLElement | null = document.querySelector(
    formElementSelector("component", { exclusions: [] }),
  );
  formElement?.classList.remove("w-form");

  if (!formElement) {
    console.error("Form not found.");
    return;
  }

  const progressManager = new FormProgressManager();
  progressManager.initForm(formId, version);

  const alertDialog = getAlertDialog();
  const prospectArray = new FormArray<Resident>({
    id: "resident",
    formId: formId,
    container: formElement,
    limit: 1,
    manager: progressManager,
    itemClass: Resident,
    alertDialog,
    grammar: {
      item: {
        sg: "Person",
        pl: "Personen",
      },
      article: {
        sg: "die",
        pl: "die",
      },
    },
  });
  const contactArray = new FormArray<ContactPerson>({
    id: "contacts",
    formId: formId,
    container: formElement,
    limit: 4,
    manager: progressManager,
    itemClass: ContactPerson,
    alertDialog,
    grammar: {
      item: {
        sg: "Person",
        pl: "Personen",
      },
      article: {
        sg: "die",
        pl: "die",
      },
    },
  });
  const FORM = new MultiStepForm(formElement, {
    id: formId,
    version: version,
    navigation: {
      hideInStep: 0,
    },
    recaptcha: true,
    manager: progressManager,
    excludeInputSelectors: [
      '[data-decision-path="upload"]',
      "[data-decision-component]",
    ],
  });

  FORM.addCustomComponent({
    stepIndex: 1,
    instance: prospectArray,
    validator: () => prospectArray.validate(),
    getData: () => prospectArray.serialize(),
  });
  FORM.addCustomComponent({
    stepIndex: 2,
    instance: contactArray,
    validator: () => contactArray.validate(),
    getData: () => flattenPeople(contactArray.items),
  });
  FORM.component.addEventListener("changeStep", () => {
    if (prospectArray.modal.opened) prospectArray.closeModal();
  });

  const errorMessages = {
    attachmentSubmission: {
      upload: "Bitte laden Sie alle Beilagen hoch.",
    },
  };

  const defaultMessages = {
    attachmentSubmission: `Bitte laden Sie alle Beilagen hoch oder w├ñhlen Sie die Option "Beilagen per Post senden".`,
  };

  initializeProspectDecisions(prospectArray, errorMessages, defaultMessages);
  initializeFormDecisions(FORM, errorMessages, defaultMessages);
  insertSearchParamValues();

  prospectArray.loadProgress();
  contactArray.loadProgress();
  prospectArray.registerSelects("(Ich)");
  contactArray.registerSelects("(Kontaktperson)");

  FORM.events.on("success", () => {
    progressManager.clearForm(formId);
  });

  FORM.events.on("input", () => FORM.saveFields());

  prospectArray.onSave("save-progress", (component) =>
    FORM.saveComponentProgress(component),
  );
  prospectArray.onSave("hide-add", () => {
    const addButtonWrapper = prospectArray.select("add").parentElement;
    if (prospectArray.items.size === prospectArray.options.limit) {
      addButtonWrapper.style.display = "none";
    } else {
      addButtonWrapper.style.removeProperty("display");
    }
  });
  contactArray.onSave("save-progress", (component) =>
    FORM.saveComponentProgress(component),
  );

  prospectArray.triggerOnSave();
  contactArray.triggerOnSave();

  FORM.loadProgress();

  // @ts-ignore
  window.MultiStepForm = FORM;

  // FORM.options.validation.validate = false;
  // FORM.changeToStep(3);
  // await new Promise(resolve => setTimeout(resolve, 600));
  // prospectArray.editProspect(prospectArray.getProspect(0));

  console.log("Form initialized:", FORM.initialized, FORM);
}

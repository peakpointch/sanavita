// Imports
import {
  CMSSelect,
  FormArray,
  MultiStepForm,
  FormDecision,
  FormProgressManager,
  formElementSelector,
} from "peakflow/form";
import { createAttribute } from "peakflow/attributeselector";
import { flattenProspects as flattenPerson } from "./form/resident-prospect";
import { addMonths, format, startOfMonth } from "date-fns";
import { getElement } from "peakflow/utils";
import { ResidentProspect } from "./form/resident-prospect";
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
  prospectArray: FormArray<ResidentProspect>,
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

function initCMSSelect(): void {
  const source = CMSSelect.selector("source", "apartment");
  const apartmentSelect = new CMSSelect(source);
  apartmentSelect.insertOptions();

  const wrapper = getElement('[data-field-wrapper-id="alternativeApartment"]');

  if (apartmentSelect.values.length <= 1) {
    wrapper.style.display = "none";
    return;
  }

  const alternative = CMSSelect.selector("target", "alternativeApartment");
  const alternativeSelect =
    wrapper.querySelector<HTMLSelectElement>(alternative);
  apartmentSelect.onChange("syncAlternatives", () => {
    const values = Array.from(apartmentSelect.values);
    const filtered = values.filter(
      (val) => val !== apartmentSelect.targets[0].value,
    );
    CMSSelect.clearOptions(alternativeSelect, true);
    CMSSelect.insertOptions(alternativeSelect, filtered);
  });
  apartmentSelect.triggerOnChange();
}

function saveComponentProgress(
  progressManager: FormProgressManager,
  formId: string,
  component: FormProgressComponent,
): void {
  const form = progressManager.getForm(formId);
  const foundIndex = form.components.findIndex((c) => c.id === component.id);
  if (foundIndex === -1) {
    form.components.push(component);
  } else {
    form.components[foundIndex] = component;
  }
  progressManager.saveForm(formId, form);
}

export function initRoomRegistrationForm(): void {
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
  const alertDialog = getAlertDialog();
  const prospectArray = new FormArray<ResidentProspect>({
    id: "resident-prospect",
    formId: formId,
    container: formElement,
    limit: 1,
    manager: progressManager,
    itemClass: ResidentProspect,
    alertDialog,
  });
  const contactArray = new FormArray<ContactPerson>({
    id: "contact-person",
    formId: formId,
    container: formElement,
    limit: 10,
    manager: progressManager,
    itemClass: ContactPerson,
    alertDialog,
  });
  const FORM = new MultiStepForm(formElement, {
    navigation: {
      hideInStep: 0,
    },
    recaptcha: true,
    excludeInputSelectors: [
      '[data-decision-path="upload"]',
      "[data-decision-component]",
    ],
  });

  FORM.addCustomComponent({
    stepIndex: 1,
    instance: prospectArray,
    validator: () => prospectArray.validate(),
    getData: () => flattenPerson(prospectArray.items),
  });
  FORM.addCustomComponent({
    stepIndex: 2,
    instance: contactArray,
    validator: () => contactArray.validate(),
    getData: () => flattenPerson(contactArray.items),
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
  initCMSSelect();

  prospectArray.loadProgress();
  contactArray.loadProgress();
  FORM.formElement.addEventListener("formSuccess", () => {
    progressManager.clear();
  });

  prospectArray.onSave("save-progress", (component) =>
    saveComponentProgress(progressManager, formId, component),
  );
  contactArray.onSave("save-progress", (component) =>
    saveComponentProgress(progressManager, formId, component),
  );

  const monthStart = startOfMonth(new Date());
  const nextMonthStart = addMonths(monthStart, 1);
  const nextMonthStartString = format(nextMonthStart, "yyyy-MM-dd");
  const moveInDateInput = FORM.getFormInput<HTMLInputElement>("moveInDate");
  moveInDateInput.min = nextMonthStartString;

  // @ts-ignore
  window.MultiStepForm = FORM;

  FORM.options.validation.validate = false;
  FORM.changeToStep(2);
  // await new Promise(resolve => setTimeout(resolve, 600));
  // prospectArray.editProspect(prospectArray.getProspect(0));

  console.log("Form initialized:", FORM.initialized, FORM);
}

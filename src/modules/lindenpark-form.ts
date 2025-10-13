// Imports
import {
  FormArray,
  MultiStepForm,
  FormDecision,
  FormProgressManager,
  formElementSelector,
} from "peakflow/form";
import { createAttribute } from "peakflow/attributeselector";
import { Resident, SerializedResident } from "./form/resident";
import { ContactPerson, SerializedContact } from "./form/contact-person";
import { getAlertDialog } from "./form/alert-dialog";

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
    id: "residents",
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
    dialogs: {
      delete: {
        title: ({ item, grammar }) =>
          `Möchten Sie ${grammar.article.sg} ${grammar.item.sg} "${item?.getFullName()}" wirklich löschen?`,
        paragraph: ({ item, grammar }) =>
          `Mit dieser Aktion wird ${grammar.article.sg} ${grammar.item.sg} "${item?.getFullName()}" gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.`,
        cancel: "Abbrechen",
        confirm: "Person löschen",
      },
      discard: {
        title: "Möchten Sie die Änderungen verwerfen?",
        paragraph: ({ item }) =>
          `Mit dieser Aktion gehen alle Änderungen für "${item?.getFullName()}" verloren. Diese Aktion kann nicht rückgängig gemacht werden.`,
        cancel: "Abbrechen",
        confirm: "Änderungen verwerfen",
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
        sg: "Kontaktperson",
        pl: "Kontaktpersonen",
      },
      article: {
        sg: "die",
        pl: "die",
      },
    },
    dialogs: {
      delete: {
        title: ({ item }) =>
          `Möchten Sie die Kontaktperson "${item.getFullName()}" wirklich löschen?`,
        paragraph: ({ item }) =>
          `Mit dieser Aktion wird die Kontaktperson "${item.getFullName()}" gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.`,
        cancel: "Abbrechen",
        confirm: "Kontaktperson löschen",
      },
      discard: {
        title: "Möchten Sie die Änderungen verwerfen?",
        paragraph: ({ item }) =>
          `Mit dieser Aktion gehen alle Änderungen für "${item.getFullName()}" verloren. Diese Aktion kann nicht rückgängig gemacht werden.`,
        cancel: "Abbrechen",
        confirm: "Änderungen verwerfen",
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
    jsonFields: false,
  });

  FORM.addCustomComponent({
    stepIndex: 1,
    instance: prospectArray,
    validator: () => prospectArray.validate(),
    getData: () => {
      const data = {};
      data[prospectArray.id] = JSON.stringify(prospectArray.serialize());
      return data;
    },
  });
  FORM.addCustomComponent({
    stepIndex: 2,
    instance: contactArray,
    validator: () => contactArray.validate(),
    getData: () => {
      const data = {};
      data[contactArray.id] = JSON.stringify(contactArray.serialize());
      return data;
    },
  });
  FORM.component.addEventListener("changeStep", () => {
    if (prospectArray.modal.opened) prospectArray.closeModal();
  });

  FORM.virtualFields.set("recipients", ({ customFields }) => {
    const people: Array<SerializedResident | SerializedContact> = [
      ...JSON.parse(customFields.residents),
      ...JSON.parse(customFields.contacts),
    ];
    const emails = people.map((person) => person.personalData.email.value);

    return JSON.stringify(emails);
  });

  FORM.virtualFields.set("greetings", ({ customFields }) => {
    const people: Array<SerializedResident | SerializedContact> = [
      ...JSON.parse(customFields.residents),
    ];
    const names = people
      .map((person) => {
        const firstName = person.personalData.firstName.value;
        const lastName = person.personalData.lastName.value;
        const fullName = [firstName, lastName].join(" ");
        return `Guten Tag ${fullName}`;
      })
      .join(",<br>");

    return names;
  });

  FORM.virtualFields.set("names", ({ fields, customFields }) => {
    const people: Array<SerializedResident | SerializedContact> = [
      ...JSON.parse(customFields.residents),
      ...JSON.parse(customFields.contacts),
    ];

    const fieldIds = [
      "primaryContact",
      "invoiceRecipient",
      "laundryRepairContact",
      "legalRepresentative",
    ];

    const names = fieldIds.reduce((acc, id) => {
      const person = people.find((person) => person.key === fields[id]);
      const firstName = person.personalData.firstName.value;
      const lastName = person.personalData.lastName.value;
      const fullName = [firstName, lastName].join(" ");

      return {
        ...acc,
        [id]: fullName,
      };
    }, {});

    return JSON.stringify(names);
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
    FORM.events.emit("save");
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

  // Load progress here, otherwise recovering FormArray selects fails
  FORM.loadProgress();

  // @ts-ignore
  window.MultiStepForm = FORM;
  console.log("Form initialized:", FORM.initialized, FORM);

  // FORM.options.validation.validate = false;
  // FORM.changeToStep(4);
  // FORM.submit();
  // await new Promise(resolve => setTimeout(resolve, 600));
  // prospectArray.editProspect(prospectArray.getProspect(0));
}

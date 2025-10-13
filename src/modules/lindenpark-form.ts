import { FormArray, MultiStepForm, FormProgressManager, formElementSelector } from "peakflow/form";
import { Resident, SerializedResident } from "./form/resident";
import { ContactPerson, SerializedContact } from "./form/contact-person";
import { initializeFormDecisions, initializeArrayDecisions } from "./form/decisions";
import { getAlertDialog } from "./form/alert-dialog";

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
  const ResidentArray = new FormArray<Resident>({
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
    messages: {
      empty: "Bitte fügen Sie mindestens eine Person hinzu.",
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

  const ContactArray = new FormArray<ContactPerson>({
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

  const LindenparkForm = new MultiStepForm(formElement, {
    id: formId,
    version: version,
    navigation: {
      hideInStep: 0,
    },
    recaptcha: true,
    manager: progressManager,
    excludeInputSelectors: ['[data-decision-path="upload"]', "[data-decision-component]"],
    jsonFields: false,
  });

  LindenparkForm.addCustomComponent({
    stepIndex: 1,
    instance: ResidentArray,
    validator: () => ResidentArray.validate(),
    getData: () => {
      return {
        [ResidentArray.id]: JSON.stringify(ResidentArray.serialize()),
      };
    },
  });

  LindenparkForm.addCustomComponent({
    stepIndex: 2,
    instance: ContactArray,
    validator: () => ContactArray.validate(),
    getData: () => {
      return {
        [ContactArray.id]: JSON.stringify(ContactArray.serialize()),
      };
    },
  });

  LindenparkForm.virtualFields.set("recipients", ({ customFields }) => {
    const people: Array<SerializedResident | SerializedContact> = [
      ...JSON.parse(customFields.residents),
      ...JSON.parse(customFields.contacts),
    ];
    const emails = people.map((person) => person.personalData.email.value);

    return JSON.stringify(emails);
  });

  LindenparkForm.virtualFields.set("greetings", ({ customFields }) => {
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

  LindenparkForm.virtualFields.set("names", ({ fields, customFields }) => {
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

  LindenparkForm.events.on("changeStep", () => {
    if (ResidentArray.modal.opened) ResidentArray.closeModal();
  });

  LindenparkForm.events.on("success", () => {
    progressManager.clearForm(formId);
    LindenparkForm.events.emit("save");
  });

  LindenparkForm.events.on("input", () => LindenparkForm.saveFields());

  ResidentArray.onSave("save-progress", (component) =>
    LindenparkForm.saveComponentProgress(component),
  );
  ResidentArray.onSave("hide-add", () => {
    const addButtonWrapper = ResidentArray.select("add").parentElement;
    if (ResidentArray.items.size === ResidentArray.options.limit) {
      addButtonWrapper.style.display = "none";
    } else {
      addButtonWrapper.style.removeProperty("display");
    }
  });
  ContactArray.onSave("save-progress", (component) =>
    LindenparkForm.saveComponentProgress(component),
  );

  ResidentArray.loadProgress();
  ContactArray.loadProgress();
  ResidentArray.registerSelects("(Ich)");
  ContactArray.registerSelects("(Kontaktperson)");
  ResidentArray.triggerOnSave();
  ContactArray.triggerOnSave();

  initializeFormDecisions(LindenparkForm, {});
  initializeArrayDecisions(ResidentArray, {});

  LindenparkForm.loadProgress();

  // @ts-ignore
  window.MultiStepForm = LindenparkForm;
  console.log("Form initialized:", LindenparkForm.initialized, LindenparkForm);

  // LindenparkForm.options.validation.validate = false;
  // LindenparkForm.changeToStep(4);
  // setTimeout(() => {
  //   ResidentArray.editItem(ResidentArray.getItem(0))
  // }, 600);
}

import {
  FormArray,
  FormProgressManager,
  MultiStepForm,
  CMSSelect,
  formElementSelector,
} from "peakflow/form";
import { getElement } from "peakflow/utils";
import { SerializedTenant, Tenant } from "./form/tenant";
import { getAlertDialog } from "./form/alert-dialog";
import { initializeFormDecisions, initializeArrayDecisions } from "./form/decisions";
import { addMonths, format, startOfMonth } from "date-fns";

const errorMessages = {
  attachmentSubmission: {
    upload: "Bitte laden Sie alle Beilagen hoch.",
  },
};

const defaultMessages = {
  attachmentSubmission: `Bitte laden Sie alle Beilagen hoch oder wählen Sie die Option "Beilagen per Post senden".`,
};

function insertSearchParamValues(): void {
  if (window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const selectElement = document.querySelector("#apartment") as HTMLInputElement;

    const wohnungValue = params.get("wohnung");
    const option = selectElement.querySelector(`option[value="${wohnungValue}"]`);

    if (wohnungValue && option) {
      selectElement.value = wohnungValue;
    }
  }
}

function initializeMoveInDate(form: MultiStepForm): void {
  const monthStart = startOfMonth(new Date());
  const nextMonthStart = addMonths(monthStart, 1);
  const nextMonthStartString = format(nextMonthStart, "yyyy-MM-dd");
  const moveInDateInput = form.getFormInput<HTMLInputElement>("moveInDate");
  moveInDateInput.min = nextMonthStartString;
}

function initializeCMSSelect(): void {
  const source = CMSSelect.selector("source", "apartment");
  const apartmentSelect = new CMSSelect(source);
  apartmentSelect.insertOptions();

  const wrapper = getElement('[data-field-wrapper-id="alternativeApartment"]');

  if (apartmentSelect.values.length <= 1) {
    wrapper.style.display = "none";
    return;
  }

  const alternative = CMSSelect.selector("target", "alternativeApartment");
  const alternativeSelect = wrapper.querySelector<HTMLSelectElement>(alternative);
  apartmentSelect.onChange("syncAlternatives", () => {
    const values = Array.from(apartmentSelect.values);
    const filtered = values.filter((val) => val !== apartmentSelect.targets[0].value);
    CMSSelect.clearOptions(alternativeSelect, true);
    CMSSelect.insertOptions(alternativeSelect, filtered);
  });
  apartmentSelect.triggerOnChange();
}

export function initApartmentRegistrationForm(): void {
  const formId = "wohnungsanmeldung";
  const version = "4.0.0";
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

  const TenantArray = new FormArray<Tenant>({
    id: "tenants",
    formId: formId,
    container: formElement,
    limit: 2,
    manager: progressManager,
    itemClass: Tenant,
    alertDialog: getAlertDialog(),
    messages: {
      empty: "Bitte tragen Sie die mietenden Personen ein.",
      limit: ({ options }) => `Sie können max. ${options.limit} Mieter hinzufügen.`,
      draft: ({ item }) =>
        `Die Angaben des Mieters "${item.getFullName()}" sind unvollständig. Bitte geben Sie alle angaben an.`,
      invalid: ({ item }) =>
        `Bitte füllen Sie alle Pflichtfelder für "${item?.getFullName()}" aus.`,
    },
  });

  const ApartmentForm = new MultiStepForm(formElement, {
    id: formId,
    version,
    navigation: {
      hideInStep: 0,
    },
    recaptcha: true,
    excludeInputSelectors: ['[data-decision-path="upload"]', "[data-decision-component]"],
    manager: progressManager,
  });

  ApartmentForm.addCustomComponent({
    stepIndex: 2,
    instance: TenantArray,
    validator: () => TenantArray.validate(),
    getData: () => {
      return {
        [TenantArray.id]: JSON.stringify(TenantArray.serialize()),
      };
    },
  });

  ApartmentForm.virtualFields.set("recipients", ({ customFields }) => {
    const people: Array<SerializedTenant> = JSON.parse(customFields.tenants);
    const emails = people.reduce((acc, person) => {
      return [...acc, person.personalData.email.value, person.primaryRelative.email.value];
    }, []);

    return JSON.stringify([...new Set(emails)]);
  });

  ApartmentForm.virtualFields.set("greetings", ({ customFields }) => {
    const people: Array<SerializedTenant> = JSON.parse(customFields.tenants);
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

  ApartmentForm.events.on("input", () => ApartmentForm.saveFields());

  ApartmentForm.events.on("changeStep", () => {
    if (TenantArray.modal.opened) TenantArray.closeModal();
  });

  ApartmentForm.events.on("success", () => {
    progressManager.clear();
    ApartmentForm.events.emit("save");
  });

  TenantArray.onSave("save-progress", (component) =>
    ApartmentForm.saveComponentProgress(component),
  );

  initializeFormDecisions(ApartmentForm, errorMessages, defaultMessages);
  initializeArrayDecisions(TenantArray, errorMessages, defaultMessages);
  initializeMoveInDate(ApartmentForm);
  initializeCMSSelect();
  insertSearchParamValues();

  TenantArray.loadProgress();
  ApartmentForm.loadProgress();

  // @ts-ignore
  window.MultiStepForm = TenantArray;
  console.log("Form initialized:", ApartmentForm.initialized, ApartmentForm);

  ApartmentForm.options.recaptcha = false;
  // ApartmentForm.options.validation.validate = false;
  // ApartmentForm.changeToStep(1);
  // setTimeout(() => {
  //   TenantArray.editItem(TenantArray.getItem(0));
  // }, 600);
}

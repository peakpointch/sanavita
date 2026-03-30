import { Selector, FormArray, FormDecision, MultiStepForm } from "peakflow";
import { Resident } from "./resident";
import { ContactPerson } from "./contact-person";
import { Tenant } from "./tenant";

const decisionSelector = Selector.attr("data-decision-component");

export function initializeFormDecisions(
  form: MultiStepForm,
  errorMessages: { [id: string]: { [key: string]: string } },
  defaultMessages: { [id: string]: string } = {},
): void {
  form.formSteps.forEach((step, stepIndex) => {
    const formDecisions = step.querySelectorAll<HTMLElement>(decisionSelector());

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

export function initializeArrayDecisions<T extends string = string>(
  formArray: FormArray<Tenant | Resident | ContactPerson>,
  errorMessages: { [id: string]: { [key: string]: string } },
  defaultMessages: { [id: string]: string } = {},
): Map<T, FormDecision<PathId>> {
  const decisionElements = formArray.modalElement.querySelectorAll<HTMLElement>(decisionSelector());
  const formDecisions: Map<T, FormDecision<PathId>> = new Map();

  decisionElements.forEach((element, index) => {
    const id = element.getAttribute(FormDecision.attr.component) || index.toString();
    const decision = new FormDecision<PathId>(element, {
      id,
      clearPathOnChange: false,
    });
    formDecisions.set(decision.opts.id as T, decision);

    const group = formArray.getClosestGroup(decision.component);
    decision.onChange(() => {
      formArray.validateModalGroup(group);
      const valid = formArray.groups.every((group) => group.isValid === true);
      formArray.splitButton.setAction(valid ? "save" : "draft");
    });

    formArray.onOpen(`decision-${id}`, () => decision.sync());
    formArray.onClose(`decision-${id}`, () => decision.reset());

    // Set error messages for this FormDecision if available
    if (id && errorMessages[id]) {
      decision.setErrorMessages(errorMessages[id], defaultMessages[id]);
    }
  });

  return formDecisions;
}

import { loadCal } from "@peakflow/cal/loader";
import { disableWebflowForm, formElementSelector, getWfFormData, sendFormData } from "@peakflow/form/utility";
import Modal from "@peakflow/modal";

const modal = Modal.select("component", "prototype");
const prototypeForm = modal.querySelector("form");
disableWebflowForm(prototypeForm);

prototypeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formBlock = prototypeForm.parentElement;

  const fields = Object.fromEntries((new FormData(prototypeForm) as any).entries());
  const wfFormData = getWfFormData(prototypeForm, fields);

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

loadCal("prototyp").then((Cal) => {
  const element = document.querySelector<HTMLElement>('[calcom-embed="inline"]');
  if (!element) throw new Error("Embed container not found");

  Cal.ns["prototyp"]("inline", {
    elementOrSelector: element,
    config: { layout: "month_view" },
    calLink: "peakpoint/prototyp",
  });

  Cal.ns["prototyp"]("ui", {
    hideEventTypeDetails: true,
    layout: "month_view",
    cssVarsPerTheme: {
      light: { "cal-brand": "#333" },
      dark: { "cal-brand": "#eee" },
    },
  });

  Cal.ns.prototyp("on", {
    action: "bookingSuccessfulV2",
    callback: () => {
      console.log("BOOKING SUCCESSFUL WORKS");

      const event = new Event("submit", { bubbles: true, cancelable: true });
      prototypeForm.dispatchEvent(event);
    }
  });
});

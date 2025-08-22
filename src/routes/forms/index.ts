import { WFRoute } from "@xatom/core";
import { initApartmentRegistrationForm } from "src/modules/apartment-form";

export const forms = () => {
  new WFRoute("/anmeldung-wohnen-mit-service").execute(() => {
    initApartmentRegistrationForm();
  });

  new WFRoute("/wohnungen/anmeldung").execute(() => {
    initApartmentRegistrationForm();
  });
};

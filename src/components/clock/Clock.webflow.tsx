import { declareComponent } from "@webflow/react";
import { Clock } from "./Clock";
import { props } from "@webflow/data-types";

import "@/styles/globals.css";

export default declareComponent(Clock, {
  name: "TV / Uhr",

  props: {
    visibility: props.Visibility({
      group: "Visibility",
      name: "Visibility",
      defaultValue: true,
    }),

    timeFormat: props.String({
      group: "Uhr",
      name: "Uhrzeit Format",
      defaultValue: "H:mm",
    }),

    dateFormat: props.String({
      group: "Uhr",
      name: "Datum Format",
      defaultValue: "EEEE, d. MMM",
    }),

    delay: props.Number({
      group: "Uhr",
      name: "Intervall",
      defaultValue: 1000,
    }),
  },
});

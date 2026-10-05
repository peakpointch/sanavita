import { declareComponent } from "@webflow/react";
import { ValuesWheel } from "./ValuesWheel";
import { props } from "@webflow/data-types";

import "@/styles/components/globals.css";

export default declareComponent(ValuesWheel.Item, {
  name: "Werterad Eintrag",
  options: {
    ssr: false,
  },
  props: {
    visibility: props.Visibility({
      group: "Visibility",
      name: "Visibility",
      defaultValue: true,
    }),
    wheelId: props.Text({
      group: "Einstellungen",
      name: "Wheel ID",
      defaultValue: "wheel-1",
    }),
    index: props.Number({
      group: "Einstellungen",
      name: "Item number",
      defaultValue: 1,
      min: 1,
      decimals: 0,
    }),
    label: props.Text({
      group: "Inhalt",
      name: "Label",
      defaultValue: "Mehr",
    }),
    description: props.RichText({
      group: "Inhalt",
      name: "Beschreibung",
    }),
  },
});

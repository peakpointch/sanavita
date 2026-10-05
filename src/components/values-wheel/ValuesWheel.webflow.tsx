import { declareComponent } from "@webflow/react";
import { ValuesWheel } from "./ValuesWheel";
import { props } from "@webflow/data-types";

import "@/styles/components/globals.css";

export default declareComponent(ValuesWheel, {
  name: "Werterad",
  options: {
    ssr: false,
  },
  props: {
    layout: props.Variant({
      group: "Style",
      name: "Layout",
      options: ["full", "mini"],
      defaultValue: "mini",
    }),
    visibility: props.Visibility({
      group: "Visibility",
      name: "Visibility",
      defaultValue: true,
    }),
    wheelId: props.Text({
      group: "Einstellungen",
      name: "Werterad ID",
      defaultValue: "wheel-1",
    }),
    itemCount: props.Number({
      group: "Einstellungen",
      name: "Anzahl Einträge",
      defaultValue: 1,
      min: 0,
      decimals: 0,
    }),
    startIndex: props.Number({
      group: "Einstellungen",
      name: "Start item",
      defaultValue: 1,
      min: 1,
      decimals: 0,
    }),
    heading: props.Text({
      group: "Inhalt",
      name: "Titel",
      defaultValue: "Werte bei Sanavita",
      tooltip: "Nur auf mobilen Geräten sichtbar",
    }),
    children: props.Slot({
      group: "Inhalt",
      name: "Content",
    }),
  },
});

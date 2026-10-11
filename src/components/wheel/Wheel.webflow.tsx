import { declareComponent } from "@webflow/react";
import { Wheel } from "./Wheel";
import { props } from "@webflow/data-types";
import { type ComponentProps } from "react";

import "@/styles/components/globals.css";

type WebflowWheelProps = Omit<ComponentProps<typeof Wheel>, "autoplay"> & {
  enableAutoplay: boolean;
  autoplayDelay: number;
};

function WebflowWheel({ enableAutoplay, autoplayDelay, ...wheelProps }: WebflowWheelProps) {
  return (
    <Wheel {...wheelProps} autoplay={{ enabled: enableAutoplay, delay: autoplayDelay * 1000 }} />
  );
}

export default declareComponent(WebflowWheel, {
  name: "Werterad",
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
    initialTabId: props.Number({
      group: "Einstellungen",
      name: "Initial Tab ID",
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
    enableAutoplay: props.Boolean({
      group: "Einstellungen",
      name: "Autoplay",
      defaultValue: true,
    }),
    autoplayDelay: props.Number({
      group: "Einstellungen",
      name: "Autoplay Dauer",
      tooltip: "Zeit in Sekunden",
      defaultValue: 10,
      min: 0,
      decimals: 0,
    }),
    children: props.Slot({
      group: "Inhalt",
      name: "Content",
    }),
  },
});

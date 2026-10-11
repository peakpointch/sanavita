import { declareComponent } from "@webflow/react";
import { WheelItem, type WheelItemProps } from "./Wheel";
import { props } from "@webflow/data-types";

import "@/styles/components/globals.css";

type WebflowWheelItemProps = WheelItemProps & {
  visibility?: boolean;
};

function WebflowWheelItem({ visibility = true, ...props }: WebflowWheelItemProps) {
  if (!visibility) return null;

  return <WheelItem {...props} />;
}

export default declareComponent(WebflowWheelItem, {
  name: "Werterad Eintrag",
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
    tabId: props.Number({
      group: "Einstellungen",
      name: "Tab ID",
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

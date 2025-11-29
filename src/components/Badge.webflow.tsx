import { Badge } from "./badge";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(Badge, {
  name: "Badge",
  description: "A badge with variants",
  group: "Info",
  props: {
    variant: props.Variant({
      name: "Variant",
      options: ["Light", "Dark"],
      group: "Style",
    }),
    text: props.Text({
      name: "Text",
      defaultValue: "Badge",
      group: "Content",
    }),
  },
});

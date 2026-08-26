import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

import "@/styles/components/globals.css";

import { MenuItem } from "./MenuItem";

export default declareComponent(MenuItem, {
  name: "Menu / Item",
  props: {
    visibility: props.Visibility({
      group: "Visibility",
      name: "Visibility",
      defaultValue: true,
    }),
  },
});

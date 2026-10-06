import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

import "@/styles/components/globals.css";

import { AdminScreen } from "./AdminScreen";

export default declareComponent(AdminScreen, {
  name: "Admin / Screen",
  props: {
    visibility: props.Visibility({
      group: "Visibility",
      name: "Visibility",
      defaultValue: true,
    }),
  },
});

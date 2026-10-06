import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

import "@/styles/components/globals.css";

import { AdminHome } from "./AdminHome";

export default declareComponent(AdminHome, {
  name: "Admin / Home",
  props: {
    visibility: props.Visibility({
      group: "Visibility",
      name: "Visibility",
      defaultValue: true,
    }),
  },
});

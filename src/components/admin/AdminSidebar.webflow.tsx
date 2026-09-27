import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

import "@/styles/components/globals.css";

import { AdminSidebar } from "./AdminSidebar";

export default declareComponent(AdminSidebar, {
  name: "Admin / Sidebar",
  options: {
    ssr: false,
  },
  props: {
    visibility: props.Visibility({
      group: "Visibility",
      name: "Visibility",
      defaultValue: true,
    }),
  },
});

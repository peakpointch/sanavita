import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

import "@/styles/components/globals.css";

import { MenuList } from "./MenuList";

export default declareComponent(MenuList, {
  name: "Menu / List",
  options: {
    ssr: false,
  },
  props: {
    visibility: props.Visibility({
      group: "Visibility",
      name: "Visibility",
      defaultValue: true,
    }),
    collapsible: props.Boolean({
      group: "Behavior",
      name: "Collapsible",
      defaultValue: true,
    }),
    startCollapsed: props.Boolean({
      group: "Behavior",
      name: "Start collapsed",
      defaultValue: false,
    }),
    skipEmptyMenus: props.Boolean({
      group: "Behavior",
      name: "Skip empty menus",
      defaultValue: true,
    }),
    onPage: props.Variant({
      group: "Filter",
      name: "On page",
      options: ["All", "Bistro", "Bankette", "Not set"],
      defaultValue: "All",
    }),
    seasonal: props.Variant({
      group: "Filter",
      name: "Seasonal",
      options: ["All", "Seasonal", "Not seasonal"],
      defaultValue: "All",
    }),
    limit: props.Number({
      group: "Filter",
      name: "Limit",
      tooltip: "Maximum number of menus to show. Use 0 for no limit.",
      min: 0,
      decimals: 0,
      defaultValue: 0,
    }),
    skip: props.Number({
      group: "Filter",
      name: "Skip",
      tooltip: "Number of matching menus to skip before applying the limit.",
      min: 0,
      decimals: 0,
      defaultValue: 0,
    }),
    scaled: props.Boolean({
      group: "Style",
      name: "Scaled",
      defaultValue: false,
    }),
  },
});

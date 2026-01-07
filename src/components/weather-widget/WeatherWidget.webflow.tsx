import { declareComponent } from "@webflow/react";
import { WeatherWidget } from "./WeatherWidget";
import { props } from "@webflow/data-types";

export default declareComponent(WeatherWidget, {
  name: "Weather Widget",
  description:
    "A weather widget showing the local weather of a specific location",

  props: {
    variant: props.Variant({
      group: "Style",
      name: "Variant",
      options: ["horizontal", "vertical"],
      defaultValue: "horizontal",
    }),

    visibility: props.Visibility({
      group: "Visibility",
      name: "Visibility",
      defaultValue: true,
    }),

    days: props.Number({
      group: "Widget",
      name: "Days",
      min: 0,
      max: 4,
      tooltip: "Die Anzahl der angezeigten Tage der Wettervorhersage",
    }),

    showMinMaxTemp: props.Boolean({
      group: "Widget",
      name: "Höchst und Tiefst-Temparatur anzeigen",
      tooltip:
        "Ersetzt die Durchschnittstemparatur mit der Höchst und Tiefst-Temparatur des Tages für die Wettervorhersage",
    }),
  },
});

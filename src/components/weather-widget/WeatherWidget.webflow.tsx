import { declareComponent } from "@webflow/react";
import { WeatherWidget } from "./WeatherWidget";
import { props } from "@webflow/data-types";

import "@/styles/globals.css";

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
      tooltip: "Die Anzahl der angezeigten Tage der Wettervorhersage",
      min: 0,
      max: 4,
      defaultValue: 4,
    }),

    showMinMaxTemp: props.Boolean({
      group: "Widget",
      name: "Min & Max-Temparatur",
      tooltip:
        "Ersetzt die Durchschnittstemparatur mit der Höchst und Tiefst-Temparatur des Tages für die Wettervorhersage",
      defaultValue: false,
    }),

    weatherDelay: props.Number({
      group: "Widget",
      name: "Intervall Wetter",
      tooltip: "Anzahl Minuten bevor das aktuelle Wetter aktualisiert wird",
      min: 0,
      defaultValue: 10,
    }),

    forecastDelay: props.Number({
      group: "Widget",
      name: "Intervall Vorhersage",
      tooltip: "Anzahl Minuten bevor die Wettervorhersage wird",
      min: 0,
      defaultValue: 60,
    }),

    prod: props.Boolean({
      group: "Widget",
      name: "Production",
      tooltip:
        "Ob das Wetter von der API geladen werden soll. NUR im Entwicklungsmodus aktivieren.",
      defaultValue: true,
    }),
  },
});

import OpenWeatherMap from "openweathermap-ts";
import type { WeatherDay, WeatherForecast } from "./types";
import { getIconColor, weatherIconMap } from "./icons";
import { HelpCircle, LucideIcon } from "lucide-react";
import { format } from "date-fns";

import { openWeatherMapApiKey } from "@/secrets";
import { currentWeather, forecast } from "./constants";

const openWeather = new OpenWeatherMap({
  apiKey: openWeatherMapApiKey,
  units: "metric",
});

export async function fetchCurrentWeather(
  prod: boolean = true
): Promise<WeatherDay> {
  return new Promise(async (resolve) => {
    if (!prod) {
      return resolve(currentWeather);
    }

    const data = await openWeather.getCurrentWeatherByZipcode(5210, "CH");
    resolve(data as WeatherDay);
  });
}

export async function fetchForecast(
  prod: boolean = true
): Promise<WeatherForecast> {
  return new Promise(async (resolve) => {
    if (!prod) {
      return resolve(forecast);
    }

    const data = await openWeather.getThreeHourForecastByZipcode(5210, "CH");
    resolve(data as WeatherForecast);
  });
}

export interface DayForecast {
  date: Date;
  temp: number;
  minTemp: number;
  maxTemp: number;
  icon: {
    node: LucideIcon;
    color: string;
  };
}

export function getDaysFromForecast(
  forecast: WeatherForecast,
  prod: boolean = true
): DayForecast[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyGroups = forecast.list.reduce<Record<string, DayForecast>>(
    (acc, item) => {
      // Parse date
      const date = new Date(item.dt * 1000);
      date.setHours(0, 0, 0, 0);
      const dateStr = format(date, "yyyy-MM-dd");

      // Skip today and past days
      if (prod && date <= today) return acc;

      if (!acc || !acc[dateStr]) {
        acc[dateStr] = {
          date: date,
          temp: item.main.temp,
          minTemp: item.main.temp_min,
          maxTemp: item.main.temp_max,
          icon: {
            node: weatherIconMap[item.weather[0].icon] || HelpCircle,
            color: getIconColor(item.weather[0].icon),
          },
        };
      } else {
        // Skip forecasts from the same day
        acc[dateStr].minTemp = Math.min(
          acc[dateStr].minTemp,
          item.main.temp_min
        );
        acc[dateStr].maxTemp = Math.max(
          acc[dateStr].maxTemp,
          item.main.temp_max
        );
      }

      return acc;
    },
    {}
  );

  return Object.entries(dailyGroups).map<DayForecast>(([_, item]) => {
    return {
      ...item,
      temp: Math.round(item.temp),
      minTemp: Math.round(item.minTemp),
      maxTemp: Math.round(item.maxTemp),
    };
  });
}

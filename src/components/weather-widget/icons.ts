import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudRain,
  CloudSunRain,
  CloudMoonRain,
  CloudLightning,
  Snowflake,
  Haze,
} from "lucide-react";
import { WeatherIcon } from "./types";

/**
 * Weather Color Config for Tailwind v4
 * Maps OpenWeather icon prefixes (01, 02, etc.) to semantic text color classes.
 */
export const weatherColorConfig: Record<string, string> = {
  "01": "text-yellow-400", // Clear Sky
  "02": "text-orange-300", // Few Clouds
  "03": "text-gray-100", // Scattered Clouds
  "04": "text-slate-200", // Overcast/Broken Clouds
  "09": "text-sky-200", // Showers
  "10": "text-sky-200", // Rain
  "11": "text-purple-500", // Thunderstorm
  "13": "text-sky-100", // Snow
  "50": "text-teal-400", // Atmosphere (Mist/Fog)
};

export function getIconColor(icon: WeatherIcon): string {
  return weatherColorConfig[icon.slice(0, 2)] || "text-gray-400";
}

export const weatherIconMap = {
  // Clear Sky
  "01d": Sun,
  "01n": Moon,

  // Few Clouds
  "02d": CloudSun,
  "02n": CloudMoon,

  // Scattered / Broken / Overcast Clouds
  "03d": Cloud,
  "03n": Cloud,
  "04d": Cloud,
  "04n": Cloud,

  // Shower Rain / Drizzle
  "09d": CloudRain,
  "09n": CloudRain,

  // Rain
  "10d": CloudSunRain,
  "10n": CloudMoonRain,

  // Thunderstorm
  "11d": CloudLightning,
  "11n": CloudLightning,

  // Snow
  "13d": Snowflake,
  "13n": Snowflake,

  // Atmosphere (Mist, Fog, Smoke, etc.)
  "50d": Haze,
  "50n": Haze,
} as const;

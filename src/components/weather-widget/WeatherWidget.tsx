import type { WeatherDay, WeatherForecast } from "./types";
import { currentWeather, forecast } from "./constants";
import { getIconColor, weatherIconMap } from "./icons";
import { de } from "./i18n";
import {
  Droplet,
  HelpCircle,
  LucideIcon,
  Thermometer,
  Wind,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

async function fetchCurrentWeather(): Promise<WeatherDay> {
  return new Promise((resolve) => resolve(currentWeather));
}

async function fetchForecast(): Promise<WeatherForecast> {
  return new Promise((resolve) => resolve(forecast));
}

interface DayForecast {
  date: Date;
  temp: number;
  minTemp: number;
  maxTemp: number;
  icon: {
    node: LucideIcon;
    color: string;
  };
}

export function getDaysFromForecast(forecast: WeatherForecast): DayForecast[] {
  const dailyGroups = forecast.list.reduce<Record<string, DayForecast>>(
    (acc, item) => {
      // Parse date
      const date = new Date(item.dt * 1000);
      date.setHours(0, 0, 0, 0);
      const dateStr = format(date, "yyyy-MM-dd");

      // Skip today and past days
      if (date <= new Date()) return acc;

      console.log(dateStr, item.main.temp_max);

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

export interface WeatherWidgetProps {
  /** Controls the visibility of this component */
  visibility?: boolean;
  /**
   * Styled variants of this component
   * - "horizontal" (default): displays the days next to each other
   * - "vertical": displays the days below each other
   */
  variant?: "horizontal" | "vertical";
  /**
   * Number of days to show
   * - default: 4
   * - min: 1
   * - max: 4
   */
  days?: number;
  /**
   * Show the minimum and maximum temparature for the forecast instead of the average temperature.
   */
  showMinMaxTemp?: boolean;
}

export function WeatherWidget({
  variant = "horizontal",
  visibility = true,
  days = 4,
  showMinMaxTemp = false,
}: WeatherWidgetProps) {
  const weather = currentWeather;
  const forecastDays = getDaysFromForecast(forecast);
  const MainIcon = weatherIconMap[weather.weather[0].icon];
  const iconColor = getIconColor(weather.weather[0].icon);

  return (
    visibility && (
      <div className="grid gap-16">
        {/* CURRENT WEATHER */}
        <div className="flex items-center gap-16">
          {/* ICON & TEMP */}
          <div className="flex items-center gap-4">
            <MainIcon
              className={cn(iconColor)}
              style={{
                height: `calc(6 * var(--tv-rem))`,
                width: `calc(6 * var(--tv-rem))`,
              }}
            />
            <div className="grid gap-2">
              <span className="text-tv-h2 font-semibold">
                {Math.round(weather.main.temp)}°C
              </span>
              <span className="text-tv-medium">
                {de.main[weather.weather[0].main]}
              </span>
            </div>
          </div>

          {/* DETAILS */}
          <div className="grid gap-4">
            {/* --- FEELS LIKE --- */}
            <div className="flex gap-4 items-center">
              <Thermometer
                className=""
                style={{
                  height: `calc(3.25 * var(--tv-rem))`,
                  width: `calc(3.25 * var(--tv-rem))`,
                }}
              />
              <span className="text-tv-regular">
                Gefühlt wie: {Math.round(weather.main.feels_like)}°C
              </span>
            </div>

            {/* --- WIND --- */}
            <div className="flex gap-4 items-center">
              <Wind
                className=""
                style={{
                  height: `calc(3.25 * var(--tv-rem))`,
                  width: `calc(3.25 * var(--tv-rem))`,
                }}
              />
              <span className="text-tv-regular">
                Windgeschwindikeit: {Math.round(weather.wind.speed)} km/h
              </span>
            </div>

            {/* --- HUMIDITY --- */}
            <div className="flex gap-4 items-center">
              <Droplet
                className=""
                style={{
                  height: `calc(3.25 * var(--tv-rem))`,
                  width: `calc(3.25 * var(--tv-rem))`,
                }}
              />
              <span className="text-tv-regular">
                Luftfeuchtigkeit: {Math.round(weather.main.humidity)}%
              </span>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="w-full h-0 border-white border-t-tv"></div>

        {/* FORECAST */}
        <div className="grid gap-8">
          <span className="text-tv-medium font-medium">
            {days}-Tages-Vorhersage
          </span>
          <div
            className={cn(
              variant === "horizontal" ? "flex gap-24" : "flex flex-col gap-16"
            )}
          >
            {forecastDays.slice(0, days).map((data) => (
              <WeatherForecastDay
                key={data.date.toISOString()}
                day={data}
                showMinMaxTemp={showMinMaxTemp}
              />
            ))}
          </div>
        </div>
      </div>
    )
  );
}

export function WeatherForecastDay({
  day,
  showMinMaxTemp = false,
}: {
  day: DayForecast;
  showMinMaxTemp?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-8">
      <span className="text-tv-regular">{format(day.date, "EEEE")}</span>
      <day.icon.node
        className={cn(day.icon.color)}
        style={{
          height: `calc(3.25 * var(--tv-rem))`,
          width: `calc(3.25 * var(--tv-rem))`,
        }}
      />
      {!showMinMaxTemp && <span className="text-tv-regular">{day.temp}°C</span>}
      {showMinMaxTemp && (
        <>
          <span className="text-tv-regular">{day.maxTemp}°C</span>
          <span className="text-tv-regular">{day.minTemp}°C</span>
        </>
      )}
    </div>
  );
}

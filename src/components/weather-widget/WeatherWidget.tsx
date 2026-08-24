import React from "react";
import type { WeatherDay, WeatherForecast } from "./types";
import { getIconColor, weatherIconMap } from "./icons";
import { de as omwDe } from "./i18n";
import { de } from "date-fns/locale";
import { Droplet, Thermometer, Wind } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { type DayForecast, fetchCurrentWeather, fetchForecast, getDaysFromForecast } from "./utils";

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
  /**
   * Time in minutes to wait before refetching the current weather
   */
  weatherDelay?: number;
  /**
   * Time in minutes to wait before refetching the weather forecast
   */
  forecastDelay?: number;
  /**
   * Whether to fetch the weather from the api. Only use `false` in development mode.
   */
  prod?: boolean;
  scaled?: boolean;
}

export function WeatherWidget({
  variant = "horizontal",
  visibility = true,
  days = 4,
  showMinMaxTemp = false,
  weatherDelay = 10,
  forecastDelay = 180,
  prod = false,
  scaled = true,
}: WeatherWidgetProps) {
  const [data, setData] = React.useState<{
    weather: WeatherDay;
    forecast: WeatherForecast;
  }>({ weather: null, forecast: null });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const updateWeather = async () => {
      const weatherRes = await fetchCurrentWeather(prod);
      setData((prev) => ({
        ...prev,
        weather: weatherRes,
      }));
    };

    const updateForecast = async () => {
      const forecastRes = await fetchForecast(prod);
      setData((prev) => ({
        ...prev,
        forecast: forecastRes,
      }));
    };

    const initData = async () => {
      await Promise.all([updateWeather(), updateForecast()]);
      setLoading(false);
    };

    // Fetch on mount
    initData();

    // Refresh weather & forecast every X minutes
    const weatherInterval = setInterval(updateWeather, weatherDelay * 60 * 1000);
    const forecastInterval = setInterval(updateForecast, forecastDelay * 60 * 1000);

    // Clear intervals on unmount
    return () => {
      clearInterval(weatherInterval);
      clearInterval(forecastInterval);
    };
  }, [prod]);

  if (loading) {
    return <div className={`wf text-base ${scaled ? "is-scaled" : ""}`}>Wird geladen...</div>;
  }

  const { weather, forecast } = data;
  const forecastDays = getDaysFromForecast(forecast, prod);
  const MainIcon = weatherIconMap[weather.weather[0].icon];
  const iconColor = getIconColor(weather.weather[0].icon);

  return (
    visibility && (
      <div className={`wf tv grid gap-16 ${scaled ? "is-scaled" : ""}`}>
        {/* CURRENT WEATHER */}
        <div className="flex items-center gap-16">
          {/* ICON & TEMP */}
          <div className="flex items-center gap-4">
            <MainIcon
              className={cn(iconColor)}
              style={{
                height: `calc(6 * var(--wf-rem))`,
                width: `calc(6 * var(--wf-rem))`,
              }}
            />
            <div className="grid gap-2">
              <span className="text-6xl font-semibold">{Math.round(weather.main.temp)}°C</span>
              <span className="text-lg">{omwDe.main[weather.weather[0].main]}</span>
            </div>
          </div>

          {/* DETAILS */}
          <div className="grid gap-4">
            {/* --- FEELS LIKE --- */}
            <div className="flex items-center gap-4">
              <Thermometer
                className=""
                style={{
                  height: `calc(3.25 * var(--wf-rem))`,
                  width: `calc(3.25 * var(--wf-rem))`,
                }}
              />
              <span className="text-base">
                Gefühlt wie: {Math.round(weather.main.feels_like)}°C
              </span>
            </div>

            {/* --- WIND --- */}
            <div className="flex items-center gap-4">
              <Wind
                className=""
                style={{
                  height: `calc(3.25 * var(--wf-rem))`,
                  width: `calc(3.25 * var(--wf-rem))`,
                }}
              />
              <span className="text-base">
                Windgeschwindikeit: {Math.round(weather.wind.speed)} km/h
              </span>
            </div>

            {/* --- HUMIDITY --- */}
            <div className="flex items-center gap-4">
              <Droplet
                className=""
                style={{
                  height: `calc(3.25 * var(--wf-rem))`,
                  width: `calc(3.25 * var(--wf-rem))`,
                }}
              />
              <span className="text-base">
                Luftfeuchtigkeit: {Math.round(weather.main.humidity)}%
              </span>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="h-0 w-full border-t border-white"></div>

        {/* FORECAST */}
        <div className="grid gap-8">
          <span className="text-lg font-medium">{days}-Tages-Vorhersage</span>
          <div className={cn(variant === "horizontal" ? "flex gap-24" : "flex flex-col gap-16")}>
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
      <span className="text-base">
        {format(day.date, "EEEE", {
          locale: de,
        })}
      </span>
      <day.icon.node
        className={cn(day.icon.color)}
        style={{
          height: `calc(3.25 * var(--wf-rem))`,
          width: `calc(3.25 * var(--wf-rem))`,
        }}
      />
      {!showMinMaxTemp && <span className="text-base">{day.temp}°C</span>}
      {showMinMaxTemp && (
        <>
          <span className="text-base">{day.maxTemp}°C</span>
          <span className="text-base">{day.minTemp}°C</span>
        </>
      )}
    </div>
  );
}

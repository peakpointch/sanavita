import { WeatherWidget } from "./weather-widget/WeatherWidget";
import { Clock } from "./clock/Clock";

import "@/styles/components/dev.css";

export interface MenuProps {}

export function TV({}: MenuProps) {
  return (
    <div className="dev-scaled tv scaled-container text-base bg-brand-900 flex flex-col items-center justify-center">
      {/* <Clock /> */}
      <WeatherWidget days={4} showMinMaxTemp={true} prod={false} />
    </div>
  );
}

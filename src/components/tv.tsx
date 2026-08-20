import { WeatherWidget } from "./weather-widget/WeatherWidget";
import { Clock } from "./clock/Clock";

export interface MenuProps {}

export function TV({}: MenuProps) {
  return (
    <div className="wf is-scaled scaled-container flex flex-col items-center justify-center bg-brand-900 text-base">
      {/* <Clock /> */}
      <WeatherWidget days={4} showMinMaxTemp={true} prod={false} />
    </div>
  );
}

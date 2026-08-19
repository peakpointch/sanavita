import { WeatherWidget } from "./weather-widget/WeatherWidget";
import { Clock } from "./clock/Clock";

export interface MenuProps {}

export function TV({}: MenuProps) {
  return (
    <div className="wf is-scaled scaled-container text-base bg-brand-900 flex flex-col items-center justify-center">
      {/* <Clock /> */}
      <WeatherWidget days={4} showMinMaxTemp={true} prod={false} />
    </div>
  );
}

import React from "react";
import ReactDOM from "react-dom/client";
import "@/styles/globals.css";

/* --- COMPONENT --- */
import { WeatherWidget } from "./weather-widget/WeatherWidget";
import { Clock } from "./clock/Clock";

function App() {
  return (
    <div className="min-h-screen p-10 flex flex-col gap-32 items-center justify-center bg-brand-900 text-white">
      {/* <h1>Components Playground</h1> */}
      {/* <Clock /> */}
      <WeatherWidget days={4} showMinMaxTemp={true} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

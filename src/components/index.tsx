import React from "react";
import ReactDOM from "react-dom/client";

/* ====================== */
/* ---- ENVIRONMENTS ---- */
/* ====================== */

import { TV } from "./tv";
import { Screen } from "./screen";

function App() {
  return (
    <div className="min-h-screen p-10 flex flex-col gap-32 items-center justify-center bg-brand-950 text-white">
      {/* Component Environments */}
      {/* <TV /> */}
      <Screen />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

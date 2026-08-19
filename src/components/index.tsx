import React from "react";
import ReactDOM from "react-dom/client";

import componentStyles from "@/styles/components/globals.css?inline";
import developmentStyles from "@/styles/components/dev.css?inline";

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

const shadowHost = document.getElementById("root")!;
const shadowRoot = shadowHost.shadowRoot ?? shadowHost.attachShadow({ mode: "open" });
const styleElement = document.createElement("style");
const appRoot = document.createElement("div");

styleElement.textContent = `
  ${componentStyles}
  ${developmentStyles}

  #app {
    all: initial;
    display: block;
  }
`;
appRoot.id = "app";
shadowRoot.replaceChildren(styleElement, appRoot);

ReactDOM.createRoot(appRoot).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

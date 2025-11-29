import React from "react";
import ReactDOM from "react-dom/client";

// Import any component inside your repo:

function App() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Components Playground</h1>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

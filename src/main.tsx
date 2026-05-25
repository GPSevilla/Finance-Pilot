import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { FinancePlanProvider } from "./hooks/useFinancePlan";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <FinancePlanProvider>
        <App />
      </FinancePlanProvider>
    </BrowserRouter>
  </React.StrictMode>
);

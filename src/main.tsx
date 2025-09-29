import { createRoot } from "react-dom/client";
import App from "./pages/App.tsx";
import "./globals.css";
import React from "react";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
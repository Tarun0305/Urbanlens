import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
import "./i18n/config";
import { useAuthStore } from "./store/authStore";
import { useUiStore } from "./store/uiStore";

useAuthStore.getState().hydrate();
useUiStore.getState().hydrate();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-center" />
    </BrowserRouter>
  </StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
// @ts-ignore Vite resolves CSS imports at runtime.
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

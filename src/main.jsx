import React from "react"; import { createRoot } from "react-dom/client"; import App from "./App.jsx"; createRoot(document.getElementById("root")).render(<App/>);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(error => console.warn('Nie udało się zapisać aplikacji offline', error));
  });
}

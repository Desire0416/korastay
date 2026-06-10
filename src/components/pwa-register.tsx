"use client";

import { useEffect } from "react";

// Enregistre le service worker pour le mode hors-ligne (PWA).
// Uniquement en production : en developpement, le cache du SW gene le HMR.
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Echec silencieux : l'app reste pleinement fonctionnelle sans SW.
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return null;
}

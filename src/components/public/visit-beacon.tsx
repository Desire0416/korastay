"use client";

import { useEffect } from "react";

// Enregistre une visite au chargement de la plateforme. Le serveur ne compte
// qu'une visite par session de 30 min (cf. /api/visit), donc une simple
// navigation interne ne gonfle pas le compteur.
export function VisitBeacon() {
  useEffect(() => {
    const t = setTimeout(() => {
      fetch("/api/visit", { method: "POST", cache: "no-store", keepalive: true }).catch(
        () => {},
      );
    }, 400);
    return () => clearTimeout(t);
  }, []);

  return null;
}

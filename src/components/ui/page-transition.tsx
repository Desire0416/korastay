"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Transition d'entree appliquee a chaque navigation via les fichiers
 * template.tsx de Next.js (le composant est remonte a chaque changement
 * de page, ce qui rejoue l'animation). Le chrome (header, sidebar) reste
 * stable car il vit dans les layouts.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

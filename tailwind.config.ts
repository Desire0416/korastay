import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", lg: "2rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        cream: "#F8F5EF",
        background: "#F8F5EF",
        surface: "#FFFFFF",
        "surface-soft": "#F2ECE1",
        border: "#E8E1D4",
        foreground: "#15201D",
        muted: "#5F6B66",
        // Vert KoraStay (primaire)
        brand: {
          50: "#E9F3EE",
          100: "#CFE6DB",
          200: "#A2D0BD",
          300: "#6DB497",
          400: "#3B9272",
          500: "#0F6B4F",
          DEFAULT: "#0F6B4F",
          600: "#0C5A42",
          700: "#0A4836",
          800: "#0B3B2D",
          900: "#0C2F25",
          ink: "#12343B",
        },
        // Orange / or KoraStay (accent)
        gold: {
          50: "#FEF6E9",
          100: "#FDEACB",
          200: "#FBD897",
          300: "#F8C264",
          400: "#F4AE45",
          500: "#F2A23A",
          DEFAULT: "#F2A23A",
          600: "#DC8419",
          700: "#B66711",
          800: "#925214",
          900: "#784415",
        },
        ink: "#12343B",
        success: "#0F8A5F",
        danger: "#E5484D",
        warning: "#F2A23A",
        info: "#2E7DA8",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(18, 52, 59, 0.08), 0 4px 16px -4px rgba(18, 52, 59, 0.06)",
        card: "0 6px 24px -8px rgba(18, 52, 59, 0.12)",
        "card-hover": "0 16px 40px -12px rgba(18, 52, 59, 0.20)",
        float: "0 8px 30px -6px rgba(18, 52, 59, 0.18)",
        "inner-soft": "inset 0 1px 2px rgba(18, 52, 59, 0.04)",
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      maxWidth: {
        "8xl": "88rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "marquee-x": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        "scale-in": "scale-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-up": "slide-up 0.32s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 1.6s infinite",
        "marquee-x": "marquee-x 32s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;

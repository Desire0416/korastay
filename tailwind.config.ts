import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

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
      // ------------------------------------------------------------
      // KoraStay v2 — afro-contemporain.
      // Les 4 couleurs officielles de la charte (vert #0F6B4F, orange
      // #F2A23A, marine #12343B, creme #F8F5EF) restent les ancres ;
      // terracotta, sable et indigo (gamme "ink") les completent.
      // ------------------------------------------------------------
      colors: {
        cream: "#F8F5EF",
        background: "#F8F5EF",
        surface: "#FFFFFF",
        "surface-soft": "#F3EDE2",
        border: "#E6DCCB",
        foreground: "#1A1D1A",
        muted: "#6A6259",
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
        // Marine officiel decline en gamme indigo (teinture indigo ouest-africaine).
        ink: {
          50: "#EEF3F4",
          100: "#D5E1E3",
          200: "#A9C2C7",
          300: "#77999F",
          400: "#4A7178",
          500: "#2A525A",
          600: "#1C434B",
          DEFAULT: "#12343B",
          700: "#12343B",
          800: "#0D272D",
          900: "#091C20",
          950: "#051114",
        },
        // Terre cuite / argile (bogolan, banco).
        terracotta: {
          50: "#FBF1EB",
          100: "#F6DCCE",
          200: "#EDB9A0",
          300: "#E0916F",
          400: "#D0704A",
          500: "#B9562F",
          DEFAULT: "#B9562F",
          600: "#9C4626",
          700: "#7E3820",
          800: "#632D1C",
          900: "#4C2418",
        },
        // Sable / lin brut.
        sand: {
          50: "#FCF9F4",
          100: "#F7F0E4",
          200: "#EEE2CC",
          300: "#E2D0AE",
          400: "#D3BA8C",
          500: "#BFA06C",
          DEFAULT: "#E2D0AE",
          600: "#9F8254",
          700: "#7D6643",
          800: "#5D4C34",
          900: "#3F3426",
        },
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
        // Arche soudano-sahelienne (mosquees de Kong, Djenne) : sommet en
        // plein cintre, base adoucie. Signature visuelle des cadres photo v2.
        arch: "999px 999px 1.5rem 1.5rem",
        "arch-sm": "999px 999px 1rem 1rem",
      },
      // Ombres teintees terre (et non plus marine) : plus chaudes sur creme.
      boxShadow: {
        soft: "0 1px 2px rgba(60, 40, 24, 0.05), 0 4px 14px -4px rgba(60, 40, 24, 0.08)",
        card: "0 2px 4px rgba(60, 40, 24, 0.04), 0 10px 28px -10px rgba(60, 40, 24, 0.16)",
        "card-hover": "0 4px 8px rgba(60, 40, 24, 0.05), 0 22px 48px -16px rgba(60, 40, 24, 0.26)",
        float: "0 12px 40px -10px rgba(18, 52, 59, 0.28)",
        "inner-soft": "inset 0 1px 2px rgba(60, 40, 24, 0.05)",
        ring: "0 0 0 1px rgba(60, 40, 24, 0.06)",
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
        // Echelle display (titres editoriaux).
        "display-sm": ["2.25rem", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
        "display-md": ["3rem", { lineHeight: "1.04", letterSpacing: "-0.025em" }],
        "display-lg": ["4rem", { lineHeight: "1", letterSpacing: "-0.03em" }],
        "display-xl": ["5.25rem", { lineHeight: "0.96", letterSpacing: "-0.035em" }],
      },
      letterSpacing: {
        eyebrow: "0.18em",
      },
      // Typographie des pages legales (prose) aux couleurs KoraStay.
      typography: ({ theme }: { theme: (path: string) => string }) => ({
        DEFAULT: {
          css: {
            maxWidth: "none",
            "--tw-prose-body": theme("colors.foreground"),
            "--tw-prose-headings": theme("colors.foreground"),
            "--tw-prose-links": theme("colors.terracotta.600"),
            "--tw-prose-bold": theme("colors.foreground"),
            "--tw-prose-bullets": theme("colors.terracotta.400"),
            "--tw-prose-counters": theme("colors.muted"),
            "--tw-prose-hr": theme("colors.border"),
            "--tw-prose-quotes": theme("colors.foreground"),
            "--tw-prose-quote-borders": theme("colors.terracotta.200"),
            "--tw-prose-captions": theme("colors.muted"),
            "--tw-prose-th-borders": theme("colors.border"),
            "--tw-prose-td-borders": theme("colors.border"),
            h2: { fontFamily: theme("fontFamily.display"), letterSpacing: "-0.015em", fontVariationSettings: '"SOFT" 100' },
            h3: { fontFamily: theme("fontFamily.display"), fontVariationSettings: '"SOFT" 100' },
            "h2 strong, h3 strong": { fontWeight: "inherit" },
            a: { textUnderlineOffset: "2px" },
            "thead th": { backgroundColor: theme("colors.sand.100") },
            table: { fontSize: "0.925em" },
          },
        },
      }),
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
  plugins: [tailwindcssAnimate, typography],
};

export default config;

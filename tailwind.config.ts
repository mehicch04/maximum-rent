import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // toggled by next-themes
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", lg: "2rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // Semantic tokens — driven by CSS variables so light/dark swap is instant.
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        surface: {
          DEFAULT: "hsl(var(--surface) / <alpha-value>)",
          muted: "hsl(var(--surface-muted) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        // Brand red — extracted from the Maximum logo. DEFAULT = #E30613.
        brand: {
          50: "#FFF1F1",
          100: "#FFE0E1",
          200: "#FFC7C9",
          300: "#FF9DA1",
          400: "#FB5860",
          500: "#ED1822",
          600: "#E30613",
          700: "#BE040F",
          800: "#9D0710",
          900: "#820A11",
          950: "#470206",
          DEFAULT: "#E30613",
          foreground: "#FFFFFF",
        },
        // Theme-aware red for small brand-colored TEXT (AA-safe on dark).
        "brand-strong": "var(--brand-strong)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "sans-serif"],
      },
      borderRadius: { xl: "0.875rem", "2xl": "1.25rem" },
      boxShadow: {
        card: "0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -12px rgb(0 0 0 / 0.18)",
        "card-hover":
          "0 2px 4px rgb(0 0 0 / 0.06), 0 24px 48px -16px rgb(0 0 0 / 0.32)",
        // Soft lift, not a glow. The previous value (30px blur at 45%) spread
        // red well past the button edge and read as the colour bleeding out.
        // Barely-there lift for primary buttons only. Anything stronger reads
        // as the red bleeding out past the edge.
        brand: "0 4px 12px -4px rgb(227 6 19 / 0.20)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #ED1822 0%, #A40007 100%)",
        "hero-fade":
          "linear-gradient(to top, hsl(var(--background)) 4%, transparent 60%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;

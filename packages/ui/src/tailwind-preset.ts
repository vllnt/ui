import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Config } from "tailwindcss";

import { animatePlugin } from "./tailwind-animate";

const __dirname = dirname(fileURLToPath(import.meta.url));

const preset: Partial<Config> = {
  content: [
    join(__dirname, "**/*.js"),
    // These two files list class names as data. Scanning them would add
    // utilities to the consumer's CSS that no component uses.
    `!${join(__dirname, "tailwind-animate.js")}`,
    `!${join(__dirname, "lib/tailwind-merge-config.js")}`,
  ],
  darkMode: ["class"],
  plugins: [animatePlugin],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
      },
      // The large radius steps follow the surface radius, so a component's
      // `rounded-xl` or `rounded-2xl` takes the theme's corner like the rest.
      borderRadius: {
        "2xl": "var(--radius-surface)",
        "3xl": "var(--radius-surface)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "var(--radius-surface)",
      },
      // Every shadow step reads a theme shadow token, so the flat default theme
      // (no shadows) removes them all and a theme with shadows brings them back.
      boxShadow: {
        "2xl": "var(--shadow-floating)",
        DEFAULT: "var(--shadow-raised)",
        lg: "var(--shadow-overlay)",
        md: "var(--shadow-overlay)",
        sm: "var(--shadow-raised)",
        xl: "var(--shadow-floating)",
      },
      colors: {
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground) / <alpha-value>)",
        },
        background: "oklch(var(--background) / <alpha-value>)",
        border: "oklch(var(--border) / <alpha-value>)",
        card: {
          DEFAULT: "oklch(var(--card) / <alpha-value>)",
          foreground: "oklch(var(--card-foreground) / <alpha-value>)",
        },
        composer: "oklch(var(--composer-border) / <alpha-value>)",
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground) / <alpha-value>)",
        },
        diff: {
          added: "oklch(var(--diff-added) / <alpha-value>)",
          removed: "oklch(var(--diff-removed) / <alpha-value>)",
        },
        foreground: "oklch(var(--foreground) / <alpha-value>)",
        info: {
          DEFAULT: "oklch(var(--info) / <alpha-value>)",
          foreground: "oklch(var(--info-foreground) / <alpha-value>)",
        },
        input: "oklch(var(--vllnt-glass-input, var(--input)) / <alpha-value>)",
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground:
            "oklch(var(--vllnt-glass-muted-foreground, var(--muted-foreground)) / <alpha-value>)",
        },
        pill: {
          border: "oklch(var(--pill-border) / <alpha-value>)",
          DEFAULT: "oklch(var(--pill) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "oklch(var(--popover) / <alpha-value>)",
          foreground: "oklch(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground) / <alpha-value>)",
        },
        ring: "oklch(var(--ring) / <alpha-value>)",
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground) / <alpha-value>)",
        },
        sidebar: "oklch(var(--sidebar) / <alpha-value>)",
        status: {
          done: "oklch(var(--status-done) / <alpha-value>)",
          failed: "oklch(var(--status-failed) / <alpha-value>)",
          "needs-you": "oklch(var(--status-needs-you) / <alpha-value>)",
          ring: "oklch(var(--status-ring) / <alpha-value>)",
          unread: "oklch(var(--status-unread) / <alpha-value>)",
        },
        success: {
          DEFAULT: "oklch(var(--success) / <alpha-value>)",
          foreground: "oklch(var(--success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "oklch(var(--warning) / <alpha-value>)",
          foreground: "oklch(var(--warning-foreground) / <alpha-value>)",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      height: {
        "control-xs": "var(--size-control-xs)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      minHeight: {
        target: "var(--size-target-min)",
      },
      minWidth: {
        target: "var(--size-target-min)",
      },
    },
  },
};

export default preset;

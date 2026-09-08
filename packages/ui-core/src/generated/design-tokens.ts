/* This file is generated from packages/design. Do not edit directly. */

export const designTokens = {
  "$schema": "./tokens.schema.json",
  "name": "VLLNT UI",
  "version": "0.4.0",
  "source": {
    "guide": "../../DESIGN.md",
    "theme": "../ui/themes/default.css"
  },
  "color": {
    "format": "oklch-channel",
    "semantic": {
      "background": {
        "cssVariable": "--background",
        "light": "1 0 0",
        "dark": "0 0 0",
        "role": "Page and app surface"
      },
      "foreground": {
        "cssVariable": "--foreground",
        "light": "0.1445 0 0",
        "dark": "0.9848 0 0",
        "role": "Primary text and icon color"
      },
      "card": {
        "cssVariable": "--card",
        "light": "1 0 0",
        "dark": "0.1445 0 0",
        "role": "Card and contained surface"
      },
      "cardForeground": {
        "cssVariable": "--card-foreground",
        "light": "0.1445 0 0",
        "dark": "0.9848 0 0",
        "role": "Text on card surfaces"
      },
      "popover": {
        "cssVariable": "--popover",
        "light": "1 0 0",
        "dark": "0.1445 0 0",
        "role": "Popover, menu, and floating surface"
      },
      "popoverForeground": {
        "cssVariable": "--popover-foreground",
        "light": "0.1445 0 0",
        "dark": "0.9848 0 0",
        "role": "Text on popover surfaces"
      },
      "primary": {
        "cssVariable": "--primary",
        "light": "0.2044 0 0",
        "dark": "0.9848 0 0",
        "role": "Primary action surface"
      },
      "primaryForeground": {
        "cssVariable": "--primary-foreground",
        "light": "0.9848 0 0",
        "dark": "0.2044 0 0",
        "role": "Text on primary action surfaces"
      },
      "secondary": {
        "cssVariable": "--secondary",
        "light": "0.9703 0 0",
        "dark": "0.2686 0 0",
        "role": "Secondary action surface"
      },
      "secondaryForeground": {
        "cssVariable": "--secondary-foreground",
        "light": "0.2044 0 0",
        "dark": "0.9848 0 0",
        "role": "Text on secondary action surfaces"
      },
      "muted": {
        "cssVariable": "--muted",
        "light": "0.9703 0 0",
        "dark": "0.2686 0 0",
        "role": "Subtle surface"
      },
      "mutedForeground": {
        "cssVariable": "--muted-foreground",
        "light": "0.5555 0 0",
        "dark": "0.7153 0 0",
        "role": "Secondary text"
      },
      "accent": {
        "cssVariable": "--accent",
        "light": "0.9703 0 0",
        "dark": "0.2686 0 0",
        "role": "Hover and active surface"
      },
      "accentForeground": {
        "cssVariable": "--accent-foreground",
        "light": "0.2044 0 0",
        "dark": "0.9848 0 0",
        "role": "Text on accent surfaces"
      },
      "destructive": {
        "cssVariable": "--destructive",
        "light": "0.6368 0.2078 25.326",
        "dark": "0.3959 0.1331 25.721",
        "role": "Destructive action and error surface"
      },
      "destructiveForeground": {
        "cssVariable": "--destructive-foreground",
        "light": "0.9848 0 0",
        "dark": "0.9848 0 0",
        "role": "Text on destructive surfaces"
      },
      "border": {
        "cssVariable": "--border",
        "light": "0.9219 0 0",
        "dark": "0.2686 0 0",
        "role": "Hairline divider"
      },
      "input": {
        "cssVariable": "--input",
        "light": "0.9219 0 0",
        "dark": "0.2686 0 0",
        "role": "Input border"
      },
      "ring": {
        "cssVariable": "--ring",
        "light": "0.1445 0 0",
        "dark": "0.8697 0 0",
        "role": "Focus ring"
      }
    }
  },
  "typography": {
    "fontFamily": {
      "sans": {
        "cssVariable": "--font-sans",
        "value": "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        "role": "Body + UI text"
      },
      "display": {
        "cssVariable": "--font-display",
        "value": "var(--font-sans)",
        "role": "Heading + Display face — override per theme for a brand type identity (defaults to sans)"
      },
      "mono": {
        "cssVariable": "--font-mono",
        "value": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        "role": "Code + tabular"
      }
    },
    "fontWeight": {
      "heading": {
        "cssVariable": "--font-weight-heading",
        "value": 600,
        "role": "Heading primitive weight — theme-overridable"
      },
      "display": {
        "cssVariable": "--font-weight-display",
        "value": 600,
        "role": "Display primitive weight — theme-overridable"
      },
      "body": {
        "value": 400
      },
      "caption": {
        "value": 500
      }
    },
    "scale": {
      "display": {
        "cssVariable": "--font-size-display",
        "fontSize": "3.75rem",
        "lineHeight": "1.05",
        "lineHeightCssVariable": "--line-height-display"
      },
      "h1": {
        "cssVariable": "--font-size-h1",
        "fontSize": "3rem",
        "lineHeight": "1.1",
        "lineHeightCssVariable": "--line-height-h1"
      },
      "h2": {
        "cssVariable": "--font-size-h2",
        "fontSize": "2.25rem",
        "lineHeight": "1.2",
        "lineHeightCssVariable": "--line-height-h2"
      },
      "h3": {
        "cssVariable": "--font-size-h3",
        "fontSize": "1.875rem",
        "lineHeight": "1.25",
        "lineHeightCssVariable": "--line-height-h3"
      },
      "h4": {
        "cssVariable": "--font-size-h4",
        "fontSize": "1.5rem",
        "lineHeight": "1.3",
        "lineHeightCssVariable": "--line-height-h4"
      },
      "h5": {
        "cssVariable": "--font-size-h5",
        "fontSize": "1.25rem",
        "lineHeight": "1.4",
        "lineHeightCssVariable": "--line-height-h5"
      },
      "h6": {
        "cssVariable": "--font-size-h6",
        "fontSize": "1.125rem",
        "lineHeight": "1.5",
        "lineHeightCssVariable": "--line-height-h6"
      },
      "bodyLarge": {
        "cssVariable": "--font-size-body-lg",
        "fontSize": "1.125rem",
        "lineHeight": "1.7",
        "lineHeightCssVariable": "--line-height-body-lg"
      },
      "body": {
        "cssVariable": "--font-size-body",
        "fontSize": "1rem",
        "lineHeight": "1.6",
        "lineHeightCssVariable": "--line-height-body"
      },
      "bodySmall": {
        "cssVariable": "--font-size-body-sm",
        "fontSize": "0.875rem",
        "lineHeight": "1.5",
        "lineHeightCssVariable": "--line-height-body-sm"
      },
      "caption": {
        "cssVariable": "--font-size-caption",
        "fontSize": "0.75rem",
        "lineHeight": "1.4",
        "lineHeightCssVariable": "--line-height-caption"
      }
    }
  },
  "spacing": {
    "unit": "4px",
    "scale": {
      "1": "0.25rem",
      "2": "0.5rem",
      "3": "0.75rem",
      "4": "1rem",
      "6": "1.5rem",
      "8": "2rem",
      "12": "3rem",
      "16": "4rem"
    }
  },
  "radius": {
    "none": "0",
    "sm": "0.25rem",
    "md": "0.5rem",
    "lg": "0.75rem",
    "full": "9999px"
  },
  "elevation": {
    "none": "none",
    "sm": "0 1px 2px rgba(0, 0, 0, 0.05)",
    "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
  },
  "motion": {
    "duration": {
      "fast": "100ms",
      "base": "200ms",
      "slow": "300ms"
    },
    "easing": {
      "enter": "ease-out",
      "exit": "ease-in",
      "layout": "ease-in-out"
    },
    "reducedMotion": "Collapse durations to 1ms or skip non-essential motion."
  },
  "iconography": {
    "library": "lucide-react",
    "size": {
      "default": "1rem",
      "compact": "0.875rem",
      "large": "1.25rem"
    },
    "strokeWidth": 2,
    "color": "currentColor"
  }
} as const;

export const componentContracts = {
  "$schema": "./component-contracts.schema.json",
  "version": "0.1.0",
  "components": {
    "badge": {
      "variants": [
        "default",
        "destructive",
        "outline",
        "secondary"
      ]
    },
    "button": {
      "sizes": [
        "default",
        "icon",
        "lg",
        "sm"
      ],
      "variants": [
        "default",
        "destructive",
        "ghost",
        "link",
        "outline",
        "secondary"
      ]
    },
    "card": {
      "parts": [
        "Card",
        "CardHeader",
        "CardTitle",
        "CardDescription",
        "CardContent",
        "CardFooter"
      ]
    },
    "heading": {
      "levels": [
        1,
        2,
        3,
        4,
        5,
        6
      ]
    },
    "text": {
      "sizes": [
        "base",
        "caption",
        "lead",
        "small"
      ],
      "tones": [
        "default",
        "muted"
      ],
      "weights": [
        "medium",
        "normal",
        "semibold"
      ]
    }
  }
} as const;

export const nativeTokens = {
  "color": {
    "dark": {
      "background": "#050505",
      "foreground": "#fafafa",
      "card": "#0a0a0a",
      "cardForeground": "#fafafa",
      "popover": "#0a0a0a",
      "popoverForeground": "#fafafa",
      "primary": "#fafafa",
      "primaryForeground": "#171717",
      "secondary": "#262626",
      "secondaryForeground": "#fafafa",
      "muted": "#262626",
      "mutedForeground": "#a3a3a3",
      "accent": "#262626",
      "accentForeground": "#fafafa",
      "destructive": "#7f1d1d",
      "destructiveForeground": "#fafafa",
      "border": "#262626",
      "input": "#262626",
      "ring": "#d4d4d4"
    },
    "light": {
      "background": "#ffffff",
      "foreground": "#0a0a0a",
      "card": "#ffffff",
      "cardForeground": "#0a0a0a",
      "popover": "#ffffff",
      "popoverForeground": "#0a0a0a",
      "primary": "#171717",
      "primaryForeground": "#fafafa",
      "secondary": "#f5f5f5",
      "secondaryForeground": "#171717",
      "muted": "#f5f5f5",
      "mutedForeground": "#737373",
      "accent": "#f5f5f5",
      "accentForeground": "#171717",
      "destructive": "#c92f32",
      "destructiveForeground": "#fafafa",
      "border": "#e5e5e5",
      "input": "#e5e5e5",
      "ring": "#0a0a0a"
    }
  },
  "motion": {
    "duration": {
      "fast": 100,
      "base": 200,
      "slow": 300
    }
  },
  "radius": {
    "none": 0,
    "sm": 4,
    "md": 8,
    "lg": 12,
    "full": 9999
  },
  "spacing": {
    "1": 4,
    "2": 8,
    "3": 12,
    "4": 16,
    "6": 24,
    "8": 32,
    "12": 48,
    "16": 64
  },
  "typography": {
    "fontWeight": {
      "heading": 600,
      "display": 600,
      "body": 400,
      "caption": 500
    },
    "scale": {
      "display": {
        "fontSize": 60,
        "lineHeight": 63
      },
      "h1": {
        "fontSize": 48,
        "lineHeight": 52.8
      },
      "h2": {
        "fontSize": 36,
        "lineHeight": 43.2
      },
      "h3": {
        "fontSize": 30,
        "lineHeight": 37.5
      },
      "h4": {
        "fontSize": 24,
        "lineHeight": 31.2
      },
      "h5": {
        "fontSize": 20,
        "lineHeight": 28
      },
      "h6": {
        "fontSize": 18,
        "lineHeight": 27
      },
      "bodyLarge": {
        "fontSize": 18,
        "lineHeight": 30.6
      },
      "body": {
        "fontSize": 16,
        "lineHeight": 25.6
      },
      "bodySmall": {
        "fontSize": 14,
        "lineHeight": 21
      },
      "caption": {
        "fontSize": 12,
        "lineHeight": 16.8
      }
    }
  }
} as const;

export type BadgeVariant =
  (typeof componentContracts.components.badge.variants)[number];
export type ButtonSize =
  (typeof componentContracts.components.button.sizes)[number];
export type ButtonVariant =
  (typeof componentContracts.components.button.variants)[number];
export type CardPart =
  (typeof componentContracts.components.card.parts)[number];
export type HeadingLevel =
  (typeof componentContracts.components.heading.levels)[number];
export type TextSize =
  (typeof componentContracts.components.text.sizes)[number];
export type TextTone =
  (typeof componentContracts.components.text.tones)[number];
export type TextWeight =
  (typeof componentContracts.components.text.weights)[number];
export type SemanticColorName = keyof typeof nativeTokens.color.light;

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
        "light": "0.525 0 0",
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
        "light": "0.55 0.2078 25.326",
        "dark": "0.7 0.18 25.721",
        "role": "Destructive action and error surface"
      },
      "destructiveForeground": {
        "cssVariable": "--destructive-foreground",
        "light": "0.9848 0 0",
        "dark": "0.2044 0 0",
        "role": "Text on destructive surfaces"
      },
      "success": {
        "cssVariable": "--success",
        "light": "0.5 0.11 155",
        "dark": "0.78 0.16 155",
        "role": "Success fill and success text"
      },
      "successForeground": {
        "cssVariable": "--success-foreground",
        "light": "0.9848 0 0",
        "dark": "0.2044 0 0",
        "role": "Text on success surfaces"
      },
      "warning": {
        "cssVariable": "--warning",
        "light": "0.5 0.085 70",
        "dark": "0.82 0.15 85",
        "role": "Warning fill and warning text"
      },
      "warningForeground": {
        "cssVariable": "--warning-foreground",
        "light": "0.9848 0 0",
        "dark": "0.2044 0 0",
        "role": "Text on warning surfaces"
      },
      "info": {
        "cssVariable": "--info",
        "light": "0.5 0.15 255",
        "dark": "0.74 0.12 245",
        "role": "Informational fill and informational text"
      },
      "infoForeground": {
        "cssVariable": "--info-foreground",
        "light": "0.9848 0 0",
        "dark": "0.2044 0 0",
        "role": "Text on info surfaces"
      },
      "diffAdded": {
        "cssVariable": "--diff-added",
        "light": "0.94 0.04 150",
        "dark": "0.26 0.05 150",
        "role": "Added-line surface in diffs (text on it uses foreground)"
      },
      "diffRemoved": {
        "cssVariable": "--diff-removed",
        "light": "0.94 0.03 25",
        "dark": "0.26 0.055 25",
        "role": "Removed-line surface in diffs (text on it uses foreground)"
      },
      "border": {
        "cssVariable": "--border",
        "light": "0.9219 0 0",
        "dark": "0.2686 0 0",
        "role": "Hairline divider"
      },
      "input": {
        "cssVariable": "--input",
        "light": "0.66 0 0",
        "dark": "0.49 0 0",
        "role": "Form-control boundary (3:1 against background, card, popover)"
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
      },
      "label": {
        "cssVariable": "--font-weight-label",
        "value": 600,
        "role": "Label weight — theme-overridable"
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
      },
      "label": {
        "cssVariable": "--font-size-label",
        "fontSize": "0.75rem",
        "lineHeight": "1.4",
        "lineHeightCssVariable": "--line-height-label"
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
      "5": "1.25rem",
      "6": "1.5rem",
      "8": "2rem",
      "10": "2.5rem",
      "12": "3rem",
      "16": "4rem"
    }
  },
  "radius": {
    "none": "0",
    "sm": "0.25rem",
    "md": "0.5rem",
    "lg": "0.75rem",
    "xl": "1rem",
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
  },
  "themes": {
    "maia": {
      "label": "Maia",
      "description": "Maia product theme: pink primary on black and white neutrals, Figtree with JetBrains Mono. Overrides core roles only; every other role inherits core.",
      "color": {
        "light": {
          "background": "1 0 0",
          "foreground": "0 0 0",
          "card": "0.9851 0 0",
          "cardForeground": "0 0 0",
          "popover": "0.9851 0 0",
          "popoverForeground": "0 0 0",
          "primary": "0.54 0.2202 345.03",
          "primaryForeground": "1 0 0",
          "muted": "0.9702 0 0",
          "mutedForeground": "0.4997 0 0",
          "accent": "0.9702 0 0",
          "accentForeground": "0 0 0",
          "destructive": "0.5199 0.1902 27",
          "destructiveForeground": "1 0 0",
          "success": "0.5197 0.1394 150.14",
          "successForeground": "1 0 0",
          "warning": "0.5312 0.1102 70.11",
          "warningForeground": "1 0 0",
          "info": "0.4986 0.1701 258.06",
          "infoForeground": "1 0 0",
          "diffAdded": "0.9422 0.019 157.86",
          "diffRemoved": "0.9363 0.0197 17.51",
          "border": "0.9189 0 0",
          "input": "0.6201 0 0"
        },
        "dark": {
          "background": "0 0 0",
          "foreground": "1 0 0",
          "card": "0.1543 0 0",
          "cardForeground": "1 0 0",
          "popover": "0.1543 0 0",
          "popoverForeground": "1 0 0",
          "primary": "0.7208 0.1894 345.3",
          "primaryForeground": "0 0 0",
          "muted": "0.2002 0 0",
          "mutedForeground": "0.7187 0 0",
          "accent": "0.2002 0 0",
          "accentForeground": "1 0 0",
          "destructive": "0.7202 0.1606 25.02",
          "destructiveForeground": "0 0 0",
          "success": "0.7803 0.17 150.17",
          "successForeground": "0 0 0",
          "warning": "0.8012 0.1401 80.03",
          "warningForeground": "0 0 0",
          "info": "0.7402 0.1299 258.04",
          "infoForeground": "0 0 0",
          "diffAdded": "0.2624 0.0467 151.95",
          "diffRemoved": "0.2453 0.0422 25.24",
          "border": "0.3012 0 0",
          "input": "0.5208 0 0"
        }
      },
      "typography": {
        "fontFamily": {
          "sans": "'Figtree', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          "display": "'Figtree', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          "mono": "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        },
        "fontWeight": {
          "display": 700,
          "heading": 600,
          "body": 400,
          "caption": 500,
          "label": 700
        },
        "scale": {
          "display": {
            "fontSize": "1.75rem"
          },
          "h5": {
            "fontSize": "1.25rem"
          },
          "h6": {
            "fontSize": "0.9375rem"
          },
          "body": {
            "fontSize": "0.875rem"
          },
          "bodySmall": {
            "fontSize": "0.8125rem"
          },
          "caption": {
            "fontSize": "0.75rem"
          },
          "label": {
            "fontSize": "0.6875rem"
          }
        }
      },
      "radius": {
        "sm": "0.375rem",
        "md": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem"
      }
    },
    "paas": {
      "label": "PaaS",
      "description": "PaaS product theme: core neutral and status colours with JetBrains Mono for every face. Dark is the design default; light stays supported.",
      "defaultMode": "dark",
      "typography": {
        "fontFamily": {
          "sans": "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          "display": "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          "mono": "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        }
      }
    }
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
      "destructive": "#fa6961",
      "destructiveForeground": "#171717",
      "success": "#4ed589",
      "successForeground": "#171717",
      "warning": "#f0bb3b",
      "warningForeground": "#171717",
      "info": "#65b2f1",
      "infoForeground": "#171717",
      "diffAdded": "#102b17",
      "diffRemoved": "#3b1816",
      "border": "#262626",
      "input": "#606060",
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
      "mutedForeground": "#6a6a6a",
      "accent": "#f5f5f5",
      "accentForeground": "#171717",
      "destructive": "#cf1f29",
      "destructiveForeground": "#fafafa",
      "success": "#1e7546",
      "successForeground": "#fafafa",
      "warning": "#825a27",
      "warningForeground": "#fafafa",
      "info": "#1762b6",
      "infoForeground": "#fafafa",
      "diffAdded": "#d9f3dd",
      "diffRemoved": "#ffe4e1",
      "border": "#e5e5e5",
      "input": "#929292",
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
    "xl": 16,
    "full": 9999
  },
  "spacing": {
    "1": 4,
    "2": 8,
    "3": 12,
    "4": 16,
    "5": 20,
    "6": 24,
    "8": 32,
    "10": 40,
    "12": 48,
    "16": 64
  },
  "typography": {
    "fontWeight": {
      "heading": 600,
      "display": 600,
      "body": 400,
      "caption": 500,
      "label": 600
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
      },
      "label": {
        "fontSize": 12,
        "lineHeight": 16.8
      }
    }
  }
} as const;

/** Product themes resolved to native units: sRGB hex, points, primary font faces. */
export const productThemes = {
  "maia": {
    "colors": {
      "dark": {
        "background": "#000000",
        "foreground": "#ffffff",
        "card": "#0c0c0c",
        "cardForeground": "#ffffff",
        "popover": "#0c0c0c",
        "popoverForeground": "#ffffff",
        "primary": "#f46cbf",
        "primaryForeground": "#000000",
        "secondary": "#262626",
        "secondaryForeground": "#fafafa",
        "muted": "#161616",
        "mutedForeground": "#a4a4a4",
        "accent": "#161616",
        "accentForeground": "#ffffff",
        "destructive": "#f97770",
        "destructiveForeground": "#000000",
        "success": "#56d57b",
        "successForeground": "#000000",
        "warning": "#edb345",
        "warningForeground": "#000000",
        "info": "#76acfc",
        "infoForeground": "#000000",
        "diffAdded": "#112b19",
        "diffRemoved": "#321816",
        "border": "#2e2e2e",
        "input": "#696969",
        "ring": "#d4d4d4"
      },
      "light": {
        "background": "#ffffff",
        "foreground": "#000000",
        "card": "#fafafa",
        "cardForeground": "#000000",
        "popover": "#fafafa",
        "popoverForeground": "#000000",
        "primary": "#be148b",
        "primaryForeground": "#ffffff",
        "secondary": "#f5f5f5",
        "secondaryForeground": "#171717",
        "muted": "#f5f5f5",
        "mutedForeground": "#636363",
        "accent": "#f5f5f5",
        "accentForeground": "#000000",
        "destructive": "#be2323",
        "destructiveForeground": "#ffffff",
        "success": "#0a7e3a",
        "successForeground": "#ffffff",
        "warning": "#945f0e",
        "warningForeground": "#ffffff",
        "info": "#145ec1",
        "infoForeground": "#ffffff",
        "diffAdded": "#e2f0e7",
        "diffRemoved": "#f7e5e5",
        "border": "#e4e4e4",
        "input": "#868686",
        "ring": "#0a0a0a"
      }
    },
    "defaultMode": null,
    "label": "Maia",
    "radius": {
      "none": 0,
      "sm": 6,
      "md": 8,
      "lg": 12,
      "xl": 16,
      "full": 9999
    },
    "typography": {
      "fontFamily": {
        "sans": "Figtree",
        "display": "Figtree",
        "mono": "JetBrains Mono"
      },
      "fontWeight": {
        "heading": 600,
        "display": 700,
        "body": 400,
        "caption": 500,
        "label": 700
      },
      "scale": {
        "display": {
          "fontSize": 28,
          "lineHeight": 29.4
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
          "fontSize": 15,
          "lineHeight": 22.5
        },
        "bodyLarge": {
          "fontSize": 18,
          "lineHeight": 30.6
        },
        "body": {
          "fontSize": 14,
          "lineHeight": 22.4
        },
        "bodySmall": {
          "fontSize": 13,
          "lineHeight": 19.5
        },
        "caption": {
          "fontSize": 12,
          "lineHeight": 16.8
        },
        "label": {
          "fontSize": 11,
          "lineHeight": 15.4
        }
      }
    }
  },
  "paas": {
    "colors": {
      "dark": {
        "background": "#000000",
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
        "destructive": "#fa6961",
        "destructiveForeground": "#171717",
        "success": "#4ed589",
        "successForeground": "#171717",
        "warning": "#f0bb3b",
        "warningForeground": "#171717",
        "info": "#65b2f1",
        "infoForeground": "#171717",
        "diffAdded": "#102b17",
        "diffRemoved": "#3b1816",
        "border": "#262626",
        "input": "#606060",
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
        "mutedForeground": "#6a6a6a",
        "accent": "#f5f5f5",
        "accentForeground": "#171717",
        "destructive": "#cf1f29",
        "destructiveForeground": "#fafafa",
        "success": "#1e7546",
        "successForeground": "#fafafa",
        "warning": "#825a27",
        "warningForeground": "#fafafa",
        "info": "#1762b6",
        "infoForeground": "#fafafa",
        "diffAdded": "#d9f3dd",
        "diffRemoved": "#ffe4e1",
        "border": "#e5e5e5",
        "input": "#929292",
        "ring": "#0a0a0a"
      }
    },
    "defaultMode": "dark",
    "label": "PaaS",
    "radius": {
      "none": 0,
      "sm": 4,
      "md": 8,
      "lg": 12,
      "xl": 16,
      "full": 9999
    },
    "typography": {
      "fontFamily": {
        "sans": "JetBrains Mono",
        "display": "JetBrains Mono",
        "mono": "JetBrains Mono"
      },
      "fontWeight": {
        "heading": 600,
        "display": 600,
        "body": 400,
        "caption": 500,
        "label": 600
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
        },
        "label": {
          "fontSize": 12,
          "lineHeight": 16.8
        }
      }
    }
  }
} as const;

/** Plain object for Tamagui's `createTokens`; this package does not depend on Tamagui. */
export const tamaguiTokens = {
  "color": {
    "backgroundDark": "#050505",
    "foregroundDark": "#fafafa",
    "cardDark": "#0a0a0a",
    "cardForegroundDark": "#fafafa",
    "popoverDark": "#0a0a0a",
    "popoverForegroundDark": "#fafafa",
    "primaryDark": "#fafafa",
    "primaryForegroundDark": "#171717",
    "secondaryDark": "#262626",
    "secondaryForegroundDark": "#fafafa",
    "mutedDark": "#262626",
    "mutedForegroundDark": "#a3a3a3",
    "accentDark": "#262626",
    "accentForegroundDark": "#fafafa",
    "destructiveDark": "#fa6961",
    "destructiveForegroundDark": "#171717",
    "successDark": "#4ed589",
    "successForegroundDark": "#171717",
    "warningDark": "#f0bb3b",
    "warningForegroundDark": "#171717",
    "infoDark": "#65b2f1",
    "infoForegroundDark": "#171717",
    "diffAddedDark": "#102b17",
    "diffRemovedDark": "#3b1816",
    "borderDark": "#262626",
    "inputDark": "#606060",
    "ringDark": "#d4d4d4",
    "backgroundLight": "#ffffff",
    "foregroundLight": "#0a0a0a",
    "cardLight": "#ffffff",
    "cardForegroundLight": "#0a0a0a",
    "popoverLight": "#ffffff",
    "popoverForegroundLight": "#0a0a0a",
    "primaryLight": "#171717",
    "primaryForegroundLight": "#fafafa",
    "secondaryLight": "#f5f5f5",
    "secondaryForegroundLight": "#171717",
    "mutedLight": "#f5f5f5",
    "mutedForegroundLight": "#6a6a6a",
    "accentLight": "#f5f5f5",
    "accentForegroundLight": "#171717",
    "destructiveLight": "#cf1f29",
    "destructiveForegroundLight": "#fafafa",
    "successLight": "#1e7546",
    "successForegroundLight": "#fafafa",
    "warningLight": "#825a27",
    "warningForegroundLight": "#fafafa",
    "infoLight": "#1762b6",
    "infoForegroundLight": "#fafafa",
    "diffAddedLight": "#d9f3dd",
    "diffRemovedLight": "#ffe4e1",
    "borderLight": "#e5e5e5",
    "inputLight": "#929292",
    "ringLight": "#0a0a0a"
  },
  "radius": {
    "none": 0,
    "sm": 4,
    "md": 8,
    "lg": 12,
    "xl": 16,
    "full": 9999
  },
  "size": {
    "1": 4,
    "2": 8,
    "3": 12,
    "4": 16,
    "5": 20,
    "6": 24,
    "8": 32,
    "10": 40,
    "12": 48,
    "16": 64
  },
  "space": {
    "1": 4,
    "2": 8,
    "3": 12,
    "4": 16,
    "5": 20,
    "6": 24,
    "8": 32,
    "10": 40,
    "12": 48,
    "16": 64
  },
  "zIndex": {
    "0": 0,
    "1": 100,
    "2": 200,
    "3": 300,
    "4": 400,
    "5": 500
  }
} as const;

/** Plain object for Tamagui's `createTamagui({ themes })`, keyed `<theme>_<mode>`. */
export const tamaguiThemes = {
  "maia_dark": {
    "background": "#000000",
    "color": "#ffffff",
    "card": "#0c0c0c",
    "cardForeground": "#ffffff",
    "popover": "#0c0c0c",
    "popoverForeground": "#ffffff",
    "primary": "#f46cbf",
    "primaryForeground": "#000000",
    "secondary": "#262626",
    "secondaryForeground": "#fafafa",
    "muted": "#161616",
    "mutedForeground": "#a4a4a4",
    "accent": "#161616",
    "accentForeground": "#ffffff",
    "destructive": "#f97770",
    "destructiveForeground": "#000000",
    "success": "#56d57b",
    "successForeground": "#000000",
    "warning": "#edb345",
    "warningForeground": "#000000",
    "info": "#76acfc",
    "infoForeground": "#000000",
    "diffAdded": "#112b19",
    "diffRemoved": "#321816",
    "borderColor": "#2e2e2e",
    "input": "#696969",
    "ring": "#d4d4d4",
    "placeholderColor": "#a4a4a4"
  },
  "maia_light": {
    "background": "#ffffff",
    "color": "#000000",
    "card": "#fafafa",
    "cardForeground": "#000000",
    "popover": "#fafafa",
    "popoverForeground": "#000000",
    "primary": "#be148b",
    "primaryForeground": "#ffffff",
    "secondary": "#f5f5f5",
    "secondaryForeground": "#171717",
    "muted": "#f5f5f5",
    "mutedForeground": "#636363",
    "accent": "#f5f5f5",
    "accentForeground": "#000000",
    "destructive": "#be2323",
    "destructiveForeground": "#ffffff",
    "success": "#0a7e3a",
    "successForeground": "#ffffff",
    "warning": "#945f0e",
    "warningForeground": "#ffffff",
    "info": "#145ec1",
    "infoForeground": "#ffffff",
    "diffAdded": "#e2f0e7",
    "diffRemoved": "#f7e5e5",
    "borderColor": "#e4e4e4",
    "input": "#868686",
    "ring": "#0a0a0a",
    "placeholderColor": "#636363"
  },
  "paas_dark": {
    "background": "#000000",
    "color": "#fafafa",
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
    "destructive": "#fa6961",
    "destructiveForeground": "#171717",
    "success": "#4ed589",
    "successForeground": "#171717",
    "warning": "#f0bb3b",
    "warningForeground": "#171717",
    "info": "#65b2f1",
    "infoForeground": "#171717",
    "diffAdded": "#102b17",
    "diffRemoved": "#3b1816",
    "borderColor": "#262626",
    "input": "#606060",
    "ring": "#d4d4d4",
    "placeholderColor": "#a3a3a3"
  },
  "paas_light": {
    "background": "#ffffff",
    "color": "#0a0a0a",
    "card": "#ffffff",
    "cardForeground": "#0a0a0a",
    "popover": "#ffffff",
    "popoverForeground": "#0a0a0a",
    "primary": "#171717",
    "primaryForeground": "#fafafa",
    "secondary": "#f5f5f5",
    "secondaryForeground": "#171717",
    "muted": "#f5f5f5",
    "mutedForeground": "#6a6a6a",
    "accent": "#f5f5f5",
    "accentForeground": "#171717",
    "destructive": "#cf1f29",
    "destructiveForeground": "#fafafa",
    "success": "#1e7546",
    "successForeground": "#fafafa",
    "warning": "#825a27",
    "warningForeground": "#fafafa",
    "info": "#1762b6",
    "infoForeground": "#fafafa",
    "diffAdded": "#d9f3dd",
    "diffRemoved": "#ffe4e1",
    "borderColor": "#e5e5e5",
    "input": "#929292",
    "ring": "#0a0a0a",
    "placeholderColor": "#6a6a6a"
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
export type ProductThemeName = keyof typeof productThemes;
export type TamaguiThemeName = keyof typeof tamaguiThemes;

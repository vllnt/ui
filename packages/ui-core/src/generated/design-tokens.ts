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
        "light": "0 0 0",
        "dark": "1 0 0",
        "role": "Primary text and icon color"
      },
      "card": {
        "cssVariable": "--card",
        "light": "1 0 0",
        "dark": "0 0 0",
        "role": "Card and contained surface"
      },
      "cardForeground": {
        "cssVariable": "--card-foreground",
        "light": "0 0 0",
        "dark": "1 0 0",
        "role": "Text on card surfaces"
      },
      "popover": {
        "cssVariable": "--popover",
        "light": "1 0 0",
        "dark": "0.1448 0 0",
        "role": "Popover, menu, and floating surface"
      },
      "popoverForeground": {
        "cssVariable": "--popover-foreground",
        "light": "0 0 0",
        "dark": "0.9461 0 0",
        "role": "Text on popover surfaces"
      },
      "primary": {
        "cssVariable": "--primary",
        "light": "0 0 0",
        "dark": "1 0 0",
        "role": "Primary action surface"
      },
      "primaryForeground": {
        "cssVariable": "--primary-foreground",
        "light": "1 0 0",
        "dark": "0 0 0",
        "role": "Text on primary action surfaces"
      },
      "secondary": {
        "cssVariable": "--secondary",
        "light": "0.9703 0 0",
        "dark": "0.1913 0 0",
        "role": "Secondary action surface"
      },
      "secondaryForeground": {
        "cssVariable": "--secondary-foreground",
        "light": "0.2044 0 0",
        "dark": "0.9461 0 0",
        "role": "Text on secondary action surfaces"
      },
      "muted": {
        "cssVariable": "--muted",
        "light": "0.9703 0 0",
        "dark": "0.1913 0 0",
        "role": "Subtle surface"
      },
      "mutedForeground": {
        "cssVariable": "--muted-foreground",
        "light": "0.525 0 0",
        "dark": "0.6334 0 0",
        "role": "Secondary text"
      },
      "accent": {
        "cssVariable": "--accent",
        "light": "0.9703 0 0",
        "dark": "0.209 0 0",
        "role": "Hover and active surface"
      },
      "accentForeground": {
        "cssVariable": "--accent-foreground",
        "light": "0.2044 0 0",
        "dark": "0.9461 0 0",
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
        "dark": "0.235 0 0",
        "role": "Hairline divider"
      },
      "input": {
        "cssVariable": "--input",
        "light": "0.6167 0 0",
        "dark": "0.5208 0 0",
        "role": "Form-control boundary (3:1 against background, card, popover)"
      },
      "ring": {
        "cssVariable": "--ring",
        "light": "0.1445 0 0",
        "dark": "0.8697 0 0",
        "role": "Focus ring"
      },
      "sidebar": {
        "cssVariable": "--sidebar",
        "light": "0.9848 0 0",
        "dark": "0.1448 0 0",
        "role": "Sidebar and rail surface"
      },
      "pill": {
        "cssVariable": "--pill",
        "light": "0.9703 0 0",
        "dark": "0.1913 0 0",
        "role": "Fill of a pill: inline code and small tags"
      },
      "pillBorder": {
        "cssVariable": "--pill-border",
        "light": "0.9219 0 0",
        "dark": "0.2686 0 0",
        "role": "1px border of a pill"
      },
      "composerBorder": {
        "cssVariable": "--composer-border",
        "light": "0.8699 0 0",
        "dark": "0.285 0 0",
        "role": "Border of a composer, the message input box"
      },
      "statusNeedsYou": {
        "cssVariable": "--status-needs-you",
        "light": "0.554 0.135 66.44",
        "dark": "0.795 0.162 86.05",
        "role": "Status mark: waiting for the person (yellow). A mark, not text"
      },
      "statusUnread": {
        "cssVariable": "--status-unread",
        "light": "0.546 0.215 262.88",
        "dark": "0.623 0.188 259.81",
        "role": "Status mark: unread (blue). A mark, not text"
      },
      "statusFailed": {
        "cssVariable": "--status-failed",
        "light": "0.577 0.215 27.33",
        "dark": "0.637 0.208 25.33",
        "role": "Status mark: failed (red). A mark, not text; red text uses destructive"
      },
      "statusDone": {
        "cssVariable": "--status-done",
        "light": "0.527 0.137 150.07",
        "dark": "0.723 0.219 149.58",
        "role": "Status mark: done (green). A mark, not text"
      },
      "statusRing": {
        "cssVariable": "--status-ring",
        "light": "0.556 0 0",
        "dark": "0.715 0 0",
        "role": "Status mark: idle ring (grey). A mark, not text"
      }
    },
    "glass-border": {
      "light": "#00000024",
      "dark": "#FFFFFF2E",
      "role": "Hairline of a glass surface, with alpha. Material token material.glass.hairline points at it"
    },
    "glass-input": {
      "light": "0.464 0 0",
      "dark": "0.7155 0 0",
      "role": "Control boundary inside a glass surface (3:1 against the glass over a white, black or mid backdrop). Replaces input within glass"
    },
    "glass-muted-foreground": {
      "light": "0.3715 0 0",
      "dark": "0.8699 0 0",
      "role": "Secondary text inside a glass surface (4.5:1 against the glass over a white, black or mid backdrop). Replaces muted-foreground within glass"
    },
    "badge-label": {
      "danger": {
        "value": "{color.destructive}",
        "role": "Penpot name for a danger Badge label colour. Web code reads the destructive role directly"
      },
      "info": {
        "value": "{color.info}",
        "role": "Penpot name for an info Badge label colour. Web code reads the info role directly"
      },
      "success": {
        "value": "{color.success}",
        "role": "Penpot name for a success Badge label colour. Web code reads the success role directly"
      },
      "warning": {
        "value": "{color.warning}",
        "role": "Penpot name for a warning Badge label colour. Web code reads the warning role directly"
      }
    }
  },
  "brand": {
    "status": {
      "candidate": {
        "light": {
          "value": "{color.info}",
          "role": "Roadmap status: candidate (light)"
        },
        "dark": {
          "value": "{color.info}",
          "role": "Roadmap status: candidate (dark)"
        }
      },
      "deprecated": {
        "light": {
          "value": "{color.warning}",
          "role": "Roadmap status: deprecated (light)"
        },
        "dark": {
          "value": "{color.warning}",
          "role": "Roadmap status: deprecated (dark)"
        }
      },
      "implemented": {
        "light": {
          "value": "{color.success}",
          "role": "Roadmap status: implemented (light)"
        },
        "dark": {
          "value": "{color.success}",
          "role": "Roadmap status: implemented (dark)"
        }
      },
      "planned": {
        "light": {
          "value": "{color.muted-foreground}",
          "role": "Roadmap status: planned (light)"
        },
        "dark": {
          "value": "{color.muted-foreground}",
          "role": "Roadmap status: planned (dark)"
        }
      },
      "unsupported": {
        "light": {
          "value": "{color.destructive}",
          "role": "Roadmap status: unsupported (light)"
        },
        "dark": {
          "value": "{color.destructive}",
          "role": "Roadmap status: unsupported (dark)"
        }
      }
    }
  },
  "typography": {
    "fontFamily": {
      "sans": {
        "cssVariable": "--font-sans",
        "value": "'JetBrains Mono', ui-monospace, \"SF Mono\", SFMono-Regular, Menlo, Consolas, \"Liberation Mono\", monospace",
        "role": "Body + UI text. A monospace stack; no font file is shipped, so the app loads JetBrains Mono or the system face shows"
      },
      "display": {
        "cssVariable": "--font-display",
        "value": "var(--font-sans)",
        "role": "Heading + Display face — override per theme for a brand type identity (defaults to sans)"
      },
      "mono": {
        "cssVariable": "--font-mono",
        "value": "'JetBrains Mono', ui-monospace, \"SF Mono\", SFMono-Regular, Menlo, Consolas, \"Liberation Mono\", monospace",
        "role": "Code + tabular"
      }
    },
    "fontWeight": {
      "heading": {
        "cssVariable": "--font-weight-heading",
        "value": 500,
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
        "value": 400
      },
      "label": {
        "cssVariable": "--font-weight-label",
        "value": 500,
        "role": "Label weight — theme-overridable"
      }
    },
    "scale": {
      "display": {
        "cssVariable": "--font-size-display",
        "fontSize": "1.75rem",
        "lineHeight": "1.1",
        "lineHeightCssVariable": "--line-height-display"
      },
      "h1": {
        "cssVariable": "--font-size-h1",
        "fontSize": "1.25rem",
        "lineHeight": "1.3",
        "lineHeightCssVariable": "--line-height-h1"
      },
      "h2": {
        "cssVariable": "--font-size-h2",
        "fontSize": "0.875rem",
        "lineHeight": "1.4",
        "lineHeightCssVariable": "--line-height-h2"
      },
      "h3": {
        "cssVariable": "--font-size-h3",
        "fontSize": "0.8125rem",
        "lineHeight": "1.4",
        "lineHeightCssVariable": "--line-height-h3"
      },
      "h4": {
        "cssVariable": "--font-size-h4",
        "fontSize": "0.8125rem",
        "lineHeight": "1.4",
        "lineHeightCssVariable": "--line-height-h4"
      },
      "h5": {
        "cssVariable": "--font-size-h5",
        "fontSize": "0.8125rem",
        "lineHeight": "1.4",
        "lineHeightCssVariable": "--line-height-h5"
      },
      "h6": {
        "cssVariable": "--font-size-h6",
        "fontSize": "0.8125rem",
        "lineHeight": "1.4",
        "lineHeightCssVariable": "--line-height-h6"
      },
      "bodyLarge": {
        "cssVariable": "--font-size-body-lg",
        "fontSize": "0.9375rem",
        "lineHeight": "1.6",
        "lineHeightCssVariable": "--line-height-body-lg"
      },
      "body": {
        "cssVariable": "--font-size-body",
        "fontSize": "0.875rem",
        "lineHeight": "1.5",
        "lineHeightCssVariable": "--line-height-body"
      },
      "bodySmall": {
        "cssVariable": "--font-size-body-sm",
        "fontSize": "0.8125rem",
        "lineHeight": "1.45",
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
        "fontSize": "0.6875rem",
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
      "16": "4rem",
      "24": "6rem"
    },
    "page-gutter": {
      "value": "{spacing.5}",
      "role": "Horizontal page padding below 768 px (20)"
    },
    "page-gutter-tablet": {
      "value": "{spacing.12}",
      "role": "Horizontal page padding from 768 px (48)"
    },
    "page-gutter-desktop": {
      "value": "{spacing.24}",
      "role": "Horizontal page padding from 1200 px (96)"
    }
  },
  "radius": {
    "none": "0",
    "sm": "0.25rem",
    "md": "0.5rem",
    "lg": "0.75rem",
    "xl": "1rem",
    "full": "9999px",
    "control": "0.25rem",
    "surface": "0.375rem"
  },
  "size": {
    "control-xs": {
      "value": "2rem",
      "coarse": "{size.target.min}",
      "role": "Extra-small control height (32). Under a coarse pointer it rises to size.target.min"
    },
    "measure-narrow": {
      "value": "30rem",
      "role": "Narrow text column width (480), for rich text in a tight container"
    },
    "measure-prose": {
      "value": "45rem",
      "role": "Prose text column width (720), for lead copy and descriptions"
    },
    "page-max": {
      "value": "90rem",
      "role": "Maximum width of the page column (1440), centred; the gutters above are its side padding"
    },
    "target": {
      "min": {
        "value": "2.75rem",
        "role": "Minimum touch target (44). Interactive controls reach it under a coarse pointer"
      }
    }
  },
  "opacity": {
    "grain": {
      "value": "1",
      "role": "Opacity of a Surface grain layer when grain is on. Grain is opt-in; 0 hides it"
    },
    "contact": {
      "value": "1",
      "role": "Opacity of a Surface contact-shadow layer. 0 hides it"
    }
  },
  "elevation": {
    "none": "none",
    "sm": "0 1px 2px rgba(0, 0, 0, 0.05)",
    "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
  },
  "shadow": {
    "raised": {
      "role": "Shadow of a raised surface, the lowest step. None: depth is a border and a surface step, not a shadow",
      "light": [],
      "dark": []
    },
    "overlay": {
      "role": "Shadow of an overlay: dialog, command palette, popover, tooltip. None: an overlay is a solid surface with a border",
      "light": [],
      "dark": []
    },
    "floating": {
      "role": "Shadow of a floating surface, the highest step. None: a floating surface is a solid surface with a border",
      "light": [],
      "dark": []
    },
    "glass": {
      "role": "Two-layer shadow of a glass part: bars, panels, cards, chips",
      "light": [
        {
          "offsetX": "0",
          "offsetY": "1",
          "blur": "2",
          "spread": "0",
          "color": "#0000000D",
          "inset": false
        },
        {
          "offsetX": "0",
          "offsetY": "4",
          "blur": "14",
          "spread": "0",
          "color": "#0000000F",
          "inset": false
        }
      ],
      "dark": [
        {
          "offsetX": "0",
          "offsetY": "1",
          "blur": "2",
          "spread": "0",
          "color": "#00000066",
          "inset": false
        },
        {
          "offsetX": "0",
          "offsetY": "4",
          "blur": "14",
          "spread": "0",
          "color": "#0000004D",
          "inset": false
        }
      ]
    },
    "glass-floating": {
      "role": "Stronger two-layer shadow of a floating glass part: docks, menus, popovers, dialogs, sheets",
      "light": [
        {
          "offsetX": "0",
          "offsetY": "1",
          "blur": "2",
          "spread": "0",
          "color": "#00000014",
          "inset": false
        },
        {
          "offsetX": "0",
          "offsetY": "10",
          "blur": "28",
          "spread": "0",
          "color": "#0000001F",
          "inset": false
        }
      ],
      "dark": [
        {
          "offsetX": "0",
          "offsetY": "1",
          "blur": "2",
          "spread": "0",
          "color": "#00000080",
          "inset": false
        },
        {
          "offsetX": "0",
          "offsetY": "10",
          "blur": "28",
          "spread": "0",
          "color": "#00000080",
          "inset": false
        }
      ]
    }
  },
  "blur": {
    "glass": {
      "sm": {
        "value": "8px",
        "role": "Backdrop blur radius of a small glass layer: scrims, chips, tracks (8)"
      },
      "md": {
        "value": "12px",
        "role": "Backdrop blur radius of a medium glass layer: cards, overlays on content (12)"
      },
      "lg": {
        "value": "24px",
        "role": "Backdrop blur radius of the budget ceiling (24): no glass layer blurs more"
      },
      "default": {
        "value": "20px",
        "role": "Backdrop blur radius of a glass part: panels, bars, menus, dialogs (20). Mirrors the backgroundBlur 20 of the Penpot Glass board"
      }
    }
  },
  "material": {
    "glass": {
      "opacity": {
        "sm": {
          "value": "0.6",
          "role": "Glass tint opacity, step sm. Not for text-bearing surfaces"
        },
        "md": {
          "value": "0.72",
          "role": "Glass tint opacity, step md"
        },
        "lg": {
          "value": "0.82",
          "role": "Glass tint opacity, step lg. The floor for text on glass over a worst-case backdrop"
        },
        "xl": {
          "value": "0.9",
          "role": "Glass tint opacity, step xl: floating surfaces"
        },
        "default": {
          "value": "{material.glass.opacity.lg}",
          "role": "Glass tint opacity of a surface that does not pick a step"
        }
      },
      "tint": {
        "value": "{color.background}",
        "role": "Glass tint colour: the page background, drawn at a glass opacity"
      },
      "highlight": {
        "value": "{material.highlight.top}",
        "role": "1 px light line along the top edge of a glass surface"
      },
      "hairline": {
        "value": "{color.glass-border}",
        "role": "Border colour of a glass surface"
      },
      "tint-top": {
        "light": "#FFFFFFA3",
        "dark": "#1C1C1CB2",
        "role": "Default glass tint, top stop. Foreground text only: no muted text, placeholder or control border. Dark is #1C1C1CB2, not the first recipe draft's #1C1C1CAF, so foreground text keeps 4.5:1 over a white backdrop (4.51:1, against 4.34:1)"
      },
      "tint-bottom": {
        "light": "#FFFFFF80",
        "dark": "#1414149C",
        "role": "Default glass tint, bottom stop. Dark is #1414149C, not the first recipe draft's #14141499, for the same reason"
      },
      "tint-dense-top": {
        "light": "#FFFFFFE6",
        "dark": "#121212E0",
        "role": "Dense glass tint, top stop: panels with body text, muted text, a placeholder or a control-identifying border"
      },
      "tint-dense-bottom": {
        "light": "#FFFFFFD6",
        "dark": "#121212D1",
        "role": "Dense glass tint, bottom stop"
      },
      "hairline-edge": {
        "light": "#00000014",
        "dark": "#FFFFFF1A",
        "role": "Outer 1 px edge of a glass part, ink 8% on light and white 10% on dark. Decorative only: a control border uses color.glass-input"
      },
      "sheen-opacity": {
        "light": "1",
        "dark": "0.17",
        "role": "Opacity of the white sheen drawn over the tint: the specular gradient and the inner highlight. Dark scales the light values by 0.17"
      }
    },
    "highlight": {
      "top": {
        "light": "#FFFFFFCC",
        "dark": "#FFFFFF2E",
        "role": "Top edge highlight of a glass surface, with alpha"
      }
    },
    "solid": {
      "material.glass.opacity.sm": "1",
      "material.glass.opacity.md": "1",
      "material.glass.opacity.lg": "1",
      "material.glass.opacity.xl": "1",
      "material.glass.tint": "{color.card}",
      "material.glass.highlight": "{color.border}",
      "material.glass.hairline": "{color.border}",
      "material.glass.tint-top": "{color.card}",
      "material.glass.tint-bottom": "{color.card}",
      "material.glass.tint-dense-top": "{color.card}",
      "material.glass.tint-dense-bottom": "{color.card}",
      "material.glass.hairline-edge": "{color.border}",
      "material.glass.sheen-opacity": "0",
      "shadow.glass": "{shadow.raised}",
      "shadow.glass-floating": "{shadow.floating}",
      "blur.glass.sm": "0px",
      "blur.glass.md": "0px",
      "blur.glass.lg": "0px",
      "blur.glass.default": "0px"
    }
  },
  "depth": {
    "z-0": {
      "offset": {
        "value": "0px",
        "role": "Depth step 0 offset: flat, on the page"
      },
      "shadow": {
        "value": "none",
        "role": "Depth step 0 shadow: none"
      },
      "tint": {
        "value": "{material.glass.opacity.default}",
        "role": "Depth step 0 glass tint opacity"
      }
    },
    "z-1": {
      "offset": {
        "value": "2px",
        "role": "Depth step 1 offset: raised surface"
      },
      "shadow": {
        "value": "{shadow.raised}",
        "role": "Depth step 1 shadow"
      },
      "tint": {
        "value": "{material.glass.opacity.default}",
        "role": "Depth step 1 glass tint opacity"
      }
    },
    "z-2": {
      "offset": {
        "value": "8px",
        "role": "Depth step 2 offset: overlay (dialog, popover, menu)"
      },
      "shadow": {
        "value": "{shadow.overlay}",
        "role": "Depth step 2 shadow"
      },
      "tint": {
        "value": "{material.glass.opacity.default}",
        "role": "Depth step 2 glass tint opacity"
      }
    },
    "z-3": {
      "offset": {
        "value": "16px",
        "role": "Depth step 3 offset: floating surface (dock, floating bar)"
      },
      "shadow": {
        "value": "{shadow.floating}",
        "role": "Depth step 3 shadow"
      },
      "tint": {
        "value": "{material.glass.opacity.xl}",
        "role": "Depth step 3 glass tint opacity"
      }
    },
    "z-4": {
      "offset": {
        "value": "32px",
        "role": "Depth step 4 offset: topmost surface"
      },
      "shadow": {
        "value": "{shadow.floating}",
        "role": "Depth step 4 shadow"
      },
      "tint": {
        "value": "{material.glass.opacity.xl}",
        "role": "Depth step 4 glass tint opacity"
      }
    }
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
      "description": "Maia product theme. It equals the core default and overrides nothing: the flat monochrome workbench look is the default. The theme is kept so data-theme=\"maia\" stays valid."
    },
    "paas": {
      "label": "PaaS",
      "description": "PaaS product theme: core neutral and status colours with JetBrains Mono for every face. Dark is the design default; light stays supported.",
      "defaultMode": "dark",
      "opacity": {
        "grain": "0",
        "contact": "0"
      },
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
        "secondary",
        "soft"
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
      "foreground": "#ffffff",
      "card": "#0a0a0a",
      "cardForeground": "#ffffff",
      "popover": "#0a0a0a",
      "popoverForeground": "#ededed",
      "primary": "#ffffff",
      "primaryForeground": "#000000",
      "secondary": "#141414",
      "secondaryForeground": "#ededed",
      "muted": "#262626",
      "mutedForeground": "#a3a3a3",
      "accent": "#181818",
      "accentForeground": "#ededed",
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
      "border": "#1e1e1e",
      "input": "#696969",
      "ring": "#d4d4d4",
      "sidebar": "#0a0a0a",
      "pill": "#141414",
      "pillBorder": "#262626",
      "composerBorder": "#2a2a2a",
      "statusNeedsYou": "#eab305",
      "statusUnread": "#3b82f6",
      "statusFailed": "#ef4444",
      "statusDone": "#00c950",
      "statusRing": "#a3a3a3"
    },
    "light": {
      "background": "#ffffff",
      "foreground": "#000000",
      "card": "#ffffff",
      "cardForeground": "#000000",
      "popover": "#ffffff",
      "popoverForeground": "#000000",
      "primary": "#000000",
      "primaryForeground": "#ffffff",
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
      "input": "#858585",
      "ring": "#0a0a0a",
      "sidebar": "#fafafa",
      "pill": "#f5f5f5",
      "pillBorder": "#e5e5e5",
      "composerBorder": "#d4d4d4",
      "statusNeedsYou": "#a65f00",
      "statusUnread": "#2563eb",
      "statusFailed": "#dc2626",
      "statusDone": "#15803d",
      "statusRing": "#737373"
    }
  },
  "glass": {
    "dark": {
      "blur": {
        "sm": 8,
        "md": 12,
        "lg": 24,
        "default": 20
      },
      "foreground": "#ffffff",
      "hairline": "#ffffff2e",
      "input": "#a3a3a3",
      "mutedForeground": "#d4d4d4",
      "shadow": {
        "glass": {
          "elevation": 6,
          "shadowColor": "#000000",
          "shadowOffset": {
            "height": 4,
            "width": 0
          },
          "shadowOpacity": 0.302,
          "shadowRadius": 7
        },
        "glassFloating": {
          "elevation": 12,
          "shadowColor": "#000000",
          "shadowOffset": {
            "height": 10,
            "width": 0
          },
          "shadowOpacity": 0.502,
          "shadowRadius": 14
        }
      },
      "tint": {
        "top": "#1c1c1cb2",
        "bottom": "#1414149c",
        "denseTop": "#121212e0",
        "denseBottom": "#121212d1"
      },
      "solid": {
        "blur": {
          "sm": 0,
          "md": 0,
          "lg": 0,
          "default": 0
        },
        "foreground": "#ffffff",
        "hairline": "#1e1e1e",
        "input": "#696969",
        "mutedForeground": "#a3a3a3",
        "shadow": {
          "glass": {
            "elevation": 0,
            "shadowColor": "#000000",
            "shadowOffset": {
              "height": 0,
              "width": 0
            },
            "shadowOpacity": 0,
            "shadowRadius": 0
          },
          "glassFloating": {
            "elevation": 0,
            "shadowColor": "#000000",
            "shadowOffset": {
              "height": 0,
              "width": 0
            },
            "shadowOpacity": 0,
            "shadowRadius": 0
          }
        },
        "tint": {
          "top": "#0a0a0a",
          "bottom": "#0a0a0a",
          "denseTop": "#0a0a0a",
          "denseBottom": "#0a0a0a"
        }
      }
    },
    "light": {
      "blur": {
        "sm": 8,
        "md": 12,
        "lg": 24,
        "default": 20
      },
      "foreground": "#000000",
      "hairline": "#00000024",
      "input": "#595959",
      "mutedForeground": "#404040",
      "shadow": {
        "glass": {
          "elevation": 6,
          "shadowColor": "#000000",
          "shadowOffset": {
            "height": 4,
            "width": 0
          },
          "shadowOpacity": 0.059,
          "shadowRadius": 7
        },
        "glassFloating": {
          "elevation": 12,
          "shadowColor": "#000000",
          "shadowOffset": {
            "height": 10,
            "width": 0
          },
          "shadowOpacity": 0.122,
          "shadowRadius": 14
        }
      },
      "tint": {
        "top": "#ffffffa3",
        "bottom": "#ffffff80",
        "denseTop": "#ffffffe6",
        "denseBottom": "#ffffffd6"
      },
      "solid": {
        "blur": {
          "sm": 0,
          "md": 0,
          "lg": 0,
          "default": 0
        },
        "foreground": "#000000",
        "hairline": "#e5e5e5",
        "input": "#858585",
        "mutedForeground": "#6a6a6a",
        "shadow": {
          "glass": {
            "elevation": 0,
            "shadowColor": "#000000",
            "shadowOffset": {
              "height": 0,
              "width": 0
            },
            "shadowOpacity": 0,
            "shadowRadius": 0
          },
          "glassFloating": {
            "elevation": 0,
            "shadowColor": "#000000",
            "shadowOffset": {
              "height": 0,
              "width": 0
            },
            "shadowOpacity": 0,
            "shadowRadius": 0
          }
        },
        "tint": {
          "top": "#ffffff",
          "bottom": "#ffffff",
          "denseTop": "#ffffff",
          "denseBottom": "#ffffff"
        }
      }
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
    "full": 9999,
    "control": 4,
    "surface": 6
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
    "16": 64,
    "24": 96
  },
  "typography": {
    "fontWeight": {
      "heading": 500,
      "display": 600,
      "body": 400,
      "caption": 400,
      "label": 500
    },
    "scale": {
      "display": {
        "fontSize": 28,
        "lineHeight": 30.8
      },
      "h1": {
        "fontSize": 20,
        "lineHeight": 26
      },
      "h2": {
        "fontSize": 14,
        "lineHeight": 19.6
      },
      "h3": {
        "fontSize": 13,
        "lineHeight": 18.2
      },
      "h4": {
        "fontSize": 13,
        "lineHeight": 18.2
      },
      "h5": {
        "fontSize": 13,
        "lineHeight": 18.2
      },
      "h6": {
        "fontSize": 13,
        "lineHeight": 18.2
      },
      "bodyLarge": {
        "fontSize": 15,
        "lineHeight": 24
      },
      "body": {
        "fontSize": 14,
        "lineHeight": 21
      },
      "bodySmall": {
        "fontSize": 13,
        "lineHeight": 18.85
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
} as const;

/** Product themes resolved to native units: sRGB hex, points, primary font faces. */
export const productThemes = {
  "maia": {
    "colors": {
      "dark": {
        "background": "#000000",
        "foreground": "#ffffff",
        "card": "#000000",
        "cardForeground": "#ffffff",
        "popover": "#0a0a0a",
        "popoverForeground": "#ededed",
        "primary": "#ffffff",
        "primaryForeground": "#000000",
        "secondary": "#141414",
        "secondaryForeground": "#ededed",
        "muted": "#141414",
        "mutedForeground": "#8a8a8a",
        "accent": "#181818",
        "accentForeground": "#ededed",
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
        "border": "#1e1e1e",
        "input": "#696969",
        "ring": "#d4d4d4",
        "sidebar": "#0a0a0a",
        "pill": "#141414",
        "pillBorder": "#262626",
        "composerBorder": "#2a2a2a",
        "statusNeedsYou": "#eab305",
        "statusUnread": "#3b82f6",
        "statusFailed": "#ef4444",
        "statusDone": "#00c950",
        "statusRing": "#a3a3a3"
      },
      "light": {
        "background": "#ffffff",
        "foreground": "#000000",
        "card": "#ffffff",
        "cardForeground": "#000000",
        "popover": "#ffffff",
        "popoverForeground": "#000000",
        "primary": "#000000",
        "primaryForeground": "#ffffff",
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
        "input": "#858585",
        "ring": "#0a0a0a",
        "sidebar": "#fafafa",
        "pill": "#f5f5f5",
        "pillBorder": "#e5e5e5",
        "composerBorder": "#d4d4d4",
        "statusNeedsYou": "#a65f00",
        "statusUnread": "#2563eb",
        "statusFailed": "#dc2626",
        "statusDone": "#15803d",
        "statusRing": "#737373"
      }
    },
    "defaultMode": null,
    "label": "Maia",
    "radius": {
      "none": 0,
      "sm": 4,
      "md": 8,
      "lg": 12,
      "xl": 16,
      "full": 9999,
      "control": 4,
      "surface": 6
    },
    "typography": {
      "fontFamily": {
        "sans": "JetBrains Mono",
        "display": "JetBrains Mono",
        "mono": "JetBrains Mono"
      },
      "fontWeight": {
        "heading": 500,
        "display": 600,
        "body": 400,
        "caption": 400,
        "label": 500
      },
      "scale": {
        "display": {
          "fontSize": 28,
          "lineHeight": 30.8
        },
        "h1": {
          "fontSize": 20,
          "lineHeight": 26
        },
        "h2": {
          "fontSize": 14,
          "lineHeight": 19.6
        },
        "h3": {
          "fontSize": 13,
          "lineHeight": 18.2
        },
        "h4": {
          "fontSize": 13,
          "lineHeight": 18.2
        },
        "h5": {
          "fontSize": 13,
          "lineHeight": 18.2
        },
        "h6": {
          "fontSize": 13,
          "lineHeight": 18.2
        },
        "bodyLarge": {
          "fontSize": 15,
          "lineHeight": 24
        },
        "body": {
          "fontSize": 14,
          "lineHeight": 21
        },
        "bodySmall": {
          "fontSize": 13,
          "lineHeight": 18.85
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
        "foreground": "#ffffff",
        "card": "#000000",
        "cardForeground": "#ffffff",
        "popover": "#0a0a0a",
        "popoverForeground": "#ededed",
        "primary": "#ffffff",
        "primaryForeground": "#000000",
        "secondary": "#141414",
        "secondaryForeground": "#ededed",
        "muted": "#141414",
        "mutedForeground": "#8a8a8a",
        "accent": "#181818",
        "accentForeground": "#ededed",
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
        "border": "#1e1e1e",
        "input": "#696969",
        "ring": "#d4d4d4",
        "sidebar": "#0a0a0a",
        "pill": "#141414",
        "pillBorder": "#262626",
        "composerBorder": "#2a2a2a",
        "statusNeedsYou": "#eab305",
        "statusUnread": "#3b82f6",
        "statusFailed": "#ef4444",
        "statusDone": "#00c950",
        "statusRing": "#a3a3a3"
      },
      "light": {
        "background": "#ffffff",
        "foreground": "#000000",
        "card": "#ffffff",
        "cardForeground": "#000000",
        "popover": "#ffffff",
        "popoverForeground": "#000000",
        "primary": "#000000",
        "primaryForeground": "#ffffff",
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
        "input": "#858585",
        "ring": "#0a0a0a",
        "sidebar": "#fafafa",
        "pill": "#f5f5f5",
        "pillBorder": "#e5e5e5",
        "composerBorder": "#d4d4d4",
        "statusNeedsYou": "#a65f00",
        "statusUnread": "#2563eb",
        "statusFailed": "#dc2626",
        "statusDone": "#15803d",
        "statusRing": "#737373"
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
      "full": 9999,
      "control": 4,
      "surface": 6
    },
    "typography": {
      "fontFamily": {
        "sans": "JetBrains Mono",
        "display": "JetBrains Mono",
        "mono": "JetBrains Mono"
      },
      "fontWeight": {
        "heading": 500,
        "display": 600,
        "body": 400,
        "caption": 400,
        "label": 500
      },
      "scale": {
        "display": {
          "fontSize": 28,
          "lineHeight": 30.8
        },
        "h1": {
          "fontSize": 20,
          "lineHeight": 26
        },
        "h2": {
          "fontSize": 14,
          "lineHeight": 19.6
        },
        "h3": {
          "fontSize": 13,
          "lineHeight": 18.2
        },
        "h4": {
          "fontSize": 13,
          "lineHeight": 18.2
        },
        "h5": {
          "fontSize": 13,
          "lineHeight": 18.2
        },
        "h6": {
          "fontSize": 13,
          "lineHeight": 18.2
        },
        "bodyLarge": {
          "fontSize": 15,
          "lineHeight": 24
        },
        "body": {
          "fontSize": 14,
          "lineHeight": 21
        },
        "bodySmall": {
          "fontSize": 13,
          "lineHeight": 18.85
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
  }
} as const;

/** Plain object for Tamagui's `createTokens`; this package does not depend on Tamagui. */
export const tamaguiTokens = {
  "color": {
    "backgroundDark": "#050505",
    "foregroundDark": "#ffffff",
    "cardDark": "#0a0a0a",
    "cardForegroundDark": "#ffffff",
    "popoverDark": "#0a0a0a",
    "popoverForegroundDark": "#ededed",
    "primaryDark": "#ffffff",
    "primaryForegroundDark": "#000000",
    "secondaryDark": "#141414",
    "secondaryForegroundDark": "#ededed",
    "mutedDark": "#262626",
    "mutedForegroundDark": "#a3a3a3",
    "accentDark": "#181818",
    "accentForegroundDark": "#ededed",
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
    "borderDark": "#1e1e1e",
    "inputDark": "#696969",
    "ringDark": "#d4d4d4",
    "sidebarDark": "#0a0a0a",
    "pillDark": "#141414",
    "pillBorderDark": "#262626",
    "composerBorderDark": "#2a2a2a",
    "statusNeedsYouDark": "#eab305",
    "statusUnreadDark": "#3b82f6",
    "statusFailedDark": "#ef4444",
    "statusDoneDark": "#00c950",
    "statusRingDark": "#a3a3a3",
    "backgroundLight": "#ffffff",
    "foregroundLight": "#000000",
    "cardLight": "#ffffff",
    "cardForegroundLight": "#000000",
    "popoverLight": "#ffffff",
    "popoverForegroundLight": "#000000",
    "primaryLight": "#000000",
    "primaryForegroundLight": "#ffffff",
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
    "inputLight": "#858585",
    "ringLight": "#0a0a0a",
    "sidebarLight": "#fafafa",
    "pillLight": "#f5f5f5",
    "pillBorderLight": "#e5e5e5",
    "composerBorderLight": "#d4d4d4",
    "statusNeedsYouLight": "#a65f00",
    "statusUnreadLight": "#2563eb",
    "statusFailedLight": "#dc2626",
    "statusDoneLight": "#15803d",
    "statusRingLight": "#737373"
  },
  "radius": {
    "none": 0,
    "sm": 4,
    "md": 8,
    "lg": 12,
    "xl": 16,
    "full": 9999,
    "control": 4,
    "surface": 6
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
    "16": 64,
    "24": 96
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
    "16": 64,
    "24": 96
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
    "card": "#000000",
    "cardForeground": "#ffffff",
    "popover": "#0a0a0a",
    "popoverForeground": "#ededed",
    "primary": "#ffffff",
    "primaryForeground": "#000000",
    "secondary": "#141414",
    "secondaryForeground": "#ededed",
    "muted": "#141414",
    "mutedForeground": "#8a8a8a",
    "accent": "#181818",
    "accentForeground": "#ededed",
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
    "borderColor": "#1e1e1e",
    "input": "#696969",
    "ring": "#d4d4d4",
    "sidebar": "#0a0a0a",
    "pill": "#141414",
    "pillBorder": "#262626",
    "composerBorder": "#2a2a2a",
    "statusNeedsYou": "#eab305",
    "statusUnread": "#3b82f6",
    "statusFailed": "#ef4444",
    "statusDone": "#00c950",
    "statusRing": "#a3a3a3",
    "placeholderColor": "#8a8a8a"
  },
  "maia_light": {
    "background": "#ffffff",
    "color": "#000000",
    "card": "#ffffff",
    "cardForeground": "#000000",
    "popover": "#ffffff",
    "popoverForeground": "#000000",
    "primary": "#000000",
    "primaryForeground": "#ffffff",
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
    "input": "#858585",
    "ring": "#0a0a0a",
    "sidebar": "#fafafa",
    "pill": "#f5f5f5",
    "pillBorder": "#e5e5e5",
    "composerBorder": "#d4d4d4",
    "statusNeedsYou": "#a65f00",
    "statusUnread": "#2563eb",
    "statusFailed": "#dc2626",
    "statusDone": "#15803d",
    "statusRing": "#737373",
    "placeholderColor": "#6a6a6a"
  },
  "paas_dark": {
    "background": "#000000",
    "color": "#ffffff",
    "card": "#000000",
    "cardForeground": "#ffffff",
    "popover": "#0a0a0a",
    "popoverForeground": "#ededed",
    "primary": "#ffffff",
    "primaryForeground": "#000000",
    "secondary": "#141414",
    "secondaryForeground": "#ededed",
    "muted": "#141414",
    "mutedForeground": "#8a8a8a",
    "accent": "#181818",
    "accentForeground": "#ededed",
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
    "borderColor": "#1e1e1e",
    "input": "#696969",
    "ring": "#d4d4d4",
    "sidebar": "#0a0a0a",
    "pill": "#141414",
    "pillBorder": "#262626",
    "composerBorder": "#2a2a2a",
    "statusNeedsYou": "#eab305",
    "statusUnread": "#3b82f6",
    "statusFailed": "#ef4444",
    "statusDone": "#00c950",
    "statusRing": "#a3a3a3",
    "placeholderColor": "#8a8a8a"
  },
  "paas_light": {
    "background": "#ffffff",
    "color": "#000000",
    "card": "#ffffff",
    "cardForeground": "#000000",
    "popover": "#ffffff",
    "popoverForeground": "#000000",
    "primary": "#000000",
    "primaryForeground": "#ffffff",
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
    "input": "#858585",
    "ring": "#0a0a0a",
    "sidebar": "#fafafa",
    "pill": "#f5f5f5",
    "pillBorder": "#e5e5e5",
    "composerBorder": "#d4d4d4",
    "statusNeedsYou": "#a65f00",
    "statusUnread": "#2563eb",
    "statusFailed": "#dc2626",
    "statusDone": "#15803d",
    "statusRing": "#737373",
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

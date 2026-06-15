type OGTemplate = {
  descriptionMaxLength?: number;
  footerLabel?: string;
  showCategory: boolean;
  titleMaxLength: number;
  titleSize: number;
};

/**
 * The valid OG image types. Single source of truth — the Zod schemas in
 * lib/og.ts and lib/schemas.ts derive their enums from this tuple, and
 * OG_TEMPLATES must provide a template per entry.
 */
export const OG_TYPES = ["home", "component", "docs", "page"] as const;

export type OGTemplateType = (typeof OG_TYPES)[number];

function isOGTemplateType(type: string): type is OGTemplateType {
  return (OG_TYPES as readonly string[]).includes(type);
}

const DESCRIPTION_MAX = 120;
const TITLE_MAX_LARGE = 25;
const TITLE_MAX_SMALL = 30;

const OG_TEMPLATES = {
  component: {
    descriptionMaxLength: DESCRIPTION_MAX,
    footerLabel: "COMPONENT",
    showCategory: true,
    titleMaxLength: TITLE_MAX_SMALL,
    titleSize: 140,
  },
  docs: {
    descriptionMaxLength: DESCRIPTION_MAX,
    footerLabel: "DOCS",
    showCategory: false,
    titleMaxLength: TITLE_MAX_LARGE,
    titleSize: 160,
  },
  home: {
    descriptionMaxLength: DESCRIPTION_MAX,
    footerLabel: undefined,
    showCategory: false,
    titleMaxLength: TITLE_MAX_LARGE,
    titleSize: 160,
  },
  page: {
    descriptionMaxLength: DESCRIPTION_MAX,
    footerLabel: undefined,
    showCategory: false,
    titleMaxLength: TITLE_MAX_LARGE,
    titleSize: 160,
  },
} satisfies Record<OGTemplateType, OGTemplate>;

export function getTemplate(type: string): OGTemplate {
  return isOGTemplateType(type) ? OG_TEMPLATES[type] : OG_TEMPLATES.page;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  const cutPoint = lastSpace > 0 ? lastSpace : maxLength;
  const clean = truncated.slice(0, cutPoint).replace(/[\s,.:;]+$/, "");

  return `${clean}...`;
}

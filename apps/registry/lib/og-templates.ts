type OGTemplate = {
  descriptionMaxLength?: number;
  footerLabel?: string;
  showCategory: boolean;
  titleMaxLength: number;
  titleSize: number;
};

const DESCRIPTION_MAX = 120;
const TITLE_MAX_LARGE = 25;
const TITLE_MAX_SMALL = 30;

export const OG_TEMPLATES = {
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
} satisfies Record<string, OGTemplate>;

export type OGTemplateType = keyof typeof OG_TEMPLATES;

export function getTemplate(type: string): OGTemplate {
  if (type in OG_TEMPLATES) {
    return OG_TEMPLATES[type as OGTemplateType];
  }
  return OG_TEMPLATES.page;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  const cutPoint = lastSpace > 0 ? lastSpace : maxLength;
  const clean = truncated.slice(0, cutPoint).replace(/[\s,.:;]+$/, "");

  return `${clean}...`;
}

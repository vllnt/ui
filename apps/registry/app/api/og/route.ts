import React from "react";

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "@/lib/og";
import {
  getTemplate,
  type OGTemplateType,
  truncateText,
} from "@/lib/og-templates";

const parametersSchema = z.object({
  category: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  title: z.string().min(1).max(200).default("VLLNT UI"),
  type: z.enum(["home", "component", "docs", "page"]).default("page"),
  url: z.string().max(200).optional(),
});

type ValidatedParameters = z.infer<typeof parametersSchema>;

function parseSearchParameters(
  searchParameters: URLSearchParams,
): Record<string, string> {
  return Object.fromEntries(
    [...searchParameters.entries()].filter(([, value]) => value),
  );
}

export const revalidate = 604_800;

const h = React.createElement;

function renderCategoryBadge(category: string): React.ReactElement {
  return h(
    "div",
    {
      style: {
        alignItems: "center",
        display: "flex",
        fontSize: 48,
        width: "100%",
      },
    },
    h(
      "span",
      {
        style: {
          border: "2px solid rgba(255, 255, 255, 0.3)",
          borderRadius: 9999,
          color: "rgba(255, 255, 255, 0.9)",
          padding: "12px 32px",
          textTransform: "capitalize" as const,
        },
      },
      category.replaceAll("-", " ").toLowerCase(),
    ),
  );
}

function renderTitle(title: string, fontSize: number): React.ReactElement {
  return h(
    "h1",
    {
      style: {
        color: "white",
        fontSize,
        letterSpacing: "-0.03em",
        lineHeight: 1.2,
        margin: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        width: "100%",
      },
    },
    title,
  );
}

function renderDescription(text: string): React.ReactElement {
  return h(
    "p",
    {
      style: {
        color: "rgba(255, 255, 255, 0.75)",
        fontSize: 64,
        lineHeight: 1.4,
        marginTop: 83,
      },
    },
    text,
  );
}

function renderMainContent(
  title: string,
  titleSize: number,
  description?: string,
): React.ReactElement {
  return h(
    "div",
    {
      style: {
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        maxWidth: 1600,
      },
    },
    renderTitle(title, titleSize),
    description ? renderDescription(description) : undefined,
  );
}

function renderFooterLabel(label: string): React.ReactElement {
  return h(
    "span",
    {
      style: {
        color: "rgba(255, 255, 255, 0.5)",
        fontSize: 42,
        letterSpacing: "0.15em",
      },
    },
    label,
  );
}

function renderFooter(footerLabel?: string): React.ReactElement {
  return h(
    "div",
    {
      style: {
        alignItems: "center",
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
      },
    },
    h(
      "span",
      { style: { color: "rgba(255, 255, 255, 0.8)", fontSize: 48 } },
      "ui.vllnt.com",
    ),
    footerLabel ? renderFooterLabel(footerLabel) : undefined,
  );
}

function renderOGElement(
  parameters: ValidatedParameters,
  templateType: OGTemplateType,
): React.ReactElement {
  const template = getTemplate(templateType);
  const displayTitle = truncateText(parameters.title, template.titleMaxLength);
  const displayDescription =
    parameters.description && template.descriptionMaxLength
      ? truncateText(parameters.description, template.descriptionMaxLength)
      : parameters.description;

  return h(
    "div",
    {
      style: {
        alignItems: "flex-start",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui, sans-serif",
        height: "100%",
        justifyContent: "space-between",
        padding: 120,
        width: "100%",
      },
    },
    template.showCategory && parameters.category
      ? renderCategoryBadge(parameters.category)
      : h("div", { style: { display: "flex" } }),
    renderMainContent(displayTitle, template.titleSize, displayDescription),
    renderFooter(template.footerLabel),
  );
}

function formatZodErrors(zodError: z.ZodError): string {
  return zodError.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");
}

function handleError(error: unknown): Response {
  if (error instanceof z.ZodError) {
    return new Response(`Invalid parameters: ${formatZodErrors(error)}`, {
      status: 400,
    });
  }
  return new Response(
    `Failed to generate image: ${error instanceof Error ? error.message : "Unknown error"}`,
    { status: 500 },
  );
}

export function GET(request: NextRequest): ImageResponse | Response {
  try {
    const { searchParams } = new URL(request.url);
    const raw = parseSearchParameters(searchParams);
    const parameters = parametersSchema.parse(raw);
    const element = renderOGElement(parameters, parameters.type);

    return new ImageResponse(element, {
      height: OG_IMAGE_HEIGHT,
      width: OG_IMAGE_WIDTH,
    });
  } catch (error) {
    return handleError(error);
  }
}

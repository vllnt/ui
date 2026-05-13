import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { isLocale, type Locale } from "@/i18n/routing";
import {
  getDescriptionSourceLocale,
  getLocalizedDescription,
} from "@/lib/registry-i18n";
import registryData from "@/registry.json";
import type { Registry, RegistryComponent } from "@/types/registry";

const registry = registryData as Registry;

type RouteParameters = {
  params: Promise<{ name: string }>;
};

async function readComponentFile(filePath: string) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const content = await readFile(fullPath, "utf8");
    return { content, path: filePath };
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return { content: "", path: filePath };
  }
}

function parseRegistryName(
  rawName: string,
): undefined | { componentName: string; locale?: Locale; overlay: boolean } {
  const overlayMatch = /^(.+)\.([a-z]{2}(?:-[A-Z]{2})?)\.json$/.exec(rawName);
  if (overlayMatch?.[1] && overlayMatch[2]) {
    if (!isLocale(overlayMatch[2])) return undefined;
    return {
      componentName: overlayMatch[1],
      locale: overlayMatch[2],
      overlay: true,
    };
  }

  return {
    componentName: rawName.endsWith(".json") ? rawName.slice(0, -5) : rawName,
    overlay: false,
  };
}

// eslint-disable-next-line @typescript-eslint/naming-convention, max-lines-per-function
export async function GET(_request: Request, routeParameters: RouteParameters) {
  try {
    const { name } = await routeParameters.params;
    const parsed = parseRegistryName(name);
    if (!parsed) {
      return NextResponse.json(
        { error: "Locale not supported" },
        { status: 404 },
      );
    }

    const component = registry.items.find(
      (item): item is RegistryComponent =>
        item.name === parsed.componentName &&
        item.type === "registry:component",
    );

    if (!component) {
      return NextResponse.json(
        { error: "Component not found" },
        { status: 404 },
      );
    }

    if (parsed.overlay) {
      const locale = parsed.locale;
      if (!locale) {
        return NextResponse.json(
          { error: "Locale not supported" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        canonical: `/r/${component.name}.json`,
        description: getLocalizedDescription(component, locale),
        locale,
        name: component.name,
        sourceLocale: getDescriptionSourceLocale(component, locale),
        title: component.title,
      });
    }

    const files = await Promise.all(
      component.files.map((file) => readComponentFile(file.path)),
    );

    return NextResponse.json({
      ...component,
      files,
    });
  } catch (error) {
    console.error("Error in registry route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

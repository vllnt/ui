import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

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

// eslint-disable-next-line @typescript-eslint/naming-convention
export async function GET(_request: Request, routeParameters: RouteParameters) {
  try {
    const { name } = await routeParameters.params;
    const component = registry.items.find(
      (item): item is RegistryComponent =>
        item.name === name && item.type === "registry:component",
    );

    if (!component) {
      return NextResponse.json(
        { error: "Component not found" },
        { status: 404 },
      );
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

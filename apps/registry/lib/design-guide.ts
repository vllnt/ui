import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type DesignGuideSection = {
  readonly id: string;
  readonly title: string;
};

const DESIGN_FILE_CANDIDATES = [
  path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../DESIGN.md",
  ),
  path.join(process.cwd(), "DESIGN.md"),
  path.join(process.cwd(), "..", "..", "DESIGN.md"),
];

export function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .replaceAll(/`|\*/g, "")
    .replaceAll(/[^\da-z]+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

export function extractDesignGuideSections(
  markdown: string,
): DesignGuideSection[] {
  return markdown
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => line.replace(/^##\s+/, "").trim())
    .filter(Boolean)
    .map((title) => ({ id: slugifyHeading(title), title }));
}

export async function getDesignGuideMarkdown(): Promise<string> {
  try {
    return await Promise.any(
      DESIGN_FILE_CANDIDATES.map(async (filePath) => {
        const content = await readFile(filePath, "utf8");
        return content.trim();
      }),
    );
  } catch {
    throw new Error("DESIGN.md could not be found");
  }
}

export { default as designTokens } from "../../../packages/design/tokens.json";

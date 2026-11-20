import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";
import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

import { AI_SEO } from "./ai-seo";
import {
  getCategoryDescription,
  groupedComponents,
} from "./component-categories";
import { COMPONENT_SEO } from "./component-seo";
import { getFamilyCopy } from "./family-copy";
import { listSearchCopy } from "./search-copy";
import { USE_CASES } from "./use-cases";

const EM_DASH = String.fromCodePoint(0x2014);
const CONTENT = fileURLToPath(new URL("../content", import.meta.url));
const META_KEY = /meta(?:title|description)$/i;
const EXTRA_META_KEYS = ["pages.families.description"];

type Text = { readonly label: string; readonly text: string };

function offenders(texts: readonly Text[]): string[] {
  return texts
    .filter(({ text }) => text.includes(EM_DASH))
    .map(({ label, text }) => `${label}: ${text.slice(0, 60)}`);
}

function messageTexts(
  locale: string,
  node: unknown,
  trail: readonly string[] = [],
): Text[] {
  if (typeof node === "string") {
    const key = trail.join(".");
    const emitted =
      META_KEY.test(trail.at(-1) ?? "") || EXTRA_META_KEYS.includes(key);

    return emitted ? [{ label: `${locale} ${key}`, text: node }] : [];
  }
  if (typeof node !== "object" || node === null) return [];

  return Object.entries(node).flatMap(([key, child]) =>
    messageTexts(locale, child, [...trail, key]),
  );
}

function mdxFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return mdxFiles(full);

    return entry.name.endsWith(".mdx") ? [full] : [];
  });
}

function frontmatterTexts(file: string): Text[] {
  const { data } = matter(readFileSync(file, "utf8"));
  const label = path.relative(CONTENT, file);
  const og: unknown = data.og;
  const values: unknown[] = [
    data.title,
    data.description,
    ...(typeof og === "object" && og !== null
      ? [Reflect.get(og, "title"), Reflect.get(og, "description")]
      : []),
  ];

  return values.flatMap((value) =>
    typeof value === "string" ? [{ label, text: value }] : [],
  );
}

/**
 * The brand rules ban the em dash in titles and meta descriptions. Each group
 * below is a source the site turns into a `<title>` or a meta description; the
 * route-level check in a real browser is `e2e/seo-no-em-dash.spec.ts`.
 */
describe("no em dash in emitted titles and descriptions", () => {
  it("covers every component and AI entry", () => {
    expect(COMPONENT_SEO.length).toBeGreaterThan(20);
    expect(AI_SEO.length).toBeGreaterThan(10);
    expect(
      offenders(
        [...COMPONENT_SEO, ...AI_SEO].flatMap((entry) => [
          { label: `${entry.slug} title`, text: entry.title },
          { label: `${entry.slug} description`, text: entry.description },
        ]),
      ),
    ).toEqual([]);
  });

  it("covers the search copy table", () => {
    expect(
      offenders(
        listSearchCopy().flatMap(([pathname, copy]) => [
          { label: `${pathname} title`, text: copy.title },
          { label: `${pathname} description`, text: copy.description },
        ]),
      ),
    ).toEqual([]);
  });

  it("covers use-case pages", () => {
    expect(
      offenders(
        USE_CASES.flatMap((useCase) => [
          { label: `${useCase.slug} title`, text: useCase.title },
          { label: `${useCase.slug} description`, text: useCase.description },
        ]),
      ),
    ).toEqual([]);
  });

  it("covers every family description", () => {
    const texts = groupedComponents.flatMap(({ category }) => [
      {
        label: `${category} intro`,
        text: getFamilyCopy(category)?.intro ?? "",
      },
      { label: `${category} blurb`, text: getCategoryDescription(category) },
    ]);

    expect(texts.length).toBeGreaterThan(10);
    expect(offenders(texts)).toEqual([]);
  });

  it("covers the meta title and description messages of both locales", () => {
    const texts = [...messageTexts("en", en), ...messageTexts("fr", fr)];

    expect(texts.length).toBeGreaterThan(20);
    expect(offenders(texts)).toEqual([]);
  });

  it("covers the frontmatter of every component and page MDX file", () => {
    const files = mdxFiles(CONTENT);
    const texts = files.flatMap(frontmatterTexts);

    expect(files.length).toBeGreaterThan(300);
    expect(offenders(texts)).toEqual([]);
  });
});

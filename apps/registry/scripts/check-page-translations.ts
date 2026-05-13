import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { defaultLocale, locales } from "../i18n/locales";

const pagesDirectory = join(process.cwd(), "content", "pages");

const slugs = readdirSync(pagesDirectory).filter((entry) => {
  const fullPath = join(pagesDirectory, entry);
  return statSync(fullPath).isDirectory();
});

let missingDefault = 0;
let warnings = 0;

for (const slug of slugs) {
  const defaultPath = join(pagesDirectory, slug, `${defaultLocale}.mdx`);
  if (!existsSync(defaultPath) || readFileSync(defaultPath, "utf8").trim() === "") {
    console.error(`Missing required ${defaultLocale} MDX for ${slug}`);
    missingDefault += 1;
    continue;
  }

  for (const locale of locales) {
    if (locale === defaultLocale) continue;

    const translatedPath = join(pagesDirectory, slug, `${locale}.mdx`);
    if (
      !existsSync(translatedPath) ||
      readFileSync(translatedPath, "utf8").trim() === ""
    ) {
      console.warn(
        `Missing ${locale} MDX for ${slug}; ${defaultLocale} fallback will be used.`,
      );
      warnings += 1;
    }
  }
}

if (warnings > 0) {
  console.warn(`${warnings} non-default translation warning(s).`);
}

if (missingDefault > 0) {
  process.exitCode = 1;
}

import { readFile } from "node:fs/promises";
import path from "node:path";

import type { ComponentSource } from "@/components/component-source-code";
import { type Locale, routing } from "@/i18n/routing";
import { getAiSeo } from "@/lib/ai-seo";
import type { ComponentContent } from "@/lib/component-content";
import { findComponentDirectory } from "@/lib/component-directory";
import { componentMeta } from "@/lib/component-meta";
import { type ComponentSeo, getComponentSeo } from "@/lib/component-seo";
import { generateOGImageURL } from "@/lib/og";
import type { PlatformContext } from "@/lib/platform";
import { registry, type RegistryComponent } from "@/lib/registry";
import { canonical } from "@/lib/seo";
import type { groupedComponents } from "@/lib/sidebar-sections";

export type FamilyGroup = (typeof groupedComponents)[number];

/** The copy a component page shows, resolved for one locale. */
export type ComponentCopy = {
  readonly componentSeo?: ComponentSeo;
  readonly displayDescription: string;
  readonly displayTitle: string;
  readonly seoCopy?: ComponentSeo;
  readonly whenToUse?: string;
};

/** Title, description and URLs shared by the header, JSON-LD and share bar. */
export type ComponentArticle = {
  readonly description: string;
  readonly keywords: ComponentContent["frontmatter"]["keywords"];
  readonly ogImage: string;
  readonly path: string;
  readonly title: string;
  readonly url: string;
};

type SourceLabels = {
  readonly react: string;
  readonly reactNative: string;
};

type NativeDescriptionValues = {
  readonly description: string;
  readonly title: string;
};

const CHART_COMPONENTS = new Set(["area-chart", "bar-chart", "line-chart"]);

const MAX_RELATED_COMPONENTS = 6;

/**
 * ai-seo / component-seo copy is hand-written English. It renders on the
 * default locale; other locales get the localized MDX body instead. (The
 * curated `related` slugs are language-neutral and always apply.)
 */
export function getComponentCopy(
  slug: string,
  component: RegistryComponent,
  locale: Locale,
): ComponentCopy {
  const meta = componentMeta[slug];
  const aiSeo = getAiSeo(slug);
  const componentSeo = getComponentSeo(slug);
  const isDefaultLocale = locale === routing.defaultLocale;
  const handWrittenDescription = isDefaultLocale
    ? (aiSeo?.description ?? componentSeo?.description)
    : undefined;

  return {
    componentSeo,
    displayDescription:
      handWrittenDescription ??
      meta?.description ??
      component.description ??
      "",
    displayTitle: meta?.title ?? component.title ?? component.name,
    seoCopy: isDefaultLocale ? componentSeo : undefined,
    whenToUse: isDefaultLocale ? aiSeo?.whenToUse : undefined,
  };
}

function componentOgImage(card: {
  readonly category?: string;
  readonly description: string;
  readonly title: string;
}): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.com";

  return `${siteUrl}${generateOGImageURL({ ...card, type: "component" })}`;
}

export function buildComponentArticle(input: {
  readonly category?: string;
  readonly component: RegistryComponent;
  readonly copy: ComponentCopy;
  /** Native components wrap the description in a localized sentence. */
  readonly describeNative: (values: NativeDescriptionValues) => string;
  readonly locale: Locale;
  readonly localized?: ComponentContent;
}): ComponentArticle {
  const { category, component, copy, describeNative, locale, localized } =
    input;
  const title = localized?.frontmatter.title ?? copy.displayTitle;
  const purposeDescription =
    localized?.frontmatter.description ?? copy.displayDescription;
  const description = component.native
    ? describeNative({ description: purposeDescription, title })
    : purposeDescription;
  const articlePath = `/components/${component.name}`;

  return {
    description,
    keywords: localized?.frontmatter.keywords,
    ogImage: componentOgImage({ category, description, title }),
    path: articlePath,
    title,
    url: canonical(articlePath, locale),
  };
}

async function readWebSource(componentName: string): Promise<string> {
  try {
    const componentDirectory = findComponentDirectory(
      path.join(
        process.cwd(),
        "..",
        "..",
        "packages",
        "ui",
        "src",
        "components",
      ),
      CHART_COMPONENTS.has(componentName) ? "chart" : componentName,
    );

    return componentDirectory
      ? await readFile(
          path.join(componentDirectory, `${componentName}.tsx`),
          "utf8",
        )
      : "";
  } catch {
    // Source file not found — skip code section
    return "";
  }
}

async function readNativeSource(component: RegistryComponent): Promise<string> {
  if (!component.native) return "";

  try {
    return await readFile(
      path.join(
        process.cwd(),
        "..",
        "..",
        "packages",
        "ui-native",
        component.native.source,
      ),
      "utf8",
    );
  } catch {
    // Native source file not found — leave the Web source without a platform tab.
    return "";
  }
}

/**
 * The browser preview stays on the Web implementation. Paired Native source is
 * available from the source selector when this component supports it, and
 * comes first on the native platform variant.
 */
export async function loadComponentSources(
  component: RegistryComponent,
  platform: PlatformContext,
  labels: SourceLabels,
): Promise<ComponentSource[]> {
  const [webCode, nativeCode] = await Promise.all([
    readWebSource(component.name),
    readNativeSource(component),
  ]);
  const webSource: ComponentSource | undefined = webCode
    ? { code: webCode, id: "react", label: labels.react }
    : undefined;
  const nativeSource: ComponentSource | undefined = nativeCode
    ? { code: nativeCode, id: "react-native", label: labels.reactNative }
    : undefined;

  return (
    platform === "native"
      ? [nativeSource, webSource]
      : [webSource, nativeSource]
  ).filter((source): source is ComponentSource => source !== undefined);
}

/**
 * Hand-curated related slugs (component-seo) beat the family fallback. The
 * result lists components that exist on the current platform variant.
 */
export function getRelatedComponents(input: {
  readonly component: RegistryComponent;
  readonly componentSeo?: ComponentSeo;
  readonly familyGroup?: FamilyGroup;
  readonly platform: PlatformContext;
}): string[] {
  const { component, componentSeo, familyGroup, platform } = input;
  const candidates =
    componentSeo && componentSeo.related.length > 0
      ? componentSeo.related
      : (familyGroup?.items ?? []).map((item) => item.name);
  const available = new Set(
    registry.items
      .filter((item) => !platform || item.platforms.includes(platform))
      .map((item) => item.name),
  );

  return candidates
    .filter((name) => name !== component.name)
    .slice(0, MAX_RELATED_COMPONENTS)
    .filter((name) => available.has(name));
}

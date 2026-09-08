import { getTranslations } from "next-intl/server";

import { ComponentThumbnail } from "@/components/component-thumbnail";
import { PlatformBadges } from "@/components/platform-badges";
import { Link, type Locale } from "@/i18n/routing";
import { getComponentContent } from "@/lib/component-content";
import componentMetadata from "@/lib/component-metadata.json";
import {
  type PlatformContext,
  type PlatformQuery,
  withPlatformQuery,
} from "@/lib/platform";

const META = componentMetadata as Record<
  string,
  {
    description?: string;
    platforms?: ("native" | "web")[];
    stories?: { id: string; name: string }[];
    title?: string;
  }
>;

type ComponentCardProps = {
  /** Optional description override (e.g. AI-SEO copy); falls back to registry metadata. */
  readonly description?: string;
  readonly locale: Locale;
  /** Active URL capability filter. Card previews always use the Web renderer. */
  readonly platform?: PlatformContext;
  /** Current URL query values retained by the component link. */
  readonly query?: PlatformQuery;
  /** Registry slug — links to `/components/<slug>` and resolves the preview. */
  readonly slug: string;
  /** Optional title override; falls back to registry metadata. */
  readonly title?: string;
};

/**
 * Shared gallery card: a live component preview above its title, description, and
 * story count, linking to the component page. Used by the components index and
 * the per-family landing pages so every surface looks identical.
 *
 * @param slug - registry component slug
 * @param locale - active locale for the link
 */
export async function ComponentCard({
  description,
  locale,
  platform,
  query = {},
  slug,
  title,
}: ComponentCardProps) {
  const t = await getTranslations("pages.components");
  const meta = META[slug];
  const localized = await getComponentContent(slug, locale);
  const displayTitle =
    title ?? localized?.frontmatter.title ?? meta?.title ?? slug;
  const displayDescription =
    description ?? localized?.frontmatter.description ?? meta?.description;
  const storyCount = meta?.stories?.length ?? 0;

  const href = withPlatformQuery(`/components/${slug}`, query, platform);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border bg-card transition-colors hover:border-foreground/20">
      <ComponentThumbnail componentName={slug} title={displayTitle} />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-medium transition-colors group-hover:text-foreground">
          {displayTitle}
        </h3>
        {displayDescription ? (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {displayDescription}
          </p>
        ) : null}
        <PlatformBadges
          className="mt-3 flex flex-wrap items-center gap-2"
          platforms={meta?.platforms ?? ["web"]}
        />
        {storyCount > 0 ? (
          <span className="mt-3 text-xs text-muted-foreground">
            {t("stories", { count: storyCount })}
          </span>
        ) : null}
        <Link
          aria-label={`${t("viewComponent")}: ${displayTitle}`}
          className="mt-4 inline-flex min-h-11 items-center self-start rounded-md text-sm font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={href}
        >
          {t("viewComponent")}
        </Link>
      </div>
    </article>
  );
}

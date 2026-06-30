import Link from "next/link";

import { ComponentThumbnail } from "@/components/component-thumbnail";
import type { Locale } from "@/i18n/routing";
import componentMetadata from "@/lib/component-metadata.json";
import { localizePathname } from "@/lib/seo";

const META = componentMetadata as Record<
  string,
  {
    description?: string;
    stories?: { id: string; name: string }[];
    title?: string;
  }
>;

type ComponentCardProps = {
  /** Optional description override (e.g. AI-SEO copy); falls back to registry metadata. */
  readonly description?: string;
  readonly locale: Locale;
  /** Registry slug — links to `/components/<slug>` and resolves the preview. */
  readonly slug: string;
  /** Optional title override; falls back to registry metadata. */
  readonly title?: string;
};

/**
 * Shared gallery card: a live component preview above its title, description, and
 * story count, linking to the component page. Used by the components index, the
 * per-family landing pages, and the AI hub so every surface looks identical.
 *
 * @param slug - registry component slug
 * @param locale - active locale for the link
 */
export function ComponentCard({
  description,
  locale,
  slug,
  title,
}: ComponentCardProps) {
  const meta = META[slug];
  const displayTitle = title ?? meta?.title ?? slug;
  const displayDescription = description ?? meta?.description;
  const storyCount = meta?.stories?.length ?? 0;

  return (
    <Link
      className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-colors hover:border-foreground/20"
      href={localizePathname(`/components/${slug}`, locale)}
    >
      <ComponentThumbnail componentName={slug} />
      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm font-medium transition-colors group-hover:text-foreground">
          {displayTitle}
        </p>
        {displayDescription ? (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {displayDescription}
          </p>
        ) : null}
        {storyCount > 0 ? (
          <span className="mt-3 text-xs text-muted-foreground">
            {`${storyCount} ${storyCount === 1 ? "story" : "stories"}`}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

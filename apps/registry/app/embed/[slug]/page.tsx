import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComponentPreview } from "@/components/component-preview/component-preview";
import { componentMeta } from "@/lib/component-meta";
import { findComponent, registry } from "@/lib/registry";
import { componentUrl, withRef } from "@/lib/share";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string; theme?: string }>;
};

export function generateStaticParams() {
  return registry.items.map((item) => ({ slug: item.name }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const component = findComponent(slug);
  const title = componentMeta[slug]?.title ?? component?.title ?? slug;

  return {
    robots: { follow: false, index: false },
    title: `${title} — VLLNT UI embed`,
  };
}

export default async function EmbedPage(props: Props) {
  const { slug } = await props.params;
  const { mode, theme } = await props.searchParams;
  const component = findComponent(slug);

  if (!component) {
    notFound();
  }

  const title = componentMeta[slug]?.title ?? component.title ?? slug;
  const isDark = theme === "dark";
  const link = withRef(componentUrl(slug), "embed");

  if (mode === "thumbnail") {
    return (
      <div className={isDark ? "dark" : undefined}>
        <div className="flex min-h-dvh items-center justify-center overflow-hidden bg-background p-4 text-foreground">
          <ComponentPreview componentName={slug} />
        </div>
      </div>
    );
  }

  return (
    <div className={isDark ? "dark" : undefined}>
      <div className="flex min-h-dvh flex-col bg-background text-foreground">
        <div className="flex flex-1 items-center justify-center p-6">
          <ComponentPreview componentName={slug} />
        </div>
        <a
          className="flex items-center justify-between gap-2 border-t border-border px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          href={link}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span>
            {title} — <strong className="font-semibold">VLLNT UI</strong>
          </span>
          <ArrowUpRight className="size-3.5" />
        </a>
      </div>
    </div>
  );
}

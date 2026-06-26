import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComponentPreview } from "@/components/component-preview/component-preview";
import componentMetadata from "@/lib/component-metadata.json";
import { registry } from "@/lib/registry";
import { componentUrl, withRef } from "@/lib/share";
import type { RegistryComponent } from "@/types/registry";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ theme?: string }>;
};

const metadataMap = componentMetadata as Record<
  string,
  { description: string; title: string }
>;

function findComponent(slug: string): RegistryComponent | undefined {
  return registry.items.find(
    (item): item is RegistryComponent =>
      item.name === slug && item.type === "registry:component",
  );
}

export function generateStaticParams() {
  return registry.items
    .filter(
      (item): item is RegistryComponent => item.type === "registry:component",
    )
    .map((item) => ({ slug: item.name }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const component = findComponent(slug);
  const title = metadataMap[slug]?.title ?? component?.title ?? slug;

  return {
    robots: { follow: false, index: false },
    title: `${title} — VLLNT UI embed`,
  };
}

export default async function EmbedPage(props: Props) {
  const { slug } = await props.params;
  const { theme } = await props.searchParams;
  const component = findComponent(slug);

  if (!component) {
    notFound();
  }

  const title = metadataMap[slug]?.title ?? component.title ?? slug;
  const isDark = theme === "dark";
  const link = withRef(componentUrl(slug), "embed");

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

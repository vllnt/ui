import React, { type ComponentProps, type ReactNode } from "react";

import { MDXContent, Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";

import {
  designTokens,
  extractDesignGuideSections,
  getDesignGuideMarkdown,
  slugifyHeading,
} from "@/lib/design-guide";
import { jsonLdScript } from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

const DESCRIPTION =
  "Canonical VLLNT UI design rules, tokens, component patterns, accessibility expectations, and agent-facing guidance.";

export const dynamic = "force-static";
export const revalidate = 86_400;

export const metadata: Metadata = {
  alternates: { canonical: canonical("/design") },
  description: DESCRIPTION,
  openGraph: generateOGMetadata({
    description: DESCRIPTION,
    title: "VLLNT UI Design Guide",
    type: "docs",
  }),
  title: "Design Guide",
  twitter: generateTwitterMetadata({
    description: DESCRIPTION,
    title: "VLLNT UI Design Guide",
    type: "docs",
  }),
};

function getNodeText(children: ReactNode): string {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }
      return "";
    })
    .join(" ")
    .trim();
}

function DesignHeadingTwo({ children, ...props }: ComponentProps<"h2">) {
  const id = slugifyHeading(getNodeText(children));

  return (
    <h2
      className="mt-10 scroll-mt-24 text-2xl font-semibold"
      id={id}
      {...props}
    >
      {children}
    </h2>
  );
}

function DesignHeadingThree({ children, ...props }: ComponentProps<"h3">) {
  const id = slugifyHeading(getNodeText(children));

  return (
    <h3 className="mt-8 scroll-mt-24 text-xl font-semibold" id={id} {...props}>
      {children}
    </h3>
  );
}

export default async function DesignPage() {
  const markdown = await getDesignGuideMarkdown();
  const sections = extractDesignGuideSections(markdown);
  const semanticColorCount = Object.keys(designTokens.color.semantic).length;
  const spacingCount = Object.keys(designTokens.spacing.scale).length;

  const techArticleLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    about: ["React component library", "design system", "accessibility"],
    author: {
      "@type": "Organization",
      name: "VLLNT",
    },
    description: DESCRIPTION,
    headline: "VLLNT UI Design Guide",
    publisher: {
      "@type": "Organization",
      name: "VLLNT",
    },
    url: canonical("/design"),
  };

  return (
    <>
      <Sidebar sections={getSidebarSections()} />
      <main className="flex-1 overflow-y-auto bg-background">
        <script
          dangerouslySetInnerHTML={{ __html: jsonLdScript(techArticleLd) }}
          type="application/ld+json"
        />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:px-8">
          <article className="min-w-0">
            <div className="mb-8 border-b border-border pb-8">
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                Agent-consumable brand guide
              </p>
              <h1 className="text-4xl font-semibold">VLLNT UI Design Guide</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
                The canonical rules for brand, tokens, layout, motion,
                accessibility, and component composition across the library.
              </p>
            </div>
            <MDXContent
              components={{
                h2: DesignHeadingTwo,
                h3: DesignHeadingThree,
              }}
              content={markdown}
            />
          </article>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold">Contents</h2>
              <nav aria-label="Design guide sections" className="mt-4">
                <ol className="space-y-2">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        className="text-sm text-muted-foreground hover:text-foreground"
                        href={`#${section.id}`}
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>

            <div className="mt-4 rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold">Token contract</h2>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Version</dt>
                  <dd className="font-medium">{designTokens.version}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Colors</dt>
                  <dd className="font-medium">{semanticColorCount}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Spacing</dt>
                  <dd className="font-medium">{spacingCount}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Icons</dt>
                  <dd className="font-medium">
                    {designTokens.iconography.library}
                  </dd>
                </div>
              </dl>
              <a
                className="mt-4 inline-flex text-sm font-medium text-primary underline underline-offset-4"
                href="/r/design.json"
              >
                View design tokens JSON
              </a>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

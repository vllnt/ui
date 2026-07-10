import { CodeBlock, Sidebar } from "@vllnt/ui";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { Footer } from "@/components/footer/footer";
import { type Locale, routing } from "@/i18n/routing";
import { resolveAiComponent } from "@/lib/ai-seo";
import { breadcrumbLd, faqPageLd, jsonLdScriptAttributes } from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";
import { getUseCase, USE_CASES } from "@/lib/use-cases";

type Props = {
  readonly params: Promise<{ locale: Locale; slug: string }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.com";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    USE_CASES.map((useCase) => ({ locale, slug: useCase.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const useCase = getUseCase(slug);
  if (!useCase) {
    return {};
  }

  const pathname = `/build/${slug}`;
  const ogParameters = {
    description: useCase.description,
    title: useCase.title,
    type: "page" as const,
  };

  return {
    alternates: {
      canonical: canonical(pathname, locale),
      languages: languageAlternates(pathname),
    },
    description: useCase.description,
    openGraph: generateOGMetadata(ogParameters, { locale, pathname }),
    title: `${useCase.title} | VLLNT UI`,
    twitter: generateTwitterMetadata(ogParameters),
  };
}

export default async function UseCasePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const useCase = getUseCase(slug);
  if (!useCase) {
    notFound();
  }

  const components = useCase.componentSlugs.flatMap((componentSlug) => {
    const resolved = resolveAiComponent(componentSlug);
    return resolved ? [resolved] : [];
  });

  const installCommand = components
    .map(
      (component) =>
        `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/${component.name}.json`,
    )
    .join("\n");

  return (
    <>
      <script
        {...jsonLdScriptAttributes([
          breadcrumbLd([
            { name: "Home", url: SITE_URL },
            { name: "AI components", url: `${SITE_URL}/ai` },
            {
              name: useCase.title,
              url: `${SITE_URL}/build/${useCase.slug}`,
            },
          ]),
          faqPageLd(useCase.faq),
        ])}
      />
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            <Link
              className="hover:text-foreground"
              href={localizePathname("/families/ai", locale)}
            >
              UI for AI agents
            </Link>
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
            {useCase.title}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">{useCase.intro}</p>

          {/* Components used */}
          <h2 className="mt-14 text-2xl font-semibold">
            Components you&apos;ll use
          </h2>
          <ul className="mt-6 space-y-3">
            {components.map((component) => (
              <li key={component.name}>
                <Link
                  className="group flex flex-col rounded-lg border border-border p-5 hover:border-foreground/40"
                  href={localizePathname(
                    `/components/${component.name}`,
                    locale,
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium">{component.title}</span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-2 text-sm text-muted-foreground">
                    {component.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Install */}
          <h2 className="mt-14 text-2xl font-semibold">Install</h2>
          <p className="mt-2 text-muted-foreground">
            Add every component above with the shadcn CLI. You own the source
            after install.
          </p>
          <div className="mt-4">
            <CodeBlock language="bash">{installCommand}</CodeBlock>
          </div>

          {/* FAQ */}
          <h2 className="mt-14 text-2xl font-semibold">Frequently asked</h2>
          <dl className="mt-6 space-y-6">
            {useCase.faq.map((item) => (
              <div key={item.question}>
                <dt className="font-medium">{item.question}</dt>
                <dd className="mt-2 text-muted-foreground">{item.answer}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-14 border-t border-border pt-8">
            <Link
              className="inline-flex items-center gap-1 font-medium text-foreground underline"
              href={localizePathname("/families/ai", locale)}
            >
              Browse all AI agent components
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}

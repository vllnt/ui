import { Breadcrumb, Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { setRequestLocale } from "next-intl/server";

import { GitHubMark } from "@/components/github-mark";
import { type Locale, routing } from "@/i18n/routing";
import {
  breadcrumbTrailLd,
  jsonLdScriptAttributes,
  softwareApplicationLd,
} from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";
import {
  getTemplate,
  getTemplateGithubUrl,
  getTemplatePath,
  TEMPLATES,
} from "@/lib/templates";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export function generateStaticParams(): { locale: Locale; slug: string }[] {
  return routing.locales.flatMap((locale) =>
    TEMPLATES.map((template) => ({ locale, slug: template.slug })),
  );
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const template = getTemplate(slug);

  if (!template) {
    return {
      title: "Templates - VLLNT UI",
    };
  }

  const title = `${template.title} Template - VLLNT UI`;
  const pathname = getTemplatePath(template);

  return {
    alternates: {
      canonical: canonical(pathname, locale),
      languages: languageAlternates(pathname),
    },
    description: template.description,
    openGraph: generateOGMetadata(
      {
        description: template.description,
        title,
        type: "docs",
      },
      { locale, pathname },
    ),
    title,
    twitter: generateTwitterMetadata({
      description: template.description,
      title,
      type: "docs",
    }),
  };
}

export default async function TemplatePage(props: Props) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);
  const template = getTemplate(slug);

  if (!template) {
    notFound();
  }

  const templatePath = getTemplatePath(template);
  const templateUrl = canonical(templatePath, locale);
  const githubUrl = getTemplateGithubUrl(template);

  return (
    <>
      <Script
        id={`template-${template.slug}-json-ld`}
        {...jsonLdScriptAttributes([
          breadcrumbTrailLd(locale, [
            { name: "Templates", path: "/templates" },
            { name: template.title, path: templatePath },
          ]),
          softwareApplicationLd({
            description: template.description,
            name: template.title,
            url: templateUrl,
          }),
        ])}
      />
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <Breadcrumb
            className="mb-6 text-muted-foreground"
            items={[
              { href: localizePathname("/", locale), label: "Home" },
              {
                href: localizePathname("/templates", locale),
                label: "Templates",
              },
              { label: template.title },
            ]}
          />

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section>
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Template
              </p>
              <h1 className="mt-2 text-4xl font-semibold">{template.title}</h1>
              <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
                {template.description}
              </p>

              <div className="mt-8 overflow-hidden rounded-md border border-border bg-muted/30">
                <Image
                  alt={`${template.title} template screenshot`}
                  className="aspect-video w-full object-cover"
                  height={720}
                  priority
                  src={template.screenshot}
                  width={1280}
                />
              </div>

              <section className="mt-10">
                <h2 className="text-2xl font-semibold">Source</h2>
                <p className="mt-4 text-sm text-muted-foreground">
                  This template is available as source in the VLLNT UI
                  repository. Copy or adapt the files from the template source
                  until a supported template CLI is available.
                </p>
              </section>

              <section className="mt-10">
                <h2 className="text-2xl font-semibold">What is included</h2>
                <ul className="mt-4 grid gap-3 md:grid-cols-2">
                  {template.highlights.map((highlight) => (
                    <li
                      className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground"
                      key={highlight}
                    >
                      {highlight}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-10">
                <h2 className="text-2xl font-semibold">Components</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {template.components.map((component) => (
                    <li key={component}>
                      <Link
                        className="inline-flex h-8 items-center rounded-md border border-border px-3 text-sm hover:bg-muted"
                        href={localizePathname(
                          `/components/${component}`,
                          locale,
                        )}
                      >
                        {component}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </section>

            <aside className="space-y-6">
              <section className="rounded-md border border-border bg-card p-5">
                <h2 className="text-lg font-semibold">Links</h2>
                <div className="mt-4 grid gap-3">
                  <a
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
                    href={githubUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <GitHubMark className="size-4" />
                    GitHub source
                  </a>
                </div>
              </section>

              <section className="rounded-md border border-border bg-card p-5">
                <h2 className="text-lg font-semibold">Fit</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {template.audience}
                </p>
              </section>

              <section className="rounded-md border border-border bg-card p-5">
                <h2 className="text-lg font-semibold">Pages</h2>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {template.pages.map((page) => (
                    <li key={page}>{page}</li>
                  ))}
                </ul>
              </section>

              <section className="rounded-md border border-border bg-card p-5">
                <h2 className="text-lg font-semibold">Stack</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {template.stack.map((item) => (
                    <li
                      className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium"
                      key={item}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

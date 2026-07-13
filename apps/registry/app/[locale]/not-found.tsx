import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { isLocale, Link } from "@/i18n/routing";
import { getSidebarSections } from "@/lib/sidebar-sections";

export const metadata: Metadata = {
  description: "We couldn't find the page you were looking for.",
  robots: { follow: true, index: false },
  title: "Page not found · VLLNT UI",
};

const POPULAR_COMPONENTS: readonly { name: string; slug: string }[] = [
  { name: "Button", slug: "button" },
  { name: "DataTable", slug: "data-table" },
  { name: "AI Chat Input", slug: "ai-chat-input" },
  { name: "Combobox", slug: "combobox" },
  { name: "Timeline", slug: "timeline" },
  { name: "Globe 3D", slug: "globe-3d" },
];

const REQUEST_URL =
  "https://github.com/vllnt/ui/issues/new?template=feature_request.yml&labels=enhancement,component";

export default async function NotFound() {
  const requestedLocale = await getLocale();
  const locale = isLocale(requestedLocale) ? requestedLocale : "en";
  const common = await getTranslations({ locale, namespace: "common" });
  const t = await getTranslations({ locale, namespace: "pages.notFound" });

  return (
    <>
      <Sidebar sections={await getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-24 lg:px-8 max-w-3xl">
          <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            404
          </p>
          <h1 className="mt-3 text-4xl font-semibold">{t("title")}</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("description")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex h-10 items-center rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
              href="/components"
            >
              {common("browseComponents")}
            </Link>
            <Link
              className="inline-flex h-10 items-center rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
              href="/docs"
            >
              {common("readDocs")}
            </Link>
            <a
              className="inline-flex h-10 items-center rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
              href={REQUEST_URL}
              rel="noreferrer"
              target="_blank"
            >
              {common("requestComponent")}
            </a>
          </div>

          <section className="mt-16">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("popular")}
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {POPULAR_COMPONENTS.map((component) => (
                <li key={component.slug}>
                  <Link
                    className="block rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-muted"
                    href={`/components/${component.slug}`}
                  >
                    {component.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}

import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { Link, type Locale } from "@/i18n/routing";
import { canonical, languageAlternates } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

type Props = {
  params: Promise<{ locale: Locale }>;
};

type Comparison = {
  readonly available: boolean;
  readonly name: string;
  readonly slug: string;
  readonly tagline: string;
};

const ENGLISH_COMPARISONS: readonly Comparison[] = [
  {
    available: true,
    name: "shadcn/ui",
    slug: "shadcn",
    tagline:
      "Closest sibling. Same registry format. Different component count and agent surface.",
  },
  {
    available: false,
    name: "Radix UI",
    slug: "radix",
    tagline: "Accessible primitives — VLLNT UI is built on top of these.",
  },
  {
    available: false,
    name: "HeadlessUI",
    slug: "headless-ui",
    tagline: "Tailwind Labs primitives — different ecosystem.",
  },
  {
    available: false,
    name: "NextUI",
    slug: "nextui",
    tagline: "Component library with its own design language.",
  },
];

const FRENCH_COMPARISONS: readonly Comparison[] = [
  {
    available: true,
    name: "shadcn/ui",
    slug: "shadcn",
    tagline:
      "Le plus proche parent. Même format de registre, avec un nombre de composants et une surface agent différents.",
  },
  {
    available: false,
    name: "Radix UI",
    slug: "radix",
    tagline:
      "Primitives accessibles — VLLNT UI est construit au-dessus d’elles.",
  },
  {
    available: false,
    name: "HeadlessUI",
    slug: "headless-ui",
    tagline: "Primitives de Tailwind Labs — un écosystème différent.",
  },
  {
    available: false,
    name: "NextUI",
    slug: "nextui",
    tagline: "Bibliothèque de composants avec son propre langage visuel.",
  },
];

function getComparisons(locale: Locale): readonly Comparison[] {
  return locale === "fr" ? FRENCH_COMPARISONS : ENGLISH_COMPARISONS;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFrench = locale === "fr";

  return {
    alternates: {
      canonical: canonical("/vs", locale),
      languages: languageAlternates("/vs"),
    },
    description: isFrench
      ? "Comparaison honnête et factuelle de VLLNT UI face à shadcn/ui, Radix UI, HeadlessUI et NextUI."
      : "Honest, evidence-based comparison of VLLNT UI vs shadcn/ui, Radix UI, HeadlessUI, and NextUI.",
    title: isFrench ? "VLLNT UI face aux autres" : "VLLNT UI vs · Comparisons",
  };
}

export default async function VsIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isFrench = locale === "fr";
  const comparisons = getComparisons(locale);

  return (
    <>
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-16 lg:px-8">
          <h1 className="text-4xl font-semibold mb-3">
            {isFrench ? "VLLNT UI face aux autres" : "VLLNT UI vs the rest"}
          </h1>
          <p className="text-muted-foreground text-lg mb-10">
            {isFrench
              ? "Des comparaisons honnêtes. Nous indiquons où les alternatives sont plus fortes, où VLLNT UI s’intègre mieux et où l’écart est trop faible pour compter."
              : "Honest comparisons. We call out where alternatives are stronger, where VLLNT UI fits better, and where the gap is small enough to not matter."}
          </p>

          <ul className="space-y-3">
            {comparisons.map((entry) =>
              entry.available ? (
                <li key={entry.slug}>
                  <Link
                    className="block rounded-lg border border-border p-5 hover:border-foreground/40"
                    href={`/vs/${entry.slug}`}
                  >
                    <p className="text-lg font-semibold">
                      VLLNT UI vs {entry.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {entry.tagline}
                    </p>
                  </Link>
                </li>
              ) : (
                <li
                  className="rounded-lg border border-dashed border-border p-5 opacity-60"
                  key={entry.slug}
                >
                  <p className="text-lg font-semibold">
                    VLLNT UI vs {entry.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {entry.tagline}.{" "}
                    {isFrench ? "Page à venir." : "Page coming soon."}
                  </p>
                </li>
              ),
            )}
          </ul>
        </div>
      </main>
    </>
  );
}

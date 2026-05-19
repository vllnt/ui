import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { canonical, languageAlternates } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";
import { getComponentCount, getLibraryVersion } from "@/lib/stats";

type Props = {
  params: Promise<{ locale: Locale }>;
};

type Row = {
  readonly attribute: string;
  readonly shadcn: string;
  readonly vllnt: string;
  readonly winner?: "even" | "shadcn" | "vllnt";
};

function getRows(locale: Locale, componentCount: number): readonly Row[] {
  if (locale === "fr") {
    return [
      {
        attribute: "Nombre de composants",
        shadcn: "~50 composants",
        vllnt: `${componentCount} composants`,
        winner: "vllnt",
      },
      {
        attribute: "Modèle d’installation",
        shadcn: "CLI shadcn connecté à ui.shadcn.com/r",
        vllnt: "CLI shadcn connecté à /r/<name>.json",
        winner: "even",
      },
      {
        attribute: "Vous possédez le code source après installation",
        shadcn: "Oui",
        vllnt: "Oui",
        winner: "even",
      },
      {
        attribute: "Résolution des composants frères",
        shadcn: "Tout le code source est inclus dans chaque composant",
        vllnt:
          "Hybride : source feuille + dépendance paire @vllnt/ui pour les composants frères",
        winner: "vllnt",
      },
      {
        attribute: "Index agent /llms.txt",
        shadcn: "Non",
        vllnt: "Oui — conforme à llmstxt.org",
        winner: "vllnt",
      },
      {
        attribute: "Serveur MCP",
        shadcn: "Non",
        vllnt: "Oui — ui.vllnt.ai/mcp (outils search/get/list)",
        winner: "vllnt",
      },
      {
        attribute: "Schéma a11y par composant dans le JSON",
        shadcn: "Non",
        vllnt: "Oui — clavier, rôles ARIA, modèle de focus",
        winner: "vllnt",
      },
      {
        attribute: "Exemples par composant dans le JSON",
        shadcn: "Non",
        vllnt: "Oui — code structuré en données, lisible par les agents",
        winner: "vllnt",
      },
      {
        attribute: "Schéma de props par composant dans le JSON",
        shadcn: "Non",
        vllnt: "Oui — format inspiré de TSDoc",
        winner: "vllnt",
      },
      {
        attribute: "Version + stabilité par composant",
        shadcn: "Non",
        vllnt: "Oui (stable / beta / experimental / deprecated)",
        winner: "vllnt",
      },
      {
        attribute: "Theming",
        shadcn: "Variables CSS",
        vllnt: "Variables CSS + design tokens (DESIGN.md)",
        winner: "vllnt",
      },
      {
        attribute: "Primitives d’accessibilité",
        shadcn: "Radix UI",
        vllnt: "Radix UI",
        winner: "even",
      },
      {
        attribute: "Système de variantes",
        shadcn: "CVA",
        vllnt: "CVA",
        winner: "even",
      },
      {
        attribute: "Taille de communauté",
        shadcn: "Massive — des millions d’installations",
        vllnt: "Plus petite, en croissance",
        winner: "shadcn",
      },
      {
        attribute: "Reconnaissance du namespace",
        shadcn: "shadcn (standard du secteur)",
        vllnt: "@vllnt/ui (plus récent)",
        winner: "shadcn",
      },
      {
        attribute: "Tutoriels + contenu",
        shadcn: "Très riche — innombrables vidéos, articles et cours",
        vllnt: "Limité (projet jeune)",
        winner: "shadcn",
      },
      {
        attribute: "Templates / starters",
        shadcn: "Nombreux templates officiels et communautaires",
        vllnt: "À venir",
        winner: "shadcn",
      },
      {
        attribute: "Licence",
        shadcn: "MIT",
        vllnt: "MIT",
        winner: "even",
      },
    ];
  }

  return [
    {
      attribute: "Component count",
      shadcn: "~50 components",
      vllnt: `${componentCount} components`,
      winner: "vllnt",
    },
    {
      attribute: "Install model",
      shadcn: "shadcn CLI against ui.shadcn.com/r",
      vllnt: "shadcn CLI against /r/<name>.json",
      winner: "even",
    },
    {
      attribute: "You own the source after install",
      shadcn: "Yes",
      vllnt: "Yes",
      winner: "even",
    },
    {
      attribute: "Sibling-component resolution",
      shadcn: "All source inlined per component",
      vllnt: "Hybrid: leaf source + @vllnt/ui peer dep for siblings",
      winner: "vllnt",
    },
    {
      attribute: "/llms.txt agent index",
      shadcn: "No",
      vllnt: "Yes — llmstxt.org compliant",
      winner: "vllnt",
    },
    {
      attribute: "MCP server",
      shadcn: "No",
      vllnt: "Yes — ui.vllnt.ai/mcp (search/get/list tools)",
      winner: "vllnt",
    },
    {
      attribute: "Per-component a11y schema in JSON",
      shadcn: "No",
      vllnt: "Yes — keyboard map, ARIA roles, focus model",
      winner: "vllnt",
    },
    {
      attribute: "Per-component examples in JSON",
      shadcn: "No",
      vllnt: "Yes — code-as-data, agent-readable",
      winner: "vllnt",
    },
    {
      attribute: "Per-component props schema in JSON",
      shadcn: "No",
      vllnt: "Yes — TSDoc-shaped",
      winner: "vllnt",
    },
    {
      attribute: "version + stability per component",
      shadcn: "No",
      vllnt: "Yes (stable / beta / experimental / deprecated)",
      winner: "vllnt",
    },
    {
      attribute: "Theming",
      shadcn: "CSS variables",
      vllnt: "CSS variables + design tokens (DESIGN.md)",
      winner: "vllnt",
    },
    {
      attribute: "Accessibility primitives",
      shadcn: "Radix UI",
      vllnt: "Radix UI",
      winner: "even",
    },
    {
      attribute: "Variant system",
      shadcn: "CVA",
      vllnt: "CVA",
      winner: "even",
    },
    {
      attribute: "Community size",
      shadcn: "Massive — millions of installs",
      vllnt: "Smaller, growing",
      winner: "shadcn",
    },
    {
      attribute: "Namespace recognition",
      shadcn: "shadcn (industry standard)",
      vllnt: "@vllnt/ui (newer)",
      winner: "shadcn",
    },
    {
      attribute: "Tutorials + content",
      shadcn: "Extensive — countless videos, blogs, courses",
      vllnt: "Limited (young project)",
      winner: "shadcn",
    },
    {
      attribute: "Templates / starter kits",
      shadcn: "Many official + community templates",
      vllnt: "Coming soon",
      winner: "shadcn",
    },
    {
      attribute: "License",
      shadcn: "MIT",
      vllnt: "MIT",
      winner: "even",
    },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isFrench = locale === "fr";

  return {
    alternates: {
      canonical: canonical("/vs/shadcn", locale),
      languages: languageAlternates("/vs/shadcn"),
    },
    description: isFrench
      ? "VLLNT UI face à shadcn/ui : format de registre, nombre de composants, surface agent, theming et accessibilité. Comparaison honnête."
      : "VLLNT UI vs shadcn/ui - registry format, component count, agent surface, theming, accessibility. Honest comparison.",
    title: isFrench ? "VLLNT UI face à shadcn/ui" : "VLLNT UI vs shadcn/ui",
  };
}

export default async function VsShadcnPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isFrench = locale === "fr";
  const componentCount = getComponentCount();
  const version = getLibraryVersion();
  const rows = getRows(locale, componentCount);

  return (
    <>
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-16 lg:px-8">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            {isFrench
              ? `Comparaison · v${version}`
              : `Comparison · v${version}`}
          </p>
          <h1 className="mt-2 text-4xl font-semibold">
            {isFrench ? "VLLNT UI face à shadcn/ui" : "VLLNT UI vs shadcn/ui"}
          </h1>

          <div className="prose prose-lg dark:prose-invert mt-6 max-w-none">
            <h2>{isFrench ? "Résumé" : "TLDR"}</h2>
            {isFrench ? (
              <>
                <p>
                  shadcn/ui est le standard du secteur. VLLNT UI est un parent
                  plus jeune qui pousse la même idée de registre plus loin :
                  plus de composants, une surface pensée pour les agents
                  (/llms.txt, /mcp, des descripteurs JSON plus riches) et un
                  modèle d’installation hybride qui déduplique les primitives
                  partagées via @vllnt/ui.
                </p>
                <p>
                  Si vous cherchez le maximum de signal communautaire et le plus
                  grand nombre de tutoriels et templates tiers, shadcn/ui gagne.
                  Si vous voulez le catalogue de composants le plus large et un
                  registre directement lisible par des agents IA, VLLNT UI
                  gagne.
                </p>
              </>
            ) : (
              <>
                <p>
                  shadcn/ui is the industry standard. VLLNT UI is a younger
                  sibling that takes the same registry idea further: more
                  components, an agent-first surface (<code>/llms.txt</code>,{" "}
                  <code>/mcp</code>, richer JSON descriptors), and a hybrid
                  install model that dedupes shared primitives via{" "}
                  <code>@vllnt/ui</code>.
                </p>
                <p>
                  If you want maximum community signal and the largest pool of
                  third-party tutorials and templates, shadcn/ui wins. If you
                  want the broadest curated component set and a registry that AI
                  agents can read directly, VLLNT UI wins.
                </p>
              </>
            )}
          </div>

          <h2 className="mt-12 text-2xl font-semibold">
            {isFrench ? "Côte à côte" : "Side-by-side"}
          </h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left font-semibold">
                    {isFrench ? "Critère" : "Attribute"}
                  </th>
                  <th className="p-3 text-left font-semibold">VLLNT UI</th>
                  <th className="p-3 text-left font-semibold">shadcn/ui</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr className="border-t border-border" key={row.attribute}>
                    <td className="p-3 font-medium">{row.attribute}</td>
                    <td
                      className={
                        row.winner === "vllnt" ? "p-3 font-semibold" : "p-3"
                      }
                    >
                      {row.vllnt}
                    </td>
                    <td
                      className={
                        row.winner === "shadcn" ? "p-3 font-semibold" : "p-3"
                      }
                    >
                      {row.shadcn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="prose prose-lg dark:prose-invert mt-12 max-w-none">
            <h2>
              {isFrench
                ? "Quand choisir l’un ou l’autre"
                : "When to pick which"}
            </h2>
            {isFrench ? (
              <>
                <p>
                  <strong>Choisissez shadcn/ui</strong> si vous voulez l’option
                  la plus éprouvée, si vous avez besoin d’un grand volume de
                  tutoriels, ou si votre projet gagne à rester « juste shadcn ».
                </p>
                <p>
                  <strong>Choisissez VLLNT UI</strong> si vous avez besoin de
                  composants au-delà du cœur shadcn (timelines, cartes,
                  composants IA, overlays runtime, primitives canvas), si les
                  agents IA font partie de votre flux d’authoring, ou si vous
                  voulez des données de registre assez structurées pour être
                  interrogées par programme.
                </p>
                <p>
                  La réponse honnête : beaucoup de projets utilisent les deux.
                  shadcn/ui comme base, VLLNT UI pour les familles que shadcn ne
                  couvre pas. Même modèle d’installation : ils coexistent
                  proprement.
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>Pick shadcn/ui</strong> when you want the
                  most-validated choice, need a large pool of tutorials, or are
                  building something that benefits from being &ldquo;just
                  shadcn&rdquo;.
                </p>
                <p>
                  <strong>Pick VLLNT UI</strong> when you need components beyond
                  the shadcn core (timelines, maps, AI compounds, runtime
                  overlays, canvas primitives), when AI agents are part of your
                  authoring flow, or when you want the registry data structured
                  enough to query programmatically.
                </p>
                <p>
                  The honest answer: many projects use both. shadcn/ui as the
                  baseline, VLLNT UI for the families shadcn doesn&rsquo;t
                  cover. Same install model: they coexist cleanly.
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

/* eslint-disable max-lines-per-function */

import { CodeBlock } from "@vllnt/ui";
import { ArrowRight, ExternalLink, Sparkles, Terminal } from "lucide-react";
import { useTranslations } from "next-intl";

import { Footer } from "@/components/footer/footer";
import { Link } from "@/i18n/routing";
import {
  getCategoryCount,
  getComponentCount,
  getFeaturedComponents,
  getLibraryVersion,
  getRegistryGeneratedAt,
} from "@/lib/stats";

const GITHUB_URL = "https://github.com/vllnt/ui";
const STORYBOOK_URL = "https://storybook.vllnt.ai";
const REQUEST_URL =
  "https://github.com/vllnt/ui/issues/new?template=feature_request.yml&labels=enhancement,component";

function Hero({
  componentCount,
  version,
}: {
  componentCount: number;
  version: string;
}) {
  const t = useTranslations("landing.hero");
  const trustBadges = [
    { label: "MIT" },
    { label: "TypeScript" },
    { label: t("rscCompatible") },
    { label: t("tailwindReady") },
  ];

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {t("kicker", { version })}
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
          {t("title", { count: componentCount })}
          <br />
          <span className="text-muted-foreground">{t("subtitle")}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          {t("description")}
        </p>

        <div className="mt-8">
          <CodeBlock language="bash">
            pnpm dlx shadcn@latest add https://ui.vllnt.ai/r/button.json
          </CodeBlock>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
            href="/components"
          >
            {t("browseComponents", { count: componentCount })}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
            href="/docs"
          >
            {t("readDocs")}
          </Link>
          <a
            className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
            href={GITHUB_URL}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink className="h-4 w-4" />
            {t("github")}
          </a>
        </div>

        <ul className="mt-8 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {trustBadges.map((badge) => (
            <li
              className="rounded-full border border-border bg-muted/40 px-3 py-1"
              key={badge.label}
            >
              {badge.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Stats({
  categoryCount,
  componentCount,
  generatedAt,
  version,
}: {
  categoryCount: number;
  componentCount: number;
  generatedAt?: string;
  version: string;
}) {
  const t = useTranslations("landing.stats");

  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 lg:grid-cols-4 lg:px-8">
        <Stat label={t("components")} value={String(componentCount)} />
        <Stat label={t("categories")} value={String(categoryCount)} />
        <Stat label={t("libraryVersion")} value={`v${version}`} />
        <Stat
          label={t("lastBuild")}
          value={
            generatedAt ? new Date(generatedAt).toISOString().slice(0, 10) : "-"
          }
        />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-3xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function AgentCallout() {
  const t = useTranslations("landing.agent");

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          {t("eyebrow")}
        </div>
        <h2 className="mt-2 text-3xl font-semibold">{t("title")}</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {t("description")}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <AgentCard
            description={t("llmsDescription")}
            href="/llms.txt"
            title="/llms.txt"
          />
          <AgentCard
            description={t("llmsFullDescription")}
            href="/llms-full.txt"
            title="/llms-full.txt"
          />
          <AgentCard
            description={t("mcpDescription")}
            href="/mcp"
            title="/mcp"
          />
        </div>
      </div>
    </section>
  );
}

function AgentCard({
  description,
  href,
  title,
}: {
  description: string;
  href: string;
  title: string;
}) {
  const t = useTranslations("landing.agent");

  return (
    <a
      className="group rounded-lg border border-border p-5 hover:border-foreground/40"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <div className="flex items-center gap-2 text-sm font-mono">
        <Terminal className="h-4 w-4 text-muted-foreground" />
        <span>{title}</span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      <p className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-foreground">
        {t("open")}
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </p>
    </a>
  );
}

function FeaturedComponents() {
  const t = useTranslations("landing.featured");
  const featured = getFeaturedComponents();
  if (featured.length === 0) return null;
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <h2 className="text-2xl font-semibold">{t("title")}</h2>
        <p className="mt-2 text-muted-foreground">
          {t("description", { count: getComponentCount() })}{" "}
          <Link
            className="font-medium text-foreground underline"
            href="/components"
          >
            /components
          </Link>
          .
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((component) => (
            <li key={component.name}>
              <Link
                className="block rounded-lg border border-border p-4 hover:border-foreground/40"
                href={`/components/${component.name}`}
              >
                <p className="font-medium">{component.name}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                  {component.category ?? "uncategorized"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CommunityCTA() {
  const t = useTranslations("landing.community");

  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <h2 className="text-3xl font-semibold">{t("title")}</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {t("description")}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
            href={GITHUB_URL}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink className="h-4 w-4" />
            {t("starGithub")}
          </a>
          <a
            className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
            href={REQUEST_URL}
            rel="noreferrer"
            target="_blank"
          >
            {t("requestComponent")}
          </a>
          <a
            className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
            href={STORYBOOK_URL}
            rel="noreferrer"
            target="_blank"
          >
            {t("openStorybook")}
          </a>
        </div>
      </div>
    </section>
  );
}

export function Landing() {
  const componentCount = getComponentCount();
  const categoryCount = getCategoryCount();
  const version = getLibraryVersion();
  const generatedAt = getRegistryGeneratedAt();

  return (
    <>
      <Hero componentCount={componentCount} version={version} />
      <Stats
        categoryCount={categoryCount}
        componentCount={componentCount}
        generatedAt={generatedAt}
        version={version}
      />
      <AgentCallout />
      <FeaturedComponents />
      <CommunityCTA />
      <Footer />
    </>
  );
}

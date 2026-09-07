import { Badge, StaticCode } from "@vllnt/ui";
import { ArrowRight, Sparkles, Terminal } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Footer } from "@/components/footer/footer";
import { GitHubMark } from "@/components/github-mark";
import { VersionChannels } from "@/components/landing/version-channels";
import { Link } from "@/i18n/routing";
import { getLatestReleaseRecords } from "@/lib/changelog";
import { getNpmDistributionTags } from "@/lib/npm-version";
import {
  getCategoryCount,
  getComponentCount,
  getFeaturedComponents,
  getRegistryGeneratedAt,
} from "@/lib/stats";

const GITHUB_URL = "https://github.com/vllnt/ui";
const STORYBOOK_URL = "https://storybook.vllnt.com";
const REQUEST_URL =
  "https://github.com/vllnt/ui/issues/new?template=feature_request.yml&labels=enhancement,component";
const INSTALL_COMMAND =
  "pnpm dlx shadcn@latest add https://ui.vllnt.com/r/button.json";

const TRUST_BADGE_KEYS = ["mit", "typescript", "rsc", "tailwind"] as const;

async function HeroActions({ componentCount }: { componentCount: number }) {
  const t = await getTranslations("landing.hero");
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Link
        className="inline-flex h-11 items-center gap-2 rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
        href="/families/ai"
      >
        {t("exploreAi")}
        <ArrowRight className="size-4" />
      </Link>
      <Link
        className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
        href="/components"
      >
        {t("browseAll", { count: componentCount })}
      </Link>
      <Link
        className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
        href="/templates"
      >
        {t("browseTemplates")}
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
        <GitHubMark className="size-4" />
        {t("github")}
      </a>
    </div>
  );
}

async function Hero({
  componentCount,
  version,
}: {
  componentCount: number;
  version: string;
}) {
  const t = await getTranslations("landing.hero");
  const badges = await getTranslations("landing.trustBadges");

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {t("kicker", { version })}
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
          {t("titleLead")}
          <br />
          <span className="text-muted-foreground">{t("titleAccent")}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          {t("description", { count: componentCount })}
        </p>

        <div className="mt-8">
          <StaticCode code={INSTALL_COMMAND} language="bash" />
        </div>

        <HeroActions componentCount={componentCount} />

        <ul className="mt-8 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {TRUST_BADGE_KEYS.map((key) => (
            <li
              className="rounded-full border border-border bg-muted/40 px-3 py-1"
              key={key}
            >
              {badges(key)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

async function Stats({
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
  const t = await getTranslations("landing.stats");
  const generatedDate = generatedAt?.slice(0, 10) ?? "—";

  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 lg:grid-cols-4 lg:px-8">
        <Stat label={t("components")} value={String(componentCount)} />
        <Stat label={t("categories")} value={String(categoryCount)} />
        <Stat label={t("libraryVersion")} value={`v${version}`} />
        <Stat label={t("lastBuild")} value={generatedDate} />
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

async function AgentCallout() {
  const t = await getTranslations("landing.agent");

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Sparkles className="size-4" />
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
            open={t("open")}
            title="/llms.txt"
          />
          <AgentCard
            description={t("llmsFullDescription")}
            href="/llms-full.txt"
            open={t("open")}
            title="/llms-full.txt"
          />
          <AgentCard
            description={t("mcpDescription")}
            href="/mcp"
            open={t("open")}
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
  open,
  title,
}: {
  description: string;
  href: string;
  open: string;
  title: string;
}) {
  return (
    <a
      className="group rounded-lg border border-border p-5 hover:border-foreground/40"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <div className="flex items-center gap-2 text-sm font-mono">
        <Terminal className="size-4 text-muted-foreground" />
        <span>{title}</span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      <p className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-foreground">
        {open}
        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
      </p>
    </a>
  );
}

async function FeaturedComponents() {
  const featured = getFeaturedComponents();
  if (featured.length === 0) return null;
  const t = await getTranslations("landing.featured");

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <h2 className="text-2xl font-semibold">{t("title")}</h2>
        <p className="mt-2 text-muted-foreground">
          {t("descriptionLead", { count: getComponentCount() })}{" "}
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
                  {component.category ?? t("uncategorized")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

async function ReleasesStrip() {
  const releases = await getLatestReleaseRecords(3);
  if (releases.length === 0) return null;
  const t = await getTranslations("landing.releases");

  return (
    <section className="border-b border-border bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{t("title")}</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {t("description")}
            </p>
          </div>
          <Link
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
            href="/releases"
          >
            {t("viewAll")}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <ul className="mt-8 grid gap-3 lg:grid-cols-3">
          {releases.map((release, index) => (
            <li
              className="border border-border bg-background p-5"
              key={release.anchor}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{release.version}</Badge>
                {index === 0 ? (
                  <Badge variant="secondary">{t("whatsNew")}</Badge>
                ) : null}
              </div>
              <h3 className="mt-4 font-semibold">{release.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                {release.summary}
              </p>
              <Link
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium"
                href={`/releases#${release.anchor}`}
              >
                {t("readNotes")}
                <ArrowRight className="size-3" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

async function CommunityCTA() {
  const t = await getTranslations("landing.community");

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
            <GitHubMark className="size-4" />
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

export async function Landing() {
  const componentCount = getComponentCount();
  const categoryCount = getCategoryCount();
  const { latest } = await getNpmDistributionTags();
  const generatedAt = getRegistryGeneratedAt();

  return (
    <>
      <Hero componentCount={componentCount} version={latest} />
      <Stats
        categoryCount={categoryCount}
        componentCount={componentCount}
        generatedAt={generatedAt}
        version={latest}
      />
      <VersionChannels />
      <ReleasesStrip />
      <AgentCallout />
      <FeaturedComponents />
      <CommunityCTA />
      <Footer />
    </>
  );
}

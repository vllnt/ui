import { Badge } from "@vllnt/ui";
import { ArrowRight, Sparkles, Terminal } from "lucide-react";
import Link from "next/link";

import { CodeStatic } from "@/components/code-static/code-static";
import { Footer } from "@/components/footer/footer";
import { GitHubMark } from "@/components/github-mark";
import { getLatestReleaseRecords } from "@/lib/changelog";
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
const INSTALL_COMMAND =
  "pnpm dlx shadcn@latest add https://ui.vllnt.ai/r/button.json";

const TRUST_BADGES = [
  { label: "MIT" },
  { label: "TypeScript" },
  { label: "RSC compatible" },
  { label: "Tailwind v4 ready" },
];

function Hero({
  componentCount,
  version,
}: {
  componentCount: number;
  version: string;
}) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          v{version} / MIT
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
          {componentCount} agent-first React components.
          <br />
          <span className="text-muted-foreground">Copy, paste, ship.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Built on Radix UI, Tailwind CSS, and CVA. Every component is also a
          machine-readable JSON descriptor: agents (Claude, Cursor, Cline,
          Continue) read the registry directly without scraping HTML.
        </p>

        <div className="mt-8">
          <CodeStatic code={INSTALL_COMMAND} language="bash" />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
            href="/components"
          >
            Browse {componentCount} components
            <ArrowRight className="size-4" />
          </Link>
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
            href="/templates"
          >
            Browse templates
          </Link>
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
            href="/docs"
          >
            Read the docs
          </Link>
          <a
            className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
            href={GITHUB_URL}
            rel="noreferrer"
            target="_blank"
          >
            <GitHubMark className="size-4" />
            GitHub
          </a>
        </div>

        <ul className="mt-8 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {TRUST_BADGES.map((badge) => (
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
  const generatedDate = generatedAt?.slice(0, 10) ?? "—";

  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 lg:grid-cols-4 lg:px-8">
        <Stat label="Components" value={String(componentCount)} />
        <Stat label="Categories" value={String(categoryCount)} />
        <Stat label="Library version" value={`v${version}`} />
        <Stat label="Last build" value={generatedDate} />
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
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Sparkles className="size-4" />
          Agent-first
        </div>
        <h2 className="mt-2 text-3xl font-semibold">
          Built so AI coding agents can use it directly.
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Every component ships as a machine-readable JSON descriptor with name,
          version, stability, accessibility schema, usage examples, and prop
          definitions. Agents discover the registry through three surfaces.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <AgentCard
            description="Concise index per the llmstxt.org spec - sections, links, descriptions."
            href="/llms.txt"
            title="/llms.txt"
          />
          <AgentCard
            description="Full registry context in one fetch - docs + per-component descriptors."
            href="/llms-full.txt"
            title="/llms-full.txt"
          />
          <AgentCard
            description="Streamable HTTP MCP server. Tools: search_components, get_component, list_categories."
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
        Open
        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
      </p>
    </a>
  );
}

function FeaturedComponents() {
  const featured = getFeaturedComponents();
  if (featured.length === 0) return null;
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <h2 className="text-2xl font-semibold">Featured components</h2>
        <p className="mt-2 text-muted-foreground">
          A few favourites. Browse all {getComponentCount()} from{" "}
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

async function ReleasesStrip() {
  const releases = await getLatestReleaseRecords(3);
  if (releases.length === 0) return null;

  return (
    <section className="border-b border-border bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Latest releases</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Follow what changed across the component library, registry, and
              release pipeline.
            </p>
          </div>
          <Link
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
            href="/releases"
          >
            View all releases
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
                  <Badge variant="secondary">What&apos;s new</Badge>
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
                Read notes
                <ArrowRight className="size-3" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CommunityCTA() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <h2 className="text-3xl font-semibold">Build with the community.</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          MIT licensed. No tracking. No backend. Issues, ideas, and pull
          requests welcome.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
            href={GITHUB_URL}
            rel="noreferrer"
            target="_blank"
          >
            <GitHubMark className="size-4" />
            Star on GitHub
          </a>
          <a
            className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
            href={REQUEST_URL}
            rel="noreferrer"
            target="_blank"
          >
            Request a component
          </a>
          <a
            className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
            href={STORYBOOK_URL}
            rel="noreferrer"
            target="_blank"
          >
            Open Storybook
          </a>
        </div>
      </div>
    </section>
  );
}

export async function Landing() {
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
      <ReleasesStrip />
      <AgentCallout />
      <FeaturedComponents />
      <CommunityCTA />
      <Footer />
    </>
  );
}

import { readFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";
const GITHUB_REPO_URL = "https://github.com/vllnt/ui";
const GITHUB_RELEASES_API = "https://api.github.com/repos/vllnt/ui/releases";
const GITHUB_HEADERS = new Headers([["Accept", "application/vnd.github+json"]]);

export type ChangelogTypeFilter = "all" | "breaking" | "feat" | "fix";

export type ChangelogFilters = {
  readonly from?: string;
  readonly to?: string;
  readonly type: ChangelogTypeFilter;
};

export type ChangelogSection = {
  readonly body: string;
  readonly title: string;
  readonly type: ChangelogTypeFilter;
};

export type ChangelogEntry = {
  readonly anchor: string;
  readonly date?: string;
  readonly sections: readonly ChangelogSection[];
  readonly title: string;
  readonly version: string;
};

export type ReleaseRecord = {
  readonly anchor: string;
  readonly breakingChanges: number;
  readonly componentDelta?: number;
  readonly date?: string;
  readonly migrationUrl?: string;
  readonly notes: string;
  readonly summary: string;
  readonly title: string;
  readonly url: string;
  readonly version: string;
};

type Heading = {
  readonly date?: string;
  readonly title: string;
  readonly version: string;
};

const githubReleasesSchema = z.array(z.record(z.string(), z.unknown()));
const urlSchema = z.url();

function normalizeVersion(version: string): string {
  return version.replace(/^v/i, "");
}

export function versionToAnchor(version: string): string {
  const normalized = version.trim().toLowerCase().replace(/^v/, "");
  if (normalized === "unreleased") {
    return "unreleased";
  }
  return `v${normalized.replaceAll(".", "-").replaceAll(/[^\da-z-]/g, "-")}`;
}

function sectionTypeFromTitle(title: string): ChangelogTypeFilter {
  const lower = title.toLowerCase();
  if (lower.includes("breaking")) return "breaking";
  if (lower.includes("fix")) return "fix";
  if (lower.includes("added") || lower.includes("feature")) return "feat";
  return "all";
}

function isWithinDateRange(
  entry: ChangelogEntry,
  from?: string,
  to?: string,
): boolean {
  if (!entry.date) return true;
  if (from && entry.date < from) return false;
  if (to && entry.date > to) return false;
  return true;
}

function extractSummary(notes: string): string {
  const firstBullet = notes
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("- "));
  if (firstBullet) {
    return firstBullet.replace(/^-+\s*/, "").replaceAll(/[*_`]/g, "");
  }
  return (
    notes
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim().replaceAll(/\s+/g, " "))
      .find(
        (paragraph) => paragraph.length > 0 && !paragraph.startsWith("###"),
      ) ?? "Release notes are available in the changelog."
  );
}

function countBreakingChanges(entry: ChangelogEntry): number {
  return entry.sections
    .filter((section) => section.type === "breaking")
    .reduce((count, section) => {
      const bullets = section.body
        .split("\n")
        .filter((line) => line.trim().startsWith("- "));
      return count + Math.max(1, bullets.length);
    }, 0);
}

function extractComponentDelta(notes: string): number | undefined {
  const match =
    /total component count:\s*\*\*(\d+)\*\*\s*\(up from\s*(\d+)\)/i.exec(notes);
  if (!match) return undefined;
  return Number(match[1]) - Number(match[2]);
}

function extractMigrationUrl(notes: string): string | undefined {
  return /\[migration(?: guide)?]\(([^)]+)\)/i.exec(notes)?.[1];
}

function changelogCandidates(): readonly string[] {
  return [
    path.join(process.cwd(), "CHANGELOG.md"),
    path.join(process.cwd(), "..", "..", "CHANGELOG.md"),
    path.join(process.cwd(), "packages", "ui", "CHANGELOG.md"),
    path.join(process.cwd(), "..", "..", "packages", "ui", "CHANGELOG.md"),
  ];
}

async function readChangelog(): Promise<string> {
  return Promise.any(
    changelogCandidates().map((candidate) => readFile(candidate, "utf8")),
  ).catch(() => "");
}

function parseHeading(line: string): Heading | undefined {
  const match =
    /^##\s+\[?([^\n\]]+)]?(?:\s+-\s+(\d{4}-\d{2}-\d{2}|\d{4}-\d{2}))?/.exec(
      line,
    );
  if (!match) return undefined;
  const rawVersion = match[1];
  if (!rawVersion) return undefined;
  const version = rawVersion.replace(/\s+-\s+repo-wide$/i, "").trim();
  const date = match[2];
  return { date, title: date ? `${version} - ${date}` : version, version };
}

function parseSection(lines: readonly string[]): ChangelogSection | undefined {
  const [heading, ...bodyLines] = lines;
  const body = bodyLines.join("\n").trim();
  if (!heading || !body) return undefined;
  const title = heading.replace(/^###\s+/, "").trim();
  return { body, title, type: sectionTypeFromTitle(title) };
}

function appendSectionBlock(
  blocks: readonly (readonly string[])[],
  line: string,
): readonly (readonly string[])[] {
  if (line.startsWith("### ")) return [...blocks, [line]];
  const last = blocks.at(-1);
  if (!last) return blocks;
  return [...blocks.slice(0, -1), [...last, line]];
}

function parseSections(lines: readonly string[]): readonly ChangelogSection[] {
  return lines
    .reduce(appendSectionBlock, [])
    .map(parseSection)
    .filter((section): section is ChangelogSection => section !== undefined);
}

function parseEntry(block: readonly string[]): ChangelogEntry | undefined {
  const [heading, ...lines] = block;
  const parsedHeading = heading ? parseHeading(heading) : undefined;
  if (!parsedHeading) return undefined;
  const sections = parseSections(lines);
  return {
    anchor: versionToAnchor(parsedHeading.version),
    date: parsedHeading.date,
    sections,
    title: parsedHeading.title,
    version: parsedHeading.version,
  };
}

function appendEntryBlock(
  blocks: readonly (readonly string[])[],
  line: string,
): readonly (readonly string[])[] {
  if (line.startsWith("## ")) return [...blocks, [line]];
  const last = blocks.at(-1);
  if (!last) return blocks;
  return [...blocks.slice(0, -1), [...last, line]];
}

async function parseChangelogEntries(): Promise<readonly ChangelogEntry[]> {
  const changelog = await readChangelog();
  return changelog
    .split("\n")
    .reduce(appendEntryBlock, [])
    .map(parseEntry)
    .filter((entry): entry is ChangelogEntry => entry !== undefined)
    .filter((entry) => entry.sections.length > 0);
}

function filterEntry(
  entry: ChangelogEntry,
  filters: ChangelogFilters,
): ChangelogEntry | undefined {
  if (!isWithinDateRange(entry, filters.from, filters.to)) return undefined;
  if (filters.type === "all") return entry;
  const sections = entry.sections.filter(
    (section) => section.type === filters.type,
  );
  return sections.length > 0 ? { ...entry, sections } : undefined;
}

export async function getChangelogEntries(
  filters?: ChangelogFilters,
): Promise<readonly ChangelogEntry[]> {
  const entries = await parseChangelogEntries();
  const normalizedFilters = filters ?? { type: "all" };
  return entries
    .map((entry) => filterEntry(entry, normalizedFilters))
    .filter((entry): entry is ChangelogEntry => entry !== undefined);
}

function entryToReleaseRecord(entry: ChangelogEntry): ReleaseRecord {
  const notes = entry.sections
    .map((section) => `### ${section.title}\n\n${section.body}`)
    .join("\n\n");
  const version = entry.version === "Unreleased" ? "0.3.0" : entry.version;
  const tag = `v${normalizeVersion(version)}`;

  return {
    anchor: versionToAnchor(version),
    breakingChanges: countBreakingChanges(entry),
    componentDelta: extractComponentDelta(notes),
    date: entry.date,
    migrationUrl: extractMigrationUrl(notes),
    notes,
    summary: extractSummary(notes),
    title: entry.version === "Unreleased" ? "0.3.0 preview" : `v${version}`,
    url: `${GITHUB_REPO_URL}/releases/tag/${tag}`,
    version: tag,
  };
}

async function getLocalReleaseRecords(): Promise<readonly ReleaseRecord[]> {
  const entries = await parseChangelogEntries();
  return entries.map(entryToReleaseRecord);
}

function stringField(
  record: Readonly<Record<string, unknown>>,
  key: string,
): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function githubRecordToReleaseRecord(
  record: Readonly<Record<string, unknown>>,
): ReleaseRecord | undefined {
  const version = stringField(record, "tag_name");
  const url = stringField(record, "html_url");
  const notes = stringField(record, "body") ?? "";
  if (!version || !url || !urlSchema.safeParse(url).success) return undefined;

  return {
    anchor: versionToAnchor(version),
    breakingChanges: /breaking/i.test(notes) ? 1 : 0,
    componentDelta: extractComponentDelta(notes),
    date: stringField(record, "published_at")?.slice(0, 10),
    migrationUrl: extractMigrationUrl(notes),
    notes: notes || "Release notes are available on GitHub.",
    summary: extractSummary(notes),
    title: stringField(record, "name") ?? version,
    url,
    version,
  };
}

async function fetchGithubReleaseData(): Promise<readonly ReleaseRecord[]> {
  const response = await fetch(GITHUB_RELEASES_API, {
    headers: GITHUB_HEADERS,
    next: { revalidate: 3600 },
  });
  if (!response.ok) return [];

  const parsed = githubReleasesSchema.safeParse(await response.json());
  if (!parsed.success) return [];
  return parsed.data
    .map(githubRecordToReleaseRecord)
    .filter((release): release is ReleaseRecord => release !== undefined);
}

async function getGithubReleaseRecords(): Promise<readonly ReleaseRecord[]> {
  return fetchGithubReleaseData().catch(() => []);
}

function mergeLocalRelease(
  localRelease: ReleaseRecord,
  githubByVersion: ReadonlyMap<string, ReleaseRecord>,
): ReleaseRecord {
  const version = normalizeVersion(localRelease.version);
  const githubRelease = githubByVersion.get(version);
  if (!githubRelease) return localRelease;
  return {
    ...localRelease,
    date: githubRelease.date ?? localRelease.date,
    title: githubRelease.title,
    url: githubRelease.url,
  };
}

function githubOnlyReleases(
  githubReleases: readonly ReleaseRecord[],
  localReleases: readonly ReleaseRecord[],
): readonly ReleaseRecord[] {
  const localVersions = new Set(
    localReleases.map((release) => normalizeVersion(release.version)),
  );
  return githubReleases.filter(
    (release) => !localVersions.has(normalizeVersion(release.version)),
  );
}

export async function getReleaseRecords(): Promise<readonly ReleaseRecord[]> {
  const [localReleases, githubReleases] = await Promise.all([
    getLocalReleaseRecords(),
    getGithubReleaseRecords(),
  ]);

  if (githubReleases.length === 0) return localReleases;
  const githubByVersion = new Map(
    githubReleases.map((release) => [
      normalizeVersion(release.version),
      release,
    ]),
  );

  return [
    ...localReleases.map((release) =>
      mergeLocalRelease(release, githubByVersion),
    ),
    ...githubOnlyReleases(githubReleases, localReleases),
  ];
}

export async function getLatestReleaseRecords(
  limit: number,
): Promise<readonly ReleaseRecord[]> {
  const releases = await getReleaseRecords();
  return releases
    .filter(
      (release) => release.date !== undefined || release.anchor === "v0-3-0",
    )
    .slice(0, limit);
}

export function feedUpdatedAt(releases: readonly ReleaseRecord[]): string {
  const firstDated = releases.find((release) => release.date);
  return firstDated?.date
    ? new Date(firstDated.date).toISOString()
    : new Date().toISOString();
}

export function releasePageUrl(release: ReleaseRecord): string {
  return `${SITE_URL}/releases#${release.anchor}`;
}

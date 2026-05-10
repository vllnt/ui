import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { canonical } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/vs") },
  description:
    "Honest, evidence-based comparison of VLLNT UI vs shadcn/ui, Radix UI, HeadlessUI, and NextUI.",
  title: "VLLNT UI vs · Comparisons",
};

const COMPARISONS: ReadonlyArray<{
  readonly slug: string;
  readonly name: string;
  readonly tagline: string;
  readonly available: boolean;
}> = [
  {
    slug: "shadcn",
    name: "shadcn/ui",
    tagline:
      "Closest sibling. Same registry format. Different component count and agent surface.",
    available: true,
  },
  {
    slug: "radix",
    name: "Radix UI",
    tagline: "Accessible primitives — VLLNT UI is built on top of these.",
    available: false,
  },
  {
    slug: "headless-ui",
    name: "HeadlessUI",
    tagline: "Tailwind Labs primitives — different ecosystem.",
    available: false,
  },
  {
    slug: "nextui",
    name: "NextUI",
    tagline: "Component library with its own design language.",
    available: false,
  },
];

export default function VsIndexPage() {
  return (
    <>
      <Sidebar sections={getSidebarSections()} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-16 lg:px-8">
          <h1 className="text-4xl font-bold mb-3">VLLNT UI vs the rest</h1>
          <p className="text-muted-foreground text-lg mb-10">
            Honest comparisons. We call out where alternatives are stronger,
            where VLLNT UI fits better, and where the gap is small enough to
            not matter.
          </p>

          <ul className="space-y-3">
            {COMPARISONS.map((entry) =>
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
                    {entry.tagline} — page coming soon.
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

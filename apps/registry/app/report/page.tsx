import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";

import { canonical } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

import { ReportBugForm } from "./report-bug-form";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/report") },
  description:
    "Report a bug in VLLNT UI. The form opens a prefilled GitHub issue — no backend.",
  robots: { follow: true, index: false },
  title: "Report a bug · VLLNT UI",
};

type SearchParameters = {
  readonly component?: string;
};

export default async function ReportBugPage({
  searchParams,
}: {
  searchParams: Promise<SearchParameters>;
}) {
  const { component } = await searchParams;

  return (
    <>
      <Sidebar sections={getSidebarSections()} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto max-w-2xl px-4 py-16 lg:px-8">
          <h1 className="text-4xl font-semibold mb-3">Report a bug</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Found something broken? Fill out the fields and we&rsquo;ll open a
            prefilled GitHub issue with the right labels and template.
          </p>
          <ReportBugForm initialComponent={component ?? ""} />
        </div>
      </main>
    </>
  );
}

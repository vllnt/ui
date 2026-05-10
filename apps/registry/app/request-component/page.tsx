import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";

import { canonical } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

import { RequestComponentForm } from "./request-component-form";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/request-component") },
  description:
    "Request a new VLLNT UI component. The form opens a prefilled GitHub issue — no backend.",
  robots: { follow: true, index: false },
  title: "Request a component · VLLNT UI",
};

export default function RequestComponentPage() {
  return (
    <>
      <Sidebar sections={getSidebarSections()} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto max-w-2xl px-4 py-16 lg:px-8">
          <h1 className="text-4xl font-bold mb-3">Request a component</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Don&rsquo;t see what you need? Fill out the fields and we&rsquo;ll
            open a prefilled GitHub issue with the right labels and template.
          </p>
          <RequestComponentForm />
        </div>
      </main>
    </>
  );
}

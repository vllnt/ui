import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";

import { Landing } from "@/components/landing/landing";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";
import { getComponentCount, getLibraryVersion } from "@/lib/stats";

export function generateMetadata(): Metadata {
  const componentCount = getComponentCount();
  const version = getLibraryVersion();
  const title = `VLLNT UI — ${componentCount} agent-first React components`;
  const description = `Install any of ${componentCount} accessible React components with the shadcn CLI. Built on Radix UI, Tailwind CSS, and CVA. Every component is a machine-readable JSON descriptor agents can consume directly. v${version}, MIT licensed.`;

  return {
    alternates: { canonical: canonical("/") },
    description,
    openGraph: generateOGMetadata({
      description,
      title,
      type: "home",
    }),
    title,
    twitter: generateTwitterMetadata({
      description,
      title,
      type: "home",
    }),
  };
}

export default function HomePage() {
  return (
    <>
      <Sidebar sections={getSidebarSections()} />
      <main className="flex-1 overflow-y-auto bg-background">
        <Landing />
      </main>
    </>
  );
}

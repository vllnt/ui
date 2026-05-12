import { CodeBlock, Sidebar } from "@vllnt/ui";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

import {
  jsonLdScriptAttributes,
  softwareApplicationLd,
} from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";
import {
  getTemplateInstallCommand,
  getTemplatePath,
  TEMPLATES,
} from "@/lib/templates";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";

const title = "Templates - VLLNT UI";
const description =
  "Starter kits for Next.js apps, dashboards, SaaS products, AI chat, and documentation sites built with VLLNT UI.";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/templates") },
  description,
  openGraph: generateOGMetadata({
    description,
    title,
    type: "docs",
  }),
  title,
  twitter: generateTwitterMetadata({
    description,
    title,
    type: "docs",
  }),
};

export default function TemplatesPage() {
  return (
    <>
      <Script
        id="templates-json-ld"
        {...jsonLdScriptAttributes(
          TEMPLATES.map((template) =>
            softwareApplicationLd({
              description: template.description,
              installCommand: getTemplateInstallCommand(template),
              name: template.title,
              url: `${SITE_URL}${getTemplatePath(template)}`,
            }),
          ),
        )}
      />
      <Sidebar sections={getSidebarSections()} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Starter kits
            </p>
            <h1 className="mt-2 text-4xl font-semibold">Templates</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Curated app blueprints that show how VLLNT UI components work in
              finished product surfaces, not only isolated component examples.
            </p>
          </div>

          <div className="mt-8 max-w-3xl">
            <CodeBlock language="bash">
              {`pnpm dlx create-vllnt-app@latest --template next-starter`}
            </CodeBlock>
          </div>

          <ul className="mt-12 grid gap-5 lg:grid-cols-2">
            {TEMPLATES.map((template) => (
              <li
                className="overflow-hidden rounded-md border border-border bg-card"
                key={template.slug}
              >
                <Link className="group block" href={getTemplatePath(template)}>
                  <div className="border-b border-border bg-muted/30">
                    <Image
                      alt=""
                      className="aspect-video w-full object-cover"
                      height={720}
                      src={template.screenshot}
                      width={1280}
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold">
                          {template.title}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                      <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                          Pages
                        </dt>
                        <dd className="mt-1 font-medium">
                          {template.pages.length}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                          Components
                        </dt>
                        <dd className="mt-1 font-medium">
                          {template.components.length}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                          Stack
                        </dt>
                        <dd className="mt-1 font-medium">
                          {template.stack[0]}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}

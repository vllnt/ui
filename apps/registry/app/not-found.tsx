import "@vllnt/ui/styles.css";
import "@vllnt/ui/themes/default.css";

import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

/**
 * The 404 for URLs outside any known route, and for unknown slugs on routes
 * with `dynamicParams = false`: Next answers those from the root, before the
 * locale layout runs, so this page brings its own document. Inside a locale,
 * `[locale]/not-found.tsx` answers instead.
 */
export const metadata: Metadata = {
  description: "We couldn't find the page you were looking for.",
  robots: { follow: true, index: false },
  title: "Page not found · VLLNT UI",
};

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/components", label: "Components" },
  { href: "/docs", label: "Docs" },
  { href: "/fr", label: "Français" },
] as const;

export default function RootNotFound() {
  return (
    <html className="dark" lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <main
          className="container mx-auto max-w-3xl px-4 py-24 lg:px-8"
          id="main"
        >
          <Link className="text-xl font-semibold" href="/">
            VLLNT UI
          </Link>
          <p className="mt-12 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            404
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Page not found</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            That route does not exist. Try the component index or the docs.
          </p>
          <ul className="mt-8 flex flex-wrap gap-3">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-secondary"
                  href={link.href}
                  hrefLang={link.href === "/fr" ? "fr" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </main>
      </body>
    </html>
  );
}

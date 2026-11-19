import { describe, expect, it, vi } from "vitest";

/**
 * `@/i18n/routing` pulls `next-intl/navigation`, which cannot load in the node
 * test environment. The route needs the locale constants and nothing else.
 */
vi.mock("@/i18n/routing", async () => {
  const { defaultLocale, locales } = await import("@/i18n/locales");

  return { routing: { defaultLocale, locales } };
});

import { markdownPathnames } from "@/lib/markdown-negotiation";

import { generateStaticParams, GET } from "./route";

function request(locale: string, path?: string[]): Promise<Response> {
  return GET(new Request("http://localhost/md"), {
    params: Promise.resolve({ locale, path }),
  });
}

async function markdownOf(locale: string, path?: string[]): Promise<string> {
  const response = await request(locale, path);

  return response.text();
}

describe("markdown route", () => {
  it("answers a page with its markdown and marks the answer as varying by Accept", async () => {
    const response = await request("en", ["docs", "cli"]);
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(response.headers.get("vary")).toBe("Accept");
    expect(response.headers.get("cache-control")).toMatch(/^private/);
    expect(body.startsWith("# ")).toBe(true);
    expect(body).toContain("Canonical page: https://ui.vllnt.com/docs/cli");
  });

  it("serves the llms.txt summary for the home page", async () => {
    const body = await markdownOf("en");

    expect(body).toContain("VLLNT UI");
    expect(body).toContain("Canonical page: https://ui.vllnt.com");
  });

  it("serves a component with its install command and registry URL", async () => {
    const body = await markdownOf("en", ["components", "button"]);

    expect(body).toContain("pnpm dlx shadcn@latest add");
    expect(body).toContain("https://ui.vllnt.com/r/button.json");
  });

  it("serves the docs index with a link to every docs page", async () => {
    const body = await markdownOf("en", ["docs"]);

    expect(body.startsWith("# Docs")).toBe(true);
    expect(body).toContain("(https://ui.vllnt.com/docs/installation)");
    expect(body).toContain("(https://ui.vllnt.com/docs/cli)");
  });

  it("serves the component catalog grouped by category", async () => {
    const body = await markdownOf("fr", ["components"]);

    expect(body.startsWith("# Components")).toBe(true);
    expect(body).toMatch(/^## /m);
    expect(body).toContain("(https://ui.vllnt.com/fr/components/button)");
  });

  it("points a French page at its French canonical URL", async () => {
    const body = await markdownOf("fr", ["components", "button"]);

    expect(body).toContain(
      "Canonical page: https://ui.vllnt.com/fr/components/button",
    );
  });

  it("does not render a tag the browser would have rendered", async () => {
    const body = await markdownOf("en", ["components", "button"]);

    expect(body).not.toMatch(/^<[A-Z]/m);
  });

  it.each([
    ["a page without a twin", "en", ["templates"]],
    ["an unknown locale", "de", ["docs", "cli"]],
  ])("answers an uncached 404 for %s", async (_name, locale, path) => {
    const response = await request(locale, path);

    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("prerenders one document per locale and twin page", () => {
    const parameters = generateStaticParams();

    expect(parameters).toHaveLength(2 * markdownPathnames().length);
    expect(parameters).toContainEqual({ locale: "fr", path: ["docs", "cli"] });
    expect(parameters).toContainEqual({ locale: "en", path: [] });
  });
});

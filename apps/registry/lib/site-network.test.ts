import { describe, expect, it } from "vitest";

import {
  type BrandPath,
  CURRENT_SITE,
  NETWORK_SITES,
  networkFooterColumns,
  switcherGroups,
} from "@/lib/site-network";

const SWITCHER_HEADINGS = {
  directory: "Directory",
  learnBuild: "Learn and build",
  platforms: "Platforms",
};

const FOOTER_HEADINGS = {
  company: "vllnt",
  learnBuild: "Learn and build",
  legal: "Legal",
  platforms: "Platforms",
};

const PAGE_LABELS: Record<BrandPath, string> = {
  "/company": "Company",
  "/contact": "Contact",
  "/journal": "Journal",
  "/legal": "Legal notice",
  "/legal/privacy": "Privacy",
  "/legal/terms": "Terms",
  "/services": "Services",
};

describe("switcherGroups", () => {
  const groups = switcherGroups(SWITCHER_HEADINGS);

  it("lists this site first, alone and marked current", () => {
    expect(groups[0]).toEqual({
      id: "current",
      items: [{ current: true, href: "https://ui.vllnt.com", label: "ui" }],
    });
    expect(CURRENT_SITE).toBe("ui");
  });

  it("follows with the parent, Platforms, Learn and build, and Directory", () => {
    expect(groups.map(({ heading, id }) => [id, heading])).toEqual([
      ["current", undefined],
      ["parent", undefined],
      ["platforms", "Platforms"],
      ["learn-build", "Learn and build"],
      ["directory", "Directory"],
    ]);
  });

  it("never lists a site twice", () => {
    const labels = groups.flatMap(({ items }) =>
      items.map(({ label }) => label),
    );
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("leaves out a site that is not live", () => {
    expect(NETWORK_SITES.status.live).toBe(false);
    const labels = groups.flatMap(({ items }) =>
      items.map(({ label }) => label),
    );
    expect(labels).not.toContain("Status");
    expect(labels).toEqual([
      "ui",
      "vllnt",
      "Maia",
      "Console",
      "Blueprint",
      "Community",
      "Open Source",
      "Tools",
      "Index",
    ]);
  });

  it("marks only this site current", () => {
    expect(
      groups.flatMap(({ items }) => items).filter(({ current }) => current),
    ).toHaveLength(1);
  });
});

describe("networkFooterColumns", () => {
  const columns = networkFooterColumns({
    headings: FOOTER_HEADINGS,
    locale: "en",
    pageLabels: PAGE_LABELS,
  });

  it("builds the four columns in order", () => {
    expect(columns.map(({ heading, id }) => [id, heading])).toEqual([
      ["platforms", "Platforms"],
      ["learn-build", "Learn and build"],
      ["company", "vllnt"],
      ["legal", "Legal"],
    ]);
  });

  it("leaves this site out of its own footer", () => {
    const labels = columns.flatMap(({ links }) =>
      links.map(({ label }) => label),
    );
    expect(labels).not.toContain("ui");
    expect(columns[1]?.links.map(({ label }) => label)).toEqual([
      "Blueprint",
      "Community",
      "Open Source",
      "Tools",
    ]);
  });

  it("links the parent first in its column, then its pages, then the directory", () => {
    expect(columns[2]?.links).toEqual([
      { external: true, href: "https://vllnt.com", label: "vllnt" },
      { href: "https://vllnt.com/company", label: "Company" },
      { href: "https://vllnt.com/services", label: "Services" },
      { href: "https://vllnt.com/journal", label: "Journal" },
      { href: "https://vllnt.com/contact", label: "Contact" },
      { external: true, href: "https://index.vllnt.com", label: "Index" },
    ]);
  });

  it("marks a link to another site external and a link to a parent page not", () => {
    const all = columns.flatMap(({ links }) => links);
    expect(
      all.filter(({ href }) => href.startsWith("https://vllnt.com/")),
    ).toSatisfy((pages: typeof all) =>
      pages.every(({ external }) => external === undefined),
    );
    expect(
      all
        .filter(({ href }) => /^https:\/\/[a-z]+\.vllnt\.com/.test(href))
        .every(({ external }) => external === true),
    ).toBe(true);
  });

  it("sends the legal column to the parent's legal pages", () => {
    expect(columns[3]?.links.map(({ href }) => href)).toEqual([
      "https://vllnt.com/legal",
      "https://vllnt.com/legal/privacy",
      "https://vllnt.com/legal/terms",
    ]);
  });

  it("links the parent's French pages from a French page", () => {
    const french = networkFooterColumns({
      headings: FOOTER_HEADINGS,
      locale: "fr",
      pageLabels: PAGE_LABELS,
    });
    expect(french[2]?.links[0]?.href).toBe("https://vllnt.com/fr");
    expect(french[2]?.links[1]?.href).toBe("https://vllnt.com/fr/company");
    expect(french[3]?.links[2]?.href).toBe("https://vllnt.com/fr/legal/terms");
    expect(french[0]?.links[0]?.href).toBe("https://maia.vllnt.com");
  });

  it("links no site that is not live", () => {
    expect(
      columns.flatMap(({ links }) => links).map(({ href }) => href),
    ).not.toContain(NETWORK_SITES.status.href);
  });
});

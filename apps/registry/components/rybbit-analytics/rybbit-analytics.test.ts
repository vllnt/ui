import { createElement } from "react";

import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RybbitAnalytics } from "./rybbit-analytics";

/** Synthetic values: the real host and site id live in the build environment. */
const HOST = "https://analytics.example.test";
const SITE_ID = "test-site-id";
const SCRIPT_SRC = `${HOST}/api/script.js`;

/** What the tag holds: the site id, `defer` and the address, nothing else. */
const TAG_ATTRIBUTES = ["data-site-id", "defer", "src"];

const ENTITIES = new Map([
  ["&#x27;", "'"],
  ["&amp;", "&"],
  ["&gt;", ">"],
  ["&lt;", "<"],
  ["&quot;", '"'],
]);

/** Renders the component with the two build variables set to the given values. */
function render(host: string | undefined, siteId: string | undefined): string {
  vi.stubEnv("NEXT_PUBLIC_RYBBIT_HOST", host);
  vi.stubEnv("NEXT_PUBLIC_RYBBIT_SITE_ID", siteId);

  return renderToStaticMarkup(createElement(RybbitAnalytics));
}

function scriptTags(html: string): string[] {
  return [...html.matchAll(/<script\b[^>]*>/g)].map((match) => match[0]);
}

/** The value of one attribute of a tag, with the HTML escapes undone. */
function attribute(tag: string, name: string): string | undefined {
  const raw = new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];

  return raw?.replaceAll(
    /&(?:#x27|amp|gt|lt|quot);/g,
    (entity) => ENTITIES.get(entity) ?? entity,
  );
}

/** The names of every attribute of a tag, skipping the quoted values. */
function attributeNames(tag: string): string[] {
  return [...tag.matchAll(/\s([^\s"'=>]+)(?:="[^"]*")?/g)].map(
    (match) => match[1] ?? "",
  );
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("RybbitAnalytics without both variables", () => {
  it.each([
    ["host unset", undefined, SITE_ID],
    ["host empty", "", SITE_ID],
    ["host blank", "   ", SITE_ID],
    ["site id unset", HOST, undefined],
    ["site id empty", HOST, ""],
    ["site id blank", HOST, "   "],
    ["both unset", undefined, undefined],
    ["both empty", "", ""],
  ])("renders nothing with %s", (_, host, siteId) => {
    expect(render(host, siteId)).toBe("");
  });
});

describe("RybbitAnalytics with a host that is not HTTPS", () => {
  it.each([
    ["plain http", "http://analytics.example.test"],
    ["no scheme", "analytics.example.test"],
    ["a protocol-relative address", "//analytics.example.test"],
    ["a script address", "javascript:alert(1)"],
    ["garbage text", "not a host at all"],
  ])("renders nothing for %s", (_, host) => {
    expect(render(host, SITE_ID)).toBe("");
  });
});

describe("RybbitAnalytics with both variables set", () => {
  it("renders exactly one deferred script from the host with the site id", () => {
    const html = render(HOST, SITE_ID);
    const tags = scriptTags(html);

    expect(tags).toHaveLength(1);
    expect(html.match(/<script\b/g)).toHaveLength(1);
    expect(attribute(tags[0] ?? "", "src")).toBe(SCRIPT_SRC);
    expect(attribute(tags[0] ?? "", "data-site-id")).toBe(SITE_ID);
    expect(tags[0]).toMatch(/\sdefer(=""|\s|>)/);
    expect(tags[0]).not.toMatch(/\sasync\b/);
  });

  it("carries the site id, defer and src, and nothing else", () => {
    const tag = scriptTags(render(HOST, SITE_ID))[0] ?? "";

    expect(attributeNames(tag).toSorted()).toEqual(TAG_ATTRIBUTES);
  });

  it("is a script tag with no body, as the server HTML holds it", () => {
    expect(render(HOST, SITE_ID)).toMatch(/^<script\b.*><\/script>$/);
  });

  it.each([
    ["a trailing slash", `${HOST}/`],
    ["a path", `${HOST}/proxy/analytics`],
    ["a query and a fragment", `${HOST}/?x=1#y`],
    ["credentials", "https://user:pass@analytics.example.test/"],
    ["surrounding blanks", `  ${HOST}\n`],
  ])("keeps only the origin of a host with %s", (_, host) => {
    const tag = scriptTags(render(host, SITE_ID))[0] ?? "";

    expect(attribute(tag, "src")).toBe(SCRIPT_SRC);
  });

  it("trims the site id", () => {
    const tag = scriptTags(render(HOST, `  ${SITE_ID}\n`))[0] ?? "";

    expect(attribute(tag, "data-site-id")).toBe(SITE_ID);
  });

  it.each([
    ["double quotes", 'a"b'],
    ["single quotes", "a'b"],
    ["a closing tag", 'a"></script><script>alert(1)</script>'],
    ["an ampersand", "a&b"],
  ])("keeps a site id with %s inside one attribute", (_, siteId) => {
    const html = render(HOST, siteId);
    const tag = scriptTags(html)[0] ?? "";

    expect(scriptTags(html)).toHaveLength(1);
    expect(html.match(/<script\b/g)).toHaveLength(1);
    expect(attribute(tag, "data-site-id")).toBe(siteId);
    expect(attributeNames(tag).toSorted()).toEqual(TAG_ATTRIBUTES);
  });
});

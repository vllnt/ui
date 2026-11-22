import { rybbitManagerHead, rybbitTag } from "../.storybook/rybbit";

/** Synthetic values: the real host and site id live in the build environment. */
const HOST = "https://analytics.example.test";
const SITE_ID = "test-site-id";
const TAG = `<script defer data-site-id="${SITE_ID}" src="${HOST}/api/script.js"></script>`;

/** The number of script tags in a piece of markup. */
function scriptCount(html: string): number {
  return html.match(/<script\b/g)?.length ?? 0;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Storybook Rybbit tag", () => {
  it.each([
    ["host unset", undefined, SITE_ID],
    ["host empty", "", SITE_ID],
    ["host blank", "   ", SITE_ID],
    ["site id unset", HOST, undefined],
    ["site id empty", HOST, ""],
    ["site id blank", HOST, "   "],
    ["both unset", undefined, undefined],
    ["both empty", "", ""],
    ["a host that is plain http", "http://analytics.example.test", SITE_ID],
    ["a host with no scheme", "analytics.example.test", SITE_ID],
    ["a script address as the host", "javascript:alert(1)", SITE_ID],
  ])("is empty with %s", (_, host, siteId) => {
    expect(rybbitTag(host, siteId)).toBe("");
  });

  it("is exactly one deferred script from the host with the site id", () => {
    const tag = rybbitTag(HOST, SITE_ID);

    expect(tag).toBe(TAG);
    expect(scriptCount(tag)).toBe(1);
  });

  it.each([
    ["a trailing slash", `${HOST}/`],
    ["a path", `${HOST}/proxy/analytics`],
    ["a query and a fragment", `${HOST}/?x=1#y`],
    ["surrounding blanks", `  ${HOST}\n`],
  ])("keeps only the origin of a host with %s", (_, host) => {
    expect(rybbitTag(host, SITE_ID)).toBe(TAG);
  });

  it("trims the site id", () => {
    expect(rybbitTag(HOST, `  ${SITE_ID}\n`)).toBe(TAG);
  });

  it.each([
    ["double quotes", 'a"b', 'data-site-id="a&quot;b"'],
    ["a closing tag", "a</script>b", 'data-site-id="a&lt;/script&gt;b"'],
    ["an ampersand", "a&b", 'data-site-id="a&amp;b"'],
  ])("escapes a site id with %s", (_, siteId, attribute) => {
    const tag = rybbitTag(HOST, siteId);

    expect(tag).toContain(attribute);
    expect(scriptCount(tag)).toBe(1);
    expect(tag.match(/<\/script>/g)).toHaveLength(1);
  });
});

describe("Storybook Rybbit manager head", () => {
  it("leaves the head as it is without the variables", () => {
    vi.stubEnv("NEXT_PUBLIC_RYBBIT_HOST", "");
    vi.stubEnv("NEXT_PUBLIC_RYBBIT_SITE_ID", "");

    expect(rybbitManagerHead("")).toBe("");
    expect(rybbitManagerHead('<meta name="a">')).toBe('<meta name="a">');
    expect(rybbitManagerHead()).toBe("");
  });

  it("leaves the head as it is with only one variable", () => {
    vi.stubEnv("NEXT_PUBLIC_RYBBIT_HOST", HOST);
    vi.stubEnv("NEXT_PUBLIC_RYBBIT_SITE_ID", "");

    expect(rybbitManagerHead("<meta>")).toBe("<meta>");
  });

  it("appends exactly one tag with both variables", () => {
    vi.stubEnv("NEXT_PUBLIC_RYBBIT_HOST", HOST);
    vi.stubEnv("NEXT_PUBLIC_RYBBIT_SITE_ID", SITE_ID);

    const head = rybbitManagerHead("<meta>");

    expect(head).toBe(`<meta>${TAG}`);
    expect(scriptCount(head)).toBe(1);
  });
});

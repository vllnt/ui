import main from "../.storybook/main";
import { rybbitManagerHead } from "../.storybook/rybbit";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Storybook main config", () => {
  it("builds the manager head with the Rybbit head, so the tag rides in the manager page only", () => {
    expect(main.managerHead).toBe(rybbitManagerHead);
  });

  it("never adds a Cloudflare beacon to the head, whatever the Rybbit variables say", () => {
    vi.stubEnv("NEXT_PUBLIC_RYBBIT_HOST", "https://analytics.example.test");
    vi.stubEnv("NEXT_PUBLIC_RYBBIT_SITE_ID", "test-site-id");

    expect(rybbitManagerHead("")).not.toMatch(
      /cloudflareinsights|data-cf-beacon/,
    );
  });
});

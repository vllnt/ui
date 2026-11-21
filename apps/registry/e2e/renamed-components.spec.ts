import { expect, test } from "@playwright/test";

/**
 * A renamed component's old page answers with a permanent redirect through the
 * real middleware, in both locales.
 */
const MOVED = [
  ["/components/jarvis-dock", "/components/command-dock"],
  ["/fr/components/jarvis-dock", "/fr/components/command-dock"],
] as const;

test.describe("renamed component pages", () => {
  for (const [from, to] of MOVED) {
    test(`${from} answers 308 with a Location of ${to}`, async ({ request }) => {
      const response = await request.get(from, { maxRedirects: 0 });

      expect(response.status()).toBe(308);
      expect(new URL(response.headers().location ?? "", "http://x").pathname).toBe(
        to,
      );
    });
  }
});

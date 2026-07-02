import { expect, test } from "@playwright/experimental-ct-react";

import { Display } from "./display/display";
import { Heading } from "./heading/heading";
import { Text } from "./text/text";

test.describe("Typography token wiring (#465)", () => {
  test("Heading renders the semantic element for every level", async ({
    mount,
    page,
  }) => {
    await mount(
      <div>
        <Heading level={1}>Level one</Heading>
        <Heading level={2}>Level two</Heading>
        <Heading level={3}>Level three</Heading>
        <Heading level={4}>Level four</Heading>
        <Heading level={5}>Level five</Heading>
        <Heading level={6}>Level six</Heading>
      </div>,
    );

    for (let level = 1; level <= 6; level += 1) {
      await expect(page.getByRole("heading", { level })).toBeVisible();
    }
  });

  test("Heading defaults to sans/600, then a theme overrides family + weight via tokens alone", async ({
    mount,
    page,
  }) => {
    await mount(<Heading level={1}>Brandable heading</Heading>);

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveText("Brandable heading");

    // Default house style: the display family resolves to the sans stack, weight 600.
    const defaultFamily = await heading.evaluate(
      (node) => getComputedStyle(node).fontFamily,
    );
    const defaultWeight = await heading.evaluate(
      (node) => getComputedStyle(node).fontWeight,
    );
    expect(defaultFamily.toLowerCase()).toContain("system-ui");
    expect(defaultWeight).toBe("600");

    // A brand theme overrides the tokens — no library edit, no extra className.
    await page.evaluate(() => {
      document.documentElement.style.setProperty(
        "--font-display",
        "Georgia, serif",
      );
      document.documentElement.style.setProperty("--font-weight-heading", "800");
    });

    const themedFamily = await heading.evaluate(
      (node) => getComputedStyle(node).fontFamily,
    );
    const themedWeight = await heading.evaluate(
      (node) => getComputedStyle(node).fontWeight,
    );
    expect(themedFamily.toLowerCase()).toContain("georgia");
    expect(themedWeight).toBe("800");
  });

  test("Text resolves the sans body token", async ({ mount, page }) => {
    await mount(<Text>Body copy</Text>);

    const family = await page
      .getByText("Body copy")
      .evaluate((node) => getComputedStyle(node).fontFamily);
    expect(family.toLowerCase()).toContain("system-ui");
  });
});

test.describe("Display respects prefers-reduced-motion (#465)", () => {
  test("plays the reveal when motion is allowed", async ({ mount, page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await mount(<Display animated>Motion allowed</Display>);

    const animationName = await page
      .getByText("Motion allowed")
      .evaluate((node) => getComputedStyle(node).animationName);
    expect(animationName).toBe("vllnt-animated-text-reveal");
  });

  test("does not animate under prefers-reduced-motion: reduce", async ({
    mount,
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mount(<Display animated>Motion reduced</Display>);

    const animationName = await page
      .getByText("Motion reduced")
      .evaluate((node) => getComputedStyle(node).animationName);
    expect(animationName).toBe("none");
  });
});

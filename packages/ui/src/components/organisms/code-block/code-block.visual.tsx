import { expect, test } from "@playwright/experimental-ct-react";
import type { Locator, Page } from "@playwright/test";

import { CodeBlock } from "./code-block";

const SAMPLE = `function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));`;

const LONG_LINE = `const message = "A long line that does not fit in a narrow column, so it either wraps or scrolls.";`;

const LONG_TITLE = "packages/ui/src/components/organisms/code-block/code-block.tsx";

async function waitForHighlight(page: Page): Promise<void> {
  await expect(page.locator("code .token").first()).toBeVisible();
}

async function scrollsSideways(component: Locator): Promise<boolean> {
  return component.locator("pre").evaluate((pre) => {
    const box = pre.parentElement;
    return box !== null && box.scrollWidth > box.clientWidth;
  });
}

test.describe("CodeBlock Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<CodeBlock />);
    await expect(page).toHaveScreenshot("code-block-default.png");
  });

  test("title header", async ({ mount, page }) => {
    const component = await mount(
      <CodeBlock title="greet.ts">{SAMPLE}</CodeBlock>,
    );
    await waitForHighlight(page);
    await expect(component).toHaveScreenshot("code-block-title.png");
  });

  test("line numbers", async ({ mount, page }) => {
    const component = await mount(
      <CodeBlock showLineNumbers>{SAMPLE}</CodeBlock>,
    );
    await waitForHighlight(page);
    await expect(component.locator(".linenumber").first()).toHaveCSS(
      "font-style",
      "normal",
    );
    await expect(component).toHaveScreenshot("code-block-line-numbers.png");
  });

  test("wrap on", async ({ mount, page }) => {
    const component = await mount(
      <div style={{ width: 320 }}>
        <CodeBlock showLineNumbers title="message.ts" wrap>
          {LONG_LINE}
        </CodeBlock>
      </div>,
    );
    await waitForHighlight(page);
    await expect(component).toHaveScreenshot("code-block-wrap-on.png");
    expect(await scrollsSideways(component)).toBe(false);
  });

  test("wrap off", async ({ mount, page }) => {
    const component = await mount(
      <div style={{ width: 320 }}>
        <CodeBlock showLineNumbers title="message.ts">
          {LONG_LINE}
        </CodeBlock>
      </div>,
    );
    await waitForHighlight(page);
    await expect(component).toHaveScreenshot("code-block-wrap-off.png");
    expect(await scrollsSideways(component)).toBe(true);
  });

  test("copied state", async ({ context, mount, page }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const component = await mount(
      <CodeBlock title="greet.ts">{SAMPLE}</CodeBlock>,
    );
    await waitForHighlight(page);
    const button = component.getByRole("button", { name: "Copy code" });
    await button.click();
    const status = component.getByRole("status");
    await expect(status).toHaveText("Copied");
    await expect(status).toHaveAttribute("aria-live", "polite");
    await expect(button).toHaveAccessibleName("Copy code");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      SAMPLE,
    );
    await expect(component).toHaveScreenshot("code-block-copied.png");
    await expect(status).toHaveText("");
  });

  test("copied state without a title", async ({ context, mount, page }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const component = await mount(<CodeBlock>{SAMPLE}</CodeBlock>);
    await waitForHighlight(page);
    await component.getByRole("button", { name: "Copy code" }).click();
    await expect(component.getByRole("status")).toHaveText("Copied");
    await expect(component).toHaveScreenshot("code-block-copied-overlay.png");
  });

  test("follows the light and dark theme", async ({ mount, page }) => {
    const component = await mount(
      <CodeBlock showLineNumbers title="greet.ts">
        {SAMPLE}
      </CodeBlock>,
    );
    await waitForHighlight(page);
    const keyword = component
      .locator("code .token")
      .filter({ hasText: /^function$/ })
      .first();
    const read = async (): Promise<{ background: string; keyword: string }> => ({
      background: await component.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      ),
      keyword: await keyword.evaluate(
        (element) => getComputedStyle(element).color,
      ),
    });

    const light = await read();
    await expect(component).toHaveScreenshot("code-block-light.png");
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    const dark = await read();
    await expect(component).toHaveScreenshot("code-block-dark.png");

    expect(dark.background).not.toBe(light.background);
    expect(dark.keyword).not.toBe(light.keyword);
  });

  test("mobile 390", async ({ mount, page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => {
      errors.push(String(error));
    });
    await page.setViewportSize({ height: 844, width: 390 });
    await mount(
      <CodeBlock showLineNumbers title={LONG_TITLE}>
        {`${SAMPLE}\n${LONG_LINE}`}
      </CodeBlock>,
    );
    await waitForHighlight(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page).toHaveScreenshot("code-block-mobile.png");
    expect(errors).toEqual([]);
  });

  test("mobile 390 wrap", async ({ mount, page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => {
      errors.push(String(error));
    });
    await page.setViewportSize({ height: 844, width: 390 });
    await mount(
      <CodeBlock showLineNumbers title={LONG_TITLE} wrap>
        {`${SAMPLE}\n${LONG_LINE}`}
      </CodeBlock>,
    );
    await waitForHighlight(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page).toHaveScreenshot("code-block-mobile-wrap.png");
    expect(errors).toEqual([]);
  });
});

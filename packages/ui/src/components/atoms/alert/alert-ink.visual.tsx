import { expect, test } from "@playwright/experimental-ct-react";

import { Alert, AlertDescription, AlertTitle } from "./alert";

// Real-browser check of the shipped styles: a destructive Alert keeps its
// title and body in the foreground colour, and only the glyph and the border
// carry the status colour. Compares computed colours, so no baselines.
for (const scheme of ["light", "dark"] as const) {
  test(`destructive alert ink in ${scheme} mode`, async ({ mount, page }) => {
    const problems: string[] = [];
    page.on("pageerror", (error) => problems.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") {
        problems.push(message.text());
      }
    });

    await mount(
      <div>
        <Alert data-testid="alert" variant="destructive">
          <svg
            aria-hidden="true"
            data-testid="glyph"
            height="16"
            viewBox="0 0 16 16"
            width="16"
          >
            <circle cx="8" cy="8" fill="currentColor" r="6" />
          </svg>
          <AlertTitle data-testid="title">Payment failed</AlertTitle>
          <AlertDescription data-testid="body">
            Check the card number.
          </AlertDescription>
        </Alert>
        <p className="text-foreground" data-testid="foreground-reference">
          reference
        </p>
        <p className="text-destructive" data-testid="destructive-reference">
          reference
        </p>
      </div>,
    );
    await page.evaluate((mode) => {
      document.documentElement.classList.toggle("dark", mode === "dark");
    }, scheme);

    const colorOf = (testId: string): Promise<string> =>
      page
        .getByTestId(testId)
        .evaluate((element) => getComputedStyle(element).color);

    const foreground = await colorOf("foreground-reference");
    const destructive = await colorOf("destructive-reference");
    expect(foreground).not.toBe(destructive);
    expect(await colorOf("title")).toBe(foreground);
    expect(await colorOf("body")).toBe(foreground);
    expect(await colorOf("glyph")).toBe(destructive);
    const border = await page
      .getByTestId("alert")
      .evaluate((element) => getComputedStyle(element).borderTopColor);
    expect(border).not.toBe(foreground);
    expect(problems).toEqual([]);
  });
}

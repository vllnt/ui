import { expect, test } from "@playwright/experimental-ct-react";

import { EmptyState } from "./empty-state";

test.describe("EmptyState Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <EmptyState
        description="Try adjusting your search or filters."
        title="No results found"
      />,
    );
    await expect(component).toHaveScreenshot("empty-state-default.png");
  });

  test("size-sm", async ({ mount }) => {
    const component = await mount(
      <EmptyState description="x" size="sm" title="Empty" />,
    );
    await expect(component).toHaveScreenshot("empty-state-size-sm.png");
  });

  test("size-lg", async ({ mount }) => {
    const component = await mount(
      <EmptyState
        description="There is nothing here yet. Get started by creating your first item."
        size="lg"
        title="Welcome"
      />,
    );
    await expect(component).toHaveScreenshot("empty-state-size-lg.png");
  });
});

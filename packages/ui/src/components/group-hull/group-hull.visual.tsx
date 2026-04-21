import { expect, test } from "@playwright/experimental-ct-react";

import { ObjectCard } from "../object-card";
import { GroupHull } from "./group-hull";

test.describe("GroupHull Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <GroupHull description="A durable canvas neighborhood for related runtime objects." title="Content lane">
        <ObjectCard kind="Agent" title="Writer" />
        <ObjectCard kind="Artifact" title="Brief" />
      </GroupHull>,
    );

    await expect(page).toHaveScreenshot("group-hull-default.png");
  });
});

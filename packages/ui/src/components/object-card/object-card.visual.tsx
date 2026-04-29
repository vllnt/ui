import { expect, test } from "@playwright/experimental-ct-react";

import { AnchorPort } from "../anchor-port";
import { ObjectCard } from "./object-card";

test.describe("ObjectCard Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <ObjectCard
        footer="Latest artifact verified"
        kind="Artifact"
        metrics={[
          { label: "Version", value: "v12" },
          { label: "Quality", value: "92" },
        ]}
        ports={<AnchorPort aria-label="Artifact port" side="right" state="active" />}
        state="complete"
        summary="Pinned output object with lineage, score, and delivery state."
        title="Research summary bundle"
      />,
    );

    await expect(page).toHaveScreenshot("object-card-default.png");
  });
});

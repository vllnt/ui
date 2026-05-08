import { expect, test } from "@playwright/experimental-ct-react";

import { PropertySection } from "./property-section";

test.describe("PropertySection Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="w-72 p-4">
        <PropertySection
          entries={[
            { id: "x", label: "X", value: "120" },
            { id: "y", label: "Y", value: "80" },
            { id: "w", label: "Width", value: "240" },
            { id: "h", label: "Height", value: "120" },
          ]}
          title="Layout"
        />
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "property-section-default.png",
    );
  });
});

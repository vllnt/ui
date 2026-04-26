import { expect, test } from "@playwright/experimental-ct-react";

import { Tour } from "./tour";

test.describe("Tour Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="max-w-xl p-6">
        <Tour
          steps={[
            { description: "See the lesson outline and objectives first.", id: "outline", title: "Orientation" },
            { description: "Use the examples panel to compare solutions.", id: "examples", title: "Worked examples", badge: "Recommended" },
            { description: "Finish with a quick check for understanding.", id: "check", title: "Knowledge check" },
          ]}
        />
      </div>,
    );

    await expect(page).toHaveScreenshot("tour-default.png");
  });
});

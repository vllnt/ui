import { expect, test } from "@playwright/experimental-ct-react";

import { Stepper } from "./stepper";

test.describe("Stepper Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="max-w-4xl p-6">
        <Stepper
          currentStep={2}
          steps={[
            { id: "plan", title: "Plan", description: "Outline the lesson flow." },
            { id: "study", title: "Study", description: "Work through examples." },
            { id: "reflect", title: "Reflect", description: "Summarize key takeaways." },
          ]}
        />
      </div>,
    );

    await expect(page).toHaveScreenshot("stepper-default.png");
  });
});

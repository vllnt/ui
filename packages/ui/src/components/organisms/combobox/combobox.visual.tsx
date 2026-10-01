import { expect, test } from "@playwright/experimental-ct-react";

import { Combobox } from "./combobox";

test.describe("Combobox Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="w-80 p-6">
        <Combobox
          options={[
            { label: "Next.js", value: "next.js" },
            { label: "React", value: "react" },
            { label: "SvelteKit", value: "sveltekit" },
          ]}
          value="react"
        />
      </div>,
    );

    await expect(page).toHaveScreenshot("combobox-default.png");
  });
});

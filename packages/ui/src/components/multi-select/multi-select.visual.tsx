import { expect, test } from "@playwright/experimental-ct-react";

import { MultiSelect } from "./multi-select";

const options = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Svelte", value: "svelte" },
];

test.describe("MultiSelect Visual", () => {
  test("selected values", async ({ mount, page }) => {
    await mount(
      <div className="w-80 p-6">
        <MultiSelect defaultValue={["react", "vue"]} options={options} />
      </div>,
    );

    await expect(page).toHaveScreenshot("multi-select-selected-values.png");
  });
});

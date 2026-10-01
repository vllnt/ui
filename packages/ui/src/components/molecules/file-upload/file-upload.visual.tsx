import { expect, test } from "@playwright/experimental-ct-react";

import { FileUpload } from "./file-upload";

test.describe("FileUpload Visual", () => {
  test("default", async ({ mount, page }) => {
    const demoFile = new File(["contract"], "contract.pdf", {
      type: "application/pdf",
    });

    await mount(
      <div className="w-[28rem] p-6">
        <FileUpload files={[demoFile]} />
      </div>,
    );

    await expect(page).toHaveScreenshot("file-upload-default.png");
  });
});

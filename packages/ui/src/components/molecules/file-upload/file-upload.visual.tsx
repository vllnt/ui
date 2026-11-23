import { expect, test } from "@playwright/experimental-ct-react";

import { FileUploadWithFilePreview } from "./file-upload.visual.fixture";

test.describe("FileUpload Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<FileUploadWithFilePreview />);

    await expect(page).toHaveScreenshot("file-upload-default.png");
  });
});

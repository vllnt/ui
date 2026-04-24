import { expect, test } from "@playwright/experimental-ct-react";

import { Badge } from "../badge";
import { AIChatInput } from "./ai-chat-input";

test.describe("AIChatInput Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="max-w-2xl p-6">
        <AIChatInput
          helperText="Use @ to reference recent files"
          status="Ready"
          toolbar={<Badge variant="secondary">Workspace context</Badge>}
          value="Can you rewrite this section so it sounds more concise?"
        />
      </div>,
    );

    await expect(page).toHaveScreenshot("ai-chat-input-default.png");
  });
});

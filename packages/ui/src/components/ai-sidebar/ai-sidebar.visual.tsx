import { expect, test } from "@playwright/experimental-ct-react";

import {
  AISidebar,
  AISidebarClose,
  AISidebarContent,
  AISidebarFooter,
  AISidebarHeader,
  AISidebarProvider,
  AISidebarTitle,
} from "./ai-sidebar";

test.describe("AISidebar Visual", () => {
  test("default-open", async ({ mount }) => {
    const component = await mount(
      <div className="relative h-[480px] w-[600px] bg-muted/30">
        <AISidebarProvider defaultOpen>
          <AISidebar className="!relative">
            <AISidebarHeader>
              <AISidebarTitle>AI Assistant</AISidebarTitle>
              <AISidebarClose />
            </AISidebarHeader>
            <AISidebarContent>
              <p className="text-sm text-muted-foreground">
                Ask anything about this document.
              </p>
              <p className="text-sm text-foreground">
                I can help you summarize, draft, or refactor.
              </p>
            </AISidebarContent>
            <AISidebarFooter>
              <p className="text-xs text-muted-foreground">
                Composer goes here…
              </p>
            </AISidebarFooter>
          </AISidebar>
        </AISidebarProvider>
      </div>,
    );
    await expect(component).toHaveScreenshot("ai-sidebar-default-open.png");
  });
});

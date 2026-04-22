import { expect, test } from "@playwright/experimental-ct-react";

import { SidebarProvider } from "../sidebar-provider";
import { Sidebar } from "./sidebar";

const sampleSections = [
  {
    items: [
      { href: "/introduction", title: "Introduction" },
      { href: "/getting-started", title: "Getting Started" },
    ],
    title: "Overview",
  },
  {
    collapsible: true,
    defaultOpen: true,
    items: [
      { href: "/button", title: "Button" },
      { href: "/input", title: "Input" },
      { href: "/dialog", title: "Dialog" },
    ],
    title: "Components",
  },
];

test.describe("Sidebar Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <SidebarProvider>
        <div style={{ display: "flex", height: 400, width: 300 }}>
          <Sidebar sections={sampleSections} />
        </div>
      </SidebarProvider>,
    );
    await expect(page).toHaveScreenshot("sidebar-default.png");
  });
});

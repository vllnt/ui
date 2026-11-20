import { expect, test } from "@playwright/experimental-ct-react";

import { AccessMatrix, type AccessMatrixValue } from "./access-matrix";

const subjects = [
  { description: "Manage members and billing", id: "owners", label: "Owners" },
  { description: "Edit network policy", id: "network", label: "Network team" },
  { id: "viewers", label: "Viewers" },
];

const permissions = [
  { id: "read", label: "Read" },
  { id: "write", label: "Write" },
  { id: "invite", label: "Invite" },
];

const value: AccessMatrixValue = {
  network: { invite: "denied", read: "inherited", write: "granted" },
  owners: { invite: "granted", read: "granted", write: "granted" },
  viewers: { invite: "denied", read: "granted", write: "denied" },
};

test.describe("AccessMatrix Visual", () => {
  test("grid", async ({ mount, page }) => {
    await mount(
      <AccessMatrix
        permissions={permissions}
        subjects={subjects}
        title="Team permissions"
        value={value}
      />,
    );
    await expect(page).toHaveScreenshot("access-matrix-grid.png");
  });

  test("grid interactive", async ({ mount, page }) => {
    const component = await mount(
      <AccessMatrix
        onChange={() => {}}
        permissions={permissions}
        subjects={subjects}
        title="Team permissions"
        value={value}
      />,
    );
    await component
      .getByRole("button", { name: "Viewers, Read: Granted" })
      .focus();
    await expect(page).toHaveScreenshot("access-matrix-grid-interactive.png");
  });

  test("list", async ({ mount, page }) => {
    await mount(
      <AccessMatrix
        mode="list"
        permissions={permissions}
        subjects={subjects}
        title="Team permissions"
        value={value}
      />,
    );
    await expect(page).toHaveScreenshot("access-matrix-list.png");
  });

  test("mobile 390", async ({ mount, page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });
    page.on("pageerror", (error) => {
      errors.push(String(error));
    });
    await page.setViewportSize({ height: 844, width: 390 });
    await mount(
      <AccessMatrix
        mode="list"
        onChange={() => {}}
        permissions={permissions}
        subjects={subjects}
        title="Team permissions"
        value={value}
      />,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page).toHaveScreenshot("access-matrix-mobile.png");
    expect(errors).toEqual([]);
  });
});

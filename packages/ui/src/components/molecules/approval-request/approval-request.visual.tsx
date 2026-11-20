import { expect, test } from "@playwright/experimental-ct-react";

import {
  ApprovalRequest,
  type ApprovalRequestProps,
} from "./approval-request";

const noop = (): void => {};

const baseProps: ApprovalRequestProps = {
  action: "pnpm db:migrate --env production",
  detail: "The agent wants to apply 3 pending migrations to the database.",
  onApprove: noop,
  onDeny: noop,
  remember: { label: "Always allow this command in this workspace" },
  risk: "medium",
  title: "Run database migration",
};

test.describe("ApprovalRequest Visual", () => {
  test("pending medium", async ({ mount, page }) => {
    await mount(<ApprovalRequest {...baseProps} />);
    await expect(page).toHaveScreenshot("approval-request-pending-medium.png");
  });

  test("pending high", async ({ mount, page }) => {
    await mount(
      <ApprovalRequest
        {...baseProps}
        action="rm -rf ./dist ./node_modules/.cache"
        detail="Deletes build output and caches. This cannot be undone."
        risk="high"
        title="Delete build output"
      />,
    );
    await expect(page).toHaveScreenshot("approval-request-pending-high.png");
  });

  test("pending low", async ({ mount, page }) => {
    await mount(
      <ApprovalRequest
        {...baseProps}
        action="git status --short"
        detail="Reads the working tree. Nothing is changed."
        remember={undefined}
        risk="low"
        title="Read repository status"
      />,
    );
    await expect(page).toHaveScreenshot("approval-request-pending-low.png");
  });

  test("approved", async ({ mount, page }) => {
    await mount(<ApprovalRequest {...baseProps} status="approved" />);
    await expect(page).toHaveScreenshot("approval-request-approved.png");
  });

  test("denied", async ({ mount, page }) => {
    await mount(
      <ApprovalRequest {...baseProps} risk="high" status="denied" />,
    );
    await expect(page).toHaveScreenshot("approval-request-denied.png");
  });

  test("expired", async ({ mount, page }) => {
    await mount(<ApprovalRequest {...baseProps} status="expired" />);
    await expect(page).toHaveScreenshot("approval-request-expired.png");
  });

  test("hud", async ({ mount, page }) => {
    await mount(<ApprovalRequest {...baseProps} placement="hud" />);
    await expect(page).toHaveScreenshot("approval-request-hud.png");
  });

  test("dialog", async ({ mount, page }) => {
    await mount(<ApprovalRequest {...baseProps} placement="dialog" />);
    await expect(page).toHaveScreenshot("approval-request-dialog.png");
  });

  test("approve and deny buttons call their handlers", async ({ mount }) => {
    let approved = 0;
    let denied = 0;
    const component = await mount(
      <ApprovalRequest
        {...baseProps}
        onApprove={() => {
          approved += 1;
        }}
        onDeny={() => {
          denied += 1;
        }}
      />,
    );
    await component.getByRole("button", { name: "Approve" }).click();
    await expect.poll(() => approved).toBe(1);
    expect(denied).toBe(0);
    await component.getByRole("button", { name: "Deny" }).click();
    await expect.poll(() => denied).toBe(1);
  });

  test("remember checkbox toggles from the label and the keyboard", async ({
    mount,
  }) => {
    const changes: boolean[] = [];
    const component = await mount(
      <ApprovalRequest
        {...baseProps}
        remember={{
          label: "Always allow this command in this workspace",
          onCheckedChange: (checked) => {
            changes.push(checked);
          },
        }}
      />,
    );
    const checkbox = component.getByRole("checkbox", {
      name: "Always allow this command in this workspace",
    });
    await expect(checkbox).not.toBeChecked();
    await component
      .getByText("Always allow this command in this workspace")
      .click();
    await expect(checkbox).toBeChecked();
    await checkbox.focus();
    await checkbox.press("Space");
    await expect(checkbox).not.toBeChecked();
    await expect.poll(() => changes).toEqual([true, false]);
  });

  test("resolved status keeps its word and drops the buttons", async ({
    mount,
  }) => {
    const component = await mount(
      <ApprovalRequest {...baseProps} status="expired" />,
    );
    await expect(component.getByRole("status")).toHaveText("Expired");
    await expect(component.getByRole("button")).toHaveCount(0);
    await expect(component.getByRole("checkbox")).toHaveCount(0);
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
      <ApprovalRequest
        {...baseProps}
        action="curl --fail --silent --show-error https://registry.example.com/v1/packages/@vllnt/ui/versions/latest/tarball"
        detail="Downloads code from the registry and installs it in this workspace."
        risk="high"
        title="Download and install a package from the registry"
      />,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page).toHaveScreenshot("approval-request-mobile.png");
    expect(errors).toEqual([]);
  });
});

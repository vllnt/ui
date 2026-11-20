import { expect, test } from "@playwright/experimental-ct-react";

import {
  ShareDialogPeople,
  type ShareDialogPeopleProps,
} from "./share-dialog-people";

const props: ShareDialogPeopleProps = {
  linkUrl: "https://ui.vllnt.com/share/launch-plan",
  onClose: () => undefined,
  onRemove: () => undefined,
  people: [
    {
      email: "ada@example.com",
      id: "ada",
      name: "Ada Lovelace",
      role: "owner",
    },
    {
      email: "alan@example.com",
      id: "alan",
      name: "Alan Turing",
      role: "editor",
    },
    {
      email: "grace@example.com",
      id: "grace",
      name: "Grace Hopper",
      role: "viewer",
    },
  ],
  roles: [
    { label: "Viewer", value: "viewer" },
    { label: "Editor", value: "editor" },
    { label: "Owner", value: "owner" },
  ],
  title: "Share launch plan",
};

test.describe("ShareDialogPeople Visual", () => {
  test("list desktop", async ({ mount }) => {
    const component = await mount(<ShareDialogPeople {...props} />);
    const close = await component
      .getByRole("button", { name: "Close" })
      .boundingBox();
    expect(close?.width ?? 0).toBeGreaterThanOrEqual(24);
    expect(close?.height ?? 0).toBeGreaterThanOrEqual(24);
    await expect(component).toHaveScreenshot("share-dialog-people-list.png");
  });

  test("invite desktop", async ({ mount }) => {
    const component = await mount(
      <ShareDialogPeople {...props} kind="invite" />,
    );
    await expect(component).toHaveScreenshot("share-dialog-people-invite.png");
  });

  test("list phone", async ({ mount }) => {
    const component = await mount(
      <ShareDialogPeople {...props} layout="phone" />,
    );
    await expect(component).toHaveScreenshot(
      "share-dialog-people-list-phone.png",
    );
  });

  test("invite phone", async ({ mount }) => {
    const component = await mount(
      <ShareDialogPeople {...props} kind="invite" layout="phone" />,
    );
    await expect(component).toHaveScreenshot(
      "share-dialog-people-invite-phone.png",
    );
  });

  test("empty", async ({ mount }) => {
    const component = await mount(
      <ShareDialogPeople {...props} linkUrl={undefined} people={[]} />,
    );
    await expect(component).toHaveScreenshot("share-dialog-people-empty.png");
  });

  test("role menu open", async ({ mount, page }) => {
    const component = await mount(<ShareDialogPeople {...props} />);
    await component.getByRole("combobox", { name: "Alan Turing role" }).click();
    await expect(page.getByRole("option", { name: "Remove" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Editor" })).toBeVisible();
    await expect(page).toHaveScreenshot("share-dialog-people-menu-open.png");
  });

  test("picking a role calls onRoleChange", async ({ mount, page }) => {
    const changes: string[][] = [];
    const component = await mount(
      <ShareDialogPeople
        {...props}
        onRoleChange={(id, role) => {
          changes.push([id, role]);
        }}
      />,
    );
    await component.getByRole("combobox", { name: "Alan Turing role" }).click();
    await page.getByRole("option", { name: "Viewer" }).click();
    await expect.poll(() => changes).toEqual([["alan", "viewer"]]);
  });

  test("sending an invite calls onInvite", async ({ mount }) => {
    const invites: string[][] = [];
    const component = await mount(
      <ShareDialogPeople
        {...props}
        kind="invite"
        onInvite={(email, role) => {
          invites.push([email, role]);
        }}
      />,
    );
    await component
      .getByRole("textbox", { name: "Email address" })
      .fill("new@example.com");
    await component.getByRole("button", { name: "Send" }).click();
    await expect
      .poll(() => invites)
      .toEqual([["new@example.com", "viewer"]]);
  });

  test("mobile 390", async ({ mount, page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.setViewportSize({ width: 390, height: 844 });
    await mount(<ShareDialogPeople {...props} layout="phone" />);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page).toHaveScreenshot("share-dialog-people-mobile.png");
    expect(errors).toEqual([]);
  });

  test("mobile 390 invite", async ({ mount, page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.setViewportSize({ width: 390, height: 844 });
    await mount(<ShareDialogPeople {...props} kind="invite" layout="phone" />);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page).toHaveScreenshot("share-dialog-people-mobile-invite.png");
    expect(errors).toEqual([]);
  });
});

import { expect, test } from "@playwright/experimental-ct-react";

import { Avatar, AvatarFallback } from "../../atoms/avatar/avatar";
import { Switch } from "../../atoms/switch/switch";
import { SettingsList, SettingsListItem } from "./settings-list";

const rows = [
  <SettingsListItem
    description="Profile, email and password"
    href="/account"
    key="account"
    label="Account"
    leading={
      <Avatar>
        <AvatarFallback>BN</AvatarFallback>
      </Avatar>
    }
  />,
  <SettingsListItem
    control={<Switch defaultChecked />}
    description="Push alerts for mentions and replies"
    key="notifications"
    label="Notifications"
  />,
  <SettingsListItem
    href="/privacy"
    key="privacy"
    label="Privacy"
    meta="Friends only"
  />,
  <SettingsListItem control={<Switch />} key="sounds" label="Sounds" />,
];

test.describe("SettingsList Visual", () => {
  test("inset-grouped", async ({ mount, page }) => {
    await mount(
      <div className="w-[480px] p-4">
        <SettingsList
          description="Manage your profile, alerts and privacy."
          title="Personal settings"
        >
          {rows}
        </SettingsList>
      </div>,
    );
    await expect(page).toHaveScreenshot("settings-list-inset-grouped.png");
  });

  test("plain", async ({ mount, page }) => {
    await mount(
      <div className="w-[480px] p-4">
        <SettingsList
          description="Manage your profile, alerts and privacy."
          title="Personal settings"
          variant="plain"
        >
          {rows}
        </SettingsList>
      </div>,
    );
    await expect(page).toHaveScreenshot("settings-list-plain.png");
  });

  test("row focus ring", async ({ mount, page }) => {
    await mount(
      <div className="w-[480px] p-4">
        <SettingsList title="Personal settings">{rows}</SettingsList>
      </div>,
    );
    await page.getByRole("link", { name: /Privacy/ }).focus();
    await expect(page).toHaveScreenshot("settings-list-focus.png");
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
    await page.setViewportSize({ width: 390, height: 844 });
    await mount(
      <div className="p-4">
        <SettingsList
          description="Manage your profile, alerts and privacy."
          title="Personal settings"
        >
          {rows}
        </SettingsList>
      </div>,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page).toHaveScreenshot("settings-list-mobile.png");
    expect(errors).toEqual([]);
  });
});

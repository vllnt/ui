import * as React from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";

import { Avatar, AvatarFallback } from "../../atoms/avatar/avatar";
import { Switch } from "../../atoms/switch/switch";

import {
  SettingsList,
  SettingsListItem,
  type SettingsListItemProps,
} from "./settings-list";

describe("SettingsList", () => {
  it("renders the title, description and rows", () => {
    render(
      <SettingsList description="Manage your account." title="Account">
        <SettingsListItem label="Profile" />
        <SettingsListItem label="Privacy" />
      </SettingsList>,
    );
    const section = screen.getByRole("region", { name: "Account" });
    expect(section.tagName).toBe("SECTION");
    expect(screen.getByRole("heading", { name: "Account" })).toBeVisible();
    expect(section).toHaveAccessibleDescription("Manage your account.");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("list").tagName).toBe("UL");
  });

  it("draws a bordered surface for inset-grouped and none for plain", () => {
    const { rerender } = render(
      <SettingsList title="Account">
        <SettingsListItem label="Profile" />
      </SettingsList>,
    );
    const section = screen.getByRole("region", { name: "Account" });
    expect(section).toHaveClass("border", "rounded-lg", "bg-card");

    rerender(
      <SettingsList title="Account" variant="inset-grouped">
        <SettingsListItem label="Profile" />
      </SettingsList>,
    );
    expect(section).toHaveClass("border", "rounded-lg", "bg-card");

    rerender(
      <SettingsList title="Account" variant="plain">
        <SettingsListItem label="Profile" />
      </SettingsList>,
    );
    expect(section).not.toHaveClass("border");
    expect(section).not.toHaveClass("rounded-lg");
    expect(section).not.toHaveClass("bg-card");
  });

  it("separates rows with a CSS divider instead of extra elements", () => {
    render(
      <SettingsList title="Account">
        <SettingsListItem label="Profile" />
        <SettingsListItem label="Privacy" />
      </SettingsList>,
    );
    const list = screen.getByRole("list");
    expect(list).toHaveClass("divide-y");
    expect(list.children).toHaveLength(2);
  });

  it("renders without a title or description", () => {
    render(
      <SettingsList>
        <SettingsListItem label="Profile" />
      </SettingsList>,
    );
    expect(screen.queryByRole("region")).toBeNull();
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("renders a description without a title as an unlabelled section", () => {
    render(
      <SettingsList description="Only a description.">
        <SettingsListItem label="Profile" />
      </SettingsList>,
    );
    expect(screen.getByText("Only a description.")).toBeVisible();
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("renders an empty list without rows", () => {
    render(<SettingsList title="Account" />);
    expect(screen.getByRole("region", { name: "Account" })).toBeVisible();
    expect(screen.getByRole("list")).toBeEmptyDOMElement();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("merges className and forwards the ref to the section", () => {
    const reference = React.createRef<HTMLElement>();
    render(
      <SettingsList className="custom-root" ref={reference} title="Account" />,
    );
    expect(reference.current?.tagName).toBe("SECTION");
    expect(reference.current).toHaveClass("custom-root", "border");
  });
});

describe("SettingsListItem", () => {
  it("labels a switch control with the row label", () => {
    render(
      <SettingsList title="Account">
        <SettingsListItem
          control={<Switch defaultChecked />}
          description="Push alerts"
          label="Notifications"
        />
      </SettingsList>,
    );
    const toggle = screen.getByRole("switch", { name: "Notifications" });
    expect(toggle).toHaveAccessibleDescription("Push alerts");
    expect(toggle).toHaveAttribute("aria-checked", "true");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(toggle).toHaveAttribute("data-state", "unchecked");
  });

  it("gives a switch row without a description no described-by", () => {
    render(
      <SettingsList>
        <SettingsListItem control={<Switch />} label="Sounds" />
      </SettingsList>,
    );
    const toggle = screen.getByRole("switch", { name: "Sounds" });
    expect(toggle).not.toHaveAttribute("aria-describedby");
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("keeps the ARIA props a control already sets", () => {
    render(
      <SettingsList>
        <span id="custom-name">Custom name</span>
        <SettingsListItem
          control={<Switch aria-labelledby="custom-name" />}
          label="Sounds"
        />
      </SettingsList>,
    );
    expect(screen.getByRole("switch", { name: "Custom name" })).toBeVisible();
    expect(screen.queryByRole("switch", { name: "Sounds" })).toBeNull();
  });

  it("renders a link with a chevron when href is set", () => {
    render(
      <SettingsList>
        <SettingsListItem href="/language" label="Language" meta="English" />
      </SettingsList>,
    );
    const link = screen.getByRole("link", { name: /Language/ });
    expect(link).toHaveAttribute("href", "/language");
    expect(link).toHaveTextContent("English");
    expect(link).toHaveClass("focus-visible:ring-2");
    expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders a button that calls onClick when onClick is set", () => {
    const onClick = vi.fn();
    render(
      <SettingsList>
        <SettingsListItem label="Privacy" onClick={onClick} />
      </SettingsList>,
    );
    const button = screen.getByRole("button", { name: "Privacy" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("focus-visible:ring-2");
    expect(button.querySelector("svg")).not.toBeNull();
    expect(screen.queryByRole("link")).toBeNull();

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("hides the chevron when chevron is false", () => {
    render(
      <SettingsList>
        <SettingsListItem chevron={false} href="/about" label="About" />
        <SettingsListItem chevron={false} label="Reset" onClick={vi.fn()} />
      </SettingsList>,
    );
    expect(
      screen.getByRole("link", { name: "About" }).querySelector("svg"),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "Reset" }).querySelector("svg"),
    ).toBeNull();
  });

  it("renders a static row without a link, button or switch", () => {
    render(
      <SettingsList>
        <SettingsListItem label="Version" meta="2.4.0" />
      </SettingsList>,
    );
    expect(screen.getByText("Version")).toBeVisible();
    expect(screen.getByText("2.4.0")).toBeVisible();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("switch")).toBeNull();
  });

  it("renders only the label when optional props are missing", () => {
    render(
      <SettingsList>
        <SettingsListItem label="Profile" />
      </SettingsList>,
    );
    const row = screen.getByRole("listitem");
    expect(row).toHaveTextContent(/^Profile$/);
    expect(row.querySelector("svg")).toBeNull();
  });

  it("renders a leading avatar", () => {
    render(
      <SettingsList>
        <SettingsListItem
          href="/account"
          label="Account"
          leading={
            <Avatar>
              <AvatarFallback>BN</AvatarFallback>
            </Avatar>
          }
        />
      </SettingsList>,
    );
    expect(screen.getByText("BN")).toBeVisible();
    expect(screen.getByRole("link", { name: /Account/ })).toHaveTextContent(
      "BN",
    );
  });

  it("merges className and forwards the ref to the list item", () => {
    const reference = React.createRef<HTMLLIElement>();
    render(
      <SettingsList>
        <SettingsListItem
          className="custom-row"
          label="Profile"
          ref={reference}
        />
      </SettingsList>,
    );
    expect(reference.current?.tagName).toBe("LI");
    expect(reference.current).toHaveClass("custom-row");
  });
});

describe("SettingsListItemProps", () => {
  it("accepts at most one trailing control", () => {
    expectTypeOf<{
      label: string;
    }>().toExtend<SettingsListItemProps>();
    expectTypeOf<{
      control: React.JSX.Element;
      label: string;
    }>().toExtend<SettingsListItemProps>();
    expectTypeOf<{
      href: string;
      label: string;
    }>().toExtend<SettingsListItemProps>();
    expectTypeOf<{
      chevron: boolean;
      href: string;
      label: string;
    }>().toExtend<SettingsListItemProps>();
    expectTypeOf<{
      label: string;
      onClick: () => void;
    }>().toExtend<SettingsListItemProps>();
  });

  it("rejects conflicting trailing controls", () => {
    expectTypeOf<{
      control: React.JSX.Element;
      href: string;
      label: string;
    }>().not.toExtend<SettingsListItemProps>();
    expectTypeOf<{
      control: React.JSX.Element;
      label: string;
      onClick: () => void;
    }>().not.toExtend<SettingsListItemProps>();
    expectTypeOf<{
      chevron: true;
      control: React.JSX.Element;
      label: string;
    }>().not.toExtend<SettingsListItemProps>();
    expectTypeOf<{
      href: string;
      label: string;
      onClick: () => void;
    }>().not.toExtend<SettingsListItemProps>();
    expectTypeOf<{
      chevron: true;
      label: string;
    }>().not.toExtend<SettingsListItemProps>();
  });
});

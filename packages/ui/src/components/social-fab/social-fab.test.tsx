import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SocialFAB, type SocialFabProps } from "./social-fab";

const originalInnerWidth = window.innerWidth;

const labels = {
  close: "Close social actions",
  share: "Share",
};

const actions = [
  { id: "share", label: "Share", onClick: vi.fn() },
  { id: "copy", label: "Copy link", onClick: vi.fn() },
];

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
  act(() => {
    window.dispatchEvent(new Event("resize"));
  });
}

function renderSocialFab(overrides: Partial<SocialFabProps> = {}) {
  return render(
    <SocialFAB
      actions={actions}
      labels={labels}
      mainText="More"
      {...overrides}
    />,
  );
}

function getMainButton(name: string): HTMLElement {
  const buttons = screen.getAllByRole("button", { name });
  const button = buttons.at(-1);
  if (!button) throw new Error(`Expected main button named ${name}`);
  return button;
}

function getFirstButton(name: string): HTMLElement {
  const button = screen.getAllByRole("button", { name }).at(0);
  if (!button) throw new Error(`Expected button named ${name}`);
  return button;
}

describe("SocialFAB", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setViewportWidth(originalInnerWidth);
  });

  it("renders nothing when hidden", () => {
    const { container } = renderSocialFab({ hidden: true });

    expect(container.firstChild).toBeNull();
  });

  it("opens and closes from desktop hover callbacks", () => {
    const onClose = vi.fn();
    const onOpen = vi.fn();
    const { container } = renderSocialFab({ onClose, onOpen });
    const wrapper = container.querySelector(".fixed");
    if (!wrapper) throw new Error("Expected fixed FAB wrapper");

    fireEvent.mouseEnter(wrapper);
    expect(
      screen.getByRole("button", { name: "Close social actions" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(onOpen).toHaveBeenCalledWith("hover", "desktop");

    fireEvent.mouseLeave(wrapper);
    expect(getMainButton("Share")).toHaveAttribute("aria-expanded", "false");
    expect(onClose).toHaveBeenCalledWith("hover_leave");
  });

  it("uses a mobile backdrop to close expanded actions", () => {
    setViewportWidth(390);
    const onClose = vi.fn();
    const onOpen = vi.fn();
    renderSocialFab({ onClose, onOpen });

    fireEvent.click(getMainButton("Share"));

    expect(
      screen.getByRole("button", { name: "Close social actions" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(onOpen).toHaveBeenCalledWith("tap", "mobile");

    const backdrop = document.body.querySelector("[aria-hidden='true']");
    if (!backdrop) throw new Error("Expected mobile backdrop");
    fireEvent.click(backdrop);

    expect(getMainButton("Share")).toHaveAttribute("aria-expanded", "false");
    expect(onClose).toHaveBeenCalledWith("backdrop");
  });

  it("opens share platforms on desktop hover and launches selected share URL", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const onAction = vi.fn();
    renderSocialFab({
      onAction,
      sharePlatforms: [
        {
          buildUrl: (pageUrl, pageTitle) =>
            `https://share.example/?url=${pageUrl}&title=${pageTitle}`,
          key: "example",
          label: "Example Network",
        },
      ],
    });

    fireEvent.click(getMainButton("Share"));
    fireEvent.mouseEnter(getFirstButton("Share"));
    fireEvent.click(screen.getByRole("button", { name: "Example Network" }));

    expect(onAction).toHaveBeenCalledWith("share");
    expect(open).toHaveBeenCalledWith(
      expect.stringContaining("https://share.example/"),
      "_blank",
      "noopener,noreferrer",
    );
  });
});

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CookieConsent, type CookieConsentProps } from "./cookie-consent";

/** Clicks the first match; the banner renders mobile and desktop copies. */
function clickFirstButton(name: string): void {
  const [button] = screen.getAllByRole("button", { name });
  if (!button) throw new Error(`Missing "${name}" button`);
  fireEvent.click(button);
}

/** Advances timers inside act to flush the open/close animation delays. */
async function advance(ms: number): Promise<void> {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

describe("CookieConsent", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders an accessible dialog with default copy and no optional controls", () => {
    render(<CookieConsent open={true} />);
    const dialog = screen.getByRole("dialog");
    expect(screen.getByLabelText("Cookie consent")).toBe(dialog);
    expect(dialog).toHaveAttribute("aria-live", "polite");
    // Message and buttons appear in both mobile and desktop layouts
    expect(
      screen.getAllByText("This site uses cookies to improve your experience."),
    ).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Accept" })).toHaveLength(2);
    expect(
      screen.queryByRole("button", { name: "Decline" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Learn more" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Close cookie consent" }),
    ).not.toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    render(<CookieConsent open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders custom copy, optional controls, className, and extra attributes", () => {
    render(
      <CookieConsent
        acceptText="I Agree"
        className="custom-class"
        data-testid="cookie-banner"
        declineText="Decline"
        message="Custom cookie message"
        open={true}
        settingsHref="/privacy"
        showCloseButton={true}
      />,
    );
    expect(screen.getAllByText("Custom cookie message")).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "I Agree" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Decline" })).toHaveLength(2);
    const links = screen.getAllByRole("link", { name: "Learn more" });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/privacy");
    expect(
      screen.getByRole("button", { name: "Close cookie consent" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveClass("custom-class");
    expect(screen.getByTestId("cookie-banner")).toBeInTheDocument();
  });

  it("displays custom settings text", () => {
    render(
      <CookieConsent
        open={true}
        settingsHref="/privacy"
        settingsText="Privacy Policy"
      />,
    );
    expect(
      screen.getAllByRole("link", { name: "Privacy Policy" }),
    ).toHaveLength(2);
  });

  it("calls onAccept when accept button is clicked", () => {
    const handleAccept = vi.fn();
    render(<CookieConsent onAccept={handleAccept} open={true} />);
    clickFirstButton("Accept");
    expect(handleAccept).toHaveBeenCalledTimes(1);
  });

  it("calls onDecline when decline button is clicked", () => {
    const handleDecline = vi.fn();
    render(
      <CookieConsent
        declineText="Decline"
        onDecline={handleDecline}
        open={true}
      />,
    );
    clickFirstButton("Decline");
    expect(handleDecline).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      "accept",
      {},
      () => {
        clickFirstButton("Accept");
      },
    ],
    [
      "decline",
      { declineText: "Decline" },
      () => {
        clickFirstButton("Decline");
      },
    ],
    [
      "close button",
      { showCloseButton: true },
      () => {
        fireEvent.click(
          screen.getByRole("button", { name: "Close cookie consent" }),
        );
      },
    ],
  ] as const)(
    "calls onOpenChange with false after %s",
    async (_name, props, dismiss) => {
      const handleOpenChange = vi.fn();
      render(
        <CookieConsent
          {...props}
          onOpenChange={handleOpenChange}
          open={true}
        />,
      );
      dismiss();
      await advance(200);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    },
  );

  it("animates in after the mount delay and out on accept", async () => {
    render(<CookieConsent onOpenChange={vi.fn()} open={true} />);
    const dialog = screen.getByRole("dialog");
    // Initially hidden (translate-y-4 opacity-0)
    expect(dialog).toHaveClass("opacity-0");
    await advance(50);
    expect(dialog).toHaveClass("opacity-100");
    clickFirstButton("Accept");
    expect(dialog).toHaveClass("opacity-0");
  });

  it.each([
    ["applies bottom-left position by default", {}, ["bottom-4", "left-4"]],
    [
      "applies bottom-right position",
      { position: "bottom-right" } satisfies CookieConsentProps,
      ["bottom-4", "right-4"],
    ],
    [
      "applies bottom-center position",
      { position: "bottom-center" } satisfies CookieConsentProps,
      ["bottom-4", "left-1/2", "-translate-x-1/2"],
    ],
  ])("%s", (_name, props, classes) => {
    render(<CookieConsent {...props} open={true} />);
    expect(screen.getByRole("dialog")).toHaveClass(...classes);
  });
});

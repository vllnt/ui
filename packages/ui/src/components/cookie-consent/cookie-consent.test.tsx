/* eslint-disable max-lines-per-function, @typescript-eslint/no-non-null-assertion -- test file */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CookieConsent } from "./cookie-consent";

describe("CookieConsent", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("rendering", () => {
    it("renders when open is true", () => {
      render(<CookieConsent open={true} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("does not render when open is false", () => {
      render(<CookieConsent open={false} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("displays default message", () => {
      render(<CookieConsent open={true} />);

      // Message appears in both mobile and desktop layouts
      const messages = screen.getAllByText(
        "This site uses cookies to improve your experience.",
      );
      expect(messages).toHaveLength(2);
    });

    it("displays custom message", () => {
      render(<CookieConsent message="Custom cookie message" open={true} />);

      const messages = screen.getAllByText("Custom cookie message");
      expect(messages).toHaveLength(2);
    });

    it("displays default accept button text", () => {
      render(<CookieConsent open={true} />);

      expect(screen.getAllByRole("button", { name: "Accept" })).toHaveLength(2); // mobile + desktop
    });

    it("displays custom accept button text", () => {
      render(<CookieConsent acceptText="I Agree" open={true} />);

      expect(screen.getAllByRole("button", { name: "I Agree" })).toHaveLength(
        2,
      );
    });

    it("shows decline button when declineText is provided", () => {
      render(<CookieConsent declineText="Decline" open={true} />);

      expect(screen.getAllByRole("button", { name: "Decline" })).toHaveLength(
        2,
      );
    });

    it("hides decline button when declineText is not provided", () => {
      render(<CookieConsent open={true} />);

      expect(
        screen.queryByRole("button", { name: "Decline" }),
      ).not.toBeInTheDocument();
    });

    it("shows settings link when settingsHref is provided", () => {
      render(<CookieConsent open={true} settingsHref="/privacy" />);

      const links = screen.getAllByRole("link", { name: "Learn more" });
      expect(links).toHaveLength(2);
      expect(links[0]).toHaveAttribute("href", "/privacy");
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

    it("hides settings link when settingsHref is not provided", () => {
      render(<CookieConsent open={true} />);

      expect(
        screen.queryByRole("link", { name: "Learn more" }),
      ).not.toBeInTheDocument();
    });

    it("shows close button when showCloseButton is true", () => {
      render(<CookieConsent open={true} showCloseButton={true} />);

      expect(
        screen.getByRole("button", { name: "Close cookie consent" }),
      ).toBeInTheDocument();
    });

    it("hides close button by default", () => {
      render(<CookieConsent open={true} />);

      expect(
        screen.queryByRole("button", { name: "Close cookie consent" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has correct role", () => {
      render(<CookieConsent open={true} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("has aria-label", () => {
      render(<CookieConsent open={true} />);

      expect(screen.getByLabelText("Cookie consent")).toBeInTheDocument();
    });

    it("has aria-live polite for screen readers", () => {
      render(<CookieConsent open={true} />);

      expect(screen.getByRole("dialog")).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("interactions", () => {
    it("calls onAccept when accept button is clicked", async () => {
      const handleAccept = vi.fn();
      render(<CookieConsent onAccept={handleAccept} open={true} />);

      const acceptButtons = screen.getAllByRole("button", { name: "Accept" });
      fireEvent.click(acceptButtons[0]!);

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

      const declineButtons = screen.getAllByRole("button", { name: "Decline" });
      fireEvent.click(declineButtons[0]!);

      expect(handleDecline).toHaveBeenCalledTimes(1);
    });

    it("calls onOpenChange with false after accept", async () => {
      const handleOpenChange = vi.fn();
      render(<CookieConsent onOpenChange={handleOpenChange} open={true} />);

      const acceptButtons = screen.getAllByRole("button", { name: "Accept" });
      fireEvent.click(acceptButtons[0]!);

      // Wait for animation timeout - wrap in act to avoid React warnings
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it("calls onOpenChange with false after decline", async () => {
      const handleOpenChange = vi.fn();
      render(
        <CookieConsent
          declineText="Decline"
          onOpenChange={handleOpenChange}
          open={true}
        />,
      );

      const declineButtons = screen.getAllByRole("button", { name: "Decline" });
      fireEvent.click(declineButtons[0]!);

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it("calls onOpenChange when close button is clicked", async () => {
      const handleOpenChange = vi.fn();
      render(
        <CookieConsent
          onOpenChange={handleOpenChange}
          open={true}
          showCloseButton={true}
        />,
      );

      fireEvent.click(
        screen.getByRole("button", { name: "Close cookie consent" }),
      );

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("animation", () => {
    it("applies visible class after mount delay", async () => {
      render(<CookieConsent open={true} />);

      const dialog = screen.getByRole("dialog");

      // Initially hidden (translate-y-4 opacity-0)
      expect(dialog).toHaveClass("opacity-0");

      // Advance past mount animation delay - must wrap in act
      await act(async () => {
        vi.advanceTimersByTime(50);
      });

      expect(dialog).toHaveClass("opacity-100");
    });

    it("applies hidden class during close animation", async () => {
      const handleOpenChange = vi.fn();
      render(<CookieConsent onOpenChange={handleOpenChange} open={true} />);

      // Mount animation
      await act(async () => {
        vi.advanceTimersByTime(50);
      });

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveClass("opacity-100");

      const acceptButtons = screen.getAllByRole("button", { name: "Accept" });
      fireEvent.click(acceptButtons[0]!);

      // During animation out
      expect(dialog).toHaveClass("opacity-0");
    });
  });

  describe("position variants", () => {
    it("applies bottom-left position by default", () => {
      render(<CookieConsent open={true} />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveClass("bottom-4", "left-4");
    });

    it("applies bottom-right position", () => {
      render(<CookieConsent open={true} position="bottom-right" />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveClass("bottom-4", "right-4");
    });

    it("applies bottom-center position", () => {
      render(<CookieConsent open={true} position="bottom-center" />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveClass("bottom-4", "left-1/2", "-translate-x-1/2");
    });
  });

  describe("custom props", () => {
    it("applies custom className", () => {
      render(<CookieConsent className="custom-class" open={true} />);

      expect(screen.getByRole("dialog")).toHaveClass("custom-class");
    });

    it("passes additional HTML attributes", () => {
      render(<CookieConsent data-testid="cookie-banner" open={true} />);

      expect(screen.getByTestId("cookie-banner")).toBeInTheDocument();
    });
  });
});

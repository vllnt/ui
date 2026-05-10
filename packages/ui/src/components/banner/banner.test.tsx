import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Banner, BannerAction } from "./banner";

describe("Banner", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  describe("rendering", () => {
    it("renders children", () => {
      render(<Banner>Trial expires soon</Banner>);

      expect(screen.getByText("Trial expires soon")).toBeInTheDocument();
    });

    it.each([
      ["info", "status"],
      ["success", "status"],
      ["warning", "alert"],
      ["destructive", "alert"],
    ] as const)("maps the %s variant to role=%s", (variant, role) => {
      render(<Banner variant={variant}>x</Banner>);

      expect(screen.getByRole(role)).toBeInTheDocument();
    });

    it("honors a caller-provided role override", () => {
      render(
        <Banner role="region" variant="warning">
          x
        </Banner>,
      );

      expect(screen.getByRole("region")).toBeInTheDocument();
    });
  });

  describe("dismissal", () => {
    it("does not render a dismiss control by default", () => {
      render(<Banner>x</Banner>);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("hides itself when the dismiss control is clicked", () => {
      render(<Banner dismissible>Hide me</Banner>);

      fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

      expect(screen.queryByText("Hide me")).not.toBeInTheDocument();
    });

    it("invokes onDismiss after the user clicks dismiss", () => {
      const onDismiss = vi.fn();

      render(
        <Banner dismissible onDismiss={onDismiss}>
          x
        </Banner>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("persists dismissal to localStorage when configured", () => {
      const { unmount } = render(
        <Banner dismissible id="test-banner" persistDismissal>
          Persistent
        </Banner>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
      unmount();

      render(
        <Banner dismissible id="test-banner" persistDismissal>
          Persistent
        </Banner>,
      );

      expect(screen.queryByText("Persistent")).not.toBeInTheDocument();
    });

    it("does not persist when persistDismissal is omitted", () => {
      const { unmount } = render(
        <Banner dismissible id="ephemeral">
          Ephemeral
        </Banner>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
      unmount();

      render(
        <Banner dismissible id="ephemeral">
          Ephemeral
        </Banner>,
      );

      expect(screen.getByText("Ephemeral")).toBeInTheDocument();
    });
  });

  describe("BannerAction", () => {
    it("renders a button by default and forwards onClick", () => {
      const onClick = vi.fn();

      render(
        <Banner>
          x <BannerAction onClick={onClick}>Upgrade</BannerAction>
        </Banner>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Upgrade" }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("delegates rendering with asChild", () => {
      render(
        <Banner>
          x
          <BannerAction asChild>
            {/* eslint-disable-next-line nextjs-no-a-element */}
            <a href="/upgrade">Upgrade</a>
          </BannerAction>
        </Banner>,
      );

      const link = screen.getByRole("link", { name: "Upgrade" });
      expect(link).toHaveAttribute("href", "/upgrade");
    });
  });
});

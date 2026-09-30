import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Banner, BannerAction } from "./banner";

const clickDismiss = () => {
  fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
};

const dismissAndRemount = (id: string, persistDismissal?: boolean) => {
  const banner = (
    <Banner dismissible id={id} persistDismissal={persistDismissal}>
      Banner text
    </Banner>
  );
  const { unmount } = render(banner);
  clickDismiss();
  unmount();
  render(banner);
};

describe("Banner", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders children without a dismiss control by default", () => {
    render(<Banner>Trial expires soon</Banner>);
    expect(screen.getByText("Trial expires soon")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
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

  it("hides itself and invokes onDismiss when the dismiss control is clicked", () => {
    const onDismiss = vi.fn();
    render(
      <Banner dismissible onDismiss={onDismiss}>
        Hide me
      </Banner>,
    );
    clickDismiss();
    expect(screen.queryByText("Hide me")).not.toBeInTheDocument();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("persists dismissal to localStorage when configured", () => {
    dismissAndRemount("test-banner", true);
    expect(screen.queryByText("Banner text")).not.toBeInTheDocument();
  });

  it("does not persist when persistDismissal is omitted", () => {
    dismissAndRemount("ephemeral");
    expect(screen.getByText("Banner text")).toBeInTheDocument();
  });

  it("renders BannerAction as a button by default and forwards onClick", () => {
    const onClick = vi.fn();
    render(
      <Banner>
        x <BannerAction onClick={onClick}>Upgrade</BannerAction>
      </Banner>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Upgrade" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("delegates BannerAction rendering with asChild", () => {
    render(
      <Banner>
        x
        <BannerAction asChild>
          <a href="/upgrade">Upgrade</a>
        </BannerAction>
      </Banner>,
    );
    expect(screen.getByRole("link", { name: "Upgrade" })).toHaveAttribute(
      "href",
      "/upgrade",
    );
  });
});

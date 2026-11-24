import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusIndicator } from "./status-indicator";

describe("StatusIndicator", () => {
  it("renders the provided label", () => {
    render(<StatusIndicator>Healthy</StatusIndicator>);
    expect(screen.getByText("Healthy")).toBeVisible();
  });

  it("renders a dot by default", () => {
    const { container } = render(<StatusIndicator>Synced</StatusIndicator>);
    expect(container.querySelector("span span")).not.toBeNull();
  });

  it("can hide the dot", () => {
    const { container } = render(
      <StatusIndicator showDot={false}>Offline</StatusIndicator>,
    );
    expect(container.querySelector("span span")).toBeNull();
  });

  it("applies custom class names", () => {
    render(<StatusIndicator className="custom-class">Active</StatusIndicator>);
    expect(screen.getByText("Active")).toHaveClass("custom-class");
  });

  it("replaces the dot with the icon when one is given", () => {
    const { container } = render(
      <StatusIndicator icon={<svg data-testid="mark" />} tone="warning">
        Degraded
      </StatusIndicator>,
    );
    const mark = screen.getByTestId("mark");
    expect(mark.parentElement).toHaveAttribute("aria-hidden", "true");
    expect(mark.parentElement).toHaveClass("text-amber-500");
    expect(container.querySelector(".bg-amber-500")).toBeNull();
    expect(container.querySelectorAll("span > span")).toHaveLength(1);
  });

  it("keeps the pill and label neutral and puts the tone on the icon alone", () => {
    render(
      <StatusIndicator
        icon={<svg data-testid="mark" />}
        tone="danger"
        variant="outline"
      >
        Outage
      </StatusIndicator>,
    );
    const pill = screen.getByText("Outage");
    expect(pill).toHaveClass("border-border", "text-foreground");
    expect(pill.className).not.toMatch(/red-/);
    expect(screen.getByTestId("mark").parentElement).toHaveClass(
      "text-red-500",
    );
  });

  it.each(["outline", "soft", "solid"] as const)(
    "does not tint the %s pill by tone when an icon is given",
    (variant) => {
      render(
        <StatusIndicator icon={<svg />} tone="success" variant={variant}>
          Operational
        </StatusIndicator>,
      );
      expect(screen.getByText("Operational").className).not.toMatch(/emerald-/);
    },
  );

  it("still tints the pill by tone without an icon", () => {
    render(
      <StatusIndicator tone="danger" variant="outline">
        Outage
      </StatusIndicator>,
    );
    expect(screen.getByText("Outage")).toHaveClass("text-red-700");
  });

  it.each([
    ["danger", "text-red-500"],
    ["info", "text-sky-500"],
    ["neutral", "text-muted-foreground"],
    ["success", "text-emerald-500"],
    ["warning", "text-amber-500"],
  ] as const)("colours a %s icon with %s", (tone, colour) => {
    render(
      <StatusIndicator icon={<svg data-testid="mark" />} tone={tone}>
        State
      </StatusIndicator>,
    );
    expect(screen.getByTestId("mark").parentElement).toHaveClass(colour);
  });

  it("shows the icon even when showDot is false", () => {
    render(
      <StatusIndicator icon={<svg data-testid="mark" />} showDot={false}>
        State
      </StatusIndicator>,
    );
    expect(screen.getByTestId("mark")).toBeInTheDocument();
  });

  it("pulses the icon and stops under reduced motion", () => {
    render(
      <StatusIndicator icon={<svg data-testid="mark" />} pulse>
        Live
      </StatusIndicator>,
    );
    expect(screen.getByTestId("mark").parentElement).toHaveClass(
      "animate-pulse",
      "motion-reduce:animate-none",
    );
  });

  it("keeps the dot when no icon is given", () => {
    const { container } = render(
      <StatusIndicator tone="success">Synced</StatusIndicator>,
    );
    expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  });
});

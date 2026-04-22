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
});

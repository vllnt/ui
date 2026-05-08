import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StateBadgeOverlay } from "./state-badge-overlay";

describe("StateBadgeOverlay", () => {
  it("renders the humanized state label by default", () => {
    render(<StateBadgeOverlay state="running" x={0} y={0} />);

    expect(screen.getByText("Running")).toBeInTheDocument();
  });

  it("uses the override label when provided", () => {
    render(<StateBadgeOverlay label="In flight" state="running" x={0} y={0} />);

    expect(screen.getByText("In flight")).toBeInTheDocument();
  });

  it("positions the badge using the anchor coords", () => {
    const { container } = render(
      <StateBadgeOverlay state="idle" x={120} y={80} />,
    );

    expect(container.querySelector("[data-state-badge-overlay]")).toHaveStyle({
      left: "120px",
      top: "80px",
    });
  });

  it("propagates state + anchor to data attributes", () => {
    const { container } = render(
      <StateBadgeOverlay anchor="bottom-left" state="failed" x={0} y={0} />,
    );

    const badge = container.querySelector("[data-state-badge-overlay]");
    expect(badge).toHaveAttribute("data-state-name", "failed");
    expect(badge).toHaveAttribute("data-state-anchor", "bottom-left");
  });

  it("includes the human state in the aria-label", () => {
    render(<StateBadgeOverlay state="complete" x={0} y={0} />);

    expect(screen.getByLabelText("State: Complete")).toBeInTheDocument();
  });
});

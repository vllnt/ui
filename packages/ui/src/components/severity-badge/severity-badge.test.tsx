import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SeverityBadge } from "./severity-badge";

describe("SeverityBadge", () => {
  it("renders the default label for each level", () => {
    render(<SeverityBadge level="critical" />);

    expect(screen.getByText("Critical")).toBeInTheDocument();
  });

  it("renders custom children as label", () => {
    render(<SeverityBadge level="high">P2 incident</SeverityBadge>);

    expect(screen.getByText("P2 incident")).toBeInTheDocument();
  });

  it("exposes the level via data attribute", () => {
    render(<SeverityBadge data-testid="sev" level="medium" />);

    expect(screen.getByTestId("sev")).toHaveAttribute("data-level", "medium");
  });

  it("omits the status dot when showDot is false", () => {
    const { container } = render(
      <SeverityBadge level="low" showDot={false}>
        Low
      </SeverityBadge>,
    );

    expect(container.querySelectorAll("span[aria-hidden='true']")).toHaveLength(
      0,
    );
  });
});

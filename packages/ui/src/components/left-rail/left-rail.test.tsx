import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LeftRail } from "./left-rail";

describe("LeftRail", () => {
  it("renders children, title, and footer inside an aside with merged className", () => {
    const { container } = render(
      <LeftRail className="extra" footer={<span>foot</span>} title="Workspace">
        <span>nav-item</span>
      </LeftRail>,
    );
    expect(screen.getByText("nav-item")).toBeInTheDocument();
    expect(screen.getByText("Workspace")).toBeInTheDocument();
    expect(screen.getByText("foot")).toBeInTheDocument();
    expect(container.querySelector("aside")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("extra");
  });

  it("renders without optional title and footer", () => {
    render(<LeftRail>nav</LeftRail>);
    expect(screen.getByText("nav")).toBeInTheDocument();
  });
});

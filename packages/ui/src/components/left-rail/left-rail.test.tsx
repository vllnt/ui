import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LeftRail } from "./left-rail";

describe("LeftRail", () => {
  it("renders children inside the rail", () => {
    render(
      <LeftRail>
        <span>nav-item</span>
      </LeftRail>,
    );

    expect(screen.getByText("nav-item")).toBeInTheDocument();
  });

  it("renders the optional title", () => {
    render(
      <LeftRail title="Workspace">
        <span>nav</span>
      </LeftRail>,
    );

    expect(screen.getByText("Workspace")).toBeInTheDocument();
  });

  it("renders the optional footer", () => {
    render(
      <LeftRail footer={<span>foot</span>}>
        <span>nav</span>
      </LeftRail>,
    );

    expect(screen.getByText("foot")).toBeInTheDocument();
  });

  it("uses an aside landmark", () => {
    const { container } = render(<LeftRail>nav</LeftRail>);

    expect(container.querySelector("aside")).toBeInTheDocument();
  });

  it("merges the className prop", () => {
    const { container } = render(<LeftRail className="extra">nav</LeftRail>);

    expect(container.firstChild).toHaveClass("extra");
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RightDock } from "./right-dock";

describe("RightDock", () => {
  it("renders children inside the dock", () => {
    render(
      <RightDock>
        <span>panel</span>
      </RightDock>,
    );

    expect(screen.getByText("panel")).toBeInTheDocument();
  });

  it("renders the optional title", () => {
    render(<RightDock title="Inspector">body</RightDock>);

    expect(screen.getByText("Inspector")).toBeInTheDocument();
  });

  it("renders the optional header slot", () => {
    render(
      <RightDock header={<span>actions</span>} title="Inspector">
        body
      </RightDock>,
    );

    expect(screen.getByText("actions")).toBeInTheDocument();
  });

  it("renders the optional footer slot", () => {
    render(<RightDock footer={<span>footer-bar</span>}>body</RightDock>);

    expect(screen.getByText("footer-bar")).toBeInTheDocument();
  });

  it("uses an aside landmark", () => {
    const { container } = render(<RightDock>body</RightDock>);

    expect(container.querySelector("aside")).toBeInTheDocument();
  });
});

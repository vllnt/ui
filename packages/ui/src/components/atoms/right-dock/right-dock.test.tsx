import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RightDock } from "./right-dock";

describe("RightDock", () => {
  it("renders children inside an aside landmark", () => {
    const { container } = render(
      <RightDock>
        <span>panel</span>
      </RightDock>,
    );
    expect(screen.getByText("panel")).toBeInTheDocument();
    expect(container.querySelector("aside")).toBeInTheDocument();
  });

  it("renders the optional title and footer slots", () => {
    render(
      <RightDock footer={<span>footer-bar</span>} title="Inspector">
        body
      </RightDock>,
    );
    expect(screen.getByText("Inspector")).toBeInTheDocument();
    expect(screen.getByText("footer-bar")).toBeInTheDocument();
  });

  it("renders the optional header slot", () => {
    render(
      <RightDock header={<span>actions</span>} title="Inspector">
        body
      </RightDock>,
    );
    expect(screen.getByText("actions")).toBeInTheDocument();
  });
});

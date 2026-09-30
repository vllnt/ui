import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BottomBar } from "./bottom-bar";

describe("BottomBar", () => {
  it("renders the leading and trailing slots and omits the missing center", () => {
    const { container } = render(
      <BottomBar
        className="extra"
        data-testid="bb"
        leading={<span>left</span>}
        trailing={<span>right</span>}
      />,
    );
    expect(screen.getByText("left")).toBeInTheDocument();
    expect(screen.getByText("right")).toBeInTheDocument();
    expect(screen.queryByText("middle")).not.toBeInTheDocument();
    expect(container.firstChild).toHaveClass("extra");
    expect(container.querySelector("[data-testid='bb']")).toBeInTheDocument();
  });

  it("renders the optional center slot when provided", () => {
    render(
      <BottomBar
        center={<span>middle</span>}
        leading={<span>l</span>}
        trailing={<span>r</span>}
      />,
    );
    expect(screen.getByText("middle")).toBeInTheDocument();
  });
});

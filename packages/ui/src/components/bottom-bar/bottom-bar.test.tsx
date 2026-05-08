import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BottomBar } from "./bottom-bar";

describe("BottomBar", () => {
  it("renders the leading and trailing slots", () => {
    render(
      <BottomBar leading={<span>left</span>} trailing={<span>right</span>} />,
    );

    expect(screen.getByText("left")).toBeInTheDocument();
    expect(screen.getByText("right")).toBeInTheDocument();
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

  it("omits the center slot when not provided", () => {
    render(<BottomBar leading={<span>l</span>} trailing={<span>r</span>} />);

    expect(screen.queryByText("middle")).not.toBeInTheDocument();
  });

  it("merges the className prop", () => {
    const { container } = render(
      <BottomBar className="extra" leading={<span>l</span>} />,
    );

    expect(container.firstChild).toHaveClass("extra");
  });

  it("forwards arbitrary div props", () => {
    const { container } = render(<BottomBar data-testid="bb" />);

    expect(container.querySelector("[data-testid='bb']")).toBeInTheDocument();
  });
});

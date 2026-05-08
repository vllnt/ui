import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TopBar } from "./top-bar";

describe("TopBar", () => {
  it("renders the title and subtitle slots", () => {
    render(<TopBar subtitle="environment" title="Production" />);

    expect(screen.getByText("Production")).toBeInTheDocument();
    expect(screen.getByText("environment")).toBeInTheDocument();
  });

  it("renders the leading and trailing slots", () => {
    render(
      <TopBar
        leading={<span>left</span>}
        title="t"
        trailing={<span>right</span>}
      />,
    );

    expect(screen.getByText("left")).toBeInTheDocument();
    expect(screen.getByText("right")).toBeInTheDocument();
  });

  it("renders children in the center slot", () => {
    render(
      <TopBar title="t">
        <span>middle</span>
      </TopBar>,
    );

    expect(screen.getByText("middle")).toBeInTheDocument();
  });

  it("uses a header landmark", () => {
    const { container } = render(<TopBar title="t" />);

    expect(container.querySelector("header")).toBeInTheDocument();
  });

  it("merges the className prop", () => {
    const { container } = render(<TopBar className="extra" title="t" />);

    expect(container.firstChild).toHaveClass("extra");
  });
});

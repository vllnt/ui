import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Exercise } from "./exercise";

describe("Exercise", () => {
  it("renders title, body, and the difficulty label", () => {
    render(
      <Exercise difficulty="hard" title="Pan exercise">
        <p>Drag with space.</p>
      </Exercise>,
    );
    expect(screen.getByText("Pan exercise")).toBeInTheDocument();
    expect(screen.getByText("Drag with space.")).toBeInTheDocument();
    expect(screen.getByText("Hard")).toBeInTheDocument();
  });

  it("toggles completed state, reveals the hint, and toggles the solution", () => {
    render(
      <Exercise hint="Use the space bar" solution={<code>code</code>} title="t">
        <p>Body</p>
      </Exercise>,
    );
    fireEvent.click(screen.getByText("Mark Complete"));
    expect(screen.getByText("Done")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Done"));
    expect(screen.getByText("Mark Complete")).toBeInTheDocument();

    expect(screen.queryByText("Use the space bar")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Need a hint?"));
    expect(screen.getByText("Use the space bar")).toBeInTheDocument();

    expect(screen.queryByText("Hide Solution")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Show Solution"));
    expect(screen.getByText("Hide Solution")).toBeInTheDocument();
  });
});

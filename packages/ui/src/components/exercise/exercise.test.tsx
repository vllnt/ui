import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Exercise } from "./exercise";

describe("Exercise", () => {
  it("renders title + body", () => {
    render(
      <Exercise title="Pan exercise">
        <p>Drag with space.</p>
      </Exercise>,
    );

    expect(screen.getByText("Pan exercise")).toBeInTheDocument();
    expect(screen.getByText("Drag with space.")).toBeInTheDocument();
  });

  it("shows the difficulty label", () => {
    render(
      <Exercise difficulty="hard" title="Zoom exercise">
        <p>Body</p>
      </Exercise>,
    );

    expect(screen.getByText("Hard")).toBeInTheDocument();
  });

  it("toggles the completed state when Mark Complete is clicked", () => {
    render(
      <Exercise title="t">
        <p>Body</p>
      </Exercise>,
    );

    fireEvent.click(screen.getByText("Mark Complete"));
    expect(screen.getByText("Done")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Done"));
    expect(screen.getByText("Mark Complete")).toBeInTheDocument();
  });

  it("hides the hint until Need a hint? is clicked", () => {
    render(
      <Exercise hint="Use the space bar" title="t">
        <p>Body</p>
      </Exercise>,
    );

    expect(screen.queryByText("Use the space bar")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Need a hint?"));
    expect(screen.getByText("Use the space bar")).toBeInTheDocument();
  });

  it("toggles the solution between Show and Hide", () => {
    render(
      <Exercise solution={<code>code</code>} title="t">
        <p>Body</p>
      </Exercise>,
    );

    expect(screen.queryByText("Hide Solution")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Show Solution"));
    expect(screen.getByText("Hide Solution")).toBeInTheDocument();
  });
});

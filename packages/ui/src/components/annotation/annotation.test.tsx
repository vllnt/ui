import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Annotation, Highlight } from "./annotation";

describe("Annotation", () => {
  it("renders highlight text", () => {
    render(<Highlight>Important term</Highlight>);

    expect(screen.getByText("Important term").tagName).toBe("MARK");
  });

  it("shows the annotation content when opened", () => {
    render(
      <Annotation annotation="A named value stored for reuse.">
        variable
      </Annotation>,
    );

    fireEvent.click(screen.getByRole("button", { name: /variable/i }));

    expect(
      screen.getByText("A named value stored for reuse."),
    ).toBeInTheDocument();
  });
});

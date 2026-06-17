import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Meteors } from "./meteors";

describe("Meteors", () => {
  it("renders the default field", () => {
    const { container } = render(<Meteors />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(<Meteors className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders the requested meteor count", () => {
    const { container } = render(<Meteors count={4} />);

    expect(container.querySelectorAll(":scope > span")).toHaveLength(4);
  });
});

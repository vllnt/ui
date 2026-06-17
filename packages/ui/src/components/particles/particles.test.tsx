import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Particles } from "./particles";

describe("Particles", () => {
  it("renders the default field", () => {
    const { container } = render(<Particles />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(<Particles className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders the requested particle count", () => {
    const { container } = render(<Particles count={8} />);

    expect(container.querySelectorAll("span")).toHaveLength(8);
  });
});

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BorderBeam } from "./border-beam";

describe("BorderBeam", () => {
  it("renders aria-hidden with className and border width", () => {
    const { container } = render(
      <BorderBeam borderWidth={3} className="custom-class" />,
    );
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstChild).toHaveClass("custom-class");
    expect(container.firstChild).toHaveStyle({ padding: "3px" });
  });
});

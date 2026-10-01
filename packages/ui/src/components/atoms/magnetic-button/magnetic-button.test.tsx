import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { stubMatchMedia } from "../../../__tests__/stub-match-media";

import { MagneticButton } from "./magnetic-button";

describe("MagneticButton", () => {
  it("renders its children and merges className", () => {
    stubMatchMedia();
    const { container } = render(
      <MagneticButton className="custom-class">Hover me</MagneticButton>,
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

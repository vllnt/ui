import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { stubMatchMedia } from "../../__tests__/stub-match-media";

import { MagneticButton } from "./magnetic-button";

describe("MagneticButton", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  it("renders its children", () => {
    render(<MagneticButton>Hover me</MagneticButton>);

    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <MagneticButton className="custom-class">Action</MagneticButton>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});

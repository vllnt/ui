import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { stubMatchMedia } from "../../__tests__/stub-match-media";

import { Magnetic } from "./magnetic";

describe("Magnetic", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  it("renders its children", () => {
    render(<Magnetic>Pull me</Magnetic>);

    expect(screen.getByText("Pull me")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <Magnetic className="custom-class">Content</Magnetic>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});

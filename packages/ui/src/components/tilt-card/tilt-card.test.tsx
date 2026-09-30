import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { stubMatchMedia } from "../../__tests__/stub-match-media";

import { TiltCard } from "./tilt-card";

describe("TiltCard", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  it("renders its children", () => {
    render(<TiltCard>Hover me</TiltCard>);

    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <TiltCard className="custom-class">Card</TiltCard>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});

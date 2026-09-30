import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { stubMatchMedia } from "../../__tests__/stub-match-media";

import { TiltCard } from "./tilt-card";

describe("TiltCard", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  it("renders its children and applies a custom class name", () => {
    const { container } = render(
      <TiltCard className="custom-class">Hover me</TiltCard>,
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

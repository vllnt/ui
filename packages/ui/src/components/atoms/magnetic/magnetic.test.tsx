import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { stubMatchMedia } from "../../../__tests__/stub-match-media";

import { Magnetic } from "./magnetic";

describe("Magnetic", () => {
  it("renders its children and merges className", () => {
    stubMatchMedia();
    const { container } = render(
      <Magnetic className="custom-class">Pull me</Magnetic>,
    );
    expect(screen.getByText("Pull me")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

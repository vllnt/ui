import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { stubMatchMedia } from "../../../__tests__/stub-match-media";

import { TextReveal } from "./text-reveal";

describe("TextReveal", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  it("renders an accessible label with the full text and applies a custom class name", () => {
    const { container } = render(
      <TextReveal className="custom-class">Read this line</TextReveal>,
    );
    expect(screen.getByLabelText("Read this line")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

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
    expect(
      screen.getByText("Read this line", { selector: ".sr-only" }),
    ).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("exposes the sentence as screen-reader text, not a prohibited aria-label", () => {
    const { container } = render(<TextReveal>Read this line</TextReveal>);
    expect(container.firstChild).not.toHaveAttribute("aria-label");
    expect(
      screen.getByText("Read this line", { selector: ".sr-only" }),
    ).toBeInTheDocument();
  });
});

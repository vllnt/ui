import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { stubMatchMedia } from "../../../__tests__/stub-match-media";

import { ScrambleText } from "./scramble-text";

describe("ScrambleText", () => {
  it("renders an accessible label with the final text and merges className", () => {
    stubMatchMedia();
    const { container } = render(
      <ScrambleText className="custom-class" text="SECRET" />,
    );
    expect(
      screen.getByText("SECRET", { selector: ".sr-only" }),
    ).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("exposes the final text as screen-reader text, not a prohibited aria-label", () => {
    stubMatchMedia();
    const { container } = render(<ScrambleText text="SECRET" />);
    expect(container.firstChild).not.toHaveAttribute("aria-label");
    expect(
      screen.getByText("SECRET", { selector: ".sr-only" }),
    ).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { stubMatchMedia } from "../../__tests__/stub-match-media";

import { ScrambleText } from "./scramble-text";

describe("ScrambleText", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  it("renders an accessible label with the final text", () => {
    render(<ScrambleText text="SECRET" />);

    expect(screen.getByLabelText("SECRET")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <ScrambleText className="custom-class" text="SECRET" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});

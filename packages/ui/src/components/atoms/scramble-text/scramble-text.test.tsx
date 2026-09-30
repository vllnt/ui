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
    expect(screen.getByLabelText("SECRET")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

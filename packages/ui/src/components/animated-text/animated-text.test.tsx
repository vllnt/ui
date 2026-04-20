import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnimatedText } from "./animated-text";

describe("AnimatedText", () => {
  it("renders the full accessible label", () => {
    render(<AnimatedText text="Motion without noise" />);

    expect(screen.getByLabelText("Motion without noise")).toBeVisible();
  });

  it("splits text by words by default", () => {
    render(<AnimatedText text="Hello world again" />);

    expect(screen.getAllByText(/Hello|world|again/)).toHaveLength(3);
  });

  it("supports character splitting", () => {
    render(<AnimatedText splitBy="character" text="ABC" />);

    expect(screen.getAllByText(/[A-C]/)).toHaveLength(3);
  });
});

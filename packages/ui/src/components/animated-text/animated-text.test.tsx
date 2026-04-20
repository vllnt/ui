import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnimatedText } from "./animated-text";

describe("AnimatedText", () => {
  it("renders the full accessible label", () => {
    render(<AnimatedText text="Motion without noise" />);

    expect(screen.getByLabelText("Motion without noise")).toBeVisible();
  });

  it("uses terminal mode by default with a cursor", () => {
    render(<AnimatedText text="ABC" />);

    expect(screen.getByText("█")).toBeInTheDocument();
  });

  it("supports reveal mode word splitting", () => {
    render(
      <AnimatedText splitBy="word" text="Hello world again" variant="reveal" />,
    );

    expect(screen.getAllByText(/Hello|world|again/)).toHaveLength(3);
  });

  it("supports matrix mode", () => {
    render(<AnimatedText text="ABC" variant="matrix" />);

    expect(screen.getByLabelText("ABC")).toBeVisible();
  });
});

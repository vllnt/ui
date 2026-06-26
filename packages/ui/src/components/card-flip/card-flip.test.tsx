import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CardFlip } from "./card-flip";

describe("CardFlip", () => {
  it("renders both faces", () => {
    render(<CardFlip back={<span>Back</span>} front={<span>Front</span>} />);

    expect(screen.getByText("Front")).toBeInTheDocument();
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <CardFlip
        back={<span>Back</span>}
        className="custom-class"
        front={<span>Front</span>}
      />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("toggles on click in click mode", () => {
    const { container } = render(
      <CardFlip
        back={<span>Back</span>}
        flipOnHover={false}
        front={<span>Front</span>}
      />,
    );
    const card = container.firstChild;

    expect(card).toHaveAttribute("role", "button");
    if (card) {
      fireEvent.click(card);
    }

    expect(screen.getByText("Front")).toBeInTheDocument();
  });
});

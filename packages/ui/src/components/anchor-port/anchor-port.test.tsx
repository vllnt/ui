import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnchorPort } from "./anchor-port";

describe("AnchorPort", () => {
  it("exposes side, state, and tone data attributes", () => {
    render(
      <AnchorPort
        aria-label="Input port"
        side="left"
        state="active"
        tone="input"
      />,
    );

    const port = screen.getByLabelText("Input port");
    expect(port).toHaveAttribute("data-side", "left");
    expect(port).toHaveAttribute("data-state", "active");
    expect(port).toHaveAttribute("data-tone", "input");
  });
});

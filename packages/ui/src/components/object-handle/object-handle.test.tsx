import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ObjectHandle } from "./object-handle";

describe("ObjectHandle", () => {
  it("renders label and hint", () => {
    render(<ObjectHandle hint="⌘ drag" label="Reposition" />);

    expect(
      screen.getByRole("button", { name: /reposition/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("⌘ drag")).toBeInTheDocument();
  });
});

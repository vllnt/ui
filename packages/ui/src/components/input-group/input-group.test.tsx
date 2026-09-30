import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";

describe("InputGroup", () => {
  it("renders a group with custom className, an addon, and an input", () => {
    const { container } = render(
      <InputGroup className="custom-class">
        <InputGroupAddon>$</InputGroupAddon>
        <InputGroupInput placeholder="Amount" />
      </InputGroup>,
    );
    expect(screen.getByRole("group")).toBe(container.firstChild);
    expect(container.firstChild).toHaveClass("custom-class");
    expect(screen.getByText("$")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Amount")).toBeInTheDocument();
  });

  it.each(["leading", "trailing"] as const)(
    "renders %s addon alignment",
    (align) => {
      render(<InputGroupAddon align={align}>icon</InputGroupAddon>);
      expect(screen.getByText("icon")).toBeInTheDocument();
    },
  );

  it("forwards the disabled attribute to the input", () => {
    render(<InputGroupInput disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});

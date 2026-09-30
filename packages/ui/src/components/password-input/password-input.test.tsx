import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PasswordInput } from "./password-input";

describe("PasswordInput", () => {
  it("starts as a password field with merged classes and toggles visibility", () => {
    render(<PasswordInput className="custom-class" />);
    const input = screen.getByLabelText("Show password").previousSibling;
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveClass("custom-class");

    fireEvent.click(screen.getByLabelText("Show password"));

    expect(
      screen.getByLabelText("Hide password").previousSibling,
    ).toHaveAttribute("type", "text");
  });
});

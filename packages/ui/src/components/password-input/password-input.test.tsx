import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PasswordInput } from "./password-input";

describe("PasswordInput", () => {
  it("renders with password type by default", () => {
    render(<PasswordInput />);

    expect(
      screen.getByLabelText("Show password").previousSibling,
    ).toHaveAttribute("type", "password");
  });

  it("toggles visibility", () => {
    render(<PasswordInput />);

    fireEvent.click(screen.getByLabelText("Show password"));

    expect(
      screen.getByLabelText("Hide password").previousSibling,
    ).toHaveAttribute("type", "text");
  });

  it("applies custom class names", () => {
    render(<PasswordInput className="custom-class" />);

    expect(screen.getByLabelText("Show password").previousSibling).toHaveClass(
      "custom-class",
    );
  });
});

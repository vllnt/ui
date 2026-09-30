import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Label } from "./label";

it("Label renders children, forwards htmlFor, and merges className with default styling", () => {
  render(
    <Label className="custom" htmlFor="email-field">
      Email
    </Label>,
  );
  const label = screen.getByText("Email");
  expect(label).toHaveAttribute("for", "email-field");
  expect(label).toHaveClass("custom");
  expect(label).toHaveClass("text-sm");
});

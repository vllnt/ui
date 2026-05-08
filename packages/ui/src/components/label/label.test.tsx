import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Label } from "./label";

describe("Label", () => {
  it("renders its children", () => {
    render(<Label>Email</Label>);

    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("forwards htmlFor to associate with an input", () => {
    render(<Label htmlFor="email-field">Email</Label>);

    expect(screen.getByText("Email")).toHaveAttribute("for", "email-field");
  });

  it("merges the className prop", () => {
    render(<Label className="custom">Email</Label>);

    expect(screen.getByText("Email")).toHaveClass("custom");
  });

  it("preserves the default label styling", () => {
    render(<Label>Email</Label>);

    expect(screen.getByText("Email")).toHaveClass("text-sm");
  });
});

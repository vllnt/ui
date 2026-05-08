import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InputOTP, InputOTPGroup, InputOTPSeparator } from "./input-otp";

describe("InputOTP", () => {
  it("renders the underlying input with the requested length", () => {
    const { container } = render(
      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <span>a</span>
        </InputOTPGroup>
      </InputOTP>,
    );

    expect(container.querySelector("input")).toHaveAttribute("maxlength", "6");
  });

  it("merges the className prop on the input", () => {
    const { container } = render(
      <InputOTP className="extra" maxLength={4}>
        <InputOTPGroup>
          <span>x</span>
        </InputOTPGroup>
      </InputOTP>,
    );

    const input = container.querySelector("input");
    expect(input?.getAttribute("class") ?? "").toContain("extra");
  });
});

describe("InputOTPGroup", () => {
  it("renders its children", () => {
    render(
      <InputOTPGroup>
        <span>slot-a</span>
        <span>slot-b</span>
      </InputOTPGroup>,
    );

    expect(screen.getByText("slot-a")).toBeInTheDocument();
    expect(screen.getByText("slot-b")).toBeInTheDocument();
  });
});

describe("InputOTPSeparator", () => {
  it("renders with the separator role", () => {
    render(<InputOTPSeparator />);

    expect(screen.getByRole("separator")).toBeInTheDocument();
  });
});

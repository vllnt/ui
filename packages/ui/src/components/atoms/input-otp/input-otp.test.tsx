import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { InputOTP, InputOTPGroup, InputOTPSeparator } from "./input-otp";

it("InputOTP renders the input with length and className, plus group children and separator", () => {
  const { container } = render(
    <InputOTP className="extra" maxLength={6}>
      <InputOTPGroup>
        <span>slot-a</span>
        <span>slot-b</span>
      </InputOTPGroup>
      <InputOTPSeparator />
    </InputOTP>,
  );
  const input = container.querySelector("input");
  expect(input).toHaveAttribute("maxlength", "6");
  expect(input?.getAttribute("class") ?? "").toContain("extra");
  expect(screen.getByText("slot-a")).toBeInTheDocument();
  expect(screen.getByText("slot-b")).toBeInTheDocument();
  expect(screen.getByRole("separator")).toBeInTheDocument();
});

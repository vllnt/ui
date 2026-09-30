import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Input } from "./input";

it("Input renders a visible textbox that applies className and forwards ref", () => {
  const ref = { current: null };
  render(<Input className="custom-class" ref={ref} />);
  const input = screen.getByRole("textbox");
  expect(input).toBeVisible();
  expect(input).toHaveClass("custom-class");
  expect(ref.current).toBeInstanceOf(HTMLElement);
});

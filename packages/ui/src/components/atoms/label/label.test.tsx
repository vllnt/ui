import { createEvent, fireEvent, render, screen } from "@testing-library/react";
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

it("Label keeps a double click from selecting its text", () => {
  render(<Label>Email</Label>);
  const label = screen.getByText("Email");
  const doubleClick = createEvent.mouseDown(label, { detail: 2 });
  fireEvent(label, doubleClick);
  expect(doubleClick.defaultPrevented).toBe(true);
  const singleClick = createEvent.mouseDown(label, { detail: 1 });
  fireEvent(label, singleClick);
  expect(singleClick.defaultPrevented).toBe(false);
});

it("Label leaves a double click on a control inside it alone", () => {
  render(
    <Label>
      Email <input aria-label="inner" />
    </Label>,
  );
  const input = screen.getByLabelText("inner");
  const doubleClick = createEvent.mouseDown(input, { detail: 2 });
  fireEvent(input, doubleClick);
  expect(doubleClick.defaultPrevented).toBe(false);
});

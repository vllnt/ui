import { act, render } from "@testing-library/react";
import { expect, it } from "vitest";

import { stubMatchMedia } from "../../../__tests__/stub-match-media";

import { Cursor } from "./cursor";

it("Cursor renders with a custom class name and follows pointermove", () => {
  stubMatchMedia();
  const { container } = render(<Cursor className="custom-class" />);
  expect(container.firstChild).toHaveClass("custom-class");
  const event = new Event("pointermove");
  Object.defineProperty(event, "clientX", { value: 120 });
  Object.defineProperty(event, "clientY", { value: 80 });
  act(() => {
    window.dispatchEvent(event);
  });
  const element = container.firstChild;
  expect(element).toBeInstanceOf(HTMLElement);
  if (element instanceof HTMLElement) {
    expect(element.style.transform).toContain("120px");
  }
});

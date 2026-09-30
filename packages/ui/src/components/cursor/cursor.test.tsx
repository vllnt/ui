import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { stubMatchMedia } from "../../__tests__/stub-match-media";

import { Cursor } from "./cursor";

describe("Cursor", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  it("renders the follower", () => {
    const { container } = render(<Cursor />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(<Cursor className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("moves to the pointer position on pointermove", () => {
    const { container } = render(<Cursor />);
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
});

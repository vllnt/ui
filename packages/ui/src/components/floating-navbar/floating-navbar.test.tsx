import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { stubMatchMedia } from "../../__tests__/stub-match-media";

import { FloatingNavbar } from "./floating-navbar";

describe("FloatingNavbar", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  it("renders its children", () => {
    render(
      <FloatingNavbar>
        <a href="#home">Home</a>
      </FloatingNavbar>,
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(<FloatingNavbar className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });
});

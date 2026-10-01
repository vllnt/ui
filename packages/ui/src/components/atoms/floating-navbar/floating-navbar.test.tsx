import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { stubMatchMedia } from "../../../__tests__/stub-match-media";

import { FloatingNavbar } from "./floating-navbar";

it("FloatingNavbar renders its children and applies a custom class name", () => {
  stubMatchMedia();
  const { container } = render(
    <FloatingNavbar className="custom-class">
      <a href="#home">Home</a>
    </FloatingNavbar>,
  );
  expect(screen.getByText("Home")).toBeInTheDocument();
  expect(container.firstChild).toHaveClass("custom-class");
});

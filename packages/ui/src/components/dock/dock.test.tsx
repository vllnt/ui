import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { stubMatchMedia } from "../../__tests__/stub-match-media";

import { Dock, DockIcon } from "./dock";

it("Dock renders its icons and applies custom class names to Dock and DockIcon", () => {
  stubMatchMedia();
  const { container } = render(
    <Dock className="dock-class">
      <DockIcon className="icon-class">Home</DockIcon>
    </Dock>,
  );
  expect(screen.getByText("Home")).toBeInTheDocument();
  expect(container.firstChild).toHaveClass("dock-class");
  expect(container.querySelector(".icon-class")).toHaveTextContent("Home");
});

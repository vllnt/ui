import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { stubMatchMedia } from "../../__tests__/stub-match-media";

import { Dock, DockIcon } from "./dock";

describe("Dock", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  it("renders its icons", () => {
    render(
      <Dock>
        <DockIcon>Home</DockIcon>
      </Dock>,
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(<Dock className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("DockIcon", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <DockIcon className="custom-class">A</DockIcon>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});

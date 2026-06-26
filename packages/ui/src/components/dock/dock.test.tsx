import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Dock, DockIcon } from "./dock";

describe("Dock", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        addEventListener: vi.fn(),
        matches: false,
        removeEventListener: vi.fn(),
      }),
    );
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
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        addEventListener: vi.fn(),
        matches: false,
        removeEventListener: vi.fn(),
      }),
    );
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <DockIcon className="custom-class">A</DockIcon>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});

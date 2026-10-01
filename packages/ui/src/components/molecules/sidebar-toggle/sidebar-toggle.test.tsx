import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SidebarToggle } from "./sidebar-toggle";

describe("SidebarToggle", () => {
  it("applies custom className", () => {
    const { container } = render(<SidebarToggle className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("is visible when rendered", () => {
    const { container } = render(<SidebarToggle />);
    expect(container.firstChild).toBeVisible();
  });
});

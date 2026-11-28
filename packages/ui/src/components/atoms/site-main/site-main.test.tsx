import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteMain } from "./site-main";

describe("SiteMain", () => {
  it("renders the main landmark with id main", () => {
    const { container } = render(<SiteMain>Page</SiteMain>);
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "main");
    expect(container.querySelectorAll("main#main")).toHaveLength(1);
    expect(main).toHaveTextContent("Page");
  });

  it("can take focus from the skip link but is not a tab stop", () => {
    render(<SiteMain>Page</SiteMain>);
    expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");
  });

  it("passes className to the main element", () => {
    render(<SiteMain className="flex-1">Page</SiteMain>);
    expect(screen.getByRole("main")).toHaveClass("flex-1");
  });
});

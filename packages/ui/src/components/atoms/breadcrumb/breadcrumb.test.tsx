import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";

const sample: BreadcrumbItem[] = [
  { href: "/", label: "Home" },
  { href: "/runs", label: "Runs" },
  { label: "research-2025" },
];

describe("Breadcrumb", () => {
  it("renders a landmark with links for href items and a plain last item", () => {
    const { container } = render(<Breadcrumb items={sample} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Runs")).toBeInTheDocument();
    expect(screen.getByText("research-2025")).toBeInTheDocument();
    expect(screen.getByText("Home").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByText("Runs").closest("a")).toHaveAttribute(
      "href",
      "/runs",
    );
    expect(screen.getByText("research-2025").closest("a")).toBeNull();
    expect(container.querySelector("nav")).toHaveAttribute(
      "aria-label",
      "Breadcrumb",
    );
  });

  it("respects the separator prop", () => {
    render(<Breadcrumb items={sample} separator="slash" />);
    expect(screen.getAllByText("/").length).toBeGreaterThan(0);
  });
});

describe("Breadcrumb keys", () => {
  it("renders repeated labels without duplicate-key errors", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => null);
    render(
      <Breadcrumb
        items={[
          { href: "/a", label: "Docs" },
          { href: "/a/b", label: "Docs" },
          { label: "Page" },
        ]}
      />,
    );
    expect(screen.getAllByText("Docs")).toHaveLength(2);
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});

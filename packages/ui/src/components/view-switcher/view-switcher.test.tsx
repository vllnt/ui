import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
const mockPathname = "/tutorials";
let mockSearchParameters = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParameters,
}));

import { ViewSwitcher } from "./view-switcher";

const defaultOptions = [
  { key: "all", label: "All" },
  { key: "series", label: "Series" },
];

describe("ViewSwitcher", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParameters = new URLSearchParams();
  });

  it("renders all options as tabs in a tablist, first selected by default", () => {
    render(<ViewSwitcher options={defaultOptions} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.getByText("All")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Series")).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("applies custom className", () => {
    render(<ViewSwitcher className="custom-class" options={defaultOptions} />);
    expect(screen.getByRole("tablist")).toHaveClass("custom-class");
  });

  it("marks option matching URL param as selected", () => {
    mockSearchParameters = new URLSearchParams("view=series");
    render(<ViewSwitcher options={defaultOptions} />);
    expect(screen.getByText("Series")).toHaveAttribute("aria-selected", "true");
  });

  it("uses custom defaultKey", () => {
    render(<ViewSwitcher defaultKey="series" options={defaultOptions} />);
    expect(screen.getByText("Series")).toHaveAttribute("aria-selected", "true");
  });

  it("pushes URL with param on non-default selection", () => {
    render(<ViewSwitcher options={defaultOptions} />);
    fireEvent.click(screen.getByText("Series"));
    expect(mockPush).toHaveBeenCalledWith("/tutorials?view=series", {
      scroll: false,
    });
  });

  it("removes param when selecting default option", () => {
    mockSearchParameters = new URLSearchParams("view=series");
    render(<ViewSwitcher options={defaultOptions} />);
    fireEvent.click(screen.getByText("All"));
    expect(mockPush).toHaveBeenCalledWith("/tutorials", { scroll: false });
  });

  it("uses custom paramName", () => {
    render(<ViewSwitcher options={defaultOptions} paramName="tab" />);
    fireEvent.click(screen.getByText("Series"));
    expect(mockPush).toHaveBeenCalledWith("/tutorials?tab=series", {
      scroll: false,
    });
  });

  it("preserves other search params", () => {
    mockSearchParameters = new URLSearchParams("category=design");
    render(<ViewSwitcher options={defaultOptions} />);
    fireEvent.click(screen.getByText("Series"));
    expect(mockPush).toHaveBeenCalledWith(
      "/tutorials?category=design&view=series",
      { scroll: false },
    );
  });
});

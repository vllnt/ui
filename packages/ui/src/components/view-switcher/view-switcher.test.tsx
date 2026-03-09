import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
const mockPathname = "/tutorials";
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

import { ViewSwitcher } from "./view-switcher";

const defaultOptions = [
  { key: "all", label: "All" },
  { key: "series", label: "Series" },
];

describe("ViewSwitcher", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams = new URLSearchParams();
  });

  describe("rendering", () => {
    it("renders all options", () => {
      render(<ViewSwitcher options={defaultOptions} />);
      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getByText("Series")).toBeInTheDocument();
    });

    it("renders with tablist role", () => {
      render(<ViewSwitcher options={defaultOptions} />);
      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("renders options with tab role", () => {
      render(<ViewSwitcher options={defaultOptions} />);
      expect(screen.getAllByRole("tab")).toHaveLength(2);
    });

    it("applies custom className", () => {
      render(
        <ViewSwitcher className="custom-class" options={defaultOptions} />,
      );
      expect(screen.getByRole("tablist")).toHaveClass("custom-class");
    });
  });

  describe("active state", () => {
    it("marks first option as selected by default", () => {
      render(<ViewSwitcher options={defaultOptions} />);
      expect(screen.getByText("All")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      expect(screen.getByText("Series")).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });

    it("marks option matching URL param as selected", () => {
      mockSearchParams = new URLSearchParams("view=series");
      render(<ViewSwitcher options={defaultOptions} />);
      expect(screen.getByText("Series")).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    it("uses custom defaultKey", () => {
      render(
        <ViewSwitcher defaultKey="series" options={defaultOptions} />,
      );
      expect(screen.getByText("Series")).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });
  });

  describe("navigation", () => {
    it("pushes URL with param on non-default selection", () => {
      render(<ViewSwitcher options={defaultOptions} />);
      fireEvent.click(screen.getByText("Series"));
      expect(mockPush).toHaveBeenCalledWith("/tutorials?view=series", {
        scroll: false,
      });
    });

    it("removes param when selecting default option", () => {
      mockSearchParams = new URLSearchParams("view=series");
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
      mockSearchParams = new URLSearchParams("category=design");
      render(<ViewSwitcher options={defaultOptions} />);
      fireEvent.click(screen.getByText("Series"));
      expect(mockPush).toHaveBeenCalledWith(
        "/tutorials?category=design&view=series",
        { scroll: false },
      );
    });
  });
});

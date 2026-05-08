import { act, render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SidebarProvider, useSidebar } from "./sidebar-provider";

describe("SidebarProvider", () => {
  it("renders its children", () => {
    render(
      <SidebarProvider>
        <span>sidebar-body</span>
      </SidebarProvider>,
    );

    expect(screen.getByText("sidebar-body")).toBeInTheDocument();
  });
});

describe("useSidebar", () => {
  it("throws when used outside of SidebarProvider", () => {
    expect(() => renderHook(() => useSidebar())).toThrow(
      "useSidebar must be used within SidebarProvider",
    );
  });

  it("returns the open + setOpen pair when used inside the provider", () => {
    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => <SidebarProvider>{children}</SidebarProvider>,
    });

    expect(result.current.open).toBe(false);
    act(() => {
      result.current.setOpen(true);
    });
    expect(result.current.open).toBe(true);
  });
});

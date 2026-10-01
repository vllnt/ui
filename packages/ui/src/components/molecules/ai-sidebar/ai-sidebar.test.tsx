import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  AISidebar,
  AISidebarClose,
  AISidebarContent,
  AISidebarFooter,
  AISidebarHeader,
  AISidebarProvider,
  AISidebarTitle,
  AISidebarTrigger,
} from "./ai-sidebar";

const sidebar = (
  props: ComponentProps<typeof AISidebarProvider>,
  sidebarProps?: ComponentProps<typeof AISidebar>,
) => (
  <AISidebarProvider {...props}>
    <AISidebar {...sidebarProps}>
      <AISidebarTitle>Assistant</AISidebarTitle>
    </AISidebar>
    <AISidebarTrigger />
  </AISidebarProvider>
);

describe("AISidebar", () => {
  it("renders the title and content, and AISidebarClose closes the sidebar", () => {
    const onOpenChange = vi.fn();
    render(
      <AISidebarProvider defaultOpen onOpenChange={onOpenChange}>
        <AISidebar>
          <AISidebarHeader>
            <AISidebarTitle>Assistant</AISidebarTitle>
            <AISidebarClose />
          </AISidebarHeader>
          <AISidebarContent>
            <p>Hello</p>
          </AISidebarContent>
          <AISidebarFooter>
            <button type="button">Send</button>
          </AISidebarFooter>
        </AISidebar>
      </AISidebarProvider>,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: /Assistant/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close assistant" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("falls back to the default title when no children are passed", () => {
    render(
      <AISidebarProvider defaultOpen>
        <AISidebar>
          <AISidebarHeader>
            <AISidebarTitle />
          </AISidebarHeader>
        </AISidebar>
      </AISidebarProvider>,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: /AI Assistant/ }),
    ).toBeInTheDocument();
  });

  it("is visible and focusable when open, aria-hidden and inert when closed", () => {
    const { container, rerender } = render(sidebar({ open: true }));
    const aside = () => container.querySelector("aside");
    expect(aside()).toHaveAttribute("aria-hidden", "false");
    expect(aside()).not.toHaveAttribute("inert");
    rerender(sidebar({ open: false }));
    expect(aside()).toHaveAttribute("aria-hidden", "true");
    expect(aside()).toHaveAttribute("inert");
  });

  it("the trigger toggles open state", () => {
    const onOpenChange = vi.fn();
    render(sidebar({ onOpenChange }));
    fireEvent.click(screen.getByRole("button", { name: "Open AI assistant" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("Escape closes the sidebar when closeOnEscape is the default", () => {
    const onOpenChange = vi.fn();
    render(sidebar({ defaultOpen: true, onOpenChange }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Escape is ignored when closeOnEscape is false", () => {
    const onOpenChange = vi.fn();
    render(
      sidebar({ defaultOpen: true, onOpenChange }, { closeOnEscape: false }),
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("controlled mode flows through onOpenChange without changing internal state", () => {
    const onOpenChange = vi.fn();
    render(sidebar({ onOpenChange, open: false }));
    fireEvent.click(screen.getByRole("button", { name: "Open AI assistant" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(document.querySelector("aside")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("emits data-state and position-driven classes", () => {
    const { container } = render(
      sidebar({ defaultOpen: true, defaultPosition: "left" }),
    );
    const aside = container.querySelector("aside");
    expect(aside).toHaveAttribute("data-state", "open");
    expect(aside?.className).toContain("left-0");
    expect(aside?.className).toContain("border-r");
  });
});

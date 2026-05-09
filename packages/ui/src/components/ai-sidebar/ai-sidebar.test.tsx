import { fireEvent, render, screen } from "@testing-library/react";
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

describe("AISidebar", () => {
  describe("rendering", () => {
    it("renders the title and content", () => {
      render(
        <AISidebarProvider defaultOpen>
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

    it("uses aria-hidden=false when open and aria-hidden=true when closed", () => {
      const { container, rerender } = render(
        <AISidebarProvider open>
          <AISidebar>
            <AISidebarTitle>Assistant</AISidebarTitle>
          </AISidebar>
        </AISidebarProvider>,
      );

      expect(container.querySelector("aside")).toHaveAttribute(
        "aria-hidden",
        "false",
      );

      rerender(
        <AISidebarProvider open={false}>
          <AISidebar>
            <AISidebarTitle>Assistant</AISidebarTitle>
          </AISidebar>
        </AISidebarProvider>,
      );

      expect(container.querySelector("aside")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });
  });

  describe("toggle", () => {
    it("the trigger toggles open state", () => {
      const onOpenChange = vi.fn();
      render(
        <AISidebarProvider onOpenChange={onOpenChange}>
          <AISidebar>
            <AISidebarTitle>Assistant</AISidebarTitle>
          </AISidebar>
          <AISidebarTrigger />
        </AISidebarProvider>,
      );

      fireEvent.click(
        screen.getByRole("button", { name: "Open AI assistant" }),
      );

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it("AISidebarClose closes the sidebar", () => {
      const onOpenChange = vi.fn();
      render(
        <AISidebarProvider defaultOpen onOpenChange={onOpenChange}>
          <AISidebar>
            <AISidebarHeader>
              <AISidebarTitle>Assistant</AISidebarTitle>
              <AISidebarClose />
            </AISidebarHeader>
          </AISidebar>
        </AISidebarProvider>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Close assistant" }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("Escape closes the sidebar when closeOnEscape is the default", () => {
      const onOpenChange = vi.fn();
      render(
        <AISidebarProvider defaultOpen onOpenChange={onOpenChange}>
          <AISidebar>
            <AISidebarTitle>Assistant</AISidebarTitle>
          </AISidebar>
        </AISidebarProvider>,
      );

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("Escape is ignored when closeOnEscape is false", () => {
      const onOpenChange = vi.fn();
      render(
        <AISidebarProvider defaultOpen onOpenChange={onOpenChange}>
          <AISidebar closeOnEscape={false}>
            <AISidebarTitle>Assistant</AISidebarTitle>
          </AISidebar>
        </AISidebarProvider>,
      );

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it("controlled mode flows through onOpenChange without changing internal state", () => {
      const onOpenChange = vi.fn();
      render(
        <AISidebarProvider onOpenChange={onOpenChange} open={false}>
          <AISidebar>
            <AISidebarTitle>Assistant</AISidebarTitle>
          </AISidebar>
          <AISidebarTrigger />
        </AISidebarProvider>,
      );

      fireEvent.click(
        screen.getByRole("button", { name: "Open AI assistant" }),
      );

      expect(onOpenChange).toHaveBeenCalledWith(true);
      const aside = document.querySelector("aside");
      expect(aside).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("position", () => {
    it("emits data-state and position-driven classes", () => {
      const { container } = render(
        <AISidebarProvider defaultOpen defaultPosition="left">
          <AISidebar>
            <AISidebarTitle>Assistant</AISidebarTitle>
          </AISidebar>
        </AISidebarProvider>,
      );

      const aside = container.querySelector("aside");
      expect(aside).toHaveAttribute("data-state", "open");
      expect(aside?.className).toContain("left-0");
      expect(aside?.className).toContain("border-r");
    });
  });
});

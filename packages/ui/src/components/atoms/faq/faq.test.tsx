import { createRef } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FAQ, FAQItem } from "./faq";

describe("FAQ", () => {
  it("renders the title as h4 by default with items closed until clicked", () => {
    render(
      <FAQ title="Common questions">
        <FAQItem question="What does it do?">It tests the FAQ.</FAQItem>
      </FAQ>,
    );
    expect(
      screen.getByRole("heading", { level: 4, name: "Common questions" }),
    ).toBeInTheDocument();
    const trigger = screen.getByRole("button", { name: "What does it do?" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("It tests the FAQ.")).not.toBeVisible();
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("It tests the FAQ.")).toBeVisible();
  });

  it("falls back to the default title and respects defaultOpen on FAQItem", () => {
    render(
      <FAQ>
        <FAQItem defaultOpen question="Q1">
          Answer 1
        </FAQItem>
      </FAQ>,
    );
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
    expect(screen.getByText("Answer 1")).toBeVisible();
  });

  it("renders the title with the heading tag passed via the as prop", () => {
    render(
      <FAQ as="h2" title="Common questions">
        <FAQItem question="Q1">A</FAQItem>
      </FAQ>,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Common questions" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 4, name: "Common questions" }),
    ).not.toBeInTheDocument();
  });

  it("keeps a closed answer in the page but out of the accessibility tree", () => {
    render(
      <FAQItem question="Q1">
        <a href="/docs">Read the docs</a>
      </FAQItem>,
    );
    expect(screen.getByText("Read the docs")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("sizes the open panel from its content instead of capping it", () => {
    const { container } = render(
      <FAQItem defaultOpen question="Q1">
        {"A very long answer. ".repeat(500)}
      </FAQItem>,
    );
    const panel = container.querySelector("[data-open] > .overflow-hidden");
    expect(panel).toHaveClass("h-[var(--collapsible-panel-height)]");
    expect(panel?.className).not.toMatch(/max-h-/);
  });

  it("can be controlled with open and onOpenChange", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <FAQItem onOpenChange={onOpenChange} open={false} question="Q1">
        Answer
      </FAQItem>,
    );
    const trigger = screen.getByRole("button", { name: "Q1" });
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    rerender(
      <FAQItem onOpenChange={onOpenChange} open question="Q1">
        Answer
      </FAQItem>,
    );
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Answer")).toBeVisible();
  });

  it("forwards ref to the item root", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <FAQItem question="Q1" ref={ref}>
        A
      </FAQItem>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toContainElement(
      screen.getByRole("button", { name: "Q1" }),
    );
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FAQ, FAQItem } from "./faq";

describe("FAQ", () => {
  it("renders the title and items", () => {
    render(
      <FAQ title="Common questions">
        <FAQItem question="What does it do?">It tests the FAQ.</FAQItem>
      </FAQ>,
    );

    expect(screen.getByText("Common questions")).toBeInTheDocument();
    expect(screen.getByText("What does it do?")).toBeInTheDocument();
  });

  it("renders FAQItem closed by default", () => {
    const { container } = render(
      <FAQ>
        <FAQItem question="Q1">Answer 1</FAQItem>
      </FAQ>,
    );

    expect(container.querySelector(".overflow-hidden")).toHaveClass("max-h-0");
  });

  it("opens the item when the trigger is clicked", () => {
    const { container } = render(
      <FAQ>
        <FAQItem question="Q1">Answer 1</FAQItem>
      </FAQ>,
    );

    fireEvent.click(screen.getByText("Q1"));
    expect(container.querySelector(".overflow-hidden")).toHaveClass("max-h-96");
  });

  it("respects defaultOpen on FAQItem", () => {
    const { container } = render(
      <FAQ>
        <FAQItem defaultOpen question="Q1">
          Answer 1
        </FAQItem>
      </FAQ>,
    );

    expect(container.querySelector(".overflow-hidden")).toHaveClass("max-h-96");
  });

  it("falls back to the default title when none is provided", () => {
    render(
      <FAQ>
        <FAQItem question="Q1">A</FAQItem>
      </FAQ>,
    );

    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
  });
});

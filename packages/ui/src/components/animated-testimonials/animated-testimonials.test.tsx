import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AnimatedTestimonials,
  type Testimonial,
} from "./animated-testimonials";

const testimonials: Testimonial[] = [
  { name: "Ada", quote: "First quote", title: "Engineer" },
  { name: "Grace", quote: "Second quote", title: "Admiral" },
];

describe("AnimatedTestimonials", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        addEventListener: vi.fn(),
        matches: false,
        removeEventListener: vi.fn(),
      }),
    );
  });

  it("renders the first testimonial", () => {
    render(<AnimatedTestimonials testimonials={testimonials} />);

    expect(screen.getByText("First quote")).toBeInTheDocument();
  });

  it("advances to the next testimonial", () => {
    render(<AnimatedTestimonials testimonials={testimonials} />);

    fireEvent.click(screen.getByText("Next"));

    expect(screen.getByText("Second quote")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <AnimatedTestimonials
        className="custom-class"
        testimonials={testimonials}
      />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});

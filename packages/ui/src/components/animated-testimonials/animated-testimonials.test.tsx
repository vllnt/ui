import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { stubMatchMedia } from "../../__tests__/stub-match-media";

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
    stubMatchMedia();
  });

  it("renders the first testimonial, merges className, and advances to the next", () => {
    const { container } = render(
      <AnimatedTestimonials
        className="custom-class"
        testimonials={testimonials}
      />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(screen.getByText("First quote")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Second quote")).toBeInTheDocument();
  });
});

import { StrictMode } from "react";

import { fireEvent, render, screen } from "@testing-library/react-native";
import { Animated } from "react-native";

import { flushMicrotasks, reducedMotion } from "../../../tests/test-utils";

import { AnimatedTestimonials } from "./animated-testimonials";

it("settles a newly selected testimonial after StrictMode interrupts its entrance", async () => {
  const setValue = jest.spyOn(Animated.Value.prototype, "setValue");
  const stop = jest.fn();
  jest
    .spyOn(Animated, "timing")
    .mockReturnValue({ reset: jest.fn(), start: jest.fn(), stop });
  const service = reducedMotion(false);
  render(
    <StrictMode>
      <AnimatedTestimonials
        labels={{
          next: "Next",
          pause: "Pause",
          position: (index, total) => `${index}/${total}`,
          previous: "Previous",
          region: "Quotes",
          resume: "Resume",
        }}
        reducedMotionService={service}
        testimonials={[
          { id: "a", name: "A", quote: "First", title: "One" },
          { id: "b", name: "B", quote: "Second", title: "Two" },
        ]}
      />
    </StrictMode>,
  );
  await flushMicrotasks();
  setValue.mockClear();
  fireEvent.press(screen.getByRole("button", { name: "Next" }));
  expect(stop).toHaveBeenCalled();
  expect(setValue).toHaveBeenCalledWith(1);
  expect(screen.getByText("Second")).toBeOnTheScreen();
  jest.restoreAllMocks();
});

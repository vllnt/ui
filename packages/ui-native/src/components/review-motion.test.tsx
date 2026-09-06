import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Animated, Text } from "react-native";

import type { ReducedMotionService } from "../primitives/use-reduced-motion";

import { AnimatedList } from "./animated-list/animated-list";
import { AnimatedTestimonials } from "./animated-testimonials/animated-testimonials";

const labels = {
  next: "Next testimonial",
  pause: "Pause testimonials",
  position: (index: number, total: number) => `${index} of ${total}`,
  previous: "Previous testimonial",
  region: "Testimonials",
  resume: "Resume testimonials",
};

function ignorePreference(_enabled: boolean) {}

const testimonials = [
  { id: "one", name: "Ari", quote: "First quote", title: "Designer" },
  { id: "two", name: "Bo", quote: "Second quote", title: "Engineer" },
];

function createReducedMotionService(initialPreference: boolean) {
  let preferenceListener = ignorePreference;
  const remove = jest.fn();
  const service: ReducedMotionService = {
    addEventListener(_eventName, listener) {
      preferenceListener = listener;
      return { remove };
    },
    isReduceMotionEnabled: jest.fn(async () => initialPreference),
  };

  return {
    emit(enabled: boolean) {
      preferenceListener(enabled);
    },
    remove,
    service,
  };
}

function mockAnimations() {
  const animations: {
    readonly reset: jest.Mock;
    readonly start: jest.Mock;
    readonly stop: jest.Mock;
  }[] = [];
  const timing = jest.spyOn(Animated, "timing").mockImplementation(() => {
    const animation = {
      reset: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    };
    animations.push(animation);
    return animation;
  });
  return { animations, timing };
}

describe("native reviewed motion behavior", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("keeps initial list rows visible and animates only later insertions", async () => {
    const { service } = createReducedMotionService(false);
    const { timing } = mockAnimations();
    const initialItems = [{ content: <Text>Initial row</Text>, id: "initial" }];
    const view = render(
      <AnimatedList
        items={initialItems}
        label="Updates"
        reducedMotionService={service}
      />,
    );

    await waitFor(() => {
      expect(service.isReduceMotionEnabled).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText("Initial row")).toBeOnTheScreen();
    expect(timing).not.toHaveBeenCalled();

    view.rerender(
      <AnimatedList
        items={[
          ...initialItems,
          { content: <Text>Inserted row</Text>, id: "inserted" },
        ]}
        label="Updates"
        reducedMotionService={service}
      />,
    );

    expect(timing).toHaveBeenCalledTimes(1);
    expect(timing).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      expect.objectContaining({ delay: 40, duration: 100, toValue: 1 }),
    );
  });

  it("keeps the initial testimonial visible and animates a user selection", async () => {
    const { service } = createReducedMotionService(false);
    const { timing } = mockAnimations();
    render(
      <AnimatedTestimonials
        labels={labels}
        reducedMotionService={service}
        testimonials={testimonials}
      />,
    );

    await waitFor(() => {
      expect(service.isReduceMotionEnabled).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText("First quote")).toBeOnTheScreen();
    expect(timing).not.toHaveBeenCalled();

    fireEvent.press(screen.getByRole("button", { name: "Next testimonial" }));

    expect(screen.getByText("Second quote")).toBeOnTheScreen();
    expect(timing).toHaveBeenCalledTimes(1);
  });

  it("never animates list insertions or testimonial selections with reduced motion", async () => {
    const { service } = createReducedMotionService(true);
    const { timing } = mockAnimations();
    const initialItems = [{ content: <Text>Initial row</Text>, id: "initial" }];
    const view = render(
      <AnimatedList
        items={initialItems}
        label="Updates"
        reducedMotionService={service}
      />,
    );

    await waitFor(() => {
      expect(service.isReduceMotionEnabled).toHaveBeenCalledTimes(1);
    });
    view.rerender(
      <AnimatedList
        items={[
          ...initialItems,
          { content: <Text>Inserted row</Text>, id: "inserted" },
        ]}
        label="Updates"
        reducedMotionService={service}
      />,
    );
    expect(timing).not.toHaveBeenCalled();

    view.unmount();
    render(
      <AnimatedTestimonials
        labels={labels}
        reducedMotionService={service}
        testimonials={testimonials}
      />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Next testimonial" }));
    expect(screen.getByText("Second quote")).toBeOnTheScreen();
    expect(timing).not.toHaveBeenCalled();
  });

  it("stops running motion on preference changes and unmount", async () => {
    const preference = createReducedMotionService(false);
    const { animations } = mockAnimations();
    const initialItems = [{ content: <Text>Initial row</Text>, id: "initial" }];
    const view = render(
      <AnimatedList
        items={initialItems}
        label="Updates"
        reducedMotionService={preference.service}
      />,
    );

    await waitFor(() => {
      expect(preference.service.isReduceMotionEnabled).toHaveBeenCalledTimes(1);
    });
    view.rerender(
      <AnimatedList
        items={[
          ...initialItems,
          { content: <Text>Inserted row</Text>, id: "inserted" },
        ]}
        label="Updates"
        reducedMotionService={preference.service}
      />,
    );
    expect(animations).toHaveLength(1);

    act(() => {
      preference.emit(true);
    });
    expect(animations[0]?.stop).toHaveBeenCalledTimes(1);

    const nextPreference = createReducedMotionService(false);
    const testimonialsView = render(
      <AnimatedTestimonials
        labels={labels}
        reducedMotionService={nextPreference.service}
        testimonials={testimonials}
      />,
    );
    await waitFor(() => {
      expect(
        nextPreference.service.isReduceMotionEnabled,
      ).toHaveBeenCalledTimes(1);
    });
    fireEvent.press(screen.getByRole("button", { name: "Next testimonial" }));
    expect(animations).toHaveLength(2);

    testimonialsView.unmount();
    expect(animations[1]?.stop).toHaveBeenCalledTimes(1);
  });
});

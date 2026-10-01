import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Animated, Text } from "react-native";

import { AnimatedList } from "../components/atoms/animated-list/animated-list";
import { AnimatedTestimonials } from "../components/atoms/animated-testimonials/animated-testimonials";
import type { ReducedMotionService } from "../primitives/use-reduced-motion";

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
    const animation = { reset: jest.fn(), start: jest.fn(), stop: jest.fn() };
    animations.push(animation);
    return animation;
  });
  return { animations, timing };
}

const initialItems = [{ content: <Text>Initial row</Text>, id: "initial" }];

function list(service: ReducedMotionService, inserted = false) {
  const items = inserted
    ? [...initialItems, { content: <Text>Inserted row</Text>, id: "inserted" }]
    : initialItems;
  return (
    <AnimatedList
      items={items}
      label="Updates"
      reducedMotionService={service}
    />
  );
}

function quotes(service: ReducedMotionService) {
  return (
    <AnimatedTestimonials
      labels={labels}
      reducedMotionService={service}
      testimonials={testimonials}
    />
  );
}

async function settled(service: ReducedMotionService) {
  await waitFor(() => {
    expect(service.isReduceMotionEnabled).toHaveBeenCalledTimes(1);
  });
}

afterEach(() => {
  jest.restoreAllMocks();
});

it("keeps initial list rows visible and animates only later insertions", async () => {
  const { service } = createReducedMotionService(false);
  const { timing } = mockAnimations();
  const view = render(list(service));

  await settled(service);
  expect(screen.getByText("Initial row")).toBeOnTheScreen();
  expect(timing).not.toHaveBeenCalled();

  view.rerender(list(service, true));

  expect(timing).toHaveBeenCalledTimes(1);
  expect(timing).toHaveBeenCalledWith(
    expect.any(Animated.Value),
    expect.objectContaining({ delay: 40, duration: 100, toValue: 1 }),
  );
});

it("keeps the initial testimonial visible and animates a user selection", async () => {
  const { service } = createReducedMotionService(false);
  const { timing } = mockAnimations();
  render(quotes(service));

  await settled(service);
  expect(screen.getByText("First quote")).toBeOnTheScreen();
  expect(timing).not.toHaveBeenCalled();

  fireEvent.press(screen.getByRole("button", { name: "Next testimonial" }));

  expect(screen.getByText("Second quote")).toBeOnTheScreen();
  expect(timing).toHaveBeenCalledTimes(1);
});

it("never animates list insertions or testimonial selections with reduced motion", async () => {
  const { service } = createReducedMotionService(true);
  const { timing } = mockAnimations();
  const view = render(list(service));

  await settled(service);
  view.rerender(list(service, true));
  expect(timing).not.toHaveBeenCalled();

  view.unmount();
  render(quotes(service));
  fireEvent.press(screen.getByRole("button", { name: "Next testimonial" }));
  expect(screen.getByText("Second quote")).toBeOnTheScreen();
  expect(timing).not.toHaveBeenCalled();
});

it("stops running motion on preference changes and unmount", async () => {
  const preference = createReducedMotionService(false);
  const { animations } = mockAnimations();
  const view = render(list(preference.service));

  await settled(preference.service);
  view.rerender(list(preference.service, true));
  expect(animations).toHaveLength(1);

  act(() => {
    preference.emit(true);
  });
  expect(animations[0]?.stop).toHaveBeenCalledTimes(1);

  const nextPreference = createReducedMotionService(false);
  const testimonialsView = render(quotes(nextPreference.service));
  await settled(nextPreference.service);
  fireEvent.press(screen.getByRole("button", { name: "Next testimonial" }));
  expect(animations).toHaveLength(2);

  testimonialsView.unmount();
  expect(animations[1]?.stop).toHaveBeenCalledTimes(1);
});

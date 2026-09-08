import { StrictMode } from "react";

import { act, render, screen } from "@testing-library/react-native";
import { Animated, Text } from "react-native";

import { AnimatedList } from "./animated-list";

it("settles interrupted entrance rows visibly when their index changes", async () => {
  const setValue = jest.spyOn(Animated.Value.prototype, "setValue");
  const stop = jest.fn();
  jest
    .spyOn(Animated, "timing")
    .mockReturnValue({ reset: jest.fn(), start: jest.fn(), stop });
  const service = {
    addEventListener: () => ({ remove: () => {} }),
    isReduceMotionEnabled: async () => false,
  };
  const initial = [{ content: <Text>A</Text>, id: "a" }];
  const added = { content: <Text>B</Text>, id: "b" };
  render(
    <StrictMode>
      <AnimatedList
        items={initial}
        label="Rows"
        reducedMotionService={service}
      />
    </StrictMode>,
  );
  await act(async () => {
    await Promise.resolve();
  });
  setValue.mockClear();
  screen.rerender(
    <StrictMode>
      <AnimatedList
        items={[...initial, added]}
        label="Rows"
        reducedMotionService={service}
      />
    </StrictMode>,
  );
  screen.rerender(
    <StrictMode>
      <AnimatedList
        items={[added, ...initial]}
        label="Rows"
        reducedMotionService={service}
      />
    </StrictMode>,
  );
  expect(stop).toHaveBeenCalled();
  expect(setValue).toHaveBeenCalledWith(1);
  jest.restoreAllMocks();
});

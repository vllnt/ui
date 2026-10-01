import { useState } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { AccessibilityInfo, Animated, Text } from "react-native";

import { Marquee } from "../components/marquee/marquee";
import { Toast, type ToastItem } from "../components/toast/toast";

import { flushMicrotasks, reducedMotion } from "./test-utils";

/** Reports whether VoiceOver/TalkBack runs for components mounted next. */
function mockScreenReader(enabled: boolean) {
  jest
    .spyOn(AccessibilityInfo, "isScreenReaderEnabled")
    .mockResolvedValue(enabled);
}

/** Lays out the first marquee lane so the motion effect can start. */
function layOutMarquee() {
  const [first] = screen.getAllByText("Headline");
  if (!first) throw new Error("Expected marquee content.");
  fireEvent(first, "layout", {
    nativeEvent: { layout: { height: 20, width: 200, x: 0, y: 0 } },
  });
}

function ToastHarness({ onEmpty }: { readonly onEmpty: () => void }) {
  const [toasts, setToasts] = useState<readonly ToastItem[]>([
    { duration: 1000, id: "saved", title: "Saved" },
  ]);
  return (
    <Toast
      closeLabel="Close"
      onToastsChange={(next) => {
        setToasts(next);
        if (next.length === 0) onEmpty();
      }}
      toasts={toasts}
    />
  );
}

const marquee = (paused: boolean) => (
  <Marquee paused={paused} reducedMotionService={reducedMotion(false)}>
    <Text>Headline</Text>
  </Marquee>
);

afterEach(() => {
  jest.useRealTimers();
  jest
    .spyOn(AccessibilityInfo, "isScreenReaderEnabled")
    .mockImplementation(() => new Promise(() => {}));
});

it.each([
  [true, 0],
  [false, 1],
])(
  "with a screen reader running = %p, an expiring toast closes %p times",
  async (screenReader, closes) => {
    jest.useFakeTimers();
    mockScreenReader(screenReader);
    const onEmpty = jest.fn();
    render(<ToastHarness onEmpty={onEmpty} />);
    await flushMicrotasks();
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(onEmpty).toHaveBeenCalledTimes(closes);
  },
);

it("stops marquee motion when paused or while a screen reader runs", async () => {
  const loop = jest.spyOn(Animated, "loop");
  mockScreenReader(false);
  const view = render(marquee(true));
  await flushMicrotasks();
  layOutMarquee();
  expect(loop).not.toHaveBeenCalled();
  view.rerender(marquee(false));
  expect(loop).toHaveBeenCalled();
  view.unmount();

  loop.mockClear();
  mockScreenReader(true);
  render(marquee(false));
  await flushMicrotasks();
  layOutMarquee();
  expect(loop).not.toHaveBeenCalled();
  loop.mockRestore();
});

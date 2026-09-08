import { render, screen } from "@testing-library/react-native";

import { LiveFeed } from "./live-feed";

const events = [
  { id: "a", severity: "info", timestamp: "invalid", title: "Retained event" },
] satisfies React.ComponentProps<typeof LiveFeed>["events"];

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

it("retains invalid-dated events without inventing relative time", () => {
  render(<LiveFeed events={events} now={0} />);
  expect(screen.getByText("Retained event")).toBeOnTheScreen();
  expect(screen.queryByText(/NaN|ago|just now/)).toBeNull();
});

it("does not announce a relative age against an invalid clock", () => {
  render(
    <LiveFeed
      events={[
        { id: "valid", severity: "info", timestamp: 0, title: "Valid event" },
      ]}
      now="invalid"
    />,
  );
  expect(screen.queryByText(/NaN|ago|just now/)).toBeNull();
});

it.each([Number.NaN, Infinity, -Infinity, 3_000_000_000])(
  "bounds interval input %p",
  (tickMs) => {
    jest.useFakeTimers();
    const interval = jest.spyOn(global, "setInterval");
    const { unmount } = render(<LiveFeed events={[]} tickMs={tickMs} />);
    expect(interval).toHaveBeenLastCalledWith(
      expect.any(Function),
      Number.isFinite(tickMs) ? 2_147_483_647 : 30_000,
    );
    unmount();
    expect(jest.getTimerCount()).toBe(0);
  },
);

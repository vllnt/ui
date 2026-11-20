import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { AccessibilityInfo, Animated, Modal, Text } from "react-native";

import {
  Drawer,
  type DrawerDirection,
  type DrawerProps,
} from "../components/atoms/drawer/drawer";

import { flushMicrotasks, styleOf } from "./test-utils";

type Step = { readonly t: number; readonly x: number; readonly y: number };
type Probe = {
  readonly props: Readonly<Record<string, unknown>>;
  readonly type: unknown;
};

type TestNode = ReturnType<typeof screen.UNSAFE_getByType>;

const SNAPS = ["200px", "400px"];
const BODY = "Drawer body";

let timing: jest.SpyInstance;
let focusSpy: jest.SpyInstance;
let animations: { duration: unknown; toValue: unknown }[] = [];

beforeEach(() => {
  animations = [];
  focusSpy = jest
    .spyOn(AccessibilityInfo, "sendAccessibilityEvent")
    .mockImplementation(() => {});
  timing = jest
    .spyOn(Animated, "timing")
    .mockImplementation((_value, config) => ({
      _isUsingNativeDriver: () => false,
      _startNativeLoop: () => {},
      reset: jest.fn(),
      start: (callback) => {
        animations.push({ duration: config.duration, toValue: config.toValue });
        callback?.({ finished: true });
      },
      stop: jest.fn(),
    }));
});

afterEach(() => {
  timing.mockRestore();
  focusSpy.mockRestore();
});

function drawer(props: Partial<DrawerProps> = {}) {
  return (
    <Drawer closeLabel="Close drawer" defaultOpen title="Filters" {...props}>
      <Text>{BODY}</Text>
    </Drawer>
  );
}

function rest() {
  const target = animations.at(-1)?.toValue;
  return typeof target === "number" ? Math.abs(target) : Number.NaN;
}

function responderNodes(): unknown[] {
  const found: unknown[] = screen.UNSAFE_root.findAll(
    (node: Probe) => typeof node.props.onMoveShouldSetResponder === "function",
  );
  return found;
}

function responder(): TestNode {
  const [node] = responderNodes();
  if (!node) throw new Error("No node carries the pan handlers");
  return node;
}

function call(node: TestNode, name: string, event: unknown): unknown {
  const handler: unknown = node.props[name];
  if (typeof handler !== "function") throw new Error(`${name} is missing`);
  return Reflect.apply(handler, undefined, [event]);
}

function touch(now: Step, before: Step, start: Step) {
  return {
    nativeEvent: { touches: [{ pageX: now.x, pageY: now.y }] },
    touchHistory: {
      indexOfSingleActiveTouch: 0,
      mostRecentTimeStamp: now.t,
      numberActiveTouches: 1,
      touchBank: [
        {
          currentPageX: now.x,
          currentPageY: now.y,
          currentTimeStamp: now.t,
          previousPageX: before.x,
          previousPageY: before.y,
          previousTimeStamp: before.t,
          startPageX: start.x,
          startPageY: start.y,
          startTimeStamp: start.t,
          touchActive: true,
        },
      ],
    },
  };
}

/** A pull of `distance` points along `axis`, taking `ms`, after the touch slop. */
function pull(distance: number, ms = 1000, axis: "x" | "y" = "y"): Step[] {
  const sign = Math.sign(distance);
  const place = (along: number, t: number): Step =>
    axis === "y" ? { t, x: 0, y: along } : { t, x: along, y: 0 };
  return [
    place(0, 1),
    place(sign * 10, 2),
    place(sign * 10 + distance, 2 + ms),
  ];
}

/** Runs the steps through the pan responder; `true` when it claimed the touch. */
function drag(steps: readonly Step[], node: TestNode = responder()): boolean {
  const [start, ...moves] = steps;
  if (!start) throw new Error("A drag needs a start");
  let claimed = false;
  act(() => {
    call(node, "onStartShouldSetResponderCapture", touch(start, start, start));
    let previous = start;
    for (const move of moves) {
      const event = touch(move, previous, start);
      if (claimed) {
        call(node, "onResponderMove", event);
      } else {
        call(node, "onMoveShouldSetResponderCapture", event);
        claimed = call(node, "onMoveShouldSetResponder", event) === true;
        if (claimed) call(node, "onResponderGrant", event);
      }
      previous = move;
    }
    if (claimed) {
      call(node, "onResponderRelease", touch(previous, previous, start));
    }
  });
  return claimed;
}

function escapeHost(): unknown {
  return screen.UNSAFE_root.find(
    (node: Probe) =>
      typeof node.type === "string" &&
      typeof node.props.onAccessibilityEscape === "function",
  );
}

function handle(): unknown {
  return screen.getByRole("adjustable", { name: "Drawer height" });
}

function value(): unknown {
  return screen.getByRole("adjustable", { name: "Drawer height" }).props
    .accessibilityValue;
}

function performAction(actionName: string) {
  fireEvent(handle(), "accessibilityAction", { nativeEvent: { actionName } });
}

describe("Drawer snapPoints and the handle", () => {
  it("offers an adjustable handle that reads the visible share of the window", () => {
    render(drawer({ handleLabel: "Drawer height", snapPoints: [0.5, 1] }));
    expect(value()).toEqual({ max: 1, min: 0, now: 0, text: "50%" });
  });

  it("names the handle after the title without a handleLabel", () => {
    render(drawer({ snapPoints: [0.5, 1] }));
    expect(
      screen.getByRole("adjustable", { name: "Filters" }),
    ).toBeOnTheScreen();
  });

  it("sorts snap points smallest first and starts on the smallest", () => {
    render(drawer({ handleLabel: "Drawer height", snapPoints: [1, 0.5] }));
    expect(value()).toMatchObject({ now: 0, text: "50%" });
  });

  it("has no handle control for a single snap point", () => {
    render(drawer({ snapPoints: ["300px"] }));
    expect(screen.queryByRole("adjustable")).toBeNull();
  });

  it("ignores invalid snap points and still renders", () => {
    render(drawer({ snapPoints: [0, 2, "tall", Number.NaN] }));
    expect(screen.queryByRole("adjustable")).toBeNull();
    expect(screen.getByRole("header", { name: "Filters" })).toBeOnTheScreen();
  });

  it("steps to the next snap point on press, and cycles back at the end", () => {
    render(drawer({ handleLabel: "Drawer height", snapPoints: SNAPS }));
    fireEvent.press(handle());
    expect(value()).toMatchObject({ now: 1 });
    fireEvent.press(handle());
    expect(value()).toMatchObject({ now: 0 });
  });

  it("steps with increment and decrement actions, and stops at the ends", () => {
    render(drawer({ handleLabel: "Drawer height", snapPoints: SNAPS }));
    performAction("decrement");
    expect(value()).toMatchObject({ now: 0 });
    performAction("increment");
    performAction("increment");
    expect(value()).toMatchObject({ now: 1 });
    performAction("decrement");
    expect(value()).toMatchObject({ now: 0 });
    performAction("magic");
    expect(value()).toMatchObject({ now: 0 });
  });

  it("reports snap changes and stays put while the owner controls them", () => {
    const setActiveSnapPoint = jest.fn();
    const props = {
      activeSnapPoint: "200px",
      handleLabel: "Drawer height",
      setActiveSnapPoint,
      snapPoints: SNAPS,
    };
    const view = render(drawer(props));
    fireEvent.press(handle());
    expect(setActiveSnapPoint).toHaveBeenCalledWith("400px");
    expect(value()).toMatchObject({ now: 0 });
    view.rerender(drawer({ ...props, activeSnapPoint: "400px" }));
    expect(value()).toMatchObject({ now: 1, text: expect.any(String) });
  });

  it("falls back to the smallest snap point for null or an unknown activeSnapPoint", () => {
    const props = { handleLabel: "Drawer height", snapPoints: SNAPS };
    const view = render(drawer({ ...props, activeSnapPoint: null }));
    expect(value()).toMatchObject({ now: 0 });
    view.rerender(drawer({ ...props, activeSnapPoint: "999px" }));
    expect(value()).toMatchObject({ now: 0 });
  });

  it("sizes the drawer to the largest snap point, per direction", () => {
    const sizes: readonly [DrawerDirection, string, number][] = [
      ["bottom", "height", 400],
      ["top", "height", 400],
      ["left", "width", 400],
      ["right", "width", 400],
    ];
    for (const [direction, key, size] of sizes) {
      const view = render(drawer({ direction, snapPoints: SNAPS }));
      expect(styleOf(screen.UNSAFE_getByType(Animated.View))).toMatchObject({
        [key]: size,
      });
      view.unmount();
    }
  });
});

describe("Drawer direction", () => {
  const edges: readonly [DrawerDirection, string, Record<string, unknown>][] = [
    ["bottom", "borderTopWidth", { justifyContent: "flex-end" }],
    ["top", "borderBottomWidth", { justifyContent: "flex-start" }],
    ["left", "borderRightWidth", { alignItems: "flex-start" }],
    ["right", "borderLeftWidth", { alignItems: "flex-end" }],
  ];

  it.each(edges)(
    "%s draws its border on the open edge and docks there",
    (direction, border, content) => {
      render(drawer({ direction }));
      expect(styleOf(screen.UNSAFE_getByType(Animated.View))).toMatchObject({
        [border]: 1,
      });
      expect(styleOf(escapeHost())).toMatchObject(content);
    },
  );

  it("defaults to the bottom edge", () => {
    render(drawer());
    expect(styleOf(screen.UNSAFE_getByType(Animated.View)).borderTopWidth).toBe(
      1,
    );
  });

  it("takes 82% of the width for a side drawer without snap points", () => {
    render(drawer({ direction: "left" }));
    expect(styleOf(screen.UNSAFE_getByType(Animated.View)).width).toBe("82%");
  });
});

describe("Drawer dragging", () => {
  const closing: readonly [DrawerDirection, number, "x" | "y"][] = [
    ["bottom", 120, "y"],
    ["top", -120, "y"],
    ["right", 120, "x"],
    ["left", -120, "x"],
  ];

  it.each(closing)(
    "%s closes when dragged toward its edge past the threshold",
    (direction, distance, axis) => {
      const onAnimationEnd = jest.fn();
      const onClose = jest.fn();
      const onDrag = jest.fn();
      const onOpenChange = jest.fn();
      const onRelease = jest.fn();
      const onRequestClose = jest.fn();
      render(
        drawer({
          direction,
          onAnimationEnd,
          onClose,
          onDrag,
          onOpenChange,
          onRelease,
          onRequestClose,
          snapPoints: ["200px"],
        }),
      );
      expect(drag(pull(distance, 1000, axis))).toBe(true);
      expect(onDrag).toHaveBeenLastCalledWith(expect.anything(), 0.6);
      expect(onRelease).toHaveBeenCalledWith(expect.anything(), false);
      expect(onAnimationEnd).toHaveBeenCalledWith(false);
      expect(onRequestClose).toHaveBeenCalledWith("requestClose");
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(screen.queryByText(BODY)).toBeNull();
    },
  );

  it.each(closing)(
    "%s ignores a drag away from its edge",
    (direction, distance, axis) => {
      const onRelease = jest.fn();
      render(drawer({ direction, onRelease, snapPoints: ["200px"] }));
      drag(pull(-distance, 1000, axis));
      expect(onRelease).toHaveBeenCalledWith(expect.anything(), true);
      expect(screen.getByText(BODY)).toBeOnTheScreen();
    },
  );

  it("reports the fraction dragged, never beyond 0 to 1", () => {
    const onDrag = jest.fn();
    render(drawer({ onDrag, snapPoints: ["200px"] }));
    drag(pull(40));
    expect(onDrag).toHaveBeenLastCalledWith(expect.anything(), 0.2);
    onDrag.mockClear();
    drag(pull(900));
    expect(onDrag).toHaveBeenLastCalledWith(expect.anything(), 1);
  });

  it("settles back when the drag stays under the close threshold", () => {
    const onAnimationEnd = jest.fn();
    const onRelease = jest.fn();
    render(drawer({ onAnimationEnd, onRelease, snapPoints: ["200px"] }));
    drag(pull(30));
    expect(onRelease).toHaveBeenCalledWith(expect.anything(), true);
    expect(onAnimationEnd).toHaveBeenCalledWith(true);
    expect(rest()).toBe(0);
    expect(screen.getByText(BODY)).toBeOnTheScreen();
  });

  it("honours closeThreshold", () => {
    const view = render(drawer({ closeThreshold: 0.9, snapPoints: ["200px"] }));
    drag(pull(120));
    expect(screen.getByText(BODY)).toBeOnTheScreen();
    view.unmount();
    render(drawer({ closeThreshold: 0.1, snapPoints: ["200px"] }));
    drag(pull(30));
    expect(screen.queryByText(BODY)).toBeNull();
  });

  it("closes a drawer without snap points once it is dragged past the threshold", () => {
    render(drawer());
    act(() => {
      fireEvent(screen.UNSAFE_getByType(Animated.View), "layout", {
        nativeEvent: { layout: { height: 300, width: 750, x: 0, y: 0 } },
      });
    });
    drag(pull(120));
    expect(screen.queryByText(BODY)).toBeNull();
  });

  it("settles on the nearest snap point after a slow drag", () => {
    const setActiveSnapPoint = jest.fn();
    render(drawer({ setActiveSnapPoint, snapPoints: SNAPS }));
    drag(pull(-150));
    expect(setActiveSnapPoint).toHaveBeenCalledWith("400px");
    expect(rest()).toBe(0);
  });

  it("goes down a snap point on a slow drag past the midpoint", () => {
    const setActiveSnapPoint = jest.fn();
    render(
      drawer({
        activeSnapPoint: "400px",
        setActiveSnapPoint,
        snapPoints: SNAPS,
      }),
    );
    drag(pull(150));
    expect(setActiveSnapPoint).toHaveBeenCalledWith("200px");
  });

  it("flings to the lowest snap point, and flings closed from it", () => {
    const setActiveSnapPoint = jest.fn();
    const props = {
      activeSnapPoint: "400px",
      setActiveSnapPoint,
      snapPoints: SNAPS,
    };
    const view = render(drawer(props));
    drag(pull(100, 50));
    expect(setActiveSnapPoint).toHaveBeenCalledWith("200px");
    view.rerender(drawer({ ...props, activeSnapPoint: "200px" }));
    expect(rest()).toBe(200);
    drag(pull(100, 50));
    expect(screen.queryByText(BODY)).toBeNull();
  });

  it("flings up to the largest snap point", () => {
    const setActiveSnapPoint = jest.fn();
    render(
      drawer({ setActiveSnapPoint, snapPoints: ["100px", "200px", "400px"] }),
    );
    drag(pull(-100, 50));
    expect(setActiveSnapPoint).toHaveBeenCalledWith("400px");
  });

  it("moves one snap point per fling with snapToSequentialPoint", () => {
    const setActiveSnapPoint = jest.fn();
    const props = {
      activeSnapPoint: "400px",
      setActiveSnapPoint,
      snapPoints: ["100px", "200px", "400px"],
    };
    const view = render(drawer({ ...props, snapToSequentialPoint: true }));
    drag(pull(100, 50));
    expect(setActiveSnapPoint).toHaveBeenLastCalledWith("200px");
    view.unmount();
    render(drawer(props));
    drag(pull(100, 50));
    expect(setActiveSnapPoint).toHaveBeenLastCalledWith("100px");
  });

  it("returns to its snap point when the owner refuses the change", () => {
    const setActiveSnapPoint = jest.fn();
    render(
      drawer({
        activeSnapPoint: "200px",
        setActiveSnapPoint,
        snapPoints: SNAPS,
      }),
    );
    drag(pull(-150));
    expect(setActiveSnapPoint).toHaveBeenCalledWith("400px");
    expect(rest()).toBe(200);
  });

  it("does not drag away from a lone non-dismissible snap point", () => {
    render(drawer({ dismissible: false, snapPoints: ["200px"] }));
    expect(drag(pull(120))).toBe(false);
  });

  it("does not claim a small or sideways movement", () => {
    render(drawer({ snapPoints: SNAPS }));
    const origin: Step = { t: 1, x: 0, y: 0 };
    expect(drag([origin, { t: 2, x: 0, y: 5 }])).toBe(false);
    expect(drag([origin, { t: 2, x: 30, y: 12 }])).toBe(false);
    expect(drag(pull(120, 100))).toBe(true);
  });

  it("settles on the active snap point when the system takes the touch away", () => {
    const onRelease = jest.fn();
    render(drawer({ onRelease, snapPoints: SNAPS }));
    const origin: Step = { t: 1, x: 0, y: 0 };
    act(() => {
      call(responder(), "onResponderTerminate", touch(origin, origin, origin));
    });
    expect(onRelease).toHaveBeenCalledWith(expect.anything(), true);
    expect(screen.getByText(BODY)).toBeOnTheScreen();
  });
});

describe("Drawer dismissible", () => {
  it("blocks back, escape and drag, and keeps the close button", () => {
    const onClose = jest.fn();
    const onOpenChange = jest.fn();
    const onRequestClose = jest.fn();
    render(
      drawer({
        dismissible: false,
        onClose,
        onOpenChange,
        onRequestClose,
        snapPoints: SNAPS,
      }),
    );
    fireEvent(screen.UNSAFE_getByType(Modal), "requestClose", {
      nativeEvent: {},
    });
    fireEvent(escapeHost(), "accessibilityEscape");
    drag(pull(900));
    expect(onRequestClose).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByText(BODY)).toBeOnTheScreen();
    fireEvent.press(screen.getByRole("button", { name: "Close drawer" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("still moves between snap points", () => {
    const setActiveSnapPoint = jest.fn();
    render(
      drawer({
        activeSnapPoint: "400px",
        dismissible: false,
        setActiveSnapPoint,
        snapPoints: SNAPS,
      }),
    );
    drag(pull(900, 1000));
    expect(setActiveSnapPoint).toHaveBeenCalledWith("200px");
    expect(screen.getByText(BODY)).toBeOnTheScreen();
  });

  it("closes on back and escape when dismissible, the default", () => {
    const onClose = jest.fn();
    const onRequestClose = jest.fn();
    render(drawer({ onClose, onRequestClose }));
    fireEvent(screen.UNSAFE_getByType(Modal), "requestClose", {
      nativeEvent: {},
    });
    expect(onRequestClose).toHaveBeenCalledWith("requestClose");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose for a close the owner made", () => {
    const onClose = jest.fn();
    const view = render(drawer({ onClose, open: true }));
    view.rerender(drawer({ onClose, open: false }));
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("Drawer handleOnly", () => {
  it("puts the pan handlers on the handle, not on the whole drawer", () => {
    render(drawer({ handleOnly: true, snapPoints: ["200px"] }));
    expect(
      screen.UNSAFE_getByType(Animated.View).props.onMoveShouldSetResponder,
    ).toBeUndefined();
    expect(responderNodes().length).toBeGreaterThan(0);
  });

  it("drags from the handle", () => {
    render(drawer({ handleOnly: true, snapPoints: ["200px"] }));
    expect(drag(pull(120))).toBe(true);
    expect(screen.queryByText(BODY)).toBeNull();
  });

  it("puts the pan handlers on the whole drawer by default", () => {
    render(drawer({ snapPoints: ["200px"] }));
    expect(
      typeof screen.UNSAFE_getByType(Animated.View).props
        .onMoveShouldSetResponder,
    ).toBe("function");
  });
});

describe("Drawer onAnimationEnd", () => {
  it("is quiet on the first open and when nothing changes", () => {
    const onAnimationEnd = jest.fn();
    const view = render(drawer({ onAnimationEnd, snapPoints: SNAPS }));
    view.rerender(drawer({ onAnimationEnd, snapPoints: SNAPS }));
    expect(onAnimationEnd).not.toHaveBeenCalled();
  });

  it("fires when the owner moves the snap point", () => {
    const onAnimationEnd = jest.fn();
    const props = { onAnimationEnd, snapPoints: SNAPS };
    const view = render(drawer({ ...props, activeSnapPoint: "200px" }));
    view.rerender(drawer({ ...props, activeSnapPoint: "400px" }));
    expect(onAnimationEnd).toHaveBeenCalledWith(true);
    expect(rest()).toBe(0);
  });
});

describe("Drawer motion and focus", () => {
  it("snaps without animation while reduced motion is on", () => {
    render(drawer({ snapPoints: SNAPS }));
    drag(pull(30));
    expect(animations.length).toBeGreaterThan(0);
    expect(animations.every((animation) => animation.duration === 0)).toBe(
      true,
    );
  });

  it("animates over 220 ms once reduced motion is known to be off", async () => {
    jest
      .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
      .mockResolvedValueOnce(false);
    render(drawer({ snapPoints: SNAPS }));
    await flushMicrotasks();
    drag(pull(30));
    expect(animations.at(-1)?.duration).toBe(220);
  });

  it("moves screen-reader focus to the title when it opens", () => {
    render(drawer(), { createNodeMock: () => ({ measure: jest.fn() }) });
    expect(focusSpy).toHaveBeenCalledWith(expect.anything(), "focus");
  });

  it("leaves focus alone with autoFocus={false}", () => {
    render(drawer({ autoFocus: false }), {
      createNodeMock: () => ({ measure: jest.fn() }),
    });
    expect(focusSpy).not.toHaveBeenCalled();
  });
});

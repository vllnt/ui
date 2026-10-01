import { useState } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react-native";
import {
  AccessibilityInfo,
  Dimensions,
  Text as NativeText,
} from "react-native";

import { Alert, AlertTitle } from "../components/alert/alert";
import { Avatar, AvatarImage } from "../components/avatar/avatar";
import { AvatarGroup } from "../components/avatar-group/avatar-group";
import { Banner } from "../components/banner/banner";
import { Button } from "../components/button/button";
import { Checkbox } from "../components/checkbox/checkbox";
import { CountdownTimer } from "../components/countdown-timer/countdown-timer";
import { DataList } from "../components/data-list/data-list";
import { Fieldset } from "../components/fieldset/fieldset";
import { Item, ItemContent, ItemMedia } from "../components/item/item";
import { Link } from "../components/link/link";
import { ProgressCard } from "../components/progress-card/progress-card";
import {
  RadioGroup,
  RadioGroupItem,
} from "../components/radio-group/radio-group";
import { Select } from "../components/select/select";
import { StickyMetric } from "../components/sticky-metric/sticky-metric";
import { Switch } from "../components/switch/switch";
import { TagsInput } from "../components/tags-input/tags-input";
import { Toast, type ToastItem } from "../components/toast/toast";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../components/toggle-group/toggle-group";

import { flushMicrotasks, renderThemed } from "./test-utils";

type HostNode = {
  readonly props: Record<string, unknown>;
  readonly type: unknown;
};

const linking = { openUrl: async () => ({ status: "opened" as const }) };

function hostNodes(predicate: (node: HostNode) => boolean) {
  const nodes: readonly HostNode[] = screen.UNSAFE_root.findAll(
    (node: HostNode) => typeof node.type === "string" && predicate(node),
  );
  return nodes;
}

function mergeStyle(value: unknown): Record<string, unknown> {
  if (Array.isArray(value))
    return value.reduce<Record<string, unknown>>(
      (merged, item: unknown) => ({ ...merged, ...mergeStyle(item) }),
      {},
    );
  return typeof value === "object" && value !== null ? { ...value } : {};
}

function styleOf(node: HostNode) {
  return mergeStyle(node.props.style);
}

/** Runs `run` with the given system font scale, then restores the jest default (2). */
function withFontScale(fontScale: number, run: () => void) {
  const window = Dimensions.get("window");
  const screenSize = Dimensions.get("screen");
  act(() => {
    Dimensions.set({
      screen: { ...screenSize, fontScale },
      window: { ...window, fontScale },
    });
  });
  try {
    run();
  } finally {
    act(() => {
      Dimensions.set({ screen: screenSize, window });
    });
  }
}

let announceSpy: jest.SpyInstance;
beforeEach(() => {
  announceSpy = jest.spyOn(AccessibilityInfo, "announceForAccessibility");
  announceSpy.mockClear();
});

it("groups data rows only when both parts are plain text", () => {
  renderThemed(
    <DataList
      items={[
        { id: "region", label: "Region", value: "North America" },
        {
          id: "docs",
          label: "Docs",
          value: (
            <Link href="https://example.com" linking={linking}>
              Runbook
            </Link>
          ),
        },
      ]}
    />,
  );
  expect(screen.getByLabelText("Region, North America")).toHaveProp(
    "accessible",
    true,
  );
  expect(screen.getByRole("link", { name: "Runbook" })).toBeOnTheScreen();
  expect(screen.queryByLabelText(/^Docs/)).toBeNull();
});

it("keeps the main-branch avatar overlap and sizes at font scale 1", () => {
  withFontScale(1, () => {
    for (const [size, diameter, overlap] of [
      ["sm", 32, 10],
      ["md", 40, 12],
      ["lg", 48, 16],
    ] as const) {
      const view = renderThemed(
        <AvatarGroup
          items={[
            { accessibilityLabel: "Ada", fallback: "A", id: "a" },
            { accessibilityLabel: "Bo", fallback: "B", id: "b" },
          ]}
          size={size}
        />,
      );
      const [, second] = hostNodes(
        (node) => "marginLeft" in styleOf(node) && "zIndex" in styleOf(node),
      );
      expect(second?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            height: diameter,
            marginLeft: -overlap,
            width: diameter,
          }),
        ]),
      );
      view.unmount();
    }
    const icon = renderThemed(
      <Button accessibilityLabel="Close" size="icon">
        ×
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Close" })).toHaveStyle({
      height: 44,
      width: 44,
    });
    icon.unmount();
  });
});

it("honours caller labels and silenced live regions on alerts and banners", async () => {
  renderThemed(
    <>
      <Alert accessibilityLabel="Custom alert" testID="alert">
        <AlertTitle>Connection lost</AlertTitle>
      </Alert>
      <Alert accessibilityLiveRegion="none">
        <AlertTitle>Quiet alert</AlertTitle>
      </Alert>
      <Banner accessibilityLabel="Maintenance notice" testID="banner">
        Maintenance
      </Banner>
      <Banner accessibilityLiveRegion="none" variant="destructive">
        Quiet outage
      </Banner>
    </>,
  );
  await flushMicrotasks();
  expect(screen.getByTestId("alert")).toHaveProp(
    "accessibilityLabel",
    "Custom alert",
  );
  expect(screen.getByTestId("banner")).toHaveProp(
    "accessibilityLabel",
    "Maintenance notice",
  );
  expect(announceSpy).toHaveBeenCalledTimes(1);
  expect(announceSpy).toHaveBeenCalledWith("Custom alert");
});

it("keeps single toggle groups as releasable toggle buttons", () => {
  const onValueChange = jest.fn();
  renderThemed(
    <ToggleGroup
      accessibilityLabel="Density"
      defaultValue="compact"
      onValueChange={onValueChange}
      type="single"
    >
      <ToggleGroupItem value="compact">Compact</ToggleGroupItem>
    </ToggleGroup>,
  );
  const compact = screen.getByRole("togglebutton", { name: "Compact" });
  expect(compact).toHaveProp("accessibilityState", {
    checked: true,
    disabled: false,
  });
  fireEvent.press(compact);
  expect(onValueChange).toHaveBeenCalledWith(undefined);
  expect(screen.queryByRole("radio")).toBeNull();
});

it("names avatar images from alt or aria-label", () => {
  renderThemed(
    <>
      <Avatar>
        <AvatarImage alt="Ada" source={{ uri: "ada" }} />
      </Avatar>
      <Avatar>
        <AvatarImage aria-label="Bo" source={{ uri: "bo" }} />
      </Avatar>
    </>,
  );
  expect(screen.getByRole("image", { name: "Ada" })).toHaveProp(
    "accessible",
    true,
  );
  expect(screen.getByRole("image", { name: "Ada" })).toHaveProp(
    "accessibilityLabel",
    "Ada",
  );
  expect(screen.getAllByRole("image")).toHaveLength(2);
});

it("fills the countdown with time used and speaks the time remaining", () => {
  renderThemed(
    <CountdownTimer
      deadline="2026-01-01T14:00:00.000Z"
      now="2026-01-01T13:00:00.000Z"
      startedAt="2026-01-01T12:00:00.000Z"
      title="Release"
    />,
  );
  const [progress] = screen.getAllByRole("progressbar");
  expect(progress?.props.accessibilityValue).toEqual({
    text: expect.stringContaining("01 Hours"),
  });
  expect(
    hostNodes((node) => {
      const style = styleOf(node);
      return "width" in style && style.width === "50%";
    }),
  ).not.toHaveLength(0);
});

it("wraps checkbox labels, exposes item media by default, and keeps metric labels", () => {
  renderThemed(
    <>
      <Checkbox label="Send me a weekly summary of account activity" />
      <Item>
        <ItemMedia testID="media">
          <NativeText>Logo</NativeText>
        </ItemMedia>
        <ItemMedia decorative testID="decoration">
          <NativeText>•</NativeText>
        </ItemMedia>
        <ItemContent />
      </Item>
      <StickyMetric
        accessibilityLabel="Error rate"
        label="Errors"
        value={<NativeText>2%</NativeText>}
      />
    </>,
  );
  expect(
    screen.getByText("Send me a weekly summary of account activity"),
  ).toHaveStyle({ flexShrink: 1 });
  expect(screen.getByTestId("media")).not.toHaveProp(
    "accessibilityElementsHidden",
  );
  expect(
    screen.getByTestId("decoration", { includeHiddenElements: true }),
  ).toHaveProp("importantForAccessibility", "no-hide-descendants");
  expect(screen.getByLabelText("Error rate")).toHaveProp("accessible", true);
});

it("lets caller accessibility props win over component defaults", () => {
  renderThemed(
    <>
      <TagsInput
        accessibilityState={{ busy: true }}
        labels={{ add: "Add", input: "Tags", remove: (tag) => tag }}
        tags={{ defaultValue: [], mode: "uncontrolled" }}
      />
      <ProgressCard
        accessibilityHint="Opens the course"
        description="Learn hooks"
        max={4}
        onPress={jest.fn()}
        title="Hooks"
        value={1}
      />
    </>,
  );
  expect(screen.getByLabelText("Tags")).toHaveProp("accessibilityState", {
    busy: true,
    disabled: false,
  });
  expect(screen.getByRole("button", { name: "Hooks" })).toHaveProp(
    "accessibilityHint",
    "Opens the course",
  );
});

it("disables every package control inside a disabled fieldset", () => {
  renderThemed(
    <Fieldset disabled>
      <Checkbox label="Terms" />
      <Switch accessibilityLabel="Alerts" checked={false} />
      <Select
        labels={{
          close: "Close",
          open: "Plan",
          options: "Plans",
          placeholder: "Pick",
        }}
        options={[{ id: "a", label: "Basic" }]}
        selection={{ defaultValue: undefined, mode: "uncontrolled" }}
      />
      <RadioGroup accessibilityLabel="Size">
        <RadioGroupItem value="s">Small</RadioGroupItem>
      </RadioGroup>
    </Fieldset>,
  );
  expect(screen.getByRole("checkbox", { name: "Terms" })).toBeDisabled();
  expect(screen.getByRole("switch", { name: "Alerts" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Plan" })).toBeDisabled();
  expect(screen.getByRole("radio", { name: "Small" })).toBeDisabled();
});

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

function isBooleanListener(value: unknown): value is (on: boolean) => void {
  return typeof value === "function";
}

it("extends toast expiry while a screen reader runs and restores it after", async () => {
  jest.useFakeTimers();
  jest
    .spyOn(AccessibilityInfo, "isScreenReaderEnabled")
    .mockResolvedValue(true);
  const subscribe = jest.spyOn(AccessibilityInfo, "addEventListener");
  subscribe.mockClear();
  const onEmpty = jest.fn();
  render(<ToastHarness onEmpty={onEmpty} />);
  await flushMicrotasks();
  act(() => {
    jest.advanceTimersByTime(5000);
  });
  expect(onEmpty).not.toHaveBeenCalled();
  act(() => {
    jest.advanceTimersByTime(5000);
  });
  expect(onEmpty).toHaveBeenCalledTimes(1);

  const second = jest.fn();
  subscribe.mockClear();
  render(<ToastHarness onEmpty={second} />);
  await flushMicrotasks();
  const calls: readonly (readonly unknown[])[] = subscribe.mock.calls;
  const listener = calls.find(
    ([eventName]) => eventName === "screenReaderChanged",
  )?.[1];
  if (!isBooleanListener(listener)) throw new Error("Expected a listener.");
  act(() => {
    listener(false);
  });
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(second).toHaveBeenCalledTimes(1);
  jest.useRealTimers();
  jest
    .spyOn(AccessibilityInfo, "isScreenReaderEnabled")
    .mockImplementation(() => new Promise(() => {}));
});

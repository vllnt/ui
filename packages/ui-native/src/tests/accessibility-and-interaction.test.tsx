import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";
import { Image, Pressable, Text } from "react-native";

import { ActivityLog } from "../components/activity-log/activity-log";
import { AnimatedTestimonials } from "../components/animated-testimonials/animated-testimonials";
import { AnimatedText } from "../components/animated-text/animated-text";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../components/avatar/avatar";
import { AvatarGroup } from "../components/avatar-group/avatar-group";
import { Calendar } from "../components/calendar/calendar";
import { Callout } from "../components/callout/callout";
import { Carousel } from "../components/carousel/carousel";
import { CodeBlock } from "../components/code-block/code-block";
import { ContentIntro } from "../components/content-intro/content-intro";
import { CountdownTimer } from "../components/countdown-timer/countdown-timer";
import { EmptyState } from "../components/empty-state/empty-state";
import { Field, FieldControl, FieldLabel } from "../components/field/field";
import { Fieldset } from "../components/fieldset/fieldset";
import { FileUpload } from "../components/file-upload/file-upload";
import { HorizontalScrollRow } from "../components/horizontal-scroll-row/horizontal-scroll-row";
import { ListBox } from "../components/list-box/list-box";
import { LiveFeed } from "../components/live-feed/live-feed";
import { Marquee } from "../components/marquee/marquee";
import { Meter } from "../components/meter/meter";
import { ModelSelector } from "../components/model-selector/model-selector";
import { NavigationMenu } from "../components/navigation-menu/navigation-menu";
import { NumberInput } from "../components/number-input/number-input";
import { OverviewCard } from "../components/overview-board/overview-board";
import { Pagination } from "../components/pagination/pagination";
import { PasswordInput } from "../components/password-input/password-input";
import { PhoneInput } from "../components/phone-input/phone-input";
import { RangeCalendar } from "../components/range-calendar/range-calendar";
import { Rating } from "../components/rating/rating";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../components/resizable/resizable";
import { ModalLayer } from "../primitives/modal-layer";
import type { PickedFile } from "../primitives/platform-services";

import {
  advanceTimers,
  flushMicrotasks,
  reducedMotion,
  renderThemed,
  themed,
} from "./test-utils";

const calendarLabels = {
  formatDayAccessibilityLabel: (date: Date) =>
    `Choose ${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
  formatMonth: (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}`,
  formatWeekday: String,
  nextMonth: "Next month",
  previousMonth: "Previous month",
};
const pagingLabels = {
  next: "Next item",
  pause: "Pause rotation",
  position: (index: number, total: number) => `${index} of ${total}`,
  previous: "Previous item",
  region: "Items",
  resume: "Resume rotation",
};
const reducedMotionService = reducedMotion(true);

it("keeps grouped child controls exposed and associates field labels", async () => {
  const action = (name: string) => (
    <Pressable accessibilityLabel={name} accessibilityRole="button" />
  );
  renderThemed(
    <>
      <Fieldset testID="fieldset">{action("Field action")}</Fieldset>
      <EmptyState testID="empty" title="Nothing here">
        {action("Empty action")}
      </EmptyState>
      <HorizontalScrollRow testID="row" title="Projects">
        {action("Project action")}
      </HorizontalScrollRow>
      <Field>
        <FieldLabel>Username</FieldLabel>
        <FieldControl testID="field-control" />
      </Field>
    </>,
  );
  for (const id of ["fieldset", "empty", "row"])
    expect(screen.getByTestId(id)).not.toHaveProp("accessible", true);
  for (const name of ["Field action", "Empty action", "Project action"])
    expect(screen.getByRole("button", { name })).toBeOnTheScreen();
  await waitFor(() => {
    expect(screen.getByTestId("field-control")).toHaveProp(
      "accessibilityLabelledBy",
      screen.getByText("Username").props.nativeID,
    );
  });
});

it("fills modal layers and reports radio selection with checked state", () => {
  renderThemed(
    <>
      <ModalLayer onClose={jest.fn()} visible>
        <Text>Modal content</Text>
      </ModalLayer>
      <ModelSelector
        defaultOpen
        defaultSelectedModelId="native"
        labels={{
          close: "Close",
          description: "Choose a model",
          noModels: "No models",
          search: "Search",
          selected: "Selected",
          title: "Models",
          unavailable: "Unavailable",
        }}
        models={[{ id: "native", name: "Native model" }]}
      />
    </>,
  );
  expect(
    screen.UNSAFE_getAllByProps({ accessibilityViewIsModal: true })[0]?.props
      .style,
  ).toEqual(expect.arrayContaining([{ flex: 1 }]));
  expect(screen.getByRole("radio", { name: "Native model" })).toHaveProp(
    "accessibilityState",
    { checked: true, disabled: false },
  );
});

it("marks the complete selected calendar range", () => {
  renderThemed(
    <RangeCalendar
      labels={calendarLabels}
      month={new Date(2025, 0, 1)}
      range={{
        mode: "controlled",
        value: { end: new Date(2025, 0, 10), start: new Date(2025, 0, 12) },
      }}
    />,
  );
  for (const day of [10, 11, 12]) {
    expect(
      screen.getByRole("button", { name: `Choose 2025-1-${day}` }),
    ).toHaveProp("accessibilityState", { disabled: false, selected: true });
  }
});

it("blocks overlapping pickers and merges subsequent selections without loss", async () => {
  const resolvers: ((files: readonly PickedFile[]) => void)[] = [];
  const onChange = jest.fn();
  renderThemed(
    <FileUpload
      filePicker={{
        pickFiles: jest.fn(
          () =>
            new Promise((resolve) => {
              resolvers.push(resolve);
            }),
        ),
      }}
      files={{ defaultValue: [], mode: "uncontrolled", onChange }}
      labels={{
        choose: "Choose files",
        empty: "No files",
        failed: "Failed",
        remove: (name) => `Remove ${name}`,
        unavailable: "Unavailable",
      }}
    />,
  );
  const choose = screen.getByRole("button", { name: "Choose files" });
  fireEvent.press(choose);
  fireEvent.press(choose);
  expect(resolvers).toHaveLength(1);
  expect(choose).toBeDisabled();
  await act(async () => {
    resolvers[0]?.([{ name: "first.txt", uri: "file:///first.txt" }]);
  });
  expect(onChange).toHaveBeenCalledTimes(1);
  fireEvent.press(choose);
  expect(resolvers).toHaveLength(2);
  await act(async () => {
    resolvers[1]?.([{ name: "second.txt", uri: "file:///second.txt" }]);
  });
  expect(onChange).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenLastCalledWith([
    { name: "first.txt", uri: "file:///first.txt" },
    { name: "second.txt", uri: "file:///second.txt" },
  ]);
});

const avatar = (uri: string, onError?: () => void) => (
  <Avatar>
    <AvatarImage
      accessibilityLabel="Avatar"
      onError={onError}
      source={{ uri }}
    />
    <AvatarFallback>
      <Text>Fallback</Text>
    </AvatarFallback>
  </Avatar>
);

it("removes a failed avatar image and restores it for a new source", () => {
  const onError = jest.fn();
  renderThemed(avatar("broken", onError));
  fireEvent(screen.getByLabelText("Avatar"), "error", {
    nativeEvent: { error: "failed" },
  });
  expect(onError).toHaveBeenCalledTimes(1);
  expect(screen.queryByLabelText("Avatar")).toBeNull();
  expect(screen.getByText("Fallback")).toBeOnTheScreen();
  screen.rerender(themed(avatar("broken")));
  expect(screen.queryByLabelText("Avatar")).toBeNull();
  screen.rerender(themed(avatar("working")));
  expect(screen.getByLabelText("Avatar")).toBeOnTheScreen();
  fireEvent(screen.getByLabelText("Avatar"), "load", { nativeEvent: {} });
  expect(screen.queryByText("Fallback")).toBeNull();
  screen.rerender(themed(avatar("broken")));
  expect(screen.getByLabelText("Avatar")).toBeOnTheScreen();
});

it("resets avatar fallback and copied state when their sources fail", async () => {
  let copyFails = false;
  const codeBlock = () => (
    <CodeBlock
      clipboard={{
        getText: async () => "",
        setText: async () => {
          if (copyFails) throw new Error("copy failed");
        },
      }}
      code="const native = true"
      copyLabels={{
        copied: "Copied",
        copy: "Copy",
        unavailable: "Unavailable",
      }}
    />
  );
  const view = renderThemed(
    <>
      {avatar("first")}
      {codeBlock()}
    </>,
  );
  fireEvent(screen.getByLabelText("Avatar"), "load", { nativeEvent: {} });
  expect(screen.queryByText("Fallback")).toBeNull();
  view.rerender(themed(avatar("second")));
  expect(screen.getByText("Fallback")).toBeOnTheScreen();
  view.rerender(themed(codeBlock()));
  fireEvent.press(screen.getByRole("button", { name: "Copy" }));
  await screen.findByRole("button", { name: "Copied" });
  copyFails = true;
  fireEvent.press(screen.getByRole("button", { name: "Copied" }));
  await screen.findByRole("button", { name: "Copy" });
});

it("chains carousel layout and normalizes numeric limits", () => {
  const onLayout = jest.fn();
  const onNumberChange = jest.fn();
  renderThemed(
    <>
      <Carousel
        items={[{ content: <Text>Slide</Text>, id: "one", label: "One" }]}
        labels={pagingLabels}
        onLayout={onLayout}
        testID="carousel"
      />
      <NumberInput
        accessibilityLabel="Quantity"
        max={10}
        min={0}
        onValueChange={onNumberChange}
        step={0}
        value={20}
      />
      <NumberInput accessibilityLabel="Invalid quantity" value={Number.NaN} />
      <Meter label="Usage" segments={10_000} value={1} />
      <Rating
        label="Score"
        labels={{ option: String, value: String }}
        max={10_000}
      />
      <Marquee repeat={10_000}>
        <Text>Bounded</Text>
      </Marquee>
      <Pagination
        currentPage={1}
        maxVisiblePages={10_000}
        testID="pagination"
        totalPages={10_000}
      />
    </>,
  );
  fireEvent(screen.getByTestId("carousel"), "layout", {
    nativeEvent: { layout: { height: 100, width: 320, x: 0, y: 0 } },
  });
  expect(onLayout).toHaveBeenCalledTimes(1);
  expect(
    screen.getAllByLabelText("Quantity").find((node) => node.props.value),
  ).toHaveDisplayValue("10");
  const [decrement] = screen.getAllByRole("button", { name: "Decrement" });
  if (!decrement) throw new Error("Expected a decrement action.");
  fireEvent.press(decrement);
  expect(onNumberChange).toHaveBeenCalledWith(9);
  expect(
    screen
      .getAllByLabelText("Invalid quantity")
      .find((node) => node.props.value !== undefined),
  ).toHaveDisplayValue("");
  expect(screen.getByLabelText("Usage").props.children).toHaveLength(100);
  expect(screen.getAllByRole("radio")).toHaveLength(100);
  expect(screen.getAllByText("Bounded")).toHaveLength(100);
  expect(screen.getByText("100")).toBeOnTheScreen();
  expect(screen.queryByText("101")).toBeNull();
});

it("keeps passive status content quiet and exposes localized actions", () => {
  renderThemed(
    <>
      <Callout>Persistent context</Callout>
      <PasswordInput
        accessibilityLabel="Password"
        hideLabel="Masquer"
        showLabel="Afficher"
        value="secret"
      />
      <PhoneInput
        accessibilityLabel="Phone"
        country={{ code: "FR", dialCode: "+33", label: "France" }}
        value="123"
      />
      <Calendar
        disabled
        labels={calendarLabels}
        month={new Date(2025, 0, 1)}
        selection={{ mode: "controlled", value: new Date(2024, 0, 1) }}
      />
    </>,
  );
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.getByText("Persistent context")).toBeOnTheScreen();
  expect(screen.getByText("Afficher")).toBeOnTheScreen();
  fireEvent.press(screen.getByRole("button", { name: "Afficher" }));
  expect(screen.getByText("Masquer")).toBeOnTheScreen();
  expect(screen.getByRole("text", { name: "France, +33" })).toBeOnTheScreen();
  expect(
    screen.queryByRole("button", { name: "Choose country dialing code" }),
  ).toBeNull();
  expect(screen.getByRole("button", { name: "Previous month" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
});

it("groups single list selection and limits navigation triggers to one action", () => {
  const linking = {
    openUrl: jest.fn(() => Promise.resolve({ status: "opened" as const })),
  };
  const onNavigate = jest.fn();
  renderThemed(
    <>
      <ListBox
        accessibilityRole="none"
        label="Assignees"
        options={[{ id: "ada", label: "Ada" }]}
        selection={{ defaultValue: new Set(), mode: "uncontrolled" }}
      />
      <NavigationMenu
        items={[
          {
            href: "app://products",
            id: "products",
            label: "Products",
            panel: <Text>Product links</Text>,
          },
        ]}
        linking={linking}
        onNavigate={onNavigate}
      />
    </>,
  );
  expect(screen.getByLabelText("Assignees")).toHaveProp(
    "accessibilityRole",
    "radiogroup",
  );
  fireEvent.press(screen.getByRole("button", { name: "Products" }));
  expect(screen.getByText("Product links")).toBeOnTheScreen();
  expect(onNavigate).not.toHaveBeenCalled();
  expect(linking.openUrl).not.toHaveBeenCalled();
});

it("bounds derived progress and activity pagination", () => {
  renderThemed(
    <>
      <ContentIntro
        completedSections={new Set(["known", "unknown"])}
        estimatedTime="1 min"
        onGoToSection={jest.fn()}
        onStart={jest.fn()}
        renderIntroContent={() => null}
        sections={[{ id: "known", title: "Known" }]}
        title="Intro"
      />
      <ActivityLog
        defaultPage={Number.NaN}
        items={[
          { action: "updated", actor: "Ada", id: "one", timestamp: "now" },
          { action: "reviewed", actor: "Lin", id: "two", timestamp: "now" },
        ]}
        pageSize={Number.NaN}
      />
      <OverviewCard
        ctaLabel="Missing action"
        description="Description"
        heading="Metric"
        metric="1"
      />
    </>,
  );
  expect(screen.getByText("1/1 completed")).toBeOnTheScreen();
  expect(screen.getByText("Page 1 of 1")).toBeOnTheScreen();
  expect(screen.queryByRole("button", { name: "Missing action" })).toBeNull();
});

it("falls back after group avatar image failures and disables stray handles", () => {
  renderThemed(
    <>
      <AvatarGroup
        items={[
          {
            accessibilityLabel: "Ada",
            fallback: "AD",
            id: "ada",
            source: { uri: "broken" },
          },
        ]}
      />
      <ResizablePanelGroup>
        <ResizablePanel defaultSize={50} />
        <ResizableHandle />
        <ResizablePanel defaultSize={50} />
        <ResizableHandle accessibilityLabel="Trailing handle" />
      </ResizablePanelGroup>
    </>,
  );
  expect(screen.queryByText("AD")).toBeNull();
  fireEvent(screen.getByLabelText("Ada").findByType(Image), "error");
  expect(screen.getByText("AD")).toBeOnTheScreen();
  expect(
    screen.getByRole("adjustable", { name: "Trailing handle" }),
  ).toBeDisabled();
});

it("announces feed additions without making clock changes reannounce the group", () => {
  renderThemed(
    <LiveFeed
      events={[
        {
          id: "event",
          severity: "info",
          timestamp: "2025-01-01T00:00:00Z",
          title: "Deploy complete",
        },
      ]}
      now="2025-01-01T00:01:00Z"
      testID="feed"
    />,
  );
  expect(screen.getByText("Deploy complete")).toHaveProp(
    "accessibilityLiveRegion",
    "polite",
  );
  expect(screen.getByTestId("feed")).not.toHaveProp("accessibilityLiveRegion");
  expect(
    screen.UNSAFE_getByProps({
      accessibilityLabel: "Live feed",
      accessibilityRole: "list",
    }).props.accessibilityLiveRegion,
  ).toBeUndefined();
});

async function renderAutoplay(autoplayInterval: number) {
  jest.useFakeTimers();
  renderThemed(
    <AnimatedTestimonials
      autoplay
      autoplayInterval={autoplayInterval}
      labels={pagingLabels}
      reducedMotionService={reducedMotion(false)}
      testimonials={[
        { id: "one", name: "Ada", quote: "First", title: "Engineer" },
        { id: "two", name: "Lin", quote: "Second", title: "Designer" },
      ]}
    />,
  );
  await flushMicrotasks();
}

it("pauses testimonial autoplay after manual navigation", async () => {
  await renderAutoplay(1000);
  advanceTimers(1000);
  expect(screen.getByText("Second")).toBeOnTheScreen();
  fireEvent.press(screen.getByRole("button", { name: "Next item" }));
  expect(screen.getByText("First")).toBeOnTheScreen();
  advanceTimers(5000);
  expect(screen.getByText("First")).toBeOnTheScreen();
  fireEvent.press(screen.getByRole("button", { name: "Resume rotation" }));
  advanceTimers(1000);
  expect(screen.getByText("Second")).toBeOnTheScreen();
  jest.useRealTimers();
});

it("normalizes non-finite testimonial autoplay intervals", async () => {
  await renderAutoplay(Number.POSITIVE_INFINITY);
  advanceTimers(4999);
  expect(screen.getByText("First")).toBeOnTheScreen();
  advanceTimers(1);
  expect(screen.getByText("Second")).toBeOnTheScreen();
  jest.useRealTimers();
});

it("completes reduced motion once and exposes countdown duration errors", async () => {
  const onComplete = jest.fn();
  const view = renderThemed(
    <>
      <AnimatedText
        onAnimationComplete={onComplete}
        reducedMotionService={reducedMotionService}
        text="Ready"
      />
      <CountdownTimer
        deadline="not-a-date"
        now="2025-01-01T00:00:00Z"
        title="Invalid deadline"
      />
      <CountdownTimer
        deadline="2025-01-02T00:00:00Z"
        now="not-a-date"
        title="Invalid current time"
      />
    </>,
  );
  await waitFor(() => {
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
  const zero = "Invalid date, 00 Days, 00 Hours, 00 Minutes, 00 Seconds";
  for (const title of ["Invalid deadline", "Invalid current time"])
    expect(
      screen.getByRole("alert", { name: `${title}: ${zero}` }),
    ).toBeOnTheScreen();
  expect(screen.getAllByText("00", { exact: true })).toHaveLength(8);
  view.rerender(
    themed(
      <AnimatedText
        onAnimationComplete={jest.fn()}
        reducedMotionService={reducedMotionService}
        text="Ready"
      />,
    ),
  );
  expect(onComplete).toHaveBeenCalledTimes(1);
});

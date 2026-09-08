import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Text as NativeText } from "react-native";

import { Checkbox } from "../components/checkbox/checkbox";
import { CopyButton } from "../components/copy-button/copy-button";
import { Link } from "../components/link/link";
import {
  RadioGroup,
  RadioGroupItem,
} from "../components/radio-group/radio-group";
import { Slider } from "../components/slider/slider";
import { Toggle } from "../components/toggle/toggle";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../components/toggle-group/toggle-group";
import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
} from "../components/toolbar/toolbar";
import type {
  ClipboardService,
  LinkingService,
} from "../primitives/platform-services";

describe("native core controls", () => {
  it("copies through an injected service and exposes unavailable clipboard state", async () => {
    const clipboard: ClipboardService = {
      getText: jest.fn(async () => ""),
      setText: jest.fn(async () => {}),
    };
    const onStatusChange = jest.fn();
    render(
      <>
        <CopyButton
          clipboard={clipboard}
          onStatusChange={onStatusChange}
          value="native value"
        />
        <CopyButton value="unavailable" />
      </>,
    );

    fireEvent.press(screen.getByRole("button", { name: "Copy" }));
    await waitFor(() => {
      expect(clipboard.setText).toHaveBeenCalledWith("native value");
      expect(screen.getByRole("button", { name: "Copied" })).toBeOnTheScreen();
      expect(onStatusChange).toHaveBeenCalledWith("copied");
    });

    const unavailable = screen.getByRole("button", {
      name: "Clipboard unavailable",
    });
    expect(unavailable).toBeDisabled();
  });

  it("supports toggle and checkbox state while blocking disabled changes", () => {
    const onPressedChange = jest.fn();
    const onCheckedChange = jest.fn();
    const onDisabledChange = jest.fn();
    render(
      <>
        <Toggle defaultPressed={false} onPressedChange={onPressedChange}>
          Bold
        </Toggle>
        <Checkbox
          accessibilityLabel="Terms"
          defaultChecked="indeterminate"
          onCheckedChange={onCheckedChange}
        />
        <Checkbox
          accessibilityLabel="Locked"
          disabled
          onCheckedChange={onDisabledChange}
        />
      </>,
    );

    const toggle = screen.getByRole("button", { name: "Bold" });
    fireEvent.press(toggle);
    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(toggle).toHaveProp(
      "accessibilityState",
      expect.objectContaining({ selected: true }),
    );

    const checkbox = screen.getByRole("checkbox", { name: "Terms" });
    expect(checkbox).toHaveProp(
      "accessibilityState",
      expect.objectContaining({ checked: "mixed" }),
    );
    fireEvent.press(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(checkbox).toHaveProp(
      "accessibilityState",
      expect.objectContaining({ checked: true }),
    );

    expect(screen.getByRole("checkbox", { name: "Locked" })).toBeDisabled();
    expect(onDisabledChange).not.toHaveBeenCalled();
  });

  it("uses caller-owned keys for controlled and uncontrolled toggle groups", () => {
    const onMultipleChange = jest.fn();
    const onSingleChange = jest.fn();
    render(
      <>
        <ToggleGroup
          accessibilityLabel="Alignment"
          defaultValue={["start"]}
          onValueChange={onMultipleChange}
          type="multiple"
        >
          <ToggleGroupItem value="start">Start</ToggleGroupItem>
          <ToggleGroupItem value={42}>Center</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup
          accessibilityLabel="Density"
          onValueChange={onSingleChange}
          type="single"
          value="compact"
        >
          <ToggleGroupItem value="compact">Compact</ToggleGroupItem>
          <ToggleGroupItem value="comfortable">Comfortable</ToggleGroupItem>
        </ToggleGroup>
      </>,
    );

    expect(screen.getByLabelText("Alignment")).toHaveProp(
      "accessibilityRole",
      "none",
    );
    fireEvent.press(screen.getByRole("button", { name: "Center" }));
    expect(onMultipleChange).toHaveBeenCalledWith(["start", 42]);

    fireEvent.press(screen.getByRole("button", { name: "Comfortable" }));
    expect(onSingleChange).toHaveBeenCalledWith("comfortable");
    expect(screen.getByRole("button", { name: "Compact" })).toHaveProp(
      "accessibilityState",
      expect.objectContaining({ selected: true }),
    );
  });

  it("selects stable radio values and respects item and group disabled state", () => {
    const onValueChange = jest.fn();
    const onDisabledChange = jest.fn();
    render(
      <>
        <RadioGroup
          accessibilityLabel="Delivery"
          defaultValue="standard"
          onValueChange={onValueChange}
        >
          <RadioGroupItem value="standard">Standard</RadioGroupItem>
          <RadioGroupItem value={2}>Express</RadioGroupItem>
          <RadioGroupItem disabled value="pickup">
            Pickup
          </RadioGroupItem>
        </RadioGroup>
        <RadioGroup disabled onValueChange={onDisabledChange}>
          <RadioGroupItem value="locked">Locked</RadioGroupItem>
        </RadioGroup>
      </>,
    );

    expect(screen.getByLabelText("Delivery")).toHaveProp(
      "accessibilityRole",
      "radiogroup",
    );
    expect(screen.getByRole("radio", { name: "Standard" })).toHaveProp(
      "accessibilityState",
      expect.objectContaining({ checked: true }),
    );
    fireEvent.press(screen.getByRole("radio", { name: "Express" }));
    expect(onValueChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole("radio", { name: "Pickup" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Locked" })).toBeDisabled();
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onDisabledChange).not.toHaveBeenCalled();
  });

  it("exposes toolbar semantics and 44-point action targets", () => {
    const onPress = jest.fn();
    render(
      <Toolbar accessibilityLabel="Formatting">
        <ToolbarButton accessibilityLabel="Bold" onPress={onPress}>
          <NativeText>B</NativeText>
        </ToolbarButton>
        <ToolbarSeparator />
        <ToolbarButton accessibilityLabel="Italic" disabled>
          <NativeText>I</NativeText>
        </ToolbarButton>
      </Toolbar>,
    );

    const toolbar = screen.getByLabelText("Formatting");
    expect(toolbar).toHaveProp("accessibilityRole", "toolbar");
    expect(toolbar).not.toHaveProp("accessible", true);
    const bold = screen.getByRole("button", { name: "Bold" });
    expect(bold).toHaveStyle({ minHeight: 44, minWidth: 44 });
    fireEvent.press(bold);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(
      screen.UNSAFE_getByProps({ accessibilityRole: "none" }).props.accessible,
    ).toBe(false);
    expect(screen.getByRole("button", { name: "Italic" })).toBeDisabled();
  });

  it("supports adjustable actions and a bounded horizontal slider gesture", () => {
    const onValueChange = jest.fn();
    const onGestureValueChange = jest.fn();
    const onDisabledChange = jest.fn();
    render(
      <>
        <Slider
          accessibilityLabel="Zoom"
          max={10}
          min={0}
          onValueChange={onValueChange}
          value={5}
        />
        <Slider
          accessibilityLabel="Volume"
          defaultValue={0}
          onValueChange={onGestureValueChange}
        />
        <Slider
          accessibilityLabel="Locked slider"
          disabled
          onValueChange={onDisabledChange}
          value={5}
        />
      </>,
    );

    const slider = screen.getByRole("adjustable", { name: "Zoom" });
    expect(slider).toHaveAccessibilityValue({ max: 10, min: 0, now: 5 });
    fireEvent(slider, "accessibilityAction", {
      nativeEvent: { actionName: "increment" },
    });
    expect(onValueChange).toHaveBeenCalledWith(6);

    const gestureSlider = screen.getByRole("adjustable", { name: "Volume" });
    fireEvent(gestureSlider, "layout", {
      nativeEvent: { layout: { height: 44, width: 100, x: 0, y: 0 } },
    });
    fireEvent(gestureSlider, "responderGrant", {
      nativeEvent: { locationX: 75, locationY: 22 },
    });
    expect(onGestureValueChange).toHaveBeenCalledWith(75);

    expect(
      screen.getByRole("adjustable", { name: "Locked slider" }),
    ).toBeDisabled();
    expect(onDisabledChange).not.toHaveBeenCalled();
  });

  it("opens links through Linking and never invokes a disabled navigation", async () => {
    const linking: LinkingService = {
      openUrl: jest.fn(async () => ({ status: "opened" as const })),
    };
    const onOpenResult = jest.fn();
    render(
      <>
        <Link
          href="https://example.com/docs"
          linking={linking}
          onOpenResult={onOpenResult}
        >
          Read docs
        </Link>
        <Link disabled href="https://example.com/locked" linking={linking}>
          Locked link
        </Link>
      </>,
    );

    fireEvent.press(screen.getByRole("link", { name: "Read docs" }));
    await waitFor(() => {
      expect(linking.openUrl).toHaveBeenCalledWith("https://example.com/docs");
      expect(onOpenResult).toHaveBeenCalledWith({ status: "opened" as const });
    });

    expect(screen.getByRole("link", { name: "Locked link" })).toBeDisabled();
    expect(linking.openUrl).toHaveBeenCalledTimes(1);
  });
});

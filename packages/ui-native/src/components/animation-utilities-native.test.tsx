import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text as NativeText } from "react-native";

import type { ReducedMotionService } from "../primitives/use-reduced-motion";
import { ThemeProvider } from "../theme/theme-provider";

import { AnimatedText } from "./animated-text/animated-text";
import { Marquee } from "./marquee/marquee";
import { NumberTicker } from "./number-ticker/number-ticker";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./resizable/resizable";

function createReducedMotionService(): ReducedMotionService {
  return {
    addEventListener: () => ({ remove: jest.fn() }),
    isReduceMotionEnabled: () => new Promise(() => void 0),
  };
}

describe("native animation utilities", () => {
  it("reveals final text immediately when reduced motion is enabled", () => {
    render(
      <ThemeProvider colorScheme="dark">
        <AnimatedText
          reducedMotionService={createReducedMotionService()}
          text="Deterministic launch"
          variant="matrix"
        />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText("Deterministic launch")).toHaveTextContent(
      "Deterministic launch",
    );
  });

  it("formats the final ticker value immediately for reduced motion", () => {
    render(
      <NumberTicker
        formatOptions={{ maximumFractionDigits: 0 }}
        from={0}
        locale="en-US"
        reducedMotionService={createReducedMotionService()}
        value={1234}
      />,
    );

    expect(screen.getByLabelText("1,234")).toHaveTextContent("1,234");
    expect(screen.getByLabelText("1,234")).toHaveStyle({
      fontVariant: ["tabular-nums"],
    });
  });

  it("renders a reduced-motion marquee without hiding primary content", () => {
    render(
      <Marquee
        reducedMotionService={createReducedMotionService()}
        testID="marquee"
      >
        <NativeText>Alpha</NativeText>
        <NativeText>Beta</NativeText>
      </Marquee>,
    );

    expect(screen.getByTestId("marquee")).toHaveStyle({ overflow: "hidden" });
    expect(screen.getAllByText("Alpha")).toHaveLength(1);
  });

  it("keeps normalized defaults inside every panel constraint", () => {
    render(
      <ResizablePanelGroup>
        <ResizablePanel
          defaultSize={30}
          minSize={30}
          testID="constrained-first"
        />
        <ResizableHandle accessibilityLabel="Resize constrained workspace" />
        <ResizablePanel defaultSize={90} testID="constrained-second" />
      </ResizablePanelGroup>,
    );

    expect(screen.getByTestId("constrained-first")).toHaveStyle({
      flexGrow: 30,
    });
    expect(screen.getByTestId("constrained-second")).toHaveStyle({
      flexGrow: 70,
    });
  });

  it("resizes adjacent panels through 44-point adjustable actions", () => {
    const onSizesChange = jest.fn();
    render(
      <ResizablePanelGroup onSizesChange={onSizesChange}>
        <ResizablePanel defaultSize={50} testID="first-panel" />
        <ResizableHandle accessibilityLabel="Resize workspace" withHandle />
        <ResizablePanel defaultSize={50} testID="second-panel" />
      </ResizablePanelGroup>,
    );

    const handle = screen.getByRole("adjustable", {
      name: "Resize workspace",
    });
    expect(handle).toHaveStyle({ minHeight: 44, width: 44 });
    expect(handle).toHaveAccessibilityValue({
      max: 90,
      min: 10,
      now: 50,
      text: "50 percent",
    });

    fireEvent(handle, "accessibilityAction", {
      nativeEvent: { actionName: "increment" },
    });

    expect(onSizesChange).toHaveBeenCalledWith([55, 45]);
    expect(screen.getByTestId("first-panel")).toHaveStyle({ flexGrow: 55 });
    expect(screen.getByTestId("second-panel")).toHaveStyle({ flexGrow: 45 });
  });
});

import { screen } from "@testing-library/react-native";
import { createNativeTheme, darkTheme, lightTheme } from "@vllnt/ui-core";
import { Animated, Text as NativeText } from "react-native";

import { Display } from "../components/atoms/display/display";
import { Icon } from "../components/atoms/icon/icon";
import { Spacer } from "../components/atoms/spacer/spacer";
import { Stack } from "../components/atoms/stack/stack";
import { Text } from "../components/atoms/text/text";
import { TextColorContext } from "../primitives/text-color";
import { ThemeProvider } from "../theme/theme-provider";

import {
  flushMicrotasks,
  reducedMotion,
  renderThemed,
  SquareGlyph,
  styleOf,
} from "./test-utils";

const hidden = { includeHiddenElements: true };

function glyph() {
  const style = styleOf(screen.getByTestId("glyph", hidden));
  return { color: style.backgroundColor, size: style.height };
}

describe("Display", () => {
  it("draws hero text on the theme display scale", () => {
    renderThemed(<Display>Ship faster</Display>);

    expect(styleOf(screen.getByText("Ship faster"))).toMatchObject({
      color: lightTheme.colors.foreground,
      fontSize: lightTheme.typography.scale.display.fontSize,
      fontWeight: lightTheme.typography.fontWeight.display,
      lineHeight: lightTheme.typography.scale.display.lineHeight,
    });
  });

  it("follows a theme that changes the display scale", () => {
    const maia = createNativeTheme("light", {
      typography: { scale: { display: { fontSize: 28, lineHeight: 29.4 } } },
    });
    renderThemed(
      <ThemeProvider
        colorScheme="light"
        override={{ typography: { scale: maia.typography.scale } }}
      >
        <Display>Maia</Display>
      </ThemeProvider>,
    );

    expect(styleOf(screen.getByText("Maia"))).toMatchObject({
      fontSize: 28,
      lineHeight: 29.4,
    });
  });

  it("uses the dark foreground in the dark theme", () => {
    renderThemed(<Display>Night</Display>, "dark");

    expect(styleOf(screen.getByText("Night")).color).toBe(
      darkTheme.colors.foreground,
    );
  });

  it.each(["h1", "h2"] as const)("exposes as=%s as a header", (as) => {
    renderThemed(<Display as={as}>Hero</Display>);

    expect(screen.getByRole("header", { name: "Hero" })).toBeOnTheScreen();
  });

  it.each(["div", "p", "span"] as const)("gives as=%s no role", (as) => {
    renderThemed(<Display as={as}>Hero</Display>);

    expect(screen.queryByRole("header")).toBeNull();
    expect(screen.getByText("Hero")).not.toHaveProp("accessibilityRole");
  });

  it("gives no role by default and lets the caller name one", () => {
    renderThemed(
      <>
        <Display>Plain</Display>
        <Display accessibilityRole="header">Named</Display>
      </>,
    );

    expect(screen.getByText("Plain")).not.toHaveProp("accessibilityRole");
    expect(screen.getByRole("header", { name: "Named" })).toBeOnTheScreen();
  });

  it("renders at rest and never animates unless asked", async () => {
    const timing = jest.spyOn(Animated, "timing");
    try {
      renderThemed(
        <Display reducedMotionService={reducedMotion(false)}>Still</Display>,
      );
      await flushMicrotasks();

      expect(timing).not.toHaveBeenCalled();
      expect(styleOf(screen.getByText("Still"))).toMatchObject({ opacity: 1 });
    } finally {
      timing.mockRestore();
    }
  });

  it("plays the rise-in reveal once motion is allowed", async () => {
    const timing = jest.spyOn(Animated, "timing");
    try {
      renderThemed(
        <Display animated reducedMotionService={reducedMotion(false)}>
          Rising
        </Display>,
      );
      await flushMicrotasks();

      expect(timing).toHaveBeenCalledTimes(1);
      expect(timing).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          duration: lightTheme.motion.duration.slow,
          toValue: 1,
        }),
      );
    } finally {
      timing.mockRestore();
    }
  });

  it("skips the reveal under reduced motion and shows the final text", async () => {
    const timing = jest.spyOn(Animated, "timing");
    try {
      renderThemed(
        <Display animated reducedMotionService={reducedMotion(true)}>
          Calm
        </Display>,
      );
      await flushMicrotasks();

      expect(timing).not.toHaveBeenCalled();
      expect(styleOf(screen.getByText("Calm"))).toMatchObject({
        opacity: 1,
        transform: [{ translateY: 0 }],
      });
    } finally {
      timing.mockRestore();
    }
  });

  it("skips the reveal while the motion preference is still unknown", () => {
    const timing = jest.spyOn(Animated, "timing");
    try {
      renderThemed(
        <Display animated reducedMotionService={reducedMotion("pending")}>
          Waiting
        </Display>,
      );

      expect(timing).not.toHaveBeenCalled();
    } finally {
      timing.mockRestore();
    }
  });

  it("forwards text props and a style that wins over the scale", () => {
    renderThemed(
      <Display numberOfLines={1} style={{ fontSize: 40 }} testID="hero">
        Override
      </Display>,
    );

    expect(screen.getByTestId("hero")).toHaveProp("numberOfLines", 1);
    expect(styleOf(screen.getByTestId("hero")).fontSize).toBe(40);
  });
});

describe("Icon", () => {
  it("is decorative without a label: hidden from both screen readers", () => {
    renderThemed(<Icon icon={SquareGlyph} testID="icon" />);

    const icon = screen.getByTestId("icon", hidden);
    expect(icon).toHaveProp("accessibilityElementsHidden", true);
    expect(icon).toHaveProp("importantForAccessibility", "no-hide-descendants");
    expect(icon).not.toHaveProp("accessible", true);
    expect(icon).not.toHaveProp("accessibilityRole");
    expect(screen.queryByTestId("icon")).toBeNull();
  });

  it("becomes an accessible image once labelled", () => {
    renderThemed(<Icon icon={SquareGlyph} label="Verified" testID="icon" />);

    const icon = screen.getByRole("image", { name: "Verified" });
    expect(icon).toBe(screen.getByTestId("icon"));
    expect(icon).toHaveProp("accessible", true);
    expect(icon).not.toHaveProp("accessibilityElementsHidden", true);
    expect(icon).not.toHaveProp("importantForAccessibility");
  });

  it.each([
    ["sm", lightTheme.spacing[4]],
    ["md", lightTheme.spacing[5]],
    ["lg", lightTheme.spacing[6]],
  ] as const)("maps size %s to a spacing token (%d pt)", (size, points) => {
    renderThemed(<Icon icon={SquareGlyph} size={size} testID="icon" />);

    expect(glyph().size).toBe(points);
    expect(styleOf(screen.getByTestId("icon", hidden))).toMatchObject({
      height: points,
      width: points,
    });
  });

  it("defaults to the md size and accepts a size in points", () => {
    renderThemed(
      <>
        <Icon icon={SquareGlyph} testID="default" />
        <Icon icon={SquareGlyph} size={18} testID="custom" />
      </>,
    );

    expect(styleOf(screen.getByTestId("default", hidden)).width).toBe(
      lightTheme.spacing[5],
    );
    expect(styleOf(screen.getByTestId("custom", hidden)).width).toBe(18);
  });

  it("draws the glyph in the same colour Text uses for each tone", () => {
    renderThemed(
      <>
        <Icon icon={SquareGlyph} tone="muted" />
        <Text tone="muted">Muted</Text>
      </>,
    );

    expect(glyph().color).toBe(lightTheme.colors.mutedForeground);
    expect(styleOf(screen.getByText("Muted")).color).toBe(glyph().color);
  });

  it("uses the foreground tone by default, in dark mode too", () => {
    renderThemed(<Icon icon={SquareGlyph} />, "dark");

    expect(glyph().color).toBe(darkTheme.colors.foreground);
  });

  it("takes the paired foreground a filled surface provides, as Text does", () => {
    renderThemed(
      <TextColorContext value="#123456">
        <Icon icon={SquareGlyph} tone="muted" />
        <NativeText>Filled</NativeText>
      </TextColorContext>,
    );

    expect(glyph().color).toBe("#123456");
  });

  it("forwards View props and a style that wins over the box", () => {
    renderThemed(
      <Icon
        icon={SquareGlyph}
        style={{ marginLeft: 4, width: 30 }}
        testID="icon"
      />,
    );

    expect(styleOf(screen.getByTestId("icon", hidden))).toMatchObject({
      flexShrink: 0,
      marginLeft: 4,
      width: 30,
    });
  });
});

describe("Stack", () => {
  it("stacks children in a column with no gap and no role by default", () => {
    renderThemed(
      <Stack testID="stack">
        <Text>One</Text>
      </Stack>,
    );

    const stack = screen.getByTestId("stack");
    expect(styleOf(stack)).toMatchObject({
      flexDirection: "column",
      flexWrap: "nowrap",
    });
    expect(styleOf(stack).gap).toBeUndefined();
    expect(styleOf(stack).alignItems).toBeUndefined();
    expect(stack).not.toHaveProp("accessibilityRole");
    expect(stack).not.toHaveProp("accessible");
  });

  it("maps direction, gap token, align, justify and wrap to flex styles", () => {
    renderThemed(
      <Stack
        align="center"
        direction="row"
        gap={3}
        justify="space-between"
        testID="stack"
        wrap
      />,
    );

    expect(styleOf(screen.getByTestId("stack"))).toMatchObject({
      alignItems: "center",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: lightTheme.spacing[3],
      justifyContent: "space-between",
    });
  });

  it("reads gap from the active theme", () => {
    renderThemed(
      <ThemeProvider colorScheme="light" override={{ spacing: { 2: 10 } }}>
        <Stack gap={2} testID="stack" />
      </ThemeProvider>,
    );

    expect(styleOf(screen.getByTestId("stack")).gap).toBe(10);
  });

  it("passes View props through and lets style win", () => {
    renderThemed(
      <Stack
        accessibilityLabel="Toolbar group"
        accessible
        direction="row"
        style={{ flexDirection: "column" }}
        testID="stack"
      >
        <Text>Child</Text>
      </Stack>,
    );

    const stack = screen.getByTestId("stack");
    expect(stack).toHaveProp("accessibilityLabel", "Toolbar group");
    expect(styleOf(stack).flexDirection).toBe("column");
    expect(screen.getByText("Child")).toBeOnTheScreen();
  });
});

describe("Spacer", () => {
  it("fixes the gap along the main axis from a spacing token", () => {
    renderThemed(<Spacer size={4} testID="spacer" />);

    expect(styleOf(screen.getByTestId("spacer", hidden))).toMatchObject({
      flexBasis: lightTheme.spacing[4],
      flexGrow: 0,
      flexShrink: 0,
    });
  });

  it("absorbs free space with flex", () => {
    renderThemed(<Spacer flex testID="spacer" />);

    expect(styleOf(screen.getByTestId("spacer", hidden))).toMatchObject({
      flexBasis: 0,
      flexGrow: 1,
      flexShrink: 0,
    });
  });

  it("keeps size as the smallest gap when it also flexes", () => {
    renderThemed(<Spacer flex size={2} testID="spacer" />);

    expect(styleOf(screen.getByTestId("spacer", hidden))).toMatchObject({
      flexBasis: lightTheme.spacing[2],
      flexGrow: 1,
    });
  });

  it("is hidden from screen readers and ignores touches", () => {
    renderThemed(<Spacer size={4} testID="spacer" />);

    const spacer = screen.getByTestId("spacer", hidden);
    expect(spacer).toHaveProp("accessibilityElementsHidden", true);
    expect(spacer).toHaveProp(
      "importantForAccessibility",
      "no-hide-descendants",
    );
    expect(spacer).toHaveProp("pointerEvents", "none");
    expect(screen.queryByTestId("spacer")).toBeNull();
  });

  it("lets style override the generated box", () => {
    renderThemed(<Spacer size={4} style={{ flexBasis: 7 }} testID="spacer" />);

    expect(styleOf(screen.getByTestId("spacer", hidden)).flexBasis).toBe(7);
  });
});

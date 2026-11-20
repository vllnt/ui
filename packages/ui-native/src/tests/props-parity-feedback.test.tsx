import { act, render, screen } from "@testing-library/react-native";
import { lightTheme } from "@vllnt/ui-core";
import { Animated, Text } from "react-native";

import { Badge } from "../components/atoms/badge/badge";
import { Toast } from "../components/atoms/toast/toast";
import { ProgressBar } from "../components/molecules/progress-bar/progress-bar";
import { decorativeProps } from "../primitives/accessibility";
import { withAlpha } from "../primitives/color-alpha";

import {
  type HostNode,
  reducedMotion,
  renderThemed,
  styleOf,
  viewsWhere,
} from "./test-utils";

const { colors, spacing, typography } = lightTheme;

const DOT_SIZE = spacing[1] * 1.5;

function dotOf(badge: unknown): HostNode | undefined {
  return viewsWhere(badge, (style) => style.width === DOT_SIZE)[0];
}

function trackOf(root: unknown): HostNode | undefined {
  return viewsWhere(root, (style) => style.overflow === "hidden")[0];
}

function fillOf(root: unknown): HostNode | undefined {
  return viewsWhere(trackOf(root), () => true)[1];
}

function cellsOf(root: unknown): readonly HostNode[] {
  return viewsWhere(root, (style) => style.flex === 1);
}

function cellsFilledWith(root: unknown, color: string): number {
  return cellsOf(root).filter((cell) => styleOf(cell).backgroundColor === color)
    .length;
}

describe("Badge", () => {
  it("sizes a chip by the web size scale", () => {
    renderThemed(
      <>
        <Badge testID="default">Label</Badge>
        <Badge size="header" testID="header">
          Label
        </Badge>
        <Badge size="inline" testID="inline">
          Label
        </Badge>
        <Badge size="sm" testID="sm">
          Label
        </Badge>
      </>,
    );
    expect(styleOf(screen.getByTestId("default"))).toMatchObject({
      paddingHorizontal: spacing[2] + spacing[1] / 2,
      paddingVertical: spacing[1] / 2,
    });
    expect(styleOf(screen.getByTestId("header"))).toMatchObject({
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
    });
    expect(styleOf(screen.getByTestId("inline"))).toMatchObject({
      paddingHorizontal: spacing[1] * 1.5,
      paddingVertical: 0,
    });
    expect(styleOf(screen.getByTestId("sm"))).toMatchObject({
      paddingHorizontal: spacing[2],
      paddingVertical: 0,
    });
  });

  it("sets the label size from the type scale", () => {
    renderThemed(
      <>
        <Badge>Plain</Badge>
        <Badge size="header">Header</Badge>
      </>,
    );
    expect(screen.getByText("Plain")).toHaveStyle({
      fontSize: typography.scale.caption.fontSize,
    });
    expect(screen.getByText("Header")).toHaveStyle({
      fontSize: typography.scale.bodySmall.fontSize,
    });
  });

  it.each([
    ["default", colors.primary],
    ["destructive", colors.destructive],
    ["outline", "transparent"],
    ["secondary", colors.secondary],
    ["soft", colors.muted],
  ] as const)("keeps the %s variant surface", (variant, backgroundColor) => {
    renderThemed(
      <Badge testID="badge" variant={variant}>
        Label
      </Badge>,
    );
    expect(styleOf(screen.getByTestId("badge")).backgroundColor).toBe(
      backgroundColor,
    );
  });

  it.each([
    ["danger", colors.destructive],
    ["info", colors.info],
    ["neutral", colors.mutedForeground],
    ["primary", colors.primary],
    ["success", colors.success],
    ["warning", colors.warning],
  ] as const)(
    "puts the %s tone on the dot and keeps a secondary surface",
    (tone, dotColor) => {
      renderThemed(
        <Badge dot testID="badge" tone={tone}>
          Label
        </Badge>,
      );
      const badge = screen.getByTestId("badge");
      expect(styleOf(badge).backgroundColor).toBe(colors.secondary);
      expect(dotOf(badge)).toBeDefined();
      expect(styleOf(dotOf(badge)).backgroundColor).toBe(dotColor);
    },
  );

  it("keeps an explicit variant under a status tone", () => {
    renderThemed(
      <Badge testID="badge" tone="success" variant="outline">
        Label
      </Badge>,
    );
    expect(styleOf(screen.getByTestId("badge")).backgroundColor).toBe(
      "transparent",
    );
  });

  it("draws the solid and danger tones as their own surface over any variant", () => {
    renderThemed(
      <>
        <Badge testID="solid" tone="solid" variant="outline">
          Solid
        </Badge>
        <Badge testID="danger-solid" tone="danger-solid">
          Danger
        </Badge>
        <Badge testID="danger-tint" tone="danger-tint">
          Tint
        </Badge>
      </>,
    );
    expect(styleOf(screen.getByTestId("solid"))).toMatchObject({
      backgroundColor: colors.primary,
      borderColor: "transparent",
    });
    expect(screen.getByText("Solid")).toHaveStyle({
      color: colors.primaryForeground,
    });
    expect(styleOf(screen.getByTestId("danger-solid"))).toMatchObject({
      backgroundColor: colors.destructive,
      borderColor: "transparent",
    });
    expect(screen.getByText("Danger")).toHaveStyle({
      color: colors.destructiveForeground,
    });
    expect(styleOf(screen.getByTestId("danger-tint"))).toMatchObject({
      backgroundColor: withAlpha(colors.destructive, 0.1),
      borderColor: withAlpha(colors.destructive, 0.3),
    });
    expect(screen.getByText("Tint")).toHaveStyle({ color: colors.foreground });
  });

  it("colours the dot of a danger-tint chip with the danger tone", () => {
    renderThemed(
      <Badge dot testID="badge" tone="danger-tint">
        Failed
      </Badge>,
    );
    const badge = screen.getByTestId("badge");
    expect(styleOf(dotOf(badge)).backgroundColor).toBe(colors.destructive);
  });

  it("shows no dot by default and a decorative one when asked", () => {
    renderThemed(
      <>
        <Badge testID="plain">Plain</Badge>
        <Badge dot testID="dotted">
          Dotted
        </Badge>
      </>,
    );
    expect(dotOf(screen.getByTestId("plain"))).toBeUndefined();
    const dot = dotOf(screen.getByTestId("dotted"));
    expect(dot?.props).toMatchObject(decorativeProps);
    expect(styleOf(screen.getByTestId("dotted")).gap).toBe(spacing[1] * 1.5);
  });

  it("makes a dot without a tone follow the label colour", () => {
    renderThemed(
      <Badge dot testID="badge" variant="outline">
        Label
      </Badge>,
    );
    const badge = screen.getByTestId("badge");
    expect(styleOf(dotOf(badge)).backgroundColor).toBe(colors.foreground);
  });

  it("removes or strengthens the border and otherwise keeps the variant's", () => {
    renderThemed(
      <>
        <Badge testID="outline" variant="outline">
          Outline
        </Badge>
        <Badge border="none" testID="none" variant="outline">
          None
        </Badge>
        <Badge border="strong" testID="strong">
          Strong
        </Badge>
        <Badge testID="filled">Filled</Badge>
      </>,
    );
    expect(styleOf(screen.getByTestId("outline")).borderColor).toBe(
      colors.border,
    );
    expect(styleOf(screen.getByTestId("none")).borderColor).toBe("transparent");
    expect(styleOf(screen.getByTestId("strong")).borderColor).toBe(
      colors.foreground,
    );
    expect(styleOf(screen.getByTestId("filled")).borderColor).toBe(
      colors.primary,
    );
  });
});

describe("ProgressBar", () => {
  it("names the bar and its header by label, ahead of currentLabel", () => {
    renderThemed(
      <>
        <ProgressBar
          currentLabel="Fallback"
          label="Upload"
          max={10}
          value={4}
        />
        <ProgressBar currentLabel="Sync" max={10} value={4} />
        <ProgressBar label={<Text>Rich</Text>} max={10} value={4} />
      </>,
    );
    const [upload, sync, rich] = screen.getAllByRole("progressbar");
    expect(upload).toHaveProp("accessibilityLabel", "Upload");
    expect(screen.getByText("Upload")).toBeOnTheScreen();
    expect(sync).toHaveProp("accessibilityLabel", "Sync");
    expect(rich).toHaveProp("accessibilityLabel", "Progress");
    expect(screen.getByText("Rich")).toBeOnTheScreen();
  });

  it("shows a completed count by default, a percentage with showValue, and valueLabel above both", () => {
    renderThemed(
      <>
        <ProgressBar max={10} value={4} />
        <ProgressBar max={10} showValue value={4} />
        <ProgressBar max={8} showValue value={3} valueLabel="3 / 8" />
      </>,
    );
    expect(screen.getByText("4 / 10 completed")).toBeOnTheScreen();
    expect(screen.getByText("40%")).toBeOnTheScreen();
    expect(screen.getByText("3 / 8")).toBeOnTheScreen();
    expect(screen.queryByText("38%")).toBeNull();
  });

  it.each([
    ["sm", spacing[1]],
    ["md", spacing[2]],
    ["lg", spacing[3]],
  ] as const)("draws the %s track at its token height", (size, height) => {
    renderThemed(<ProgressBar max={10} size={size} value={4} />);
    const track = trackOf(screen.getByRole("progressbar"));
    expect(styleOf(track).height).toBe(height);
  });

  it("defaults the track to the md height", () => {
    renderThemed(<ProgressBar max={10} value={4} />);
    const track = trackOf(screen.getByRole("progressbar"));
    expect(styleOf(track).height).toBe(spacing[2]);
  });

  it.each([
    ["danger", colors.destructive],
    ["info", colors.info],
    ["neutral", colors.mutedForeground],
    ["primary", colors.primary],
    ["success", colors.success],
    ["warning", colors.warning],
  ] as const)("fills the bar with the %s tone", (tone, color) => {
    renderThemed(<ProgressBar max={10} tone={tone} value={4} />);
    expect(
      styleOf(fillOf(screen.getByRole("progressbar"))).backgroundColor,
    ).toBe(color);
  });

  it("fills with primary by default and success when complete, unless a tone is set", () => {
    renderThemed(
      <>
        <ProgressBar max={10} value={4} />
        <ProgressBar isComplete max={10} value={10} />
        <ProgressBar isComplete max={10} tone="info" value={10} />
      </>,
    );
    const [open, complete, toned] = screen.getAllByRole("progressbar");
    expect(styleOf(fillOf(open)).backgroundColor).toBe(colors.primary);
    expect(styleOf(fillOf(complete)).backgroundColor).toBe(colors.success);
    expect(styleOf(fillOf(toned)).backgroundColor).toBe(colors.info);
  });

  it("tints a complete card with its tone, as web does", () => {
    renderThemed(
      <>
        <ProgressBar isComplete max={10} tone="success" value={10} />
        <ProgressBar isComplete max={10} tone="neutral" value={10} />
        <ProgressBar max={10} value={4} />
      </>,
    );
    const [success, neutral, open] = screen.getAllByRole("progressbar");
    expect(styleOf(success)).toMatchObject({
      backgroundColor: withAlpha(colors.success, 0.05),
      borderColor: withAlpha(colors.success, 0.5),
    });
    expect(styleOf(neutral)).toMatchObject({
      backgroundColor: withAlpha(colors.muted, 0.3),
      borderColor: colors.border,
    });
    expect(styleOf(open)).toMatchObject({
      backgroundColor: colors.card,
      borderColor: colors.border,
    });
  });

  describe("mode", () => {
    it("omits the current value of an indeterminate bar and ignores value and max", () => {
      renderThemed(
        <ProgressBar max={10} mode="indeterminate" showValue value={4} />,
      );
      const root = screen.getByRole("progressbar");
      expect(root.props.accessibilityValue).toEqual({ max: 10, min: 0 });
      expect(root.props.accessibilityState).toEqual({ busy: true });
      expect(screen.queryByText("40%")).toBeNull();
      expect(screen.queryByText("4 / 10 completed")).toBeNull();
      expect(
        Number.parseFloat(String(styleOf(fillOf(root)).width)),
      ).toBeCloseTo(100 / 3, 1);
    });

    it("keeps a determinate bar determinate by default and ends indeterminate when complete or loading", () => {
      renderThemed(
        <>
          <ProgressBar max={10} value={4} />
          <ProgressBar isComplete max={10} mode="indeterminate" value={10} />
          <ProgressBar isLoading max={10} mode="indeterminate" value={4} />
        </>,
      );
      const [determinate, complete, loading] =
        screen.getAllByRole("progressbar");
      expect(determinate?.props.accessibilityValue).toMatchObject({ now: 4 });
      expect(determinate?.props.accessibilityState).toEqual({ busy: false });
      expect(complete?.props.accessibilityValue).toMatchObject({ now: 10 });
      expect(loading?.props.accessibilityValue).toEqual({
        text: "Loading progress",
      });
    });

    it("starts no animation under reduced motion", async () => {
      const timing = jest.spyOn(Animated, "timing");
      renderThemed(
        <ProgressBar
          max={10}
          mode="indeterminate"
          reducedMotionService={reducedMotion(true)}
          value={0}
        />,
      );
      await act(async () => void 0);
      expect(timing).not.toHaveBeenCalled();
      timing.mockRestore();
    });

    it("sweeps the fill when motion is allowed and stops it on unmount", async () => {
      const timing = jest.spyOn(Animated, "timing");
      const { unmount } = renderThemed(
        <ProgressBar
          max={10}
          mode="indeterminate"
          reducedMotionService={reducedMotion(false)}
          value={0}
        />,
      );
      await act(async () => void 0);
      expect(timing).toHaveBeenCalled();
      unmount();
      timing.mockRestore();
    });
  });

  describe("blocks", () => {
    it("draws ten blocks and fills one per whole 10 percent", () => {
      renderThemed(<ProgressBar blocks max={100} value={35} />);
      const cells = cellsOf(screen.getByRole("progressbar"));
      expect(cells).toHaveLength(10);
      expect(cells.map((cell) => styleOf(cell).backgroundColor)).toEqual([
        ...Array.from({ length: 3 }, () => colors.primary),
        ...Array.from({ length: 7 }, () => colors.muted),
      ]);
    });

    it("floors the raw ratio, so 999 of 1000 fills nine and a full bar fills ten", () => {
      renderThemed(
        <>
          <ProgressBar blocks max={1000} value={999} />
          <ProgressBar blocks max={1000} value={1000} />
        </>,
      );
      const [almost, full] = screen.getAllByRole("progressbar");
      expect(cellsFilledWith(almost, colors.primary)).toBe(9);
      expect(cellsFilledWith(full, colors.success)).toBe(10);
      expect(almost?.props.accessibilityValue).toMatchObject({ now: 999 });
    });

    it("colours the blocks with the tone and shows ten empty blocks while loading", () => {
      renderThemed(
        <>
          <ProgressBar blocks max={10} tone="warning" value={5} />
          <ProgressBar blocks isLoading max={10} value={5} />
        </>,
      );
      const [toned, loading] = screen.getAllByRole("progressbar");
      expect(cellsFilledWith(toned, colors.warning)).toBe(5);
      expect(cellsOf(loading)).toHaveLength(10);
      expect(cellsFilledWith(loading, colors.muted)).toBe(10);
    });

    it("keeps the continuous bar for an indeterminate bar", () => {
      renderThemed(
        <ProgressBar blocks max={10} mode="indeterminate" value={5} />,
      );
      expect(cellsOf(screen.getByRole("progressbar"))).toHaveLength(0);
    });
  });
});

describe("Toast action altText", () => {
  function renderToast(altText?: string) {
    return render(
      <Toast
        closeLabel="Dismiss"
        onToastsChange={() => void 0}
        toasts={[
          {
            actionLabel: "Undo",
            altText,
            id: "archived",
            onAction: () => void 0,
            title: "Archived",
          },
        ]}
      />,
    );
  }

  it("names the action by altText for screen readers", () => {
    renderToast("Undo archive");
    expect(
      screen.getByRole("button", { name: "Undo archive" }),
    ).toBeOnTheScreen();
    expect(screen.getByText("Undo")).toBeOnTheScreen();
  });

  it("names the action by its label without altText", () => {
    renderToast();
    expect(screen.getByRole("button", { name: "Undo" })).toBeOnTheScreen();
  });
});

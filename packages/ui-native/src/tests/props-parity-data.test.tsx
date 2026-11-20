import { act, fireEvent, screen } from "@testing-library/react-native";
import { lightTheme } from "@vllnt/ui-core";
import { Dimensions, Text } from "react-native";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../components/atoms/avatar/avatar";
import { Grid } from "../components/atoms/grid/grid";
import { DataList } from "../components/molecules/data-list/data-list";
import { decorativeProps } from "../primitives/accessibility";

import {
  advanceTimers,
  renderThemed,
  styleOf,
  themed,
  viewsWhere,
} from "./test-utils";

const { colors, radius, spacing } = lightTheme;
const PHOTO = { uri: "https://example.test/ada.png" };

describe("Avatar shape", () => {
  it("rounds a circle fully by default and a square to the md radius", () => {
    renderThemed(
      <>
        <Avatar testID="circle">
          <AvatarImage accessibilityLabel="Ada" source={PHOTO} />
          <AvatarFallback testID="circle-fallback">
            <Text>AL</Text>
          </AvatarFallback>
        </Avatar>
        <Avatar shape="square" testID="square">
          <AvatarImage accessibilityLabel="Grace" source={PHOTO} />
          <AvatarFallback testID="square-fallback">
            <Text>GH</Text>
          </AvatarFallback>
        </Avatar>
      </>,
    );
    expect(styleOf(screen.getByTestId("circle")).borderRadius).toBe(
      radius.full,
    );
    expect(styleOf(screen.getByLabelText("Ada")).borderRadius).toBe(
      radius.full,
    );
    expect(styleOf(screen.getByTestId("circle-fallback")).borderRadius).toBe(
      radius.full,
    );
    expect(styleOf(screen.getByTestId("square")).borderRadius).toBe(radius.md);
    expect(styleOf(screen.getByLabelText("Grace")).borderRadius).toBe(
      radius.md,
    );
    expect(styleOf(screen.getByTestId("square-fallback")).borderRadius).toBe(
      radius.md,
    );
  });

  it("clips a plain avatar and lets the presence marker sit past the edge", () => {
    renderThemed(
      <>
        <Avatar testID="plain" />
        <Avatar presence="online" testID="marked" />
      </>,
    );
    expect(styleOf(screen.getByTestId("plain")).overflow).toBe("hidden");
    expect(styleOf(screen.getByTestId("marked")).overflow).not.toBe("hidden");
  });
});

describe("Avatar presence", () => {
  it("draws no marker without presence", () => {
    renderThemed(<Avatar />);
    expect(screen.queryByLabelText(/^(Online|Away|Busy)$/)).toBeNull();
  });

  it.each([
    ["online", "Online"],
    ["away", "Away"],
    ["busy", "Busy"],
  ] as const)("says %s in words for screen readers", (presence, word) => {
    renderThemed(<Avatar presence={presence} />);
    const marker = screen.getByLabelText(word);
    expect(marker).toHaveProp("accessible", true);
    expect(marker).toHaveProp("accessibilityRole", "text");
  });

  it("fills the online dot with the success colour", () => {
    renderThemed(<Avatar presence="online" />);
    const [ring, dot, bar] = viewsWhere(
      screen.getByLabelText("Online"),
      () => true,
    );
    expect(styleOf(ring)).toMatchObject({
      backgroundColor: colors.background,
      padding: spacing[1] / 2,
    });
    expect(styleOf(dot).backgroundColor).toBe(colors.success);
    expect(bar).toBeUndefined();
  });

  it("draws away as a warning ring around the page colour", () => {
    renderThemed(<Avatar presence="away" />);
    const [, dot] = viewsWhere(screen.getByLabelText("Away"), () => true);
    expect(styleOf(dot)).toMatchObject({
      backgroundColor: colors.background,
      borderColor: colors.warning,
      borderWidth: spacing[1] / 2,
    });
  });

  it("draws busy as a destructive dot with a bar, so shape tells it apart", () => {
    renderThemed(<Avatar presence="busy" />);
    const [, dot, bar] = viewsWhere(screen.getByLabelText("Busy"), () => true);
    expect(styleOf(dot).backgroundColor).toBe(colors.destructive);
    expect(styleOf(bar)).toMatchObject({
      backgroundColor: colors.background,
      height: spacing[1] / 2,
      width: "50%",
    });
    expect(bar?.props).toMatchObject(decorativeProps);
  });

  it("scales the marker with the avatar and keeps a floor", () => {
    renderThemed(
      <>
        <Avatar presence="online" size={40} testID="medium" />
        <Avatar presence="busy" size={8} testID="tiny" />
      </>,
    );
    const diameter = styleOf(screen.getByTestId("medium")).width;
    const [, mediumDot] = viewsWhere(
      screen.getByLabelText("Online"),
      () => true,
    );
    expect(styleOf(mediumDot).width).toBe(Math.round(Number(diameter) * 0.3));
    const [, tinyDot] = viewsWhere(screen.getByLabelText("Busy"), () => true);
    expect(styleOf(tinyDot).width).toBe(spacing[2]);
  });

  it("takes translated words from presenceLabels and keeps the other defaults", () => {
    renderThemed(
      <>
        <Avatar presence="online" presenceLabels={{ online: "En ligne" }} />
        <Avatar presence="away" presenceLabels={{ online: "En ligne" }} />
      </>,
    );
    expect(screen.getByLabelText("En ligne")).toBeOnTheScreen();
    expect(screen.getByLabelText("Away")).toBeOnTheScreen();
    expect(screen.queryByLabelText("Online")).toBeNull();
  });
});

describe("AvatarFallback delayMs", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows the fallback at once without delayMs", () => {
    renderThemed(
      <Avatar>
        <AvatarFallback>
          <Text>AL</Text>
        </AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("AL")).toBeOnTheScreen();
  });

  it("holds the fallback back until the delay has passed", () => {
    renderThemed(
      <Avatar>
        <AvatarFallback delayMs={500}>
          <Text>AL</Text>
        </AvatarFallback>
      </Avatar>,
    );
    expect(screen.queryByText("AL")).toBeNull();
    advanceTimers(499);
    expect(screen.queryByText("AL")).toBeNull();
    advanceTimers(1);
    expect(screen.getByText("AL")).toBeOnTheScreen();
  });

  it("never shows the fallback once the image has loaded", () => {
    renderThemed(
      <Avatar>
        <AvatarImage accessibilityLabel="Ada" source={PHOTO} />
        <AvatarFallback delayMs={100}>
          <Text>AL</Text>
        </AvatarFallback>
      </Avatar>,
    );
    fireEvent(screen.getByLabelText("Ada"), "load", {
      nativeEvent: { source: { height: 1, uri: PHOTO.uri, width: 1 } },
    });
    advanceTimers(200);
    expect(screen.queryByText("AL")).toBeNull();
  });

  it("clears its timer on unmount", () => {
    const view = renderThemed(
      <Avatar>
        <AvatarFallback delayMs={500}>
          <Text>AL</Text>
        </AvatarFallback>
      </Avatar>,
    );
    view.unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
});

describe("AvatarImage onLoadingStatusChange", () => {
  const loadEvent = {
    nativeEvent: { source: { height: 1, uri: PHOTO.uri, width: 1 } },
  };

  it("reports loading, then loaded", () => {
    const onLoadingStatusChange = jest.fn();
    renderThemed(
      <Avatar>
        <AvatarImage
          accessibilityLabel="Ada"
          onLoadingStatusChange={onLoadingStatusChange}
          source={PHOTO}
        />
      </Avatar>,
    );
    expect(onLoadingStatusChange.mock.calls).toEqual([["loading"]]);
    fireEvent(screen.getByLabelText("Ada"), "load", loadEvent);
    expect(onLoadingStatusChange.mock.calls).toEqual([["loading"], ["loaded"]]);
  });

  it("reports error when the image fails", () => {
    const onLoadingStatusChange = jest.fn();
    renderThemed(
      <Avatar>
        <AvatarImage
          accessibilityLabel="Ada"
          onLoadingStatusChange={onLoadingStatusChange}
          source={PHOTO}
        />
      </Avatar>,
    );
    fireEvent(screen.getByLabelText("Ada"), "error", {
      nativeEvent: { error: "offline" },
    });
    expect(onLoadingStatusChange.mock.calls).toEqual([["loading"], ["error"]]);
  });

  it("reports error at once when there is no source", () => {
    const onLoadingStatusChange = jest.fn();
    renderThemed(
      <Avatar>
        <AvatarImage
          accessibilityLabel="Ada"
          onLoadingStatusChange={onLoadingStatusChange}
        />
      </Avatar>,
    );
    expect(onLoadingStatusChange.mock.calls).toEqual([["error"]]);
  });

  it("reports loading again for a new source and keeps the callbacks it had", () => {
    const onLoadingStatusChange = jest.fn();
    const onLoad = jest.fn();
    const view = renderThemed(
      <Avatar>
        <AvatarImage
          accessibilityLabel="Ada"
          onLoad={onLoad}
          onLoadingStatusChange={onLoadingStatusChange}
          source={PHOTO}
        />
      </Avatar>,
    );
    fireEvent(screen.getByLabelText("Ada"), "load", loadEvent);
    expect(onLoad).toHaveBeenCalledTimes(1);
    view.rerender(
      themed(
        <Avatar>
          <AvatarImage
            accessibilityLabel="Ada"
            onLoad={onLoad}
            onLoadingStatusChange={onLoadingStatusChange}
            source={{ uri: "https://example.test/ada-2.png" }}
          />
        </Avatar>,
      ),
    );
    expect(onLoadingStatusChange.mock.calls).toEqual([
      ["loading"],
      ["loaded"],
      ["loading"],
    ]);
  });
});

describe("DataListItem density", () => {
  const items = [
    { id: "plan", label: "Plan", value: "Pro" },
    { density: "compact", id: "seats", label: "Seats", value: "12" },
    { density: "default", id: "region", label: "Region", value: "EU" },
  ] as const;

  it("lets an item set its own padding over the list density", () => {
    renderThemed(<DataList items={items} />);
    expect(styleOf(screen.getByLabelText("Plan, Pro")).paddingVertical).toBe(
      spacing[4],
    );
    expect(styleOf(screen.getByLabelText("Seats, 12")).paddingVertical).toBe(
      spacing[3],
    );
    expect(styleOf(screen.getByLabelText("Region, EU")).paddingVertical).toBe(
      spacing[4],
    );
  });

  it("keeps the list density for items that set none", () => {
    renderThemed(<DataList density="compact" items={items} />);
    expect(styleOf(screen.getByLabelText("Plan, Pro")).paddingVertical).toBe(
      spacing[3],
    );
    expect(styleOf(screen.getByLabelText("Seats, 12")).paddingVertical).toBe(
      spacing[3],
    );
    expect(styleOf(screen.getByLabelText("Region, EU")).paddingVertical).toBe(
      spacing[4],
    );
  });
});

function firstCellWidth(): unknown {
  return styleOf(
    viewsWhere(
      screen.getByTestId("grid"),
      (style) => style.width !== undefined,
    )[0],
  ).width;
}

describe("Grid responsive columns", () => {
  const original = Dimensions.get("window");

  function resize(width: number): void {
    act(() => {
      Dimensions.set({ window: { ...original, width } });
    });
  }

  afterEach(() => {
    resize(original.width);
  });

  function renderGrid() {
    return renderThemed(
      <Grid cols={1} lgCols={4} mdCols={3} smCols={2} testID="grid">
        <Text>One</Text>
        <Text>Two</Text>
      </Grid>,
    );
  }

  it.each([
    [375, "100%"],
    [639, "100%"],
    [640, "50%"],
    [767, "50%"],
    [768, `${100 / 3}%`],
    [1023, `${100 / 3}%`],
    [1024, "25%"],
    [1440, "25%"],
  ])("uses the web breakpoints at %i points wide", (width, cellWidth) => {
    resize(width);
    renderGrid();
    expect(firstCellWidth()).toBe(cellWidth);
  });

  it("carries a smaller breakpoint's columns up when a larger one is not set", () => {
    resize(1200);
    renderThemed(
      <Grid cols={1} mdCols={3} testID="grid">
        <Text>One</Text>
      </Grid>,
    );
    expect(firstCellWidth()).toBe(`${100 / 3}%`);
  });

  it("keeps cols below the first breakpoint that has a value", () => {
    resize(700);
    renderThemed(
      <Grid cols={2} mdCols={4} testID="grid">
        <Text>One</Text>
      </Grid>,
    );
    expect(firstCellWidth()).toBe("50%");
  });

  it("follows the window when it resizes", () => {
    resize(375);
    renderGrid();
    expect(firstCellWidth()).toBe("100%");
    resize(1100);
    expect(firstCellWidth()).toBe("25%");
  });

  it("keeps the base columns when no breakpoint prop is set", () => {
    resize(1440);
    renderThemed(
      <Grid cols={3} testID="grid">
        <Text>One</Text>
      </Grid>,
    );
    expect(firstCellWidth()).toBe(`${100 / 3}%`);
  });
});

import { fireEvent, screen } from "@testing-library/react-native";
import { lightTheme } from "@vllnt/ui-core";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  type TabsVariant,
} from "../components/molecules/tabs/tabs";

import { renderThemed, styleOf } from "./test-utils";

const { colors, radius, spacing } = lightTheme;

function renderTabs(variant?: TabsVariant) {
  return renderThemed(
    <Tabs defaultValue="overview" variant={variant}>
      <TabsList accessibilityLabel="Account sections" testID="list">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
    </Tabs>,
  );
}

function listOf(): ReturnType<typeof styleOf> {
  return styleOf(screen.getByTestId("list"), "contentContainerStyle");
}

function triggerOf(name: string) {
  return styleOf(screen.getByRole("tab", { name }));
}

describe.each([[undefined], ["underline"]] as const)(
  "Tabs variant %s",
  (variant) => {
    it("draws a hairline under the list and a primary bar under the selected tab", () => {
      renderTabs(variant);
      expect(listOf()).toMatchObject({
        borderBottomColor: colors.border,
        borderBottomWidth: 1,
      });
      expect(triggerOf("Overview")).toMatchObject({
        borderBottomColor: colors.primary,
        borderBottomWidth: 2,
      });
      expect(triggerOf("Activity")).toMatchObject({
        borderBottomColor: "transparent",
        borderBottomWidth: 2,
      });
    });
  },
);

describe("Tabs variant pill", () => {
  it("fills the selected tab with the secondary colour and spaces the tabs", () => {
    renderTabs("pill");
    expect(listOf()).toMatchObject({ gap: spacing[1] });
    expect(listOf().borderBottomWidth).toBeUndefined();
    expect(triggerOf("Overview")).toMatchObject({
      backgroundColor: colors.secondary,
      borderRadius: radius.full,
    });
    expect(triggerOf("Overview").borderBottomWidth).toBeUndefined();
    expect(triggerOf("Activity").backgroundColor).toBe("transparent");
  });

  it("keeps the fill with the selection when another tab is chosen", () => {
    renderTabs("pill");
    fireEvent.press(screen.getByRole("tab", { name: "Activity" }));
    expect(triggerOf("Activity").backgroundColor).toBe(colors.secondary);
    expect(triggerOf("Overview").backgroundColor).toBe("transparent");
  });

  it("keeps the foreground label on the fill and mutes the rest", () => {
    renderTabs("pill");
    expect(styleOf(screen.getByText("Overview")).color).toBe(colors.foreground);
    expect(styleOf(screen.getByText("Activity")).color).toBe(
      colors.mutedForeground,
    );
  });
});

describe("Tabs variant link", () => {
  it("draws no border or fill and underlines the selected label", () => {
    renderTabs("link");
    expect(listOf().borderBottomWidth).toBeUndefined();
    expect(triggerOf("Overview").borderBottomWidth).toBeUndefined();
    expect(triggerOf("Overview").backgroundColor).toBeUndefined();
    expect(styleOf(screen.getByText("Overview"))).toMatchObject({
      color: colors.foreground,
      textDecorationLine: "underline",
    });
    expect(styleOf(screen.getByText("Activity"))).toMatchObject({
      color: colors.mutedForeground,
    });
    expect(
      styleOf(screen.getByText("Activity")).textDecorationLine,
    ).toBeUndefined();
  });

  it("moves the underline with the selection", () => {
    renderTabs("link");
    fireEvent.press(screen.getByRole("tab", { name: "Activity" }));
    expect(styleOf(screen.getByText("Activity")).textDecorationLine).toBe(
      "underline",
    );
    expect(
      styleOf(screen.getByText("Overview")).textDecorationLine,
    ).toBeUndefined();
  });
});

describe("Tabs variant semantics", () => {
  it.each([["link"], ["pill"], ["underline"]] as const)(
    "keeps the tab role and selected state in the %s look",
    (variant) => {
      renderTabs(variant);
      expect(
        screen.getByRole("tab", { name: "Overview", selected: true }),
      ).toBeOnTheScreen();
      expect(
        screen.getByRole("tab", { name: "Activity", selected: false }),
      ).toBeOnTheScreen();
    },
  );

  it("draws a list outside Tabs in the underline look, as web does", () => {
    renderThemed(
      <TabsList accessibilityLabel="Loose" testID="list">
        {null}
      </TabsList>,
    );
    expect(listOf()).toMatchObject({ borderBottomWidth: 1 });
  });
});

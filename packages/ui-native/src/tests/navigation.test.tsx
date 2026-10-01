import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { Text as NativeText, View } from "react-native";

import { AnimatedTabs } from "../components/animated-tabs/animated-tabs";
import { BottomBar } from "../components/bottom-bar/bottom-bar";
import { Breadcrumb } from "../components/breadcrumb/breadcrumb";
import { HorizontalScrollRow } from "../components/horizontal-scroll-row/horizontal-scroll-row";
import { Menubar } from "../components/menubar/menubar";
import { NavigationMenu } from "../components/navigation-menu/navigation-menu";
import { Pagination } from "../components/pagination/pagination";
import { Sidebar } from "../components/sidebar/sidebar";
import {
  SidebarProvider,
  useSidebar,
} from "../components/sidebar-provider/sidebar-provider";
import { SidebarToggle } from "../components/sidebar-toggle/sidebar-toggle";
import { StepNavigation } from "../components/step-navigation/step-navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/tabs/tabs";
import { TopBar } from "../components/top-bar/top-bar";
import { ViewSwitcher } from "../components/view-switcher/view-switcher";
import { WorkspaceSwitcher } from "../components/workspace-switcher/workspace-switcher";
import type { LinkingService } from "../primitives/platform-services";

import {
  codePreviewTabs,
  gridListOptions,
  pressTwice,
  reducedMotion,
} from "./test-utils";

const linking: LinkingService = {
  openUrl: jest.fn(async () => ({ status: "opened" as const })),
};

beforeEach(() => {
  jest.clearAllMocks();
});

it("supports uncontrolled tabs, selected semantics, stable ids, and panels", () => {
  const onValueChange = jest.fn();
  render(
    <Tabs defaultValue="overview" id="account" onValueChange={onValueChange}>
      <TabsList accessibilityLabel="Account sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <NativeText>Overview panel</NativeText>
      </TabsContent>
      <TabsContent value="activity">
        <NativeText>Activity panel</NativeText>
      </TabsContent>
    </Tabs>,
  );
  expect(screen.getByRole("tab", { name: "Overview" })).toHaveProp(
    "accessibilityState",
    { disabled: false, selected: true },
  );
  expect(screen.getByRole("tab", { name: "Overview" })).toHaveProp(
    "id",
    "account-tab-overview",
  );
  expect(screen.getByText("Overview panel")).toBeOnTheScreen();

  fireEvent.press(screen.getByRole("tab", { name: "Activity" }));

  expect(onValueChange).toHaveBeenCalledWith("activity");
  expect(screen.getByRole("tab", { name: "Activity" })).toHaveProp(
    "accessibilityState",
    { disabled: false, selected: true },
  );
  expect(screen.getByText("Activity panel")).toBeOnTheScreen();
  expect(screen.queryByText("Overview panel")).toBeNull();
});

it("keeps controlled tabs and view switchers caller-owned", () => {
  const onTabChange = jest.fn();
  const onViewChange = jest.fn();
  render(
    <View>
      <Tabs onValueChange={onTabChange} value="first">
        <TabsList>
          <TabsTrigger value="first">First</TabsTrigger>
          <TabsTrigger value="second">Second</TabsTrigger>
        </TabsList>
      </Tabs>
      <ViewSwitcher
        onValueChange={onViewChange}
        options={gridListOptions}
        value="grid"
      />
    </View>,
  );
  fireEvent.press(screen.getByRole("tab", { name: "Second" }));
  fireEvent.press(screen.getByRole("tab", { name: "List" }));

  expect(onTabChange).toHaveBeenCalledWith("second");
  expect(onViewChange).toHaveBeenCalledWith("list");
  expect(screen.getByRole("tab", { name: "First" })).toHaveProp(
    "accessibilityState",
    { disabled: false, selected: true },
  );
  expect(screen.getByRole("tab", { name: "Grid" })).toHaveProp(
    "accessibilityState",
    { disabled: undefined, selected: true },
  );
  expect(screen.getByText("Grid panel")).toBeOnTheScreen();
  expect(screen.queryByText("List panel")).toBeNull();
});

it("selects animated tabs and workspace radios without routing", () => {
  const onAnimatedChange = jest.fn();
  const onWorkspaceChange = jest.fn();
  render(
    <View>
      <AnimatedTabs
        defaultValue="code"
        onValueChange={onAnimatedChange}
        reducedMotionService={reducedMotion(true)}
        tabs={codePreviewTabs}
      />
      <WorkspaceSwitcher
        defaultValue="alpha"
        onValueChange={onWorkspaceChange}
        workspaces={[
          { description: "Alpha workspace", id: "alpha", label: "Alpha" },
          { description: "Beta workspace", id: "beta", label: "Beta" },
        ]}
      />
    </View>,
  );
  fireEvent.press(screen.getByRole("tab", { name: "Preview" }));
  fireEvent.press(screen.getByRole("radio", { name: "Beta" }));

  expect(onAnimatedChange).toHaveBeenCalledWith("preview");
  expect(screen.getByText("Preview panel")).toBeOnTheScreen();
  expect(onWorkspaceChange).toHaveBeenCalledWith("beta");
  expect(screen.getByRole("radio", { name: "Beta" })).toHaveProp(
    "accessibilityState",
    { checked: true, disabled: undefined },
  );
  expect(screen.getByText("Beta workspace")).toBeOnTheScreen();
});

it("exposes current navigation and invokes callback and link adapters", () => {
  const onNavigate = jest.fn();
  render(
    <View>
      <NavigationMenu
        currentId="home"
        items={[
          { href: "app://home", id: "home", label: "Home" },
          {
            id: "products",
            label: "Products",
            panel: <NativeText>Product links</NativeText>,
          },
        ]}
        linking={linking}
        onNavigate={onNavigate}
      />
      <Breadcrumb
        items={[
          { href: "app://home", id: "home", label: "Home" },
          { id: "settings", label: "Settings" },
        ]}
        linking={linking}
        onNavigate={onNavigate}
      />
    </View>,
  );
  expect(screen.getAllByRole("link", { name: "Home" })[0]).toHaveProp(
    "accessibilityState",
    { disabled: undefined, expanded: undefined, selected: true },
  );
  fireEvent.press(screen.getAllByRole("link", { name: "Home" })[0]);
  fireEvent.press(screen.getByRole("button", { name: "Products" }));

  expect(onNavigate).toHaveBeenCalled();
  expect(linking.openUrl).toHaveBeenCalledWith("app://home");
  expect(screen.getByText("Product links")).toBeOnTheScreen();
  const currentCrumb = screen.getByLabelText("Settings");
  expect(currentCrumb).toHaveProp("accessible", true);
  expect(currentCrumb).toHaveProp("accessibilityValue", {
    text: "current page",
  });
  expect(currentCrumb).toHaveProp("accessibilityHint", "Breadcrumb");
});

function SidebarState() {
  const { open, presentation } = useSidebar();
  return (
    <NativeText>{`${open ? "open" : "closed"}:${presentation}`}</NativeText>
  );
}
SidebarState.displayName = "SidebarState";

it("models sidebar context, compact presentation, and toggle state", () => {
  render(
    <SidebarProvider defaultOpen presentation="compact">
      <SidebarToggle />
      <SidebarState />
      <Sidebar
        currentId="dashboard"
        sections={[
          { id: "main", items: [{ id: "dashboard", label: "Dashboard" }] },
        ]}
      />
    </SidebarProvider>,
  );
  expect(screen.getByText("open:compact")).toBeOnTheScreen();
  expect(screen.getByRole("button", { name: "Dashboard" })).toHaveProp(
    "accessibilityState",
    { disabled: undefined, selected: true },
  );
  fireEvent.press(screen.getByRole("button", { name: "Close sidebar" }));
  expect(screen.getByText("closed:compact")).toBeOnTheScreen();
  expect(screen.queryByRole("button", { name: "Dashboard" })).toBeNull();
});

it("applies repeated sidebar toggles from the latest uncontrolled value", () => {
  const onOpenChange = jest.fn();
  render(
    <SidebarProvider onOpenChange={onOpenChange}>
      <SidebarToggle accessibilityLabel="Sidebar" />
      <SidebarState />
    </SidebarProvider>,
  );
  pressTwice("Sidebar");

  expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  expect(screen.getByText("closed:expanded")).toBeOnTheScreen();
});

it("keeps controlled sidebar toggles derived from the owner value", () => {
  const onOpenChange = jest.fn();
  render(
    <SidebarProvider onOpenChange={onOpenChange} open={false}>
      <SidebarToggle accessibilityLabel="Sidebar" />
    </SidebarProvider>,
  );
  pressTwice("Sidebar");

  expect(onOpenChange.mock.calls).toEqual([[true], [true]]);
  expect(screen.getByRole("button", { name: "Sidebar" })).toHaveProp(
    "accessibilityState",
    expect.objectContaining({ expanded: false }),
  );
});

it("paginates with current and disabled semantics", () => {
  const onPageChange = jest.fn();
  render(
    <Pagination
      currentPage={1}
      getHref={(page) => `app://pages/${page}`}
      linking={linking}
      onPageChange={onPageChange}
      totalPages={3}
    />,
  );
  expect(screen.getByRole("link", { name: "Previous page" })).toHaveProp(
    "accessibilityState",
    { disabled: true, selected: false },
  );
  const currentPage = screen.getByRole("link", { name: "Page 1" });
  expect(currentPage).toHaveProp("accessibilityState", {
    disabled: false,
    selected: true,
  });
  expect(currentPage).toHaveProp("accessibilityValue", {
    text: "current page",
  });
  expect(currentPage).toHaveProp("accessibilityHint", "Pagination");
  fireEvent.press(screen.getByRole("link", { name: "Page 2" }));
  expect(onPageChange).toHaveBeenCalledWith(2);
  expect(linking.openUrl).toHaveBeenCalledWith("app://pages/2");
});

it("invokes menubar commands and step callbacks", () => {
  const onItemSelect = jest.fn();
  const onNext = jest.fn();
  const onPrevious = jest.fn();
  render(
    <View>
      <Menubar
        linking={linking}
        menus={[
          {
            id: "file",
            items: [{ href: "app://new", id: "new", label: "New file" }],
            label: "File",
          },
        ]}
        onItemSelect={onItemSelect}
      />
      <StepNavigation
        canNext
        canPrevious={false}
        currentStep={1}
        onNext={onNext}
        onPrevious={onPrevious}
        totalSteps={3}
      />
    </View>,
  );
  fireEvent.press(screen.getByRole("button", { name: "File" }));
  fireEvent.press(screen.getByRole("link", { name: "New file" }));
  fireEvent.press(screen.getByRole("button", { name: "Next step" }));
  fireEvent.press(screen.getByRole("button", { name: "Previous step" }));

  expect(onItemSelect).toHaveBeenCalledTimes(1);
  expect(linking.openUrl).toHaveBeenCalledWith("app://new");
  expect(onNext).toHaveBeenCalledTimes(1);
  expect(onPrevious).not.toHaveBeenCalled();
});

it("uses safe-area wrappers and an accessible horizontal ScrollView", () => {
  const safeArea = jest.fn((content: ReactNode) => (
    <View testID="safe-area">{content}</View>
  ));
  render(
    <View>
      <TopBar safeArea={safeArea} title="Project" />
      <BottomBar
        center={<NativeText>Actions</NativeText>}
        safeArea={safeArea}
      />
      <HorizontalScrollRow description="Recent projects" title="Workspaces">
        <View accessibilityRole="text">
          <NativeText>Alpha</NativeText>
        </View>
        <View accessibilityRole="text">
          <NativeText>Beta</NativeText>
        </View>
      </HorizontalScrollRow>
    </View>,
  );
  expect(safeArea).toHaveBeenCalledTimes(2);
  expect(screen.getAllByTestId("safe-area")).toHaveLength(2);
  expect(screen.getByRole("header", { name: "Workspaces" })).toBeOnTheScreen();
  const row = screen.UNSAFE_getByProps({ accessibilityRole: "list" });
  expect(row.props.accessibilityLabel).toBeUndefined();
  expect(row.props.accessible).not.toBe(true);
  expect(row.props.horizontal).toBe(true);
  fireEvent.scroll(row, { nativeEvent: { contentOffset: { x: 120, y: 0 } } });
  expect(screen.getByText("Alpha")).toBeOnTheScreen();
});

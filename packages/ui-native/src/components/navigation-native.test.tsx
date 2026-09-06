import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { Text as NativeText, View } from "react-native";

import type { LinkingService } from "../primitives/platform-services";

import { AnimatedTabs } from "./animated-tabs/animated-tabs";
import { BottomBar } from "./bottom-bar/bottom-bar";
import { Breadcrumb } from "./breadcrumb/breadcrumb";
import { HorizontalScrollRow } from "./horizontal-scroll-row/horizontal-scroll-row";
import { Menubar } from "./menubar/menubar";
import { NavigationMenu } from "./navigation-menu/navigation-menu";
import { Pagination } from "./pagination/pagination";
import { Sidebar } from "./sidebar/sidebar";
import {
  SidebarProvider,
  useSidebar,
} from "./sidebar-provider/sidebar-provider";
import { SidebarToggle } from "./sidebar-toggle/sidebar-toggle";
import { StepNavigation } from "./step-navigation/step-navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs/tabs";
import { TopBar } from "./top-bar/top-bar";
import { ViewSwitcher } from "./view-switcher/view-switcher";
import { WorkspaceSwitcher } from "./workspace-switcher/workspace-switcher";

const linking: LinkingService = {
  openUrl: jest.fn(async () => ({ status: "opened" as const })),
};

describe("native navigation components", () => {
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
          options={[
            {
              key: "grid",
              label: "Grid",
              panel: <NativeText>Grid panel</NativeText>,
            },
            {
              key: "list",
              label: "List",
              panel: <NativeText>List panel</NativeText>,
            },
          ]}
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
          reducedMotionService={{
            addEventListener: () => ({ remove: jest.fn() }),
            isReduceMotionEnabled: async () => true,
          }}
          tabs={[
            {
              label: "Code",
              panel: <NativeText>Code panel</NativeText>,
              value: "code",
            },
            {
              label: "Preview",
              panel: <NativeText>Preview panel</NativeText>,
              value: "preview",
            },
          ]}
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
      { checked: true, disabled: undefined, selected: true },
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
    expect(screen.getByLabelText("Settings")).toHaveProp("accessibilityState", {
      selected: true,
    });
  });

  it("models sidebar context, compact presentation, and toggle state", () => {
    function SidebarState() {
      const { open, presentation } = useSidebar();
      return (
        <NativeText>{`${open ? "open" : "closed"}:${presentation}`}</NativeText>
      );
    }

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
    expect(
      screen.getByRole("link", { name: "Page 1, current page" }),
    ).toHaveProp("accessibilityState", { disabled: false, selected: true });
    fireEvent.press(screen.getByRole("link", { name: "2" }));
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
    const row = screen.UNSAFE_getByProps({
      accessibilityLabel: "Workspaces",
      accessibilityRole: "list",
    });
    expect(row.props.accessible).not.toBe(true);
    expect(row.props.horizontal).toBe(true);
    fireEvent.scroll(row, { nativeEvent: { contentOffset: { x: 120, y: 0 } } });
    expect(screen.getByText("Alpha")).toBeOnTheScreen();
  });
});

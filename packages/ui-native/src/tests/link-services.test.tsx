import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Linking, View } from "react-native";

import { AISourceCitation } from "../components/ai-source-citation/ai-source-citation";
import { Breadcrumb } from "../components/breadcrumb/breadcrumb";
import { Menubar } from "../components/menubar/menubar";
import { NavigationMenu } from "../components/navigation-menu/navigation-menu";
import { Pagination } from "../components/pagination/pagination";
import { Sidebar } from "../components/sidebar/sidebar";
import { SidebarProvider } from "../components/sidebar-provider/sidebar-provider";
import type { LinkingService } from "../primitives/platform-services";

describe("reviewed native links", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("opens every enabled href with the default native linking adapter", async () => {
    const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(true);

    render(
      <View>
        <Breadcrumb
          items={[
            {
              href: "app://breadcrumb",
              id: "breadcrumb-link",
              label: "Breadcrumb destination",
            },
            { id: "breadcrumb-current", label: "Breadcrumb current" },
          ]}
        />
        <SidebarProvider defaultOpen>
          <Sidebar
            sections={[
              {
                id: "sidebar-section",
                items: [
                  {
                    href: "app://sidebar",
                    id: "sidebar-link",
                    label: "Sidebar destination",
                  },
                ],
              },
            ]}
          />
        </SidebarProvider>
        <NavigationMenu
          items={[
            {
              href: "app://navigation-menu",
              id: "navigation-menu-link",
              label: "Navigation menu destination",
            },
          ]}
        />
        <Pagination
          currentPage={1}
          getHref={(page) => `app://pagination/${page}`}
          totalPages={2}
        />
        <Menubar
          menus={[
            {
              id: "review-menu",
              items: [
                {
                  href: "app://menubar",
                  id: "menubar-link",
                  label: "Menubar destination",
                },
              ],
              label: "Review menu",
            },
          ]}
        />
        <AISourceCitation
          href="https://example.com/citation"
          source="Review source"
          title="Citation destination"
        />
      </View>,
    );

    fireEvent.press(
      screen.getByRole("link", { name: "Breadcrumb destination" }),
    );
    fireEvent.press(screen.getByRole("link", { name: "Sidebar destination" }));
    fireEvent.press(
      screen.getByRole("link", { name: "Navigation menu destination" }),
    );
    fireEvent.press(screen.getByRole("link", { name: "2" }));
    fireEvent.press(screen.getByRole("button", { name: "Review menu" }));
    fireEvent.press(screen.getByRole("link", { name: "Menubar destination" }));
    fireEvent.press(
      screen.getByRole("link", {
        name: "Citation destination, Review source",
      }),
    );

    await waitFor(() => {
      expect(openURL).toHaveBeenCalledTimes(6);
    });
    expect(openURL).toHaveBeenCalledWith("app://breadcrumb");
    expect(openURL).toHaveBeenCalledWith("app://sidebar");
    expect(openURL).toHaveBeenCalledWith("app://navigation-menu");
    expect(openURL).toHaveBeenCalledWith("app://pagination/2");
    expect(openURL).toHaveBeenCalledWith("app://menubar");
    expect(openURL).toHaveBeenCalledWith("https://example.com/citation");
  });

  it("reports rejected link opens with their destination context", async () => {
    const error = new Error("Cannot open URL");
    const linking: LinkingService = {
      openUrl: jest.fn(() => Promise.reject(error)),
    };
    const breadcrumbItem = {
      href: "app://breadcrumb-error",
      id: "breadcrumb-error",
      label: "Rejected breadcrumb",
    };
    const sidebarItem = {
      href: "app://sidebar-error",
      id: "sidebar-error",
      label: "Rejected sidebar",
    };
    const navigationItem = {
      href: "app://navigation-error",
      id: "navigation-error",
      label: "Rejected navigation menu",
    };
    const menubarItem = {
      href: "app://menubar-error",
      id: "menubar-error",
      label: "Rejected menubar",
    };
    const menubarMenu = {
      id: "error-menu",
      items: [menubarItem],
      label: "Error menu",
    };
    const onBreadcrumbOpenError = jest.fn();
    const onSidebarOpenError = jest.fn();
    const onNavigationOpenError = jest.fn();
    const onPaginationOpenError = jest.fn();
    const onMenubarOpenError = jest.fn();
    const onCitationOpenError = jest.fn();
    jest.spyOn(Linking, "openURL").mockRejectedValue(error);

    render(
      <View>
        <Breadcrumb
          items={[
            breadcrumbItem,
            { id: "breadcrumb-error-current", label: "Current breadcrumb" },
          ]}
          linking={linking}
          onOpenError={onBreadcrumbOpenError}
        />
        <SidebarProvider defaultOpen>
          <Sidebar
            linking={linking}
            onOpenError={onSidebarOpenError}
            sections={[{ id: "error-section", items: [sidebarItem] }]}
          />
        </SidebarProvider>
        <NavigationMenu
          items={[navigationItem]}
          linking={linking}
          onOpenError={onNavigationOpenError}
        />
        <Pagination
          currentPage={1}
          getHref={(page) => `app://pagination-error/${page}`}
          linking={linking}
          onOpenError={onPaginationOpenError}
          totalPages={2}
        />
        <Menubar
          linking={linking}
          menus={[menubarMenu]}
          onOpenError={onMenubarOpenError}
        />
        <AISourceCitation
          href="https://example.com/citation-error"
          onOpenError={onCitationOpenError}
          source="Rejected source"
          title="Rejected citation"
        />
      </View>,
    );

    fireEvent.press(screen.getByRole("link", { name: breadcrumbItem.label }));
    fireEvent.press(screen.getByRole("link", { name: sidebarItem.label }));
    fireEvent.press(screen.getByRole("link", { name: navigationItem.label }));
    fireEvent.press(screen.getByRole("link", { name: "2" }));
    fireEvent.press(screen.getByRole("button", { name: menubarMenu.label }));
    fireEvent.press(screen.getByRole("link", { name: menubarItem.label }));
    fireEvent.press(
      screen.getByRole("link", { name: "Rejected citation, Rejected source" }),
    );

    await waitFor(() => {
      expect(onBreadcrumbOpenError).toHaveBeenCalledWith(error, breadcrumbItem);
      expect(onSidebarOpenError).toHaveBeenCalledWith(error, sidebarItem);
      expect(onNavigationOpenError).toHaveBeenCalledWith(error, navigationItem);
      expect(onPaginationOpenError).toHaveBeenCalledWith(error, 2);
      expect(onMenubarOpenError).toHaveBeenCalledWith(
        error,
        menubarItem,
        menubarMenu,
      );
      expect(onCitationOpenError).toHaveBeenCalledWith(
        error,
        "https://example.com/citation-error",
      );
    });
  });
});

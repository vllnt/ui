import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
} from "./navigation-menu";

type Props = Partial<React.ComponentProps<typeof NavigationMenu>>;
type ContentProps = Partial<React.ComponentProps<typeof NavigationMenuContent>>;
type LinkProps = Partial<React.ComponentProps<typeof NavigationMenuLink>>;

const Menu = ({
  content,
  link,
  ...props
}: Props & { content?: ContentProps; link?: LinkProps }) => (
  <NavigationMenu {...props}>
    <NavigationMenuList>
      <NavigationMenuItem value="guides">
        <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
        <NavigationMenuContent {...content}>
          <NavigationMenuLink href="#install" {...link}>
            Installation
          </NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem value="components">
        <NavigationMenuTrigger>Components</NavigationMenuTrigger>
        <NavigationMenuContent>
          <NavigationMenuLink href="#button">Button</NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink active href="#changelog">
          Changelog
        </NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
);

const trigger = (name: string) => screen.getByRole("button", { name });

afterEach(() => {
  vi.useRealTimers();
});

describe("NavigationMenu", () => {
  it("renders a visible root that merges className and forwards ref", () => {
    const ref = { current: null };
    const { container } = render(
      <NavigationMenu className="custom-class" ref={ref} />,
    );
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
    expect(container.firstChild).toHaveClass("max-w-max");
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("is a navigation landmark named Main, like Radix", () => {
    render(<Menu />);
    expect(screen.getByRole("navigation", { name: "Main" })).toHaveAttribute(
      "data-orientation",
      "horizontal",
    );
  });

  it("keeps every panel closed by default", () => {
    render(<Menu />);
    expect(trigger("Guides")).toHaveAttribute("data-state", "closed");
    expect(trigger("Guides")).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Installation")).not.toBeInTheDocument();
  });

  it("styles a link like a trigger with navigationMenuTriggerStyle", () => {
    expect(navigationMenuTriggerStyle()).toContain("h-10");
    expect(navigationMenuTriggerStyle()).toContain(
      "data-[state=open]:bg-accent/50",
    );
  });
});

describe("NavigationMenu panels", () => {
  it("opens a panel on press, with the Radix state attributes", () => {
    const onValueChange = vi.fn();
    render(<Menu onValueChange={onValueChange} />);

    fireEvent.click(trigger("Guides"));

    expect(onValueChange).toHaveBeenLastCalledWith("guides");
    expect(trigger("Guides")).toHaveAttribute("data-state", "open");
    expect(trigger("Guides")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Installation")).toBeInTheDocument();
    const content = screen
      .getByText("Installation")
      .closest("[data-slot='navigation-menu-content']");
    expect(content).toHaveAttribute("data-state", "open");
    expect(content).toHaveAttribute("data-orientation", "horizontal");
    const viewport = content?.closest("[data-slot='navigation-menu-viewport']");
    expect(viewport).toHaveAttribute("data-state", "open");
    expect(viewport?.className).toContain(
      "[--radix-navigation-menu-viewport-height:calc(var(--viewport-height)_-_2px)]",
    );
  });

  it("reports an empty string once the panel closes", () => {
    const onValueChange = vi.fn();
    render(<Menu defaultValue="guides" onValueChange={onValueChange} />);
    expect(trigger("Guides")).toHaveAttribute("data-state", "open");

    fireEvent.click(trigger("Guides"));

    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect(trigger("Guides")).toHaveAttribute("data-state", "closed");
  });

  it("follows a controlled value, where an empty string means closed", () => {
    const { rerender } = render(<Menu value="" />);
    expect(trigger("Guides")).toHaveAttribute("data-state", "closed");

    rerender(<Menu value="components" />);

    expect(trigger("Components")).toHaveAttribute("data-state", "open");
    expect(screen.getByText("Button")).toBeInTheDocument();
  });

  it("switches panels when another trigger is pressed", () => {
    render(<Menu defaultValue="guides" />);

    fireEvent.click(trigger("Components"));

    expect(trigger("Components")).toHaveAttribute("data-state", "open");
    expect(trigger("Guides")).toHaveAttribute("data-state", "closed");
  });

  it("opens on hover after delayDuration", () => {
    vi.useFakeTimers();
    render(<Menu delayDuration={200} />);
    const guides = trigger("Guides");

    act(() => {
      fireEvent.pointerEnter(guides, { pointerType: "mouse" });
      fireEvent.pointerMove(guides, { pointerType: "mouse" });
      vi.advanceTimersByTime(190);
    });
    expect(guides).toHaveAttribute("data-state", "closed");

    act(() => {
      vi.advanceTimersByTime(20);
    });
    expect(guides).toHaveAttribute("data-state", "open");
  });

  it("closes on Escape, unless onEscapeKeyDown calls preventDefault", () => {
    const onEscapeKeyDown = vi.fn((event: KeyboardEvent) => {
      event.preventDefault();
    });
    const { rerender } = render(
      <Menu content={{ onEscapeKeyDown }} defaultValue="guides" />,
    );
    fireEvent.keyDown(screen.getByText("Installation"), { key: "Escape" });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    expect(trigger("Guides")).toHaveAttribute("data-state", "open");

    rerender(<Menu defaultValue="guides" />);
    fireEvent.keyDown(screen.getByText("Installation"), { key: "Escape" });
    expect(trigger("Guides")).toHaveAttribute("data-state", "closed");
  });

  it("keeps a forceMount panel in the page while closed", () => {
    render(<Menu content={{ forceMount: true }} />);
    expect(trigger("Guides")).toHaveAttribute("data-state", "closed");
    expect(
      screen.getByText("Installation", { selector: "a" }),
    ).toBeInTheDocument();
  });
});

describe("NavigationMenuLink", () => {
  it("marks the active link, like Radix", () => {
    render(<Menu />);
    const link = screen.getByRole("link", { name: "Changelog" });
    expect(link).toHaveAttribute("data-active", "");
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("closes the menu on press and runs onSelect and onClick", () => {
    const onSelect = vi.fn();
    const onClick = vi.fn((event: React.MouseEvent) => {
      event.preventDefault();
    });
    render(<Menu defaultValue="guides" link={{ onClick, onSelect }} />);

    fireEvent.click(screen.getByRole("link", { name: "Installation" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(trigger("Guides")).toHaveAttribute("data-state", "closed");
  });

  it("keeps the menu open when onSelect calls preventDefault", () => {
    render(
      <Menu
        defaultValue="guides"
        link={{
          onClick: (event) => {
            event.preventDefault();
          },
          onSelect: (event) => {
            event.preventDefault();
          },
        }}
      />,
    );

    fireEvent.click(screen.getByRole("link", { name: "Installation" }));

    expect(trigger("Guides")).toHaveAttribute("data-state", "open");
  });

  it("renders the child as the link with asChild", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <button type="button">Docs</button>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(screen.getByRole("button", { name: "Docs" })).toBeInTheDocument();
  });
});

describe("NavigationMenu indicator and viewport", () => {
  it("shows the indicator state with the Radix values", () => {
    render(
      <NavigationMenu defaultValue="guides">
        <NavigationMenuList>
          <NavigationMenuItem value="guides">
            <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
            <NavigationMenuContent>Panel</NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuIndicator data-testid="indicator" />
      </NavigationMenu>,
    );
    expect(screen.getByTestId("indicator")).toHaveAttribute(
      "data-state",
      "visible",
    );

    fireEvent.click(trigger("Guides"));

    expect(screen.getByTestId("indicator")).toHaveAttribute(
      "data-state",
      "hidden",
    );
  });

  it("forwards the viewport ref and className", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <NavigationMenu defaultValue="guides">
        <NavigationMenuList>
          <NavigationMenuItem value="guides">
            <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
            <NavigationMenuContent>Panel</NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport className="extra" ref={ref} />
      </NavigationMenu>,
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current).toHaveClass("extra");
  });
});

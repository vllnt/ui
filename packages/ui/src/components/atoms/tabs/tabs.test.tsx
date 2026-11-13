import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { TabsVariant } from "./tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

function renderTabs(onValueChange?: (value: string) => void) {
  render(
    <Tabs defaultValue="a" onValueChange={onValueChange}>
      <TabsList>
        <TabsTrigger value="a">A</TabsTrigger>
        <TabsTrigger value="b">B</TabsTrigger>
      </TabsList>
      <TabsContent value="a">Panel A</TabsContent>
      <TabsContent value="b">Panel B</TabsContent>
    </Tabs>,
  );
}

describe("Tabs", () => {
  it("renders the default panel only", () => {
    renderTabs();
    expect(screen.getByText("Panel A")).toBeInTheDocument();
    expect(screen.queryByText("Panel B")).not.toBeInTheDocument();
  });

  it("switches the active panel when a trigger is clicked", () => {
    renderTabs();
    fireEvent.click(screen.getByText("B"));
    expect(screen.getByText("Panel B")).toBeInTheDocument();
    expect(screen.queryByText("Panel A")).not.toBeInTheDocument();
  });

  it("invokes onValueChange when a trigger is clicked", () => {
    const onValueChange = vi.fn();
    renderTabs(onValueChange);
    fireEvent.click(screen.getByText("B"));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("propagates aria-selected to the active trigger", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByText("A")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("B")).toHaveAttribute("aria-selected", "false");
  });

  it("forwards tab stops and panel relationships", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="Choose a source implementation">
          <TabsTrigger
            aria-controls="panel-a"
            id="tab-a"
            tabIndex={0}
            value="a"
          >
            A
          </TabsTrigger>
          <TabsTrigger
            aria-controls="panel-b"
            id="tab-b"
            tabIndex={-1}
            value="b"
          >
            B
          </TabsTrigger>
        </TabsList>
        <TabsContent aria-labelledby="tab-a" id="panel-a" value="a">
          Panel A
        </TabsContent>
        <TabsContent aria-labelledby="tab-b" id="panel-b" value="b">
          Panel B
        </TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tablist")).toHaveAccessibleName(
      "Choose a source implementation",
    );
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute(
      "tabindex",
      "0",
    );
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
    expect(screen.getByRole("tabpanel")).toHaveAttribute(
      "aria-labelledby",
      "tab-a",
    );
  });
});

const THREE_TABS_DEFAULT: { defaultValue?: string } = { defaultValue: "a" };

describe("Tabs keyboard (WAI-ARIA APG tabs pattern)", () => {
  function renderThree(props: { defaultValue?: string } = THREE_TABS_DEFAULT) {
    render(
      <Tabs {...props}>
        <TabsList aria-label="Letters">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
          <TabsTrigger value="c">C</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
        <TabsContent value="c">Panel C</TabsContent>
      </Tabs>,
    );
    return {
      a: screen.getByRole("tab", { name: "A" }),
      b: screen.getByRole("tab", { name: "B" }),
      c: screen.getByRole("tab", { name: "C" }),
    };
  }

  it("keeps a single tab stop on the active tab", () => {
    const { a, b, c } = renderThree();
    expect(a).toHaveAttribute("tabindex", "0");
    expect(b).toHaveAttribute("tabindex", "-1");
    expect(c).toHaveAttribute("tabindex", "-1");
  });

  it("makes the first tab the tab stop when no tab is active", () => {
    const { a, b } = renderThree({});
    expect(a).toHaveAttribute("tabindex", "0");
    expect(b).toHaveAttribute("tabindex", "-1");
  });

  it("moves focus and activates with ArrowRight / ArrowLeft, wrapping", () => {
    const { a, b, c } = renderThree();
    a.focus();
    fireEvent.keyDown(a, { key: "ArrowRight" });
    expect(b).toHaveFocus();
    expect(screen.getByText("Panel B")).toBeInTheDocument();
    expect(b).toHaveAttribute("tabindex", "0");
    expect(a).toHaveAttribute("tabindex", "-1");
    fireEvent.keyDown(b, { key: "ArrowLeft" });
    fireEvent.keyDown(a, { key: "ArrowLeft" });
    expect(c).toHaveFocus();
    expect(screen.getByText("Panel C")).toBeInTheDocument();
  });

  it("moves to the first and last tab with Home / End", () => {
    const { a, b, c } = renderThree({ defaultValue: "b" });
    b.focus();
    fireEvent.keyDown(b, { key: "End" });
    expect(c).toHaveFocus();
    fireEvent.keyDown(c, { key: "Home" });
    expect(a).toHaveFocus();
    expect(screen.getByText("Panel A")).toBeInTheDocument();
  });

  it("links the active tab and its panel with generated ids", () => {
    const { a } = renderThree();
    const panel = screen.getByRole("tabpanel");
    expect(a.id).not.toBe("");
    expect(panel.id).not.toBe("");
    expect(a).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", a.id);
    expect(panel).toHaveAttribute("tabindex", "0");
  });

  it("never points aria-controls at a panel that is not rendered", () => {
    const { b } = renderThree();
    expect(b).not.toHaveAttribute("aria-controls");
  });

  it("defers to a consumer onKeyDown that handles the key", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList
          onKeyDown={(event) => {
            event.preventDefault();
          }}
        >
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    const a = screen.getByRole("tab", { name: "A" });
    a.focus();
    fireEvent.keyDown(a, { key: "ArrowRight" });
    expect(a).toHaveFocus();
  });
});

describe("TabsContent tab stop (APG tabs)", () => {
  it("is a tab stop only when it has no focusable content", async () => {
    const { rerender } = render(
      <Tabs defaultValue="a">
        <TabsList aria-label="Letters">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Plain text</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tabpanel")).toHaveAttribute("tabindex", "0");
    rerender(
      <Tabs defaultValue="a">
        <TabsList aria-label="Letters">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">
          <button type="button">Action</button>
        </TabsContent>
      </Tabs>,
    );
    await waitFor(() => {
      expect(screen.getByRole("tabpanel")).not.toHaveAttribute("tabindex");
    });
  });
});

function renderVariant(variant?: TabsVariant) {
  const view = render(
    <Tabs defaultValue="a" variant={variant}>
      <TabsList aria-label="Letters">
        <TabsTrigger value="a">A</TabsTrigger>
        <TabsTrigger value="b">B</TabsTrigger>
      </TabsList>
      <TabsContent value="a">Panel A</TabsContent>
      <TabsContent value="b">Panel B</TabsContent>
    </Tabs>,
  );
  return {
    a: screen.getByRole("tab", { name: "A" }),
    b: screen.getByRole("tab", { name: "B" }),
    list: screen.getByRole("tablist"),
    unmount: view.unmount,
  };
}

const FOCUS_RING_CLASSES = [
  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-inset",
  "focus-visible:ring-ring",
];

describe("Tabs roles and aria state", () => {
  it("exposes the tablist, tab and tabpanel roles", () => {
    renderVariant();
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
  });

  it("moves aria-selected, data-state and the panel with the active tab", () => {
    const { a, b } = renderVariant();
    expect(a).toHaveAttribute("aria-selected", "true");
    expect(a).toHaveAttribute("data-state", "active");
    expect(b).toHaveAttribute("aria-selected", "false");
    expect(b).toHaveAttribute("data-state", "inactive");
    fireEvent.click(b);
    expect(a).toHaveAttribute("aria-selected", "false");
    expect(a).toHaveAttribute("data-state", "inactive");
    expect(b).toHaveAttribute("aria-selected", "true");
    expect(b).toHaveAttribute("data-state", "active");
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveTextContent("Panel B");
    expect(panel).toHaveAttribute("aria-labelledby", b.id);
    expect(b).toHaveAttribute("aria-controls", panel.id);
  });

  it("follows a controlled value", () => {
    const { rerender } = render(
      <Tabs value="a">
        <TabsList aria-label="Letters">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    rerender(
      <Tabs value="b">
        <TabsList aria-label="Letters">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel B");
  });

  it("selects no tab and renders no panel when the value matches nothing", () => {
    render(
      <Tabs defaultValue="missing">
        <TabsList aria-label="Letters">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
      </Tabs>,
    );
    screen.getAllByRole("tab").forEach((tab) => {
      expect(tab).toHaveAttribute("aria-selected", "false");
      expect(tab).toHaveAttribute("data-state", "inactive");
    });
    expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
  });

  it("renders an empty tablist without tabs or panels", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="Empty">{null}</TabsList>
      </Tabs>,
    );
    expect(screen.getByRole("tablist")).toBeEmptyDOMElement();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
  });

  it("throws when a trigger is used outside Tabs", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {
      /* React logs the thrown error; keep the test output clean */
    });
    expect(() => render(<TabsTrigger value="a">A</TabsTrigger>)).toThrow(
      "Tab components must be used within a Tabs component",
    );
    error.mockRestore();
  });
});

describe("Tabs variant", () => {
  it("renders the underline classes by default", () => {
    const { a, b, list } = renderVariant();
    expect(list).toHaveClass("border-b", "border-border", "overflow-x-auto");
    [a, b].forEach((tab) => {
      expect(tab).toHaveClass("border-b-2", "-mb-px", "px-4", "py-2");
      expect(tab).not.toHaveClass("rounded-full");
    });
    expect(a).toHaveClass(
      "data-[state=active]:border-primary",
      "data-[state=active]:text-primary",
    );
    expect(b).toHaveClass(
      "data-[state=inactive]:border-transparent",
      "data-[state=inactive]:text-muted-foreground",
    );
  });

  it("renders the same classes for variant=underline and no variant", () => {
    const unset = renderVariant();
    const unsetClasses = [unset.a.className, unset.list.className];
    unset.unmount();
    const explicit = renderVariant("underline");
    expect([explicit.a.className, explicit.list.className]).toEqual(
      unsetClasses,
    );
  });

  it("renders the pill classes: filled active trigger, no bottom border", () => {
    const { a, b, list } = renderVariant("pill");
    expect(list).not.toHaveClass("border-b");
    expect(list).toHaveClass("gap-1");
    [a, b].forEach((tab) => {
      expect(tab).toHaveClass("rounded-full");
      expect(tab).not.toHaveClass("border-b-2");
      expect(tab).not.toHaveClass("-mb-px");
    });
    expect(a).toHaveClass(
      "data-[state=active]:bg-muted",
      "data-[state=active]:text-foreground",
    );
    expect(b).toHaveClass("data-[state=inactive]:text-muted-foreground");
  });

  it("renders the link classes: text only, underlined when active or hovered", () => {
    const { a, b, list } = renderVariant("link");
    expect(list).not.toHaveClass("border-b");
    [a, b].forEach((tab) => {
      expect(tab).toHaveClass("underline-offset-4");
      expect(tab).not.toHaveClass("border-b-2");
      expect(tab).not.toHaveClass("rounded-full");
    });
    expect(a).toHaveClass(
      "data-[state=active]:text-foreground",
      "data-[state=active]:underline",
    );
    expect(b).toHaveClass(
      "data-[state=inactive]:text-muted-foreground",
      "data-[state=inactive]:hover:underline",
    );
  });

  it.each<TabsVariant | undefined>([undefined, "underline", "pill", "link"])(
    "gives every trigger the focus-visible ring (variant %s)",
    (variant) => {
      const { a, b } = renderVariant(variant);
      [a, b].forEach((tab) => {
        expect(tab).toHaveClass(...FOCUS_RING_CLASSES);
      });
    },
  );

  it("keeps a consumer className next to the variant classes", () => {
    render(
      <Tabs defaultValue="a" variant="pill">
        <TabsList className="list-extra">
          <TabsTrigger className="trigger-extra" value="a">
            A
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByRole("tablist")).toHaveClass("list-extra", "gap-1");
    expect(screen.getByRole("tab")).toHaveClass(
      "trigger-extra",
      "rounded-full",
    );
  });

  it("falls back to the underline list outside Tabs", () => {
    render(<TabsList aria-label="Standalone">{null}</TabsList>);
    expect(screen.getByRole("tablist")).toHaveClass(
      "border-b",
      "border-border",
    );
  });

  it.each<TabsVariant>(["pill", "link"])(
    "keeps arrow, Home and End navigation (variant %s)",
    (variant) => {
      const { a, b } = renderVariant(variant);
      a.focus();
      fireEvent.keyDown(a, { key: "ArrowRight" });
      expect(b).toHaveFocus();
      expect(b).toHaveAttribute("aria-selected", "true");
      expect(a).toHaveAttribute("aria-selected", "false");
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel B");
      fireEvent.keyDown(b, { key: "Home" });
      expect(a).toHaveFocus();
      expect(a).toHaveAttribute("aria-selected", "true");
      fireEvent.keyDown(a, { key: "End" });
      expect(b).toHaveFocus();
    },
  );
});

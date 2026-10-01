import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

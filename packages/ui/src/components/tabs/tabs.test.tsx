import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

describe("Tabs", () => {
  it("renders the default panel only", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("Panel A")).toBeInTheDocument();
    expect(screen.queryByText("Panel B")).not.toBeInTheDocument();
  });

  it("switches the active panel when a trigger is clicked", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
      </Tabs>,
    );

    fireEvent.click(screen.getByText("B"));

    expect(screen.getByText("Panel B")).toBeInTheDocument();
    expect(screen.queryByText("Panel A")).not.toBeInTheDocument();
  });

  it("invokes onValueChange when a trigger is clicked", () => {
    const onValueChange = vi.fn();
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

  it("uses the tablist landmark", () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    expect(container.querySelector("[role='tablist']")).toBeInTheDocument();
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

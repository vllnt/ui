import type {
  ToggleGroupMultipleProps,
  ToggleGroupSingleProps,
} from "@radix-ui/react-toggle-group";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ToggleGroup, ToggleGroupItem } from "./toggle-group";
import {
  UnstyledToggleGroup,
  UnstyledToggleGroupItem,
} from "./unstyled-toggle-group";

const withoutClasses = (markup: string) =>
  markup.replaceAll(/ class="[^"]*"/g, "");

async function pressKey(from: HTMLElement, key: string, to: HTMLElement) {
  fireEvent.keyDown(from, { key });
  await waitFor(() => expect(to).toHaveFocus());
}

type GroupOptions =
  | (Omit<ToggleGroupSingleProps, "type"> & { type?: "single" })
  | ToggleGroupMultipleProps;

function renderGroup(options: GroupOptions = {}) {
  const items = (
    <>
      <UnstyledToggleGroupItem value="a">A</UnstyledToggleGroupItem>
      <UnstyledToggleGroupItem disabled value="b">
        B
      </UnstyledToggleGroupItem>
      <UnstyledToggleGroupItem value="c">C</UnstyledToggleGroupItem>
    </>
  );
  return render(
    options.type === "multiple" ? (
      <UnstyledToggleGroup aria-label="Format" {...options}>
        {items}
      </UnstyledToggleGroup>
    ) : (
      <UnstyledToggleGroup aria-label="Format" {...options} type="single">
        {items}
      </UnstyledToggleGroup>
    ),
  );
}

describe("UnstyledToggleGroup", () => {
  it.each([
    { defaultValue: "b", type: "single" as const },
    { defaultValue: ["a", "b"], type: "multiple" as const },
  ])(
    "renders the same markup and ARIA as ToggleGroup, minus classes ($type)",
    (props) => {
      const items = (
        Group: typeof ToggleGroup,
        Item: typeof ToggleGroupItem,
      ) => (
        <Group aria-label="Format" {...props}>
          <Item value="a">A</Item>
          <Item value="b">B</Item>
          <Item disabled value="c">
            C
          </Item>
        </Group>
      );
      const unstyled = renderToStaticMarkup(
        items(UnstyledToggleGroup, UnstyledToggleGroupItem),
      );
      expect(unstyled).not.toContain("class=");
      expect(unstyled).toBe(
        withoutClasses(
          renderToStaticMarkup(items(ToggleGroup, ToggleGroupItem)),
        ),
      );
    },
  );

  it("exposes radio semantics for type single and pressed state for multiple", () => {
    const { unmount } = renderGroup({ defaultValue: "a" });
    expect(
      screen.getByRole("radiogroup", { name: "Format" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "A" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "C" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
    unmount();
    renderGroup({ defaultValue: ["c"], type: "multiple" });
    expect(screen.getByRole("toolbar", { name: "Format" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "C" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("moves focus with the arrow keys, Home and End, skipping disabled items", async () => {
    renderGroup();
    const a = screen.getByRole("radio", { name: "A" });
    const c = screen.getByRole("radio", { name: "C" });
    a.focus();
    await pressKey(a, "ArrowRight", c);
    await pressKey(c, "ArrowRight", a);
    await pressKey(a, "End", c);
    await pressKey(c, "Home", a);
    await pressKey(a, "ArrowLeft", c);
    await pressKey(c, "ArrowUp", a);
    await pressKey(a, "ArrowDown", c);
  });

  it("is one tab stop: focusing the group lands on the pressed item", async () => {
    renderGroup({ defaultValue: "c" });
    const a = screen.getByRole("radio", { name: "A" });
    const c = screen.getByRole("radio", { name: "C" });
    screen.getByRole("radiogroup").focus();
    await waitFor(() => expect(c).toHaveFocus());
    expect(c).toHaveAttribute("tabindex", "0");
    expect(a).toHaveAttribute("tabindex", "-1");
  });

  it("toggles on press, reports the value, and ignores disabled items", () => {
    const onValueChange = vi.fn();
    renderGroup({ onValueChange });
    fireEvent.click(screen.getByRole("radio", { name: "C" }));
    expect(onValueChange).toHaveBeenLastCalledWith("c");
    expect(screen.getByRole("radio", { name: "C" })).toHaveAttribute(
      "data-state",
      "on",
    );
    fireEvent.click(screen.getByRole("radio", { name: "B" }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("radio", { name: "B" })).toBeDisabled();
  });

  it("passes className through as given and forwards refs", () => {
    const groupRef = { current: null };
    const itemRef = { current: null };
    render(
      <UnstyledToggleGroup className="flex gap-1" ref={groupRef} type="single">
        <UnstyledToggleGroupItem className="px-2 px-4" ref={itemRef} value="a">
          A
        </UnstyledToggleGroupItem>
      </UnstyledToggleGroup>,
    );
    expect(screen.getByRole("radiogroup")).toHaveAttribute(
      "class",
      "flex gap-1",
    );
    expect(screen.getByRole("radiogroup")).toBe(groupRef.current);
    expect(screen.getByRole("radio")).toHaveAttribute("class", "px-2 px-4");
    expect(screen.getByRole("radio")).toBe(itemRef.current);
  });
});

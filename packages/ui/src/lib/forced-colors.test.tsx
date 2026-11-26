import { render } from "@testing-library/react";
import postcss, { type AtRule, type Rule } from "postcss";
import tailwindcss from "tailwindcss";
import { describe, expect, it } from "vitest";

import localConfig from "../../tailwind.config";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "../components/atoms/segmented-control/segmented-control";
import { Slider } from "../components/atoms/slider/slider";
import { Switch } from "../components/atoms/switch/switch";
import { Toggle } from "../components/atoms/toggle/toggle";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../components/molecules/toggle-group/toggle-group";

/*
 * Windows High Contrast (`forced-colors: active`) swaps every author colour
 * for a system one, which hides a switch thumb, a slider and an on-state that
 * differ by background colour alone. jsdom has no forced-colors mode, so the
 * test compiles the Tailwind CSS for the rendered markup and checks the rules
 * in the `forced-colors` media block; a real browser in forced-colors mode
 * checked the computed result.
 */

const SYSTEM_COLORS =
  /\b(Canvas|ButtonFace|ButtonText|Highlight|HighlightText)\b/;

async function compile(html: string): Promise<{
  forced: Rule[];
  outside: Rule[];
}> {
  const result = await postcss([
    tailwindcss({
      ...localConfig,
      content: [{ extension: "html", raw: html }],
    }),
  ]).process("@tailwind utilities;", { from: undefined });
  const forced: Rule[] = [];
  const outside: Rule[] = [];
  const root = postcss.parse(result.css);
  root.walkRules((rule) => {
    const media =
      rule.parent?.type === "atrule" ? (rule.parent as AtRule) : undefined;
    const inForced =
      media?.params.replaceAll(/\s+/g, " ") === "(forced-colors: active)";
    (inForced ? forced : outside).push(rule);
  });

  return { forced, outside };
}

function rulesFor(rules: Rule[], className: string): Rule[] {
  return rules.filter((rule) => rule.selector.includes(className));
}

function declared(rule: Rule): string {
  return rule.nodes.map((node) => node.toString()).join("; ");
}

function renderControls(): string {
  const { container } = render(
    <>
      <Switch aria-label="Switch" defaultChecked />
      <Slider aria-label="Slider" defaultValue={[10, 40]} />
      <Toggle defaultPressed>Bold</Toggle>
      <ToggleGroup defaultValue="a" type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
      <SegmentedControl aria-label="View" defaultValue="a">
        <SegmentedControlItem value="a">A</SegmentedControlItem>
      </SegmentedControl>
    </>,
  );

  return container.innerHTML;
}

describe("forced-colors rules", () => {
  it("keep every system colour inside the forced-colors media block", async () => {
    const { outside } = await compile(renderControls());

    outside.forEach((rule) => {
      expect(declared(rule)).not.toMatch(SYSTEM_COLORS);
    });
  });

  it.each([
    [
      "the Switch track",
      "forced-colors:border-[color:ButtonText]",
      "ButtonText",
    ],
    [
      "the Switch thumb off",
      "forced-colors:data-[state=unchecked]:bg-[color:Canvas]",
      "Canvas",
    ],
    [
      "the Switch thumb on",
      "forced-colors:data-[state=checked]:bg-[color:HighlightText]",
      "HighlightText",
    ],
    [
      "the Slider track",
      "forced-colors:border-[color:ButtonText]",
      "ButtonText",
    ],
    ["the Slider range", "forced-colors:bg-[color:Highlight]", "Highlight"],
    ["the Slider thumb", "forced-colors:bg-[color:ButtonFace]", "ButtonFace"],
    [
      "a pressed Toggle",
      "forced-colors:data-[state=on]:bg-[color:Highlight]",
      "Highlight",
    ],
    [
      "a pressed Toggle label",
      "forced-colors:data-[state=on]:text-[color:HighlightText]",
      "HighlightText",
    ],
  ])("sets %s to a system colour", async (_name, utility, color) => {
    const { forced } = await compile(renderControls());
    const escaped = utility.replaceAll(/[:[\]=]/g, String.raw`\$&`);
    const matching = rulesFor(forced, escaped);

    expect(matching.length).toBeGreaterThan(0);
    expect(matching.map(declared).join(" ")).toContain(color);
  });

  it("puts the on-state classes on Toggle, ToggleGroup and SegmentedControl items", () => {
    const { container } = render(
      <>
        <Toggle defaultPressed>Bold</Toggle>
        <ToggleGroup defaultValue="a" type="single">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
        </ToggleGroup>
        <SegmentedControl aria-label="View" defaultValue="a">
          <SegmentedControlItem value="a">A</SegmentedControlItem>
        </SegmentedControl>
      </>,
    );
    const on = container.querySelectorAll(
      '[data-state="on"], [data-state="active"]',
    );

    expect(on.length).toBeGreaterThanOrEqual(3);
    on.forEach((node) => {
      expect(node).toHaveClass(
        "forced-colors:data-[state=on]:bg-[color:Highlight]",
      );
    });
  });
});

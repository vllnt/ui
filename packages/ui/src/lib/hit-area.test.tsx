import { render, screen } from "@testing-library/react";
import postcss, { type Root } from "postcss";
import tailwindcss from "tailwindcss";
import { describe, expect, it } from "vitest";

import localConfig from "../../tailwind.config";
import { Checkbox } from "../components/atoms/checkbox/checkbox";
import {
  RadioGroup,
  RadioGroupItem,
} from "../components/atoms/radio-group/radio-group";
import { Rating } from "../components/atoms/rating/rating";
import { Slider } from "../components/atoms/slider/slider";
import { Switch } from "../components/atoms/switch/switch";

import { HIT_AREA_24, HIT_AREA_24_RADIO_CHILD } from "./hit-area";

/*
 * WCAG 2.5.8: a pointer target is at least 24 x 24 CSS px. These controls are
 * smaller, so each carries a transparent ::after box. jsdom has no layout, so
 * the tests compile the Tailwind CSS for the rendered markup, check the box it
 * describes and check which element owns it; a real browser measured the hit
 * areas and clicked them.
 */

/** The element a pointer lands on for each control. */
function controls(): Record<string, HTMLElement> {
  render(
    <>
      <Checkbox aria-label="Checkbox" />
      <RadioGroup>
        <RadioGroupItem aria-label="Radio" value="a" />
      </RadioGroup>
      <Switch aria-label="Switch" />
      <Slider aria-label="Slider" defaultValue={[10]} />
      <Rating label="Stars" />
    </>,
  );
  const thumb = screen.getByRole("slider").parentElement;
  const star = screen.getAllByRole("radio", { name: /star/i })[0];
  if (!thumb || !star) {
    throw new Error("slider thumb or star not found");
  }

  return {
    checkbox: screen.getByRole("checkbox", { name: "Checkbox" }),
    radio: screen.getByRole("radio", { name: "Radio" }),
    star,
    switch: screen.getByRole("switch", { name: "Switch" }),
    thumb,
  };
}

/** The class attributes of the page as raw HTML, because innerHTML escapes `&` and `>` in them. */
function renderedClasses(): string {
  return [...document.body.querySelectorAll("[class]")]
    .map((node) => `<i class="${node.getAttribute("class")}">`)
    .join("");
}

async function compile(html: string): Promise<Root> {
  const result = await postcss([
    tailwindcss({
      ...localConfig,
      content: [{ extension: "html", raw: html }],
    }),
  ]).process("@tailwind utilities;", { from: undefined });

  return postcss.parse(result.css);
}

/** Selectors of the generated rules that make an ::after box absolute. */
function absoluteBoxOwners(root: Root): string[] {
  const owners: string[] = [];
  root.walkRules((rule) => {
    const isAbsoluteBox =
      rule.selector.endsWith("::after") &&
      rule.nodes.some(
        (node) =>
          node.type === "decl" &&
          node.prop === "position" &&
          node.value === "absolute",
      );
    if (isAbsoluteBox) {
      owners.push(rule.selector.replace(/::after$/, ""));
    }
  });

  return owners;
}

describe("HIT_AREA_24", () => {
  it.each(["checkbox", "radio", "switch", "thumb", "star"])(
    "puts a box on the element the pointer lands on, the %s",
    async (name) => {
      const element = controls()[name];
      const owners = absoluteBoxOwners(await compile(renderedClasses()));

      expect(owners.some((selector) => element.matches(selector))).toBe(true);
    },
  );

  it("compiles to a transparent, centred ::after box of at least 24 px", async () => {
    const css = await compile(
      `<i class="${HIT_AREA_24} ${HIT_AREA_24_RADIO_CHILD}">`,
    );
    const rules = css.toString().replaceAll(/\s+/g, " ");

    expect(rules).toMatch(
      /\.after\\:absolute::after \{[^}]*position: absolute/,
    );
    expect(rules).toMatch(
      /\.after\\:min-h-6::after \{[^}]*min-height: 1\.5rem/,
    );
    expect(rules).toMatch(/\.after\\:min-w-6::after \{[^}]*min-width: 1\.5rem/);
    expect(rules).toMatch(/\.after\\:size-full::after \{[^}]*height: 100%/);
    expect(rules).toMatch(/>\[role=radio\]::after \{[^}]*min-height: 1\.5rem/);
  });
});

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen } from "@testing-library/react";
import postcss, { type AtRule, type Rule } from "postcss";
import { describe, expect, it } from "vitest";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/atoms/accordion/accordion";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "../components/atoms/sheet/sheet";
import { Spinner } from "../components/atoms/spinner/spinner";

/*
 * MIGRATION.md promises that under `prefers-reduced-motion` library components
 * stop decorative animation and `data-motion="essential"` loaders keep going.
 * One rule in styles.css does the first part for every component. jsdom has no
 * media queries or cascade, so the test reads the rule, checks which elements
 * its selectors match, and checks what it sets; the computed result was
 * checked in a real browser.
 */

const STYLES = readFileSync(
  join(import.meta.dirname, "..", "..", "styles.css"),
  "utf8",
);

function reducedMotionRules(): Rule[] {
  const rules: Rule[] = [];
  postcss.parse(STYLES).walkAtRules("media", (media: AtRule) => {
    if (
      media.params.replaceAll(/\s+/g, " ") ===
      "(prefers-reduced-motion: reduce)"
    ) {
      media.walkRules((rule) => {
        rules.push(rule);
      });
    }
  });

  return rules;
}

function ruleFor(property: string): Rule {
  const rule = reducedMotionRules().find((candidate) =>
    candidate.nodes.some(
      (node) => node.type === "decl" && node.prop === property,
    ),
  );
  if (!rule) {
    throw new Error(`no reduced-motion rule sets ${property}`);
  }

  return rule;
}

function declarations(rule: Rule): Record<string, string> {
  const result: Record<string, string> = {};
  rule.walkDecls((decl) => {
    result[decl.prop] = `${decl.value}${decl.important ? " !important" : ""}`;
  });

  return result;
}

/** Whether an element with these classes, and the essential marker if asked, matches. */
function matches(selector: string, className: string, essential = false) {
  const node = document.createElement("div");
  node.className = className;
  if (essential) {
    node.dataset.motion = "essential";
  }

  return node.matches(selector);
}

function matchesAll(selector: string, classNames: string[]) {
  return classNames.map((className) => matches(selector, className));
}

describe("prefers-reduced-motion rule in styles.css", () => {
  it("makes enter, exit and accordion animations finish at once", () => {
    const rule = ruleFor("animation-duration");

    expect(declarations(rule)).toEqual({
      "animation-delay": "0s !important",
      "animation-duration": "0.01ms !important",
      "animation-iteration-count": "1 !important",
    });
    expect(
      matchesAll(rule.selector, [
        "animate-in fade-in-0",
        "data-[state=closed]:animate-out",
        "animate-accordion-down",
        "data-[state=open]:animate-accordion-up",
      ]),
    ).toEqual([true, true, true, true]);
  });

  it("makes moving and resizing transitions finish at once, not colour or opacity ones", () => {
    const rule = ruleFor("transition-duration");

    expect(declarations(rule)).toEqual({
      "transition-delay": "0s !important",
      "transition-duration": "0.01ms !important",
    });
    expect(
      matchesAll(rule.selector, [
        "transition ease-in-out",
        "transition-all",
        "transition-transform",
        "transition-[width,height]",
        "group-open:transition-transform",
      ]),
    ).toEqual([true, true, true, true, true]);
    expect(
      matchesAll(rule.selector, [
        "transition-colors",
        "transition-opacity",
        "transition-shadow",
      ]),
    ).toEqual([false, false, false]);
  });

  it("leaves essential loaders and the consuming app's own animation alone", () => {
    const selectors = ["animation-duration", "transition-duration"].map(
      (property) => ruleFor(property).selector,
    );

    expect(
      selectors.map((selector) =>
        matches(selector, "animate-in transition-all", true),
      ),
    ).toEqual([false, false]);
    expect(selectors.map((selector) => matches(selector, "my-fade"))).toEqual([
      false,
      false,
    ]);
  });

  it("reaches the classes real components render", () => {
    const animation = ruleFor("animation-duration").selector;
    const transition = ruleFor("transition-duration").selector;
    render(
      <>
        <Sheet defaultOpen>
          <SheetContent>
            <SheetTitle>Panel</SheetTitle>
          </SheetContent>
        </Sheet>
        <Accordion defaultValue="a" type="single">
          <AccordionItem value="a">
            <AccordionTrigger value="a">Question</AccordionTrigger>
            <AccordionContent value="a">Body</AccordionContent>
          </AccordionItem>
        </Accordion>
        <Spinner />
      </>,
    );

    const panel = screen.getByRole("dialog", { name: "Panel" });
    expect(panel.matches(animation)).toBe(true);
    expect(panel.matches(transition)).toBe(true);
    expect(
      screen.getByRole("region", { name: "Question" }).matches(transition),
    ).toBe(true);
    const spinner = document.querySelector("[data-motion=essential]");
    expect(spinner).not.toBeNull();
    expect(spinner?.matches(animation)).toBe(false);
    expect(spinner?.matches(transition)).toBe(false);
  });
});

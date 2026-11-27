import { react } from "@vllnt/eslint-config";
import { RuleTester } from "eslint";

import rule from "./named-display-name.js";

const tsParser = react.find((entry) => entry.languageOptions?.parser)
  ?.languageOptions.parser;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run("named-display-name", rule, {
  invalid: [
    {
      code: `const Card = () => null;\nCard.displayName = "Card";`,
      errors: [{ messageId: "statement" }],
    },
    {
      code: `export function Card() { return null; }\nCard.displayName = "Card";`,
      errors: [{ messageId: "statement" }],
    },
    {
      code: `const Card = named("Card", () => null);`,
      errors: [{ messageId: "annotation" }],
    },
    {
      code: `export const Card = named("Card", () => null);`,
      errors: [{ messageId: "annotation" }],
    },
    {
      code: `const DialogHeader = dialogBox("DialogHeader", "p-4");`,
      errors: [{ messageId: "annotation" }],
    },
    {
      code: `const Card = /* not a pure annotation */ named("Card", () => null);`,
      errors: [{ messageId: "annotation" }],
    },
    {
      code: `const Tabs = /* @__PURE__ */ named("Tabs", TabsRoot);\nTabs.List = TabsList;`,
      errors: [{ messageId: "static" }],
    },
    {
      code: `const Tabs = /* @__PURE__ */ named("Tabs", TabsRoot, { List: TabsList });`,
      errors: [{ messageId: "impure" }],
    },
    {
      code: `const DialogOverlay = /* @__PURE__ */ dialogOverlay("DialogOverlay", Backdrop, { veil: "fixed" });`,
      errors: [{ messageId: "impure" }],
    },
    {
      code: `const Card = /* @__PURE__ */ named("Card", memo(Impl));`,
      errors: [{ messageId: "impure" }],
    },
    {
      code: `const Card = /* @__PURE__ */ named("Card", CardRoot, [Item]);`,
      errors: [{ messageId: "impure" }],
    },
  ],
  valid: [
    `const Card = /* @__PURE__ */ named("Card", () => null);`,
    `export const Card = /* @__PURE__ */ named("Card", () => null);`,
    `const Card = /*#__PURE__*/ named("Card", () => null);`,
    `const Card = /* @__PURE__ */ named("Card", () => null, () => ({ Item: Item }));`,
    `const DialogHeader = /* @__PURE__ */ dialogBox("DialogHeader", "p-4");`,
    `const Dialog: Props = /* @__PURE__ */ dialogRoot("Dialog", Root);`,
    // Inside a function, the call runs when the function does, so nothing to drop.
    `function make() { const Copy = () => null; Copy.displayName = "Copy"; return named("Copy", Copy); }`,
    // Reading a displayName is fine.
    `const same = Card.displayName === "Card";`,
    // Statics go through the third argument, as a function.
    `const Card = /* @__PURE__ */ named("Card", CardRoot, () => ({ Item }));`,
    // Data goes in a const, and the call takes the identifier.
    `const LOOK = { veil: "fixed" };\nconst DialogOverlay = /* @__PURE__ */ dialogOverlay("DialogOverlay", Backdrop, LOOK);`,
    // A wrapper call is pure when it is annotated and its arguments are pure.
    `const Card = /* @__PURE__ */ named("Card", /* @__PURE__ */ memo(Impl));`,
    `const Card = /* @__PURE__ */ named("Card", function Card() { return null; });`,
    // Inside a function the assignment runs with the function.
    `function make() { const Copy = () => null; Copy.Item = Item; return Copy; }`,
  ],
});

import { render } from "@testing-library/react";
import { expect, it } from "vitest";

import { Glossary, KeyConcept } from "./key-concept";

it("KeyConcept renders a visible root that applies custom className", () => {
  const { container } = render(
    <KeyConcept className="custom-class">Test Content</KeyConcept>,
  );
  expect(container.firstChild).toBeVisible();
  expect(container.firstChild).toHaveClass("custom-class");
});

it("KeyConcept wraps its term and definition in a description list", () => {
  const { container } = render(
    <KeyConcept term="Component">A reusable piece of UI.</KeyConcept>,
  );
  expect(container.querySelector("dl > dt")).toHaveTextContent("Component");
  expect(container.querySelector("dl > dd")).toHaveTextContent(
    "A reusable piece of UI.",
  );
});

it("Glossary groups key concepts without nesting description lists", () => {
  const { container } = render(
    <Glossary>
      <KeyConcept term="Prop">Component input.</KeyConcept>
      <KeyConcept term="State">Component memory.</KeyConcept>
    </Glossary>,
  );
  expect(container.querySelectorAll("dl")).toHaveLength(2);
  expect(container.querySelector("dl dl")).toBeNull();
});

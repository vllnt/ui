import { createRef } from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PullQuote } from "./pull-quote";

const mdQuoteClass = "text-[length:var(--font-size-h4)]";
const lgQuoteClass = "text-[length:var(--font-size-h2)]";

describe("PullQuote", () => {
  it("renders figure, blockquote and figcaption with the cite text", () => {
    const { container } = render(
      <PullQuote cite="Ada Lovelace">The engine weaves patterns.</PullQuote>,
    );
    const figure = screen.getByRole("figure");
    const quote = screen.getByRole("blockquote");
    const caption = container.querySelector("figcaption");
    expect(figure).toContainElement(quote);
    expect(quote).toHaveTextContent("The engine weaves patterns.");
    expect(caption).toHaveTextContent("Ada Lovelace");
    expect(figure).toContainElement(caption);
    expect(quote).not.toContainElement(caption);
  });

  it("renders no figcaption without cite", () => {
    const { container } = render(<PullQuote>Quote only.</PullQuote>);
    expect(screen.getByRole("blockquote")).toHaveTextContent("Quote only.");
    expect(container.querySelector("figcaption")).toBeNull();
  });

  it("renders no figcaption for an empty cite", () => {
    const { container } = render(<PullQuote cite="">Quote only.</PullQuote>);
    expect(container.querySelector("figcaption")).toBeNull();
  });

  it("renders a node as cite", () => {
    render(
      <PullQuote cite={<a href="/source">Source</a>}>Linked cite.</PullQuote>,
    );
    expect(screen.getByRole("link", { name: "Source" })).toHaveAttribute(
      "href",
      "/source",
    );
  });

  it("uses the md type scale by default", () => {
    render(<PullQuote>Default size.</PullQuote>);
    const quote = screen.getByRole("blockquote");
    expect(quote).toHaveClass(mdQuoteClass);
    expect(quote).not.toHaveClass(lgQuoteClass);
  });

  it("switches the type class with size", () => {
    const { rerender } = render(<PullQuote size="lg">Large.</PullQuote>);
    expect(screen.getByRole("blockquote")).toHaveClass(lgQuoteClass);
    expect(screen.getByRole("blockquote")).not.toHaveClass(mdQuoteClass);
    rerender(<PullQuote size="md">Medium.</PullQuote>);
    expect(screen.getByRole("blockquote")).toHaveClass(mdQuoteClass);
    expect(screen.getByRole("blockquote")).not.toHaveClass(lgQuoteClass);
  });

  it("scales the cite with size", () => {
    const { container, rerender } = render(
      <PullQuote cite="Author" size="lg">
        Large.
      </PullQuote>,
    );
    expect(container.querySelector("figcaption")).toHaveClass(
      "text-[length:var(--font-size-body)]",
    );
    rerender(
      <PullQuote cite="Author" size="md">
        Medium.
      </PullQuote>,
    );
    expect(container.querySelector("figcaption")).toHaveClass(
      "text-[length:var(--font-size-body-sm)]",
    );
  });

  it("hides the rule from assistive technology", () => {
    render(<PullQuote cite="Author">Quote.</PullQuote>);
    const figure = screen.getByRole("figure");
    const rule = figure.firstElementChild;
    expect(rule).toHaveAttribute("aria-hidden", "true");
    expect(rule).toBeEmptyDOMElement();
    expect(figure).toHaveAccessibleName("");
    expect(screen.getByRole("blockquote")).toBeVisible();
  });

  it("merges className and forwards props and ref to the figure", () => {
    const reference = createRef<HTMLElement>();
    render(
      <PullQuote className="max-w-prose" id="pq" ref={reference}>
        Quote.
      </PullQuote>,
    );
    const figure = screen.getByRole("figure");
    expect(figure).toHaveClass(
      "max-w-prose",
      "font-[family-name:var(--font-sans)]",
      "text-foreground",
    );
    expect(figure).toHaveAttribute("id", "pq");
    expect(reference.current).toBe(figure);
  });

  it("sets the display name", () => {
    expect(PullQuote.displayName).toBe("PullQuote");
  });
});

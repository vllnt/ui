import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Blockquote,
  H1,
  H2,
  H3,
  H4,
  InlineCode,
  Lead,
  List,
  Muted,
  P,
} from "./typography";

describe("Typography", () => {
  describe("rendering", () => {
    it("renders headings with the correct semantic element", () => {
      render(<H1>Title</H1>);
      render(<H2>Title</H2>);
      render(<H3>Title</H3>);
      render(<H4>Title</H4>);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Title",
      );
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 4 })).toBeInTheDocument();
    });

    it("renders paragraph primitives as <p>", () => {
      const { container } = render(
        <div>
          <P>Body</P>
          <Lead>Lead</Lead>
          <Muted>Muted</Muted>
        </div>,
      );

      expect(container.querySelectorAll("p")).toHaveLength(3);
    });

    it("renders Blockquote as <blockquote>", () => {
      const { container } = render(<Blockquote>Quote</Blockquote>);

      expect(container.querySelector("blockquote")).toBeInTheDocument();
    });

    it("renders InlineCode as <code>", () => {
      const { container } = render(<InlineCode>code</InlineCode>);

      expect(container.querySelector("code")).toHaveTextContent("code");
    });

    it("renders List as <ul>", () => {
      const { container } = render(
        <List>
          <li>One</li>
        </List>,
      );

      expect(container.querySelector("ul")).toBeInTheDocument();
    });
  });

  describe("className", () => {
    it("merges custom className onto the primitive", () => {
      const { container } = render(<H1 className="custom-class">Title</H1>);

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("ref", () => {
    it("forwards a ref to the underlying element", () => {
      let node: HTMLHeadingElement | null = null;
      render(
        <H1
          ref={(element) => {
            node = element;
          }}
        >
          Title
        </H1>,
      );

      expect(node).toBeInstanceOf(HTMLHeadingElement);
    });
  });
});

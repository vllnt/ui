import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DocumentSiblingNav } from "./document-sibling-nav";

const FOO = { href: "/posts/foo", title: "Foo post" };
const BAR = { href: "/posts/bar", title: "Bar post" };

describe("DocumentSiblingNav", () => {
  it("renders previous and next links", () => {
    render(<DocumentSiblingNav next={BAR} previous={FOO} />);
    expect(
      screen.getByRole("link", { name: /Older.*Foo post/ }),
    ).toHaveAttribute("href", "/posts/foo");
    expect(
      screen.getByRole("link", { name: /Newer.*Bar post/ }),
    ).toHaveAttribute("href", "/posts/bar");
  });

  it.each([
    ["previous", <DocumentSiblingNav key="p" previous={FOO} />, "/posts/foo"],
    ["next", <DocumentSiblingNav key="n" next={BAR} />, "/posts/bar"],
  ])(
    "renders only the %s link when the other side is absent",
    (_side, element, href) => {
      render(element);
      expect(screen.getByRole("link")).toHaveAttribute("href", href);
    },
  );

  it("returns null when both sides are absent", () => {
    const { container } = render(<DocumentSiblingNav />);
    expect(container.firstChild).toBeNull();
  });

  it("hides the title in compact variant", () => {
    render(<DocumentSiblingNav previous={FOO} variant="compact" />);
    expect(screen.queryByText("Foo post")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Older" })).toBeInTheDocument();
  });

  it("renders the meta line only in with-meta variant", () => {
    const { rerender } = render(
      <DocumentSiblingNav
        previous={{ ...FOO, meta: "May 2026" }}
        variant="with-meta"
      />,
    );
    expect(screen.getByText("May 2026")).toBeInTheDocument();
    rerender(<DocumentSiblingNav previous={{ ...FOO, meta: "May 2026" }} />);
    expect(screen.queryByText("May 2026")).not.toBeInTheDocument();
  });

  it("honors custom labels", () => {
    render(
      <DocumentSiblingNav
        labels={{
          navigation: "Navigation des articles",
          next: "Suivant",
          previous: "Précédent",
        }}
        next={BAR}
        previous={FOO}
      />,
    );
    expect(
      screen.getByRole("navigation", { name: "Navigation des articles" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Précédent.*Foo post/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Suivant.*Bar post/ }),
    ).toBeInTheDocument();
  });

  it("forwards anchorProps to the rendered <a>", () => {
    render(
      <DocumentSiblingNav
        next={{ ...BAR, anchorProps: { rel: "next", target: "_blank" } }}
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("rel", "next");
    expect(link).toHaveAttribute("target", "_blank");
  });
});

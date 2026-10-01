import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ShareSection } from "./share-section";

const baseProps = {
  shareOn: "Share on",
  shareTitle: "Share this post",
  title: "First post",
  url: "https://example.com/posts/first",
};

describe("ShareSection", () => {
  it("renders the title and one safe new-tab anchor per default platform with a Twitter intent URL", () => {
    render(<ShareSection {...baseProps} />);
    expect(screen.getByText("Share this post")).toBeInTheDocument();
    expect(screen.getByText(/LinkedIn$/)).toBeInTheDocument();
    expect(screen.getByText(/Facebook$/)).toBeInTheDocument();
    expect(screen.getByText(/Mastodon$/)).toBeInTheDocument();
    expect(screen.getByText(/Bluesky$/)).toBeInTheDocument();
    expect(screen.getByText(/Threads$/)).toBeInTheDocument();
    const anchor = screen.getByText(/X$/).closest("a");
    expect(anchor).toHaveAttribute(
      "href",
      "https://twitter.com/intent/tweet?url=https%3A%2F%2Fexample.com%2Fposts%2Ffirst&text=First%20post",
    );
    expect(anchor).toHaveAttribute("target", "_blank");
    expect(anchor).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders only the supplied platforms", () => {
    render(
      <ShareSection {...baseProps} platforms={[{ key: "x", label: "X" }]} />,
    );
    expect(screen.getByText(/X$/)).toBeInTheDocument();
    expect(screen.queryByText(/LinkedIn$/)).not.toBeInTheDocument();
  });

  it("uses the buildUrl override when provided", () => {
    render(
      <ShareSection
        {...baseProps}
        buildUrl={(_p, url) => `https://my-share?url=${url}`}
        platforms={[{ key: "x", label: "X" }]}
      />,
    );
    const anchor = screen.getByText(/X$/).closest("a");
    expect(anchor).toHaveAttribute(
      "href",
      "https://my-share?url=https://example.com/posts/first",
    );
  });
});

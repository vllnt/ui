import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BlogCard, ContentCard } from "./blog-card";

const post = {
  date: "2026-01-15",
  description: "A short summary of the post.",
  slug: "first-post",
  tags: ["news", "release"],
  title: "First post",
  updatedDate: "2026-02-01",
};

describe("ContentCard", () => {
  it("renders a linked card with title, description, badge, date, and read-more", () => {
    render(
      <ContentCard
        formatDate={(date) => `formatted-${date}`}
        href="/posts/first-post"
        lang="en"
        post={post}
        readMoreLabel="Read more"
      />,
    );
    expect(screen.getByText("First post").closest("a")).toHaveAttribute(
      "href",
      "/posts/first-post",
    );
    expect(
      screen.getByText("A short summary of the post."),
    ).toBeInTheDocument();
    expect(screen.getByText("news")).toBeInTheDocument();
    expect(screen.getByText("formatted-2026-01-15")).toBeInTheDocument();
    expect(screen.getByText("Read more")).toBeInTheDocument();
  });

  it("hides the badge and read-more affordance when disabled", () => {
    render(
      <ContentCard
        href="/posts/first-post"
        post={post}
        readMoreLabel="Read more"
        showBadge={false}
        showReadMore={false}
      />,
    );
    expect(screen.queryByText("news")).not.toBeInTheDocument();
    expect(screen.queryByText("Read more")).not.toBeInTheDocument();
  });
});

describe("BlogCard", () => {
  it("renders through the backwards-compatible alias", () => {
    render(<BlogCard href="/posts/first-post" post={post} />);
    expect(screen.getByText("First post")).toBeInTheDocument();
  });
});

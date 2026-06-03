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
  it("renders the title and description", () => {
    render(<ContentCard href="/posts/first-post" post={post} />);

    expect(screen.getByText("First post")).toBeInTheDocument();
    expect(
      screen.getByText("A short summary of the post."),
    ).toBeInTheDocument();
  });

  it("renders the leading tag as a badge", () => {
    render(<ContentCard href="/posts/first-post" post={post} />);

    expect(screen.getByText("news")).toBeInTheDocument();
  });

  it("hides the badge when showBadge is false", () => {
    render(
      <ContentCard href="/posts/first-post" post={post} showBadge={false} />,
    );

    expect(screen.queryByText("news")).not.toBeInTheDocument();
  });

  it("renders the formatted date when formatDate + lang are provided", () => {
    render(
      <ContentCard
        formatDate={(date) => `formatted-${date}`}
        href="/posts/first-post"
        lang="en"
        post={post}
      />,
    );

    expect(screen.getByText("formatted-2026-01-15")).toBeInTheDocument();
  });

  it("renders the read-more affordance when label is supplied", () => {
    render(
      <ContentCard
        href="/posts/first-post"
        post={post}
        readMoreLabel="Read more"
      />,
    );

    expect(screen.getByText("Read more")).toBeInTheDocument();
  });

  it("hides the read-more affordance when showReadMore is false", () => {
    render(
      <ContentCard
        href="/posts/first-post"
        post={post}
        readMoreLabel="Read more"
        showReadMore={false}
      />,
    );

    expect(screen.queryByText("Read more")).not.toBeInTheDocument();
  });

  it("wraps the card in a link to the href", () => {
    render(<ContentCard href="/posts/first-post" post={post} />);

    expect(screen.getByText("First post").closest("a")).toHaveAttribute(
      "href",
      "/posts/first-post",
    );
  });
});

describe("BlogCard", () => {
  it("renders through the backwards-compatible alias", () => {
    render(<BlogCard href="/posts/first-post" post={post} />);

    expect(screen.getByText("First post")).toBeInTheDocument();
  });
});

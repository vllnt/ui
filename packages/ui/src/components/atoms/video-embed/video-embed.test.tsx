import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VideoEmbed } from "./video-embed";

describe("VideoEmbed", () => {
  it("renders the title caption, starts in the play-button state, and swaps to an iframe when clicked", () => {
    const { container } = render(
      <VideoEmbed src="https://youtube.com/watch?v=abc" title="Demo" />,
    );
    expect(screen.getByText("Demo")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(container.querySelector("iframe")).toBeNull();
    fireEvent.click(screen.getByRole("button"));
    expect(container.querySelector("iframe")).toBeInTheDocument();
  });

  it.each([
    {
      expected: "https://www.youtube.com/embed/abc?autoplay=1",
      name: "rewrites a YouTube watch URL to an embed URL",
      source: "https://youtube.com/watch?v=abc",
      type: undefined,
    },
    {
      expected: "https://player.vimeo.com/video/12345?autoplay=1",
      name: "rewrites a Vimeo URL to a player URL",
      source: "https://vimeo.com/12345",
      type: "vimeo",
    },
    {
      expected: "https://example.com/video.mp4?autoplay=1",
      name: "uses a custom URL as-is when type is custom",
      source: "https://example.com/video.mp4",
      type: "custom",
    },
  ] as const)("$name", ({ expected, source, type }) => {
    const { container } = render(
      <VideoEmbed src={source} title="Demo" type={type} />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(container.querySelector("iframe")).toHaveAttribute("src", expected);
  });

  it("renders the thumbnail image when one is provided", () => {
    render(
      <VideoEmbed
        src="https://youtube.com/watch?v=abc"
        thumbnail="/poster.png"
        title="Demo"
      />,
    );
    expect(screen.getByAltText("Demo")).toHaveAttribute("src", "/poster.png");
  });

  it("names the play button after the video title", () => {
    render(<VideoEmbed src="https://youtube.com/watch?v=abc" title="Demo" />);
    expect(
      screen.getByRole("button", { name: "Play video: Demo" }),
    ).toBeInTheDocument();
  });
});

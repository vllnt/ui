import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VideoEmbed } from "./video-embed";

describe("VideoEmbed", () => {
  it("renders the title caption", () => {
    render(<VideoEmbed src="https://youtube.com/watch?v=abc" title="Demo" />);

    expect(screen.getByText("Demo")).toBeInTheDocument();
  });

  it("starts in the play-button state and swaps to an iframe when clicked", () => {
    const { container } = render(
      <VideoEmbed src="https://youtube.com/watch?v=abc" title="Demo" />,
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(container.querySelector("iframe")).toBeNull();

    fireEvent.click(screen.getByRole("button"));

    expect(container.querySelector("iframe")).toBeInTheDocument();
  });

  it("rewrites a YouTube watch URL to an embed URL", () => {
    const { container } = render(
      <VideoEmbed src="https://youtube.com/watch?v=abc" title="Demo" />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(container.querySelector("iframe")).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/abc?autoplay=1",
    );
  });

  it("rewrites a Vimeo URL to a player URL", () => {
    const { container } = render(
      <VideoEmbed src="https://vimeo.com/12345" title="Demo" type="vimeo" />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(container.querySelector("iframe")).toHaveAttribute(
      "src",
      "https://player.vimeo.com/video/12345?autoplay=1",
    );
  });

  it("uses a custom URL as-is when type is custom", () => {
    const { container } = render(
      <VideoEmbed
        src="https://example.com/video.mp4"
        title="Demo"
        type="custom"
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(container.querySelector("iframe")).toHaveAttribute(
      "src",
      "https://example.com/video.mp4?autoplay=1",
    );
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
});

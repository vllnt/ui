import { createRef } from "react";

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AudioPlayer } from "./audio-player";

function audioElement(container: HTMLElement) {
  const audio = container.querySelector("audio");
  if (!audio) throw new Error("Missing audio");
  return audio;
}
function metadata(audio: HTMLAudioElement, duration = 120) {
  Object.defineProperty(audio, "duration", {
    configurable: true,
    value: duration,
  });
  fireEvent.loadedMetadata(audio);
}

describe("AudioPlayer", () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(vi.fn());
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("forwards the React 19 ref and labels controls", () => {
    const ref = createRef<HTMLDivElement>();
    render(<AudioPlayer ref={ref} src="/audio.wav" title="Interview" />);
    expect(ref.current).toBe(screen.getByRole("group", { name: "Interview" }));
    expect(screen.getByRole("slider", { name: "Seek audio" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Play audio" })).toBeEnabled();
  });

  it("follows native playback, buffering, pause and ended events", async () => {
    const { container } = render(
      <AudioPlayer src="/audio.wav" title="Interview" />,
    );
    const audio = audioElement(container);
    fireEvent.loadStart(audio);
    expect(screen.getByRole("status")).toHaveTextContent("Loading audio");
    fireEvent.canPlay(audio);
    await act(async () => fireEvent.click(screen.getByRole("button")));
    expect(audio.play).toHaveBeenCalledOnce();
    fireEvent.play(audio);
    expect(screen.getByRole("button", { name: "Pause audio" })).toBeEnabled();
    fireEvent.waiting(audio);
    expect(screen.getByRole("status")).toHaveTextContent("Loading audio");
    fireEvent.playing(audio);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    Object.defineProperty(audio, "paused", {
      configurable: true,
      value: false,
    });
    fireEvent.click(screen.getByRole("button"));
    expect(audio.pause).toHaveBeenCalled();
    fireEvent.pause(audio);
    expect(screen.getByRole("button", { name: "Play audio" })).toBeEnabled();
    fireEvent.play(audio);
    fireEvent.ended(audio);
    expect(screen.getByRole("button", { name: "Play audio" })).toBeEnabled();
  });

  it("reports rejected play and native source errors", async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValue(
      new Error("denied"),
    );
    const { container } = render(
      <AudioPlayer src="/audio.wav" title="Interview" />,
    );
    await act(async () => fireEvent.click(screen.getByRole("button")));
    expect(screen.getByRole("alert")).toHaveTextContent("could not play");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    fireEvent.error(audioElement(container));
    expect(screen.getByRole("alert")).toHaveTextContent("could not load");
  });

  it("seeks with accessible time values and clamps keyboard seeks", async () => {
    const { container } = render(
      <AudioPlayer src="/audio.wav" title="Interview" />,
    );
    const audio = audioElement(container);
    metadata(audio);
    const group = screen.getByRole("button");
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "30" } });
    expect(audio.currentTime).toBe(30);
    expect(slider).toHaveAttribute("aria-valuetext", "0:30 of 2:00");
    fireEvent.keyDown(group, { key: "+" });
    expect(audio.currentTime).toBe(35);
    fireEvent.keyDown(group, { key: "-" });
    expect(audio.currentTime).toBe(30);
    fireEvent.keyDown(group, { key: "End" });
    fireEvent.keyDown(group, { key: "ArrowRight" });
    expect(audio.currentTime).toBe(120);
    fireEvent.keyDown(group, { key: "Home" });
    fireEvent.keyDown(group, { key: "ArrowLeft" });
    expect(audio.currentTime).toBe(0);
    fireEvent.keyDown(slider, { key: "+" });
    expect(audio.currentTime).toBe(0);
    await act(async () => fireEvent.click(group));
    expect(audio.play).toHaveBeenCalledOnce();
  });

  it("supports transcript and native playback rate changes", () => {
    const { container } = render(
      <AudioPlayer
        showPlaybackRate
        src="/audio.wav"
        title="Interview"
        transcript="Hello world"
      />,
    );
    expect(screen.getByText("Transcript").tagName).toBe("SUMMARY");
    expect(screen.getByText("Hello world")).toBeInTheDocument();
    const audio = audioElement(container);
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "1.5" },
    });
    expect(audio.playbackRate).toBe(1.5);
    fireEvent.rateChange(audio);
    expect(screen.getByRole("combobox")).toHaveValue("1.5");
  });

  it("resets on source replacement and ignores old play rejection", async () => {
    let rejectPlay: ((reason: Error) => void) | undefined;
    vi.mocked(HTMLMediaElement.prototype.play).mockImplementation(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectPlay = reject;
        }),
    );
    const { container, rerender } = render(
      <AudioPlayer src="/one.wav" title="Interview" />,
    );
    const old = audioElement(container);
    metadata(old);
    fireEvent.click(screen.getByRole("button"));
    rerender(<AudioPlayer src="/two.wav" title="Interview" />);
    expect(audioElement(container)).not.toBe(old);
    expect(old.pause).toHaveBeenCalled();
    await act(async () => rejectPlay?.(new Error("old request")));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("slider")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Play audio" })).toBeEnabled();
  });

  it("handles missing source and non-finite duration", () => {
    const { container } = render(<AudioPlayer src="" title="Interview" />);
    expect(screen.getByRole("button")).toBeDisabled();
    metadata(audioElement(container), Infinity);
    expect(screen.getByRole("slider")).toBeDisabled();
    expect(screen.getByRole("slider")).toHaveAttribute(
      "aria-valuetext",
      "0:00 of 0:00",
    );
  });
});

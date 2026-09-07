"use client";

import { Pause, Play } from "lucide-react";
import type { ComponentPropsWithRef, ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Button } from "../button";

import { useAudioPlayer } from "./use-audio-player";

export type AudioPlayerProps = Omit<
  ComponentPropsWithRef<"div">,
  "children" | "title"
> & {
  captionsSrc?: string;
  showPlaybackRate?: boolean;
  src: string;
  title: string;
  transcript?: ReactNode;
};

function timeLabel(seconds: number) {
  const whole = Math.floor(Math.max(0, seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

type Playback = ReturnType<typeof useAudioPlayer>;

function AudioControls({
  disabled,
  playback,
}: {
  disabled: boolean;
  playback: Playback;
}) {
  return (
    <div className="flex items-center gap-x-3">
      <Button
        aria-label={playback.playing ? "Pause audio" : "Play audio"}
        disabled={disabled}
        onClick={() => void playback.togglePlayback()}
        onKeyDown={playback.onSeekKey}
        size="icon"
        type="button"
        variant="outline"
      >
        {playback.playing ? (
          <Pause aria-hidden="true" className="size-4" />
        ) : (
          <Play aria-hidden="true" className="size-4" />
        )}
      </Button>
      <input
        aria-label="Seek audio"
        aria-valuetext={`${timeLabel(playback.position)} of ${timeLabel(playback.duration)}`}
        className="min-w-0 flex-1 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        disabled={!playback.duration || !!playback.error}
        max={playback.duration || 1}
        min={0}
        onChange={(event) => {
          playback.seek(Number(event.currentTarget.value));
        }}
        step={1}
        type="range"
        value={Math.min(playback.position, playback.duration)}
      />
      <span className="text-xs tabular-nums text-muted-foreground">
        {timeLabel(playback.position)} / {timeLabel(playback.duration)}
      </span>
    </div>
  );
}

function PlaybackRate({ playback }: { playback: Playback }) {
  return (
    <label className="flex items-center gap-x-2 text-sm">
      <span>Playback speed</span>
      <select
        className="rounded-md border bg-background p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onChange={(event) => {
          playback.changeRate(Number(event.currentTarget.value));
        }}
        value={playback.rate}
      >
        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((value) => (
          <option key={value} value={value}>
            {value}×
          </option>
        ))}
      </select>
    </label>
  );
}

function AudioPlayerSession({
  captionsSrc,
  className,
  ref,
  showPlaybackRate = false,
  src,
  title,
  transcript,
  ...props
}: AudioPlayerProps) {
  const playback = useAudioPlayer(src);
  return (
    <div
      aria-label={title}
      className={cn(
        "rounded-md border bg-background p-4 text-foreground space-y-4",
        className,
      )}
      ref={ref}
      role="group"
      {...props}
    >
      <audio
        aria-label={title}
        preload="metadata"
        src={src || undefined}
        {...playback.mediaProps}
      >
        <track kind="captions" src={captionsSrc} />
      </audio>
      <p className="text-sm font-medium">{title}</p>
      <AudioControls disabled={!src} playback={playback} />
      {showPlaybackRate ? <PlaybackRate playback={playback} /> : null}
      <p
        aria-live="polite"
        className="text-sm text-muted-foreground"
        role="status"
      >
        {playback.loading ? "Loading audio…" : ""}
      </p>
      {playback.error ? (
        <p className="text-sm text-destructive" role="alert">
          {playback.error}
        </p>
      ) : null}
      {transcript ? (
        <details className="text-sm">
          <summary className="cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Transcript
          </summary>
          <div className="pt-3 text-muted-foreground">{transcript}</div>
        </details>
      ) : null}
    </div>
  );
}

/** URL-backed audio controls. Changing src resets playback and all media state. */
export function AudioPlayer(props: AudioPlayerProps) {
  return <AudioPlayerSession key={props.src} {...props} />;
}
AudioPlayer.displayName = "AudioPlayer";

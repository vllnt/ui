"use client";

import { useEffect, useRef, useState } from "react";

import type { KeyboardEvent } from "react";

export function useAudioPlayer(source: string) {
  const media = useRef<HTMLAudioElement>(null);
  const request = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [rate, setRate] = useState(1);
  useEffect(() => {
    const audio = media.current;
    return () => {
      request.current += 1;
      audio?.pause();
    };
  }, []);
  function syncTime() {
    const audio = media.current;
    if (!audio) return;
    setDuration(
      Number.isFinite(audio.duration) ? Math.max(0, audio.duration) : 0,
    );
    setPosition(
      Number.isFinite(audio.currentTime) ? Math.max(0, audio.currentTime) : 0,
    );
  }
  function seek(value: number) {
    const audio = media.current;
    if (!audio || !duration || error) return;
    audio.currentTime = Math.min(duration, Math.max(0, value));
    setPosition(audio.currentTime);
  }
  async function togglePlayback() {
    const audio = media.current;
    if (!audio || !source) return;
    const attempt = ++request.current;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    setError("");
    setLoading(true);
    try {
      await audio.play();
      if (request.current === attempt) setLoading(false);
    } catch {
      if (request.current !== attempt) return;
      setLoading(false);
      setPlaying(false);
      setError("Audio could not play. Check the source and try again.");
    }
  }
  function handleSeekKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    if (
      !["+", "-", "ArrowLeft", "ArrowRight", "End", "Home"].includes(event.key)
    )
      return;
    event.preventDefault();
    if (event.key === "Home") seek(0);
    else if (event.key === "End") seek(duration);
    else seek(position + (["+", "ArrowRight"].includes(event.key) ? 5 : -5));
  }
  const mediaProps = {
    onCanPlay: () => {
      setLoading(false);
    },
    onDurationChange: syncTime,
    onEnded: () => {
      request.current += 1;
      setPlaying(false);
      setLoading(false);
      syncTime();
    },
    onError: () => {
      request.current += 1;
      setPlaying(false);
      setLoading(false);
      setError("Audio could not load. Check the source and try again.");
    },
    onLoadedMetadata: syncTime,
    onLoadStart: () => {
      setLoading(true);
    },
    onPause: () => {
      request.current += 1;
      setPlaying(false);
      setLoading(false);
    },
    onPlay: () => {
      setPlaying(true);
    },
    onPlaying: () => {
      setPlaying(true);
      setLoading(false);
      setError("");
    },
    onRateChange: () => {
      setRate(media.current?.playbackRate ?? 1);
    },
    onStalled: () => {
      setLoading(true);
    },
    onTimeUpdate: syncTime,
    onWaiting: () => {
      setLoading(true);
    },
    ref: media,
  };
  function changeRate(value: number) {
    if (media.current) media.current.playbackRate = value;
  }
  return {
    changeRate,
    duration,
    error,
    loading,
    mediaProps,
    handleSeekKey,
    playing,
    position,
    rate,
    seek,
    togglePlayback,
  };
}

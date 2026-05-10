"use client";

import { useState } from "react";

import { Play, Video } from "lucide-react";

import { cn } from "../../lib/utils";

export type VideoEmbedProps = {
  aspectRatio?: "1/1" | "4/3" | "16/9";
  src: string;
  thumbnail?: string;
  title: string;
  type?: "custom" | "vimeo" | "youtube";
};

function getEmbedUrl(source: string, type: string): string {
  if (type === "youtube") {
    const videoId =
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?]+)/.exec(
        source,
      )?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : source;
  }
  if (type === "vimeo") {
    const videoId = /vimeo\.com\/(\d+)/.exec(source)?.[1];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : source;
  }
  return source;
}

export function VideoEmbed({
  aspectRatio = "16/9",
  src,
  thumbnail,
  title,
  type = "youtube",
}: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const embedUrl = getEmbedUrl(src, type);
  const aspectClass =
    aspectRatio === "16/9"
      ? "aspect-video"
      : aspectRatio === "4/3"
        ? "aspect-[4/3]"
        : "aspect-square";

  return (
    <div className="my-6">
      <div
        className={cn(
          "relative rounded-lg overflow-hidden bg-muted border",
          aspectClass,
        )}
      >
        {isPlaying ? (
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            src={`${embedUrl}?autoplay=1`}
            title={title}
          />
        ) : (
          <button
            className="absolute inset-0 w-full h-full flex items-center justify-center group"
            onClick={() => {
              setIsPlaying(true);
            }}
            type="button"
          >
            {thumbnail ? (
              <img
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
                src={thumbnail}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20" />
            )}
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
              <Play className="h-6 w-6 ml-1" />
            </div>
          </button>
        )}
      </div>
      <p className="mt-2 text-sm text-center text-muted-foreground flex items-center justify-center gap-1">
        <Video className="h-4 w-4" />
        {title}
      </p>
    </div>
  );
}

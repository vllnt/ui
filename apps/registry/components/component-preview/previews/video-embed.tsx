"use client";

import { VideoEmbed } from "@vllnt/ui";

export default function VideoEmbedPreview() {
  return (
    <div className="w-full max-w-md">
      <VideoEmbed src="dQw4w9WgXcQ" title="Example Video" type="youtube" />
    </div>
  );
}

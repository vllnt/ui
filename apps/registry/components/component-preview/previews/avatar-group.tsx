"use client";

import { AvatarGroup } from "@vllnt/ui";

export default function AvatarGroupPreview() {
  return (
    <AvatarGroup
      items={[
        { alt: "Ada Lovelace", fallback: "AL" },
        { alt: "Grace Hopper", fallback: "GH" },
        { alt: "Margaret Hamilton", fallback: "MH" },
        { alt: "Katherine Johnson", fallback: "KJ" },
      ]}
      max={3}
    />
  );
}

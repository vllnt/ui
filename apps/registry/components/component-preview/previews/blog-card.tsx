"use client";

import * as React from "react";

import { ContentCard } from "@vllnt/ui";

export default function BlogCardPreview() {
  return (
    <ContentCard
      href="/blog/getting-started"
      lang="en"
      post={{
        date: "2024-01-15",
        description: "Learn the fundamentals of React development.",
        slug: "getting-started",
        tags: ["React", "Tutorial"],
        title: "Getting Started with React",
      }}
    />
  );
}

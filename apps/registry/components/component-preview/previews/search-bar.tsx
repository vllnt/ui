"use client";

import * as React from "react";

import { SearchBar } from "@vllnt/ui";

export default function SearchBarPreview() {
  return (
    <React.Suspense
      fallback={
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-muted rounded-md animate-pulse" />
          <div className="h-10 w-20 bg-muted rounded-md animate-pulse" />
        </div>
      }
    >
      <SearchBar
        onSearch={(q) => {
          console.info("Search:", q);
        }}
        placeholder="Search articles..."
      />
    </React.Suspense>
  );
}

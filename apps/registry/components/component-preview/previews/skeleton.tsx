"use client";

import { Skeleton } from "@vllnt/ui";

export default function SkeletonPreview() {
  return (
    <div className="flex items-center gap-x-4">
      <Skeleton className="size-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
  );
}

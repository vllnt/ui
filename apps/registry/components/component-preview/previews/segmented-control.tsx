"use client";

import { SegmentedControl, SegmentedControlItem } from "@vllnt/ui";

export default function SegmentedControlPreview() {
  return (
    <div className="w-full max-w-sm">
      <SegmentedControl aria-label="Project view" defaultValue="board">
        <SegmentedControlItem value="board">Board</SegmentedControlItem>
        <SegmentedControlItem value="list">List</SegmentedControlItem>
        <SegmentedControlItem value="timeline">Timeline</SegmentedControlItem>
      </SegmentedControl>
    </div>
  );
}

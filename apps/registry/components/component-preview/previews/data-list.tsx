"use client";

import {
  DataList,
  DataListItem,
  DataListLabel,
  DataListValue,
} from "@vllnt/ui";

export default function DataListPreview() {
  return (
    <div className="w-full max-w-2xl">
      <DataList>
        <DataListItem>
          <DataListLabel>Environment</DataListLabel>
          <DataListValue>Production</DataListValue>
        </DataListItem>
        <DataListItem>
          <DataListLabel>Owner</DataListLabel>
          <DataListValue>Platform engineering</DataListValue>
        </DataListItem>
        <DataListItem>
          <DataListLabel>Deploy window</DataListLabel>
          <DataListValue>Tuesday / Thursday · 09:00 UTC</DataListValue>
        </DataListItem>
      </DataList>
    </div>
  );
}

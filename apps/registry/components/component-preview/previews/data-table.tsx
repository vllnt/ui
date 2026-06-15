"use client";

import { DataTable } from "@vllnt/ui";

export default function DataTablePreview() {
  return (
    <div className="w-full max-w-4xl">
      <DataTable
        columns={[
          { accessorKey: "workspace", header: "Workspace" },
          { accessorKey: "status", header: "Status" },
          { accessorKey: "seats", header: "Seats" },
        ]}
        data={[
          { seats: 142, status: "active", workspace: "Northstar" },
          { seats: 28, status: "trial", workspace: "Signal" },
          { seats: 11, status: "paused", workspace: "Helix" },
        ]}
        enableSelection={true}
        filterableColumns={[
          {
            columnId: "status",
            label: "status",
            options: [
              { label: "Active", value: "active" },
              { label: "Trial", value: "trial" },
              { label: "Paused", value: "paused" },
            ],
          },
        ]}
        searchPlaceholder="Search workspaces"
      />
    </div>
  );
}

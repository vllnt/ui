import type { ColumnDef } from "@tanstack/react-table";
import { expect, test } from "@playwright/experimental-ct-react";

import { DataTable } from "./data-table";

type Row = {
  name: string;
  status: string;
  users: number;
};

const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Workspace" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "users", header: "Users" },
];

test.describe("DataTable Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="w-[860px] p-4">
        <DataTable
          columns={columns}
          data={[
            { name: "Northstar", status: "active", users: 142 },
            { name: "Signal", status: "trial", users: 28 },
            { name: "Helix", status: "paused", users: 11 },
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
      </div>,
    );

    await expect(page).toHaveScreenshot("data-table-default.png");
  });
});
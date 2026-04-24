import type { ColumnDef } from "@tanstack/react-table";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusIndicator } from "../status-indicator";
import { DataTable } from "./data-table";

type Workspace = {
  seats: number;
  status: string;
  workspace: string;
};

const columns: ColumnDef<Workspace>[] = [
  {
    accessorKey: "workspace",
    header: "Workspace",
  },
  {
    accessorKey: "status",
    cell: ({ row }) => (
      <StatusIndicator
        tone={
          row.original.status === "active"
            ? "success"
            : row.original.status === "trial"
              ? "info"
              : "warning"
        }
      >
        {row.original.status}
      </StatusIndicator>
    ),
    header: "Status",
  },
  {
    accessorKey: "seats",
    header: "Seats",
  },
];

const data: Workspace[] = [
  { seats: 142, status: "active", workspace: "Northstar" },
  { seats: 28, status: "trial", workspace: "Signal" },
  { seats: 11, status: "paused", workspace: "Helix" },
  { seats: 63, status: "active", workspace: "Comet" },
];

function DataTableStory() {
  return (
    <DataTable
      columns={columns}
      data={data}
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
  );
}

const meta = {
  component: DataTableStory,
  title: "Data/DataTable",
} satisfies Meta<typeof DataTableStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
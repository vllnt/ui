import type { ColumnDef } from "@tanstack/react-table";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DataTable } from "./data-table";

type Invoice = {
  customer: string;
  revenue: number;
  status: string;
};

const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
  },
];

const data: Invoice[] = [
  { customer: "Acme", revenue: 4100, status: "active" },
  { customer: "Beacon", revenue: 1800, status: "trial" },
  { customer: "Delta", revenue: 950, status: "paused" },
];

function getBodyRows(container: HTMLElement): HTMLTableRowElement[] {
  const body = container.querySelector("tbody");
  return body ? [...body.querySelectorAll("tr")] : [];
}

describe("DataTable", () => {
  it("renders rows", () => {
    render(<DataTable columns={columns} data={data} />);

    expect(screen.getByText("Acme")).toBeVisible();
    expect(screen.getByText("Beacon")).toBeVisible();
  });

  it("sorts rows when clicking a sortable header", () => {
    const { container } = render(<DataTable columns={columns} data={data} />);

    const revenueHeader = screen.getByRole("button", { name: /revenue/i });
    fireEvent.click(revenueHeader);
    fireEvent.click(revenueHeader);

    expect(getBodyRows(container)[0]).toHaveTextContent("Delta");
  });

  it("filters rows through the search input", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search customers"
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search customers"), {
      target: { value: "Beacon" },
    });

    expect(screen.getByText("Beacon")).toBeVisible();
    expect(screen.queryByText("Acme")).toBeNull();
  });

  it("supports row selection", () => {
    render(<DataTable columns={columns} data={data} enableSelection={true} />);

    fireEvent.click(screen.getByLabelText("Select row 1"));

    expect(screen.getByText("1 selected")).toBeVisible();
  });
});

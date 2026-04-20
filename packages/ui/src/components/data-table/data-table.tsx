"use client";

import * as React from "react";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type RowData,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { Input } from "../input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";

export type DataTableFilterOption = {
  label: string;
  value: string;
};

export type DataTableFilter = {
  columnId: string;
  label: string;
  options: DataTableFilterOption[];
};

export type DataTableProps<TData extends RowData> =
  React.HTMLAttributes<HTMLDivElement> & {
    caption?: string;
    columns: ColumnDef<TData>[];
    data: TData[];
    emptyMessage?: string;
    enableFiltering?: boolean;
    enablePagination?: boolean;
    enableSelection?: boolean;
    filterableColumns?: DataTableFilter[];
    getRowId?: (
      originalRow: TData,
      index: number,
      parent?: Row<TData>,
    ) => string;
    pageSize?: number;
    searchPlaceholder?: string;
  };

function SortIcon({ direction }: { direction: "asc" | "desc" | false }) {
  if (direction === "asc") {
    return <ArrowUp className="h-4 w-4" />;
  }

  if (direction === "desc") {
    return <ArrowDown className="h-4 w-4" />;
  }

  return <ArrowUpDown className="h-4 w-4" />;
}

function DataTableComponent<TData extends RowData>({
  caption,
  className,
  columns,
  data,
  emptyMessage = "No results found.",
  enableFiltering = true,
  enablePagination = true,
  enableSelection = false,
  filterableColumns = [],
  getRowId,
  pageSize = 10,
  searchPlaceholder = "Search rows...",
  ...props
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const selectionColumn = React.useMemo<ColumnDef<TData>>(
    () => ({
      cell: ({ row }) => (
        <Checkbox
          aria-label={`Select row ${row.index + 1}`}
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => {
            row.toggleSelected(Boolean(checked));
          }}
        />
      ),
      enableHiding: false,
      enableSorting: false,
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all rows"
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={(checked) => {
            table.toggleAllPageRowsSelected(Boolean(checked));
          }}
        />
      ),
      id: "select",
      size: 40,
    }),
    [],
  );

  const resolvedColumns = React.useMemo(
    () => (enableSelection ? [selectionColumn, ...columns] : columns),
    [columns, enableSelection, selectionColumn],
  );

  const table = useReactTable({
    columns: resolvedColumns,
    data,
    enableRowSelection: enableSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId,
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      globalFilter,
      rowSelection,
      sorting,
    },
  });

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {enableFiltering ? (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <Input
            className="w-full sm:max-w-sm"
            onChange={(event) => {
              setGlobalFilter(event.target.value);
            }}
            placeholder={searchPlaceholder}
            value={globalFilter}
          />
          {filterableColumns.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {filterableColumns.map((filter) => {
                const column = table.getColumn(filter.columnId);
                const value = column?.getFilterValue();
                const selectValue =
                  typeof value === "string" && value ? value : "all";

                return column ? (
                  <Select
                    key={filter.columnId}
                    onValueChange={(nextValue) => {
                      column.setFilterValue(
                        nextValue === "all" ? undefined : nextValue,
                      );
                    }}
                    value={selectValue}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={filter.label} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All {filter.label}</SelectItem>
                      {filter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null;
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-xl border bg-card">
        <Table>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <Button
                        className="-ml-3 h-8 px-3 text-xs font-medium"
                        onClick={header.column.getToggleSortingHandler()}
                        type="button"
                        variant="ghost"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        <SortIcon direction={header.column.getIsSorted()} />
                      </Button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-muted-foreground"
                  colSpan={resolvedColumns.length}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
          {enableSelection
            ? `${table.getSelectedRowModel().rows.length} selected`
            : `${table.getFilteredRowModel().rows.length} rows`}
        </div>
        {enablePagination ? (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              disabled={!table.getCanPreviousPage()}
              onClick={() => {
                table.previousPage();
              }}
              type="button"
              variant="outline"
            >
              Previous
            </Button>
            <span className="min-w-24 text-center text-xs uppercase tracking-wide text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <Button
              disabled={!table.getCanNextPage()}
              onClick={() => {
                table.nextPage();
              }}
              type="button"
              variant="outline"
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export { DataTableComponent as DataTable };

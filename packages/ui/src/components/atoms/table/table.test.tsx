import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

function slotsOf(container: HTMLElement): (string | undefined)[] {
  return [...container.querySelectorAll<HTMLElement>("[data-slot]")].map(
    (element) => element.dataset.slot,
  );
}

describe("Table", () => {
  it("renders rows + cells in a table", () => {
    render(
      <Table>
        <TableCaption>Run history</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>r-1</TableCell>
            <TableCell>complete</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>1 run</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );
    expect(screen.getByText("Run history")).toBeInTheDocument();
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("r-1")).toBeInTheDocument();
    expect(screen.getByText("1 run")).toBeInTheDocument();
  });

  it("merges the className prop on the root", () => {
    const { container } = render(
      <Table className="extra">
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(container.querySelector("table")).toHaveClass("extra");
  });

  it("names every part with data-slot, so a consumer can target it", () => {
    const { container } = render(
      <Table>
        <TableCaption>Caption</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Ada</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );
    expect(new Set(slotsOf(container))).toEqual(
      new Set([
        "table",
        "table-caption",
        "table-header",
        "table-row",
        "table-head",
        "table-body",
        "table-cell",
        "table-footer",
      ]),
    );
  });
});

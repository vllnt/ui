import { createRef } from "react";

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AccessMatrix, type AccessMatrixValue } from "./access-matrix";

const subjects = [
  { description: "Full access", id: "admins", label: "Admins" },
  { id: "editors", label: "Editors" },
];

const permissions = [
  { id: "read", label: "Read" },
  { id: "write", label: "Write" },
  { id: "delete", label: "Delete" },
];

const value: AccessMatrixValue = {
  admins: { delete: "granted", read: "granted", write: "granted" },
  editors: { delete: "denied", read: "inherited", write: "granted" },
};

describe("AccessMatrix grid", () => {
  it("renders a table with column and row headers", () => {
    render(
      <AccessMatrix
        permissions={permissions}
        subjects={subjects}
        title="Team access"
        value={value}
      />,
    );

    expect(screen.getByRole("table", { name: "Team access" })).toBeVisible();
    const columns = screen.getAllByRole("columnheader");
    expect(columns.map((column) => column.textContent)).toEqual([
      "Read",
      "Write",
      "Delete",
    ]);
    expect(columns.map((column) => column.getAttribute("scope"))).toEqual([
      "col",
      "col",
      "col",
    ]);
    const rows = screen.getAllByRole("rowheader");
    expect(rows.map((row) => row.getAttribute("scope"))).toEqual([
      "row",
      "row",
    ]);
    expect(screen.getByRole("rowheader", { name: /Admins/ })).toHaveTextContent(
      "Full access",
    );
  });

  it("renders one cell per subject and permission", () => {
    render(
      <AccessMatrix
        permissions={permissions}
        subjects={subjects}
        value={value}
      />,
    );

    const [, ...bodyRows] = screen.getAllByRole("row");
    expect(bodyRows).toHaveLength(subjects.length);
    expect(
      bodyRows.map((row) => within(row).getAllByRole("cell").length),
    ).toEqual([permissions.length, permissions.length]);
  });

  it("names every state with a word, not only a glyph", () => {
    render(
      <AccessMatrix
        permissions={permissions}
        subjects={subjects}
        value={value}
      />,
    );

    const editors = screen.getByRole("row", { name: /Editors/ });
    const cells = within(editors).getAllByRole("cell");
    expect(cells.map((cell) => cell.textContent)).toEqual([
      "Inherited",
      "Granted",
      "Denied",
    ]);
  });

  it("reads a missing entry as denied", () => {
    render(
      <AccessMatrix
        permissions={permissions}
        subjects={subjects}
        value={{ admins: { read: "granted" } }}
      />,
    );

    const editors = screen.getByRole("row", { name: /Editors/ });
    expect(
      within(editors)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["Denied", "Denied", "Denied"]);
  });

  it("uses custom state words", () => {
    render(
      <AccessMatrix
        labels={{ denied: "Non", granted: "Oui" }}
        permissions={permissions}
        subjects={subjects}
        value={value}
      />,
    );

    expect(screen.getAllByText("Oui").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Non").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Inherited").length).toBeGreaterThan(0);
    expect(screen.queryByText("Granted")).not.toBeInTheDocument();
  });

  it("is read-only without onChange", () => {
    render(
      <AccessMatrix
        permissions={permissions}
        subjects={subjects}
        value={value}
      />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("fires onChange with the ids and the opposite state", () => {
    const onChange = vi.fn();
    render(
      <AccessMatrix
        onChange={onChange}
        permissions={permissions}
        subjects={subjects}
        value={value}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Editors, Write: Granted" }),
    );
    expect(onChange).toHaveBeenLastCalledWith("editors", "write", "denied");

    fireEvent.click(
      screen.getByRole("button", { name: "Editors, Delete: Denied" }),
    );
    expect(onChange).toHaveBeenLastCalledWith("editors", "delete", "granted");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("keeps inherited cells read-only", () => {
    const onChange = vi.fn();
    render(
      <AccessMatrix
        onChange={onChange}
        permissions={permissions}
        subjects={subjects}
        value={value}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /Editors, Read/ }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(5);
    fireEvent.click(
      screen.getByText("Inherited", { selector: "td span span" }),
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it("uses custom words in the button name", () => {
    render(
      <AccessMatrix
        labels={{ granted: "Oui" }}
        onChange={vi.fn()}
        permissions={permissions}
        subjects={subjects}
        value={value}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Admins, Read: Oui" }),
    ).toBeVisible();
  });

  it("shows the inherited key only when a cell is inherited", () => {
    const { rerender } = render(
      <AccessMatrix
        permissions={permissions}
        subjects={subjects}
        title="Team access"
        value={value}
      />,
    );
    expect(
      screen.getByText("Inherited", { selector: "p" }),
    ).toBeInTheDocument();

    rerender(
      <AccessMatrix
        permissions={permissions}
        subjects={subjects}
        title="Team access"
        value={{ admins: { read: "granted" } }}
      />,
    );
    expect(screen.getByRole("heading", { name: "Team access" })).toBeVisible();
    expect(screen.queryByText("Inherited")).not.toBeInTheDocument();
  });
});

describe("AccessMatrix list", () => {
  it("renders the entries instead of the table", () => {
    render(
      <AccessMatrix
        mode="list"
        permissions={permissions}
        subjects={subjects}
        title="Team access"
        value={value}
      />,
    );

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    const list = screen.getByRole("list", { name: "Team access" });
    const entries = within(list).getAllByRole("listitem");
    expect(entries.length).toBeGreaterThanOrEqual(subjects.length);
    const editors = screen
      .getAllByRole("listitem")
      .find((entry) => within(entry).queryByText("Editors"));
    expect(editors).toBeDefined();
    expect(editors).toHaveTextContent("ReadInherited");
    expect(editors).toHaveTextContent("WriteGranted");
    expect(editors).toHaveTextContent("DeleteDenied");
  });

  it("shows the subject description", () => {
    render(
      <AccessMatrix
        mode="list"
        permissions={permissions}
        subjects={subjects}
        value={value}
      />,
    );

    expect(screen.getByText("Full access")).toBeVisible();
  });

  it("fires onChange and leaves inherited entries read-only", () => {
    const onChange = vi.fn();
    render(
      <AccessMatrix
        mode="list"
        onChange={onChange}
        permissions={permissions}
        subjects={subjects}
        value={value}
      />,
    );

    expect(screen.getAllByRole("button")).toHaveLength(5);
    fireEvent.click(
      screen.getByRole("button", { name: "Admins, Delete: Granted" }),
    );
    expect(onChange).toHaveBeenCalledWith("admins", "delete", "denied");
    expect(
      screen.queryByRole("button", { name: /Editors, Read/ }),
    ).not.toBeInTheDocument();
  });
});

describe("AccessMatrix edge cases", () => {
  it("renders no table or list when there are no subjects", () => {
    render(
      <AccessMatrix
        permissions={permissions}
        subjects={[]}
        title="Team access"
        value={{}}
      />,
    );

    expect(screen.getByRole("heading", { name: "Team access" })).toBeVisible();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders no table or list when there are no permissions", () => {
    render(
      <AccessMatrix
        mode="list"
        permissions={[]}
        subjects={subjects}
        value={{}}
      />,
    );

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders without a title or a label on the grid", () => {
    render(
      <AccessMatrix permissions={permissions} subjects={subjects} value={{}} />,
    );

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.getByRole("table")).not.toHaveAttribute("aria-labelledby");
  });

  it("forwards ref and root props to a section", () => {
    const reference = createRef<HTMLElement>();
    render(
      <AccessMatrix
        aria-label="Access"
        className="custom"
        data-testid="matrix"
        permissions={permissions}
        ref={reference}
        subjects={subjects}
        value={value}
      />,
    );

    const root = screen.getByTestId("matrix");
    expect(root.tagName).toBe("SECTION");
    expect(root).toHaveClass("custom");
    expect(reference.current).toBe(root);
  });
});

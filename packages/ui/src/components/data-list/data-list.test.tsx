import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  DataList,
  DataListItem,
  DataListLabel,
  DataListValue,
} from "./data-list";

describe("DataList", () => {
  it("renders labels and values semantically with custom class names", () => {
    render(
      <DataList className="custom-class">
        <DataListItem>
          <DataListLabel>Environment</DataListLabel>
          <DataListValue>Production</DataListValue>
        </DataListItem>
      </DataList>,
    );
    expect(screen.getByText("Environment").tagName).toBe("DT");
    expect(screen.getByText("Production").tagName).toBe("DD");
    expect(screen.getByText("Environment").closest("dl")).toHaveClass(
      "custom-class",
    );
  });

  it("inherits compact density from the root", () => {
    render(
      <DataList density="compact">
        <DataListItem>
          <DataListLabel>Owner</DataListLabel>
          <DataListValue>Design systems</DataListValue>
        </DataListItem>
      </DataList>,
    );
    expect(screen.getByText("Owner").parentElement).toHaveClass("py-3");
  });
});

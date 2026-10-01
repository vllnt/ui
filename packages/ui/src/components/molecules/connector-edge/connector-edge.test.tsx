import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ConnectorEdge } from "./connector-edge";

describe("ConnectorEdge", () => {
  it("renders an inline edge label", () => {
    render(
      <ConnectorEdge
        end={{ x: 240, y: 80 }}
        label="artifact stream"
        start={{ x: 0, y: 0 }}
        state="active"
      />,
    );

    expect(screen.getByText("artifact stream")).toBeInTheDocument();
  });
});

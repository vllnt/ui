import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StickyMetric } from "./sticky-metric";

describe("StickyMetric", () => {
  it("renders the label and value", () => {
    render(<StickyMetric label="errs / min" value="14" x={100} y={50} />);

    expect(screen.getByText("errs / min")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
  });

  it("positions the metric using the anchor coords", () => {
    const { container } = render(
      <StickyMetric label="x" value="1" x={120} y={80} />,
    );

    const metric = container.querySelector("[data-sticky-metric]");
    expect(metric).toHaveStyle({ left: "120px", top: "80px" });
  });

  it("propagates the anchor to a data attribute", () => {
    const { container } = render(
      <StickyMetric anchor="bottom-left" label="x" value="1" x={0} y={0} />,
    );

    expect(container.querySelector("[data-sticky-anchor]")).toHaveAttribute(
      "data-sticky-anchor",
      "bottom-left",
    );
  });

  it("renders the optional detail line", () => {
    render(<StickyMetric detail="↑ 12%" label="qps" value="240" x={0} y={0} />);

    expect(screen.getByText("↑ 12%")).toBeInTheDocument();
  });

  it("propagates tone to a data attribute", () => {
    const { container } = render(
      <StickyMetric label="x" tone="danger" value="1" x={0} y={0} />,
    );

    expect(container.querySelector("[data-sticky-tone]")).toHaveAttribute(
      "data-sticky-tone",
      "danger",
    );
  });
});

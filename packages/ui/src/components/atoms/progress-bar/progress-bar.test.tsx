import { createRef } from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ProgressBar,
  type ProgressBarSize,
  type ProgressBarTone,
} from "./progress-bar";

function getFill(): Element | null {
  return screen.getByRole("progressbar").firstElementChild;
}

describe("ProgressBar", () => {
  it("renders a visible root that merges className", () => {
    const { container } = render(<ProgressBar className="custom-class" />);
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("ProgressBar accessibility", () => {
  it("exposes the progressbar role with ARIA range values and the visible label as name", () => {
    render(<ProgressBar label="Upload" max={8} value={3} />);
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "8");
    expect(bar).toHaveAttribute("aria-valuenow", "3");
  });

  it("points aria-labelledby at the rendered label node", () => {
    render(<ProgressBar max={10} value={4} />);
    const bar = screen.getByRole("progressbar", { name: "Progress" });
    const labelledBy = bar.getAttribute("aria-labelledby");
    expect(labelledBy).not.toBeNull();
    expect(screen.getByText("Progress")).toHaveAttribute("id", labelledBy);
    expect(bar).not.toHaveAttribute("aria-label");
  });

  it("names the bar from currentLabel and from the complete state", () => {
    const { rerender } = render(
      <ProgressBar currentLabel="Lessons" max={10} value={4} />,
    );
    expect(
      screen.getByRole("progressbar", { name: "Lessons" }),
    ).toBeInTheDocument();
    rerender(<ProgressBar isComplete max={10} value={10} />);
    expect(
      screen.getByRole("progressbar", { name: "Complete" }),
    ).toBeInTheDocument();
  });

  it("lets aria-label override the visible label as the name", () => {
    render(
      <ProgressBar aria-label="Upload files" label="Step" max={8} value={3} />,
    );
    const bar = screen.getByRole("progressbar", { name: "Upload files" });
    expect(bar).not.toHaveAttribute("aria-labelledby");
  });

  it("falls back to a default name when no label is rendered", () => {
    const { rerender } = render(
      <ProgressBar max={8} showLabels={false} value={3} />,
    );
    expect(
      screen.getByRole("progressbar", { name: "Progress" }),
    ).toBeInTheDocument();
    rerender(
      <ProgressBar aria-label="Sync" max={8} showLabels={false} value={3} />,
    );
    expect(
      screen.getByRole("progressbar", { name: "Sync" }),
    ).toBeInTheDocument();
  });

  it("omits aria-valuenow in indeterminate mode but keeps the range", () => {
    render(<ProgressBar max={100} mode="indeterminate" value={40} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("omits aria-valuenow while loading", () => {
    render(<ProgressBar isLoading max={100} value={40} />);
    const bar = screen.getByRole("progressbar", { name: "Progress" });
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).not.toHaveAttribute("aria-labelledby");
  });

  it("reports a value again once an indeterminate task is complete", () => {
    render(
      <ProgressBar isComplete max={100} mode="indeterminate" value={100} />,
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });
});

describe("ProgressBar tone", () => {
  it.each<[ProgressBarTone, string]>([
    ["neutral", "bg-muted-foreground"],
    ["primary", "bg-primary"],
    ["success", "bg-success"],
    ["info", "bg-info"],
    ["warning", "bg-warning"],
    ["danger", "bg-destructive"],
  ])("renders the %s tone with %s", (tone, roleClass) => {
    render(<ProgressBar max={10} tone={tone} value={5} />);
    expect(getFill()).toHaveClass(roleClass);
  });

  it("keeps the primary fill by default and uses the success role once complete", () => {
    const { container, rerender } = render(<ProgressBar max={10} value={5} />);
    expect(getFill()).toHaveClass("bg-primary");
    expect(container.firstChild).toHaveClass("border-border", "bg-muted/30");

    rerender(<ProgressBar isComplete max={10} value={10} />);
    expect(getFill()).toHaveClass("bg-success");
    expect(container.firstChild).toHaveClass(
      "border-success/50",
      "bg-success/5",
    );
    expect(container.innerHTML).not.toContain("green-");
  });

  it("lets an explicit tone win over the complete default", () => {
    const { container } = render(
      <ProgressBar isComplete max={10} tone="info" value={10} />,
    );
    expect(getFill()).toHaveClass("bg-info");
    expect(container.firstChild).toHaveClass("border-info/50", "bg-info/5");
  });
});

describe("ProgressBar size", () => {
  it.each<[ProgressBarSize, string]>([
    ["sm", "h-1"],
    ["md", "h-2"],
    ["lg", "h-3"],
  ])("renders the %s track as %s", (size, heightClass) => {
    render(<ProgressBar max={10} size={size} value={5} />);
    expect(screen.getByRole("progressbar")).toHaveClass(heightClass);
  });

  it("keeps today's h-2 track by default", () => {
    render(<ProgressBar max={10} value={5} />);
    expect(screen.getByRole("progressbar")).toHaveClass("h-2");
  });
});

describe("ProgressBar mode", () => {
  it("animates an indeterminate bar with a reduced-motion fallback", () => {
    render(<ProgressBar max={100} mode="indeterminate" value={0} />);
    const fill = getFill();
    expect(fill).toHaveClass("animate-shimmer", "motion-reduce:animate-none");
    expect(fill).not.toHaveAttribute("style");
  });

  it("hides the legacy value text while the value is unknown", () => {
    render(<ProgressBar max={8} mode="indeterminate" value={3} />);
    expect(screen.queryByText(/3 \/ 8/)).not.toBeInTheDocument();
  });

  it("does not animate a determinate bar and sizes the fill from the value", () => {
    render(<ProgressBar max={8} value={2} />);
    const fill = getFill();
    expect(fill).not.toHaveClass("animate-shimmer");
    expect(fill).toHaveStyle({ width: "25%" });
  });
});

describe("ProgressBar labels", () => {
  it("renders label and valueLabel, including a step label", () => {
    render(<ProgressBar label="Step" max={8} value={3} valueLabel="3 / 8" />);
    expect(screen.getByText("Step")).toBeInTheDocument();
    expect(screen.getByText("3 / 8")).toBeInTheDocument();
  });

  it("accepts nodes for label and valueLabel", () => {
    render(
      <ProgressBar
        label={<strong>Upload</strong>}
        max={8}
        value={3}
        valueLabel={<em>3 of 8</em>}
      />,
    );
    expect(screen.getByText("Upload").tagName).toBe("STRONG");
    expect(screen.getByText("3 of 8").tagName).toBe("EM");
    expect(
      screen.getByRole("progressbar", { name: "Upload" }),
    ).toBeInTheDocument();
  });

  it("shows the percentage when showValue is set and valueLabel is absent", () => {
    render(<ProgressBar max={8} showValue value={3} />);
    expect(screen.getByText("38%")).toBeInTheDocument();
    expect(screen.queryByText(/3 \/ 8/)).not.toBeInTheDocument();
  });

  it("prefers valueLabel over showValue", () => {
    render(<ProgressBar max={8} showValue value={3} valueLabel="3 / 8" />);
    expect(screen.getByText("3 / 8")).toBeInTheDocument();
    expect(screen.queryByText("38%")).not.toBeInTheDocument();
  });

  it("shows valueLabel in indeterminate mode but never a percentage", () => {
    render(
      <ProgressBar
        max={8}
        mode="indeterminate"
        showValue
        value={3}
        valueLabel="Preparing"
      />,
    );
    expect(screen.getByText("Preparing")).toBeInTheDocument();
    const { container } = render(
      <ProgressBar max={8} mode="indeterminate" showValue value={3} />,
    );
    expect(container).not.toHaveTextContent("%");
  });

  it("hides the whole header row when showLabels is false", () => {
    render(
      <ProgressBar
        label="Step"
        max={8}
        showLabels={false}
        value={3}
        valueLabel="3 / 8"
      />,
    );
    expect(screen.queryByText("Step")).not.toBeInTheDocument();
    expect(screen.queryByText("3 / 8")).not.toBeInTheDocument();
  });
});

describe("ProgressBar existing behaviour", () => {
  it("renders the default label and the value / max text", () => {
    render(<ProgressBar max={8} value={3} />);
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("3 / 8")).toBeInTheDocument();
    expect(getFill()).toHaveStyle({ width: "38%" });
  });

  it("keeps currentLabel, completedLabel and isComplete", () => {
    render(
      <ProgressBar
        completedLabel="lessons"
        currentLabel="40% complete"
        max={10}
        value={4}
      />,
    );
    expect(screen.getByText("40% complete")).toBeInTheDocument();
    expect(screen.getByText("4 / 10 lessons")).toBeInTheDocument();
  });

  it("prefers label over currentLabel", () => {
    render(<ProgressBar currentLabel="Old" label="New" max={10} value={4} />);
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.queryByText("Old")).not.toBeInTheDocument();
  });

  it("renders an empty bar when max is zero", () => {
    render(<ProgressBar max={0} value={0} />);
    expect(getFill()).toHaveStyle({ width: "0%" });
  });

  it("shows a skeleton header and an empty bar while loading", () => {
    const { container } = render(<ProgressBar isLoading max={10} value={5} />);
    expect(screen.queryByText("Progress")).not.toBeInTheDocument();
    expect(getFill()).toHaveClass("w-0");
    expect(getFill()).not.toHaveAttribute("style");
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(2);
  });

  it("forwards ref to the root and sets a displayName", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<ProgressBar max={10} ref={ref} value={5} />);
    expect(ref.current).toBe(container.firstChild);
    expect(ProgressBar.displayName).toBe("ProgressBar");
  });
});

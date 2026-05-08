import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

describe("Tooltip", () => {
  it("renders the trigger but keeps the content closed by default", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tip body</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(screen.getByText("Hover me")).toBeInTheDocument();
    expect(screen.queryByText("Tip body")).not.toBeInTheDocument();
  });

  it("renders the content when defaultOpen is true", () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Open content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(screen.getAllByText("Open content").length).toBeGreaterThan(0);
  });

  it("merges the className prop on the content", () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent className="extra">Body</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const node = screen.getAllByText("Body")[0];
    expect(node).toHaveClass("extra");
  });
});

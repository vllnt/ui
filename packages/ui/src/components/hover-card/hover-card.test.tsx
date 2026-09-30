import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

describe("HoverCard", () => {
  it("renders the trigger but keeps the content closed by default", () => {
    render(
      <HoverCard>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Card body</HoverCardContent>
      </HoverCard>,
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
    expect(screen.queryByText("Card body")).not.toBeInTheDocument();
  });

  it("renders the content with merged className when defaultOpen is true", () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger>Trigger</HoverCardTrigger>
        <HoverCardContent className="extra">Open card</HoverCardContent>
      </HoverCard>,
    );
    expect(screen.getByText("Open card")).toHaveClass("extra");
  });
});

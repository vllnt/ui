import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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
    // ui-sdk keeps the closed tooltip hidden in the page, so it can name or
    // describe its trigger before focus reaches it.
    expect(screen.getByText("Tip body")).not.toBeVisible();
    expect(screen.getByText("Tip body")).toHaveAttribute(
      "data-state",
      "closed",
    );
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

  it("emits the Radix data-state values on the trigger and the content", () => {
    render(
      <Tooltip defaultOpen>
        <TooltipTrigger>Trigger</TooltipTrigger>
        <TooltipContent>Body</TooltipContent>
      </Tooltip>,
    );
    expect(screen.getByText("Body")).toHaveAttribute(
      "data-state",
      "delayed-open",
    );
    expect(screen.getByText("Trigger")).toHaveAttribute(
      "data-state",
      "delayed-open",
    );
  });

  it("renders the child as the trigger with asChild", () => {
    render(
      <Tooltip>
        <TooltipTrigger asChild>
          <a href="#docs">Docs</a>
        </TooltipTrigger>
        <TooltipContent>Body</TooltipContent>
      </Tooltip>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("data-slot", "tooltip-trigger");
    expect(link).toHaveAttribute("data-state", "closed");
  });

  it("forwards the ref to the content", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Tooltip defaultOpen>
        <TooltipTrigger>Trigger</TooltipTrigger>
        <TooltipContent ref={ref}>Body</TooltipContent>
      </Tooltip>,
    );
    expect(ref.current).toBe(screen.getByText("Body"));
  });
});

const hover = (element: HTMLElement) => {
  fireEvent.pointerEnter(element, { pointerType: "mouse" });
  fireEvent.pointerMove(element, { pointerType: "mouse" });
};

const advance = (milliseconds: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
  });

describe("Tooltip delay", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens after the provider's delayDuration", async () => {
    vi.useFakeTimers();
    render(
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    hover(screen.getByText("Hover me"));
    await advance(299);
    expect(screen.getByText("Tip")).toHaveAttribute("data-state", "closed");
    await advance(2);
    expect(screen.getByText("Tip")).toHaveAttribute(
      "data-state",
      "delayed-open",
    );
  });

  it("lets the tooltip's own delayDuration win over the provider's", async () => {
    vi.useFakeTimers();
    render(
      <TooltipProvider delayDuration={1000}>
        <Tooltip delayDuration={100}>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    hover(screen.getByText("Hover me"));
    await advance(101);
    expect(screen.getByText("Tip")).toHaveAttribute(
      "data-state",
      "delayed-open",
    );
  });

  it("waits 700 ms by default, like Radix", async () => {
    vi.useFakeTimers();
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tip</TooltipContent>
      </Tooltip>,
    );
    hover(screen.getByText("Hover me"));
    await advance(699);
    expect(screen.getByText("Tip")).toHaveAttribute("data-state", "closed");
    await advance(2);
    expect(screen.getByText("Tip")).toHaveAttribute(
      "data-state",
      "delayed-open",
    );
  });

  it("opens the next tooltip at once with instant-open", async () => {
    vi.useFakeTimers();
    render(
      <>
        <Tooltip>
          <TooltipTrigger>First</TooltipTrigger>
          <TooltipContent>First tip</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>Second</TooltipTrigger>
          <TooltipContent>Second tip</TooltipContent>
        </Tooltip>
      </>,
    );
    hover(screen.getByText("First"));
    await advance(701);
    fireEvent.pointerLeave(screen.getByText("First"), { pointerType: "mouse" });
    hover(screen.getByText("Second"));
    await advance(1);
    expect(screen.getByText("Second tip")).toHaveAttribute(
      "data-state",
      "instant-open",
    );
  });
});

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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

  it("emits the Radix data-state values on the trigger and the content", () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger href="#profile">Trigger</HoverCardTrigger>
        <HoverCardContent>Open card</HoverCardContent>
      </HoverCard>,
    );
    expect(screen.getByText("Trigger")).toHaveAttribute("data-state", "open");
    expect(screen.getByText("Open card")).toHaveAttribute("data-state", "open");
  });

  it("renders the child as the trigger with asChild", () => {
    render(
      <HoverCard>
        <HoverCardTrigger asChild>
          <button type="button">Profile</button>
        </HoverCardTrigger>
        <HoverCardContent>Card body</HoverCardContent>
      </HoverCard>,
    );
    const button = screen.getByRole("button", { name: "Profile" });
    expect(button).toHaveAttribute("data-slot", "hover-card-trigger");
    expect(button).toHaveAttribute("data-state", "closed");
  });

  it("forwards the ref to the content", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger>Trigger</HoverCardTrigger>
        <HoverCardContent ref={ref}>Open card</HoverCardContent>
      </HoverCard>,
    );
    expect(ref.current).toBe(screen.getByText("Open card"));
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

describe("HoverCard delays", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens after openDelay, 700 ms by default like Radix", async () => {
    vi.useFakeTimers();
    render(
      <HoverCard>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Card body</HoverCardContent>
      </HoverCard>,
    );
    hover(screen.getByText("Hover me"));
    await advance(699);
    expect(screen.queryByText("Card body")).not.toBeInTheDocument();
    await advance(2);
    expect(screen.getByText("Card body")).toBeInTheDocument();
  });

  it("opens after a custom openDelay and closes after closeDelay", async () => {
    vi.useFakeTimers();
    render(
      <HoverCard closeDelay={50} openDelay={100}>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Card body</HoverCardContent>
      </HoverCard>,
    );
    const trigger = screen.getByText("Hover me");
    hover(trigger);
    await advance(101);
    expect(screen.getByText("Card body")).toBeInTheDocument();

    // jsdom lays everything out at 0,0; leave from far away so the pointer is
    // outside the bridge ui-sdk keeps between the trigger and the card.
    fireEvent.pointerLeave(trigger, {
      clientX: 500,
      clientY: 500,
      pointerType: "mouse",
    });
    await advance(49);
    expect(screen.getByText("Card body")).toBeInTheDocument();
    await advance(2);
    expect(screen.queryByText("Card body")).not.toBeInTheDocument();
  });
});

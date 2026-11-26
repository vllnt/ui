import { createRef } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";

const SLIDE_WIDTH = 100;

// jsdom has no layout. ui-sdk reads offsets, client and scroll sizes and the
// computed width, so give the viewport and its slides a 100px-wide grid.
function mockLayout(slideCount: number) {
  const offsetLeft = vi
    .spyOn(HTMLElement.prototype, "offsetLeft", "get")
    .mockImplementation(function offsetLeftOf(this: HTMLElement) {
      return Number(this.dataset.left ?? 0);
    });
  const clientWidth = vi
    .spyOn(HTMLElement.prototype, "clientWidth", "get")
    .mockReturnValue(SLIDE_WIDTH);
  const scrollWidth = vi
    .spyOn(HTMLElement.prototype, "scrollWidth", "get")
    .mockReturnValue(slideCount * SLIDE_WIDTH);
  return () => {
    offsetLeft.mockRestore();
    clientWidth.mockRestore();
    scrollWidth.mockRestore();
  };
}

function viewportOf() {
  const viewport = document.querySelector<HTMLElement>(
    '[data-slot="carousel-viewport"]',
  );
  if (!viewport) {
    throw new Error("Carousel viewport not found");
  }
  return viewport;
}

function Slides({ count = 4 }: { count?: number }) {
  return Array.from({ length: count }, (_, index) => (
    <CarouselItem
      data-left={index * SLIDE_WIDTH}
      key={index}
      style={{ width: SLIDE_WIDTH }}
    >
      Slide {index + 1}
    </CarouselItem>
  ));
}

function Example({
  count = 4,
  ...props
}: Omit<React.ComponentProps<typeof Carousel>, "children"> & {
  count?: number;
}) {
  return (
    <Carousel aria-label="Release stages" {...props}>
      <CarouselContent>
        <Slides count={count} />
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

async function renderMeasured(
  properties: React.ComponentProps<typeof Example> = {},
) {
  const api: { current?: CarouselApi } = {};
  const view = render(
    <Example
      setApi={(next) => {
        api.current = next;
      }}
      {...properties}
    />,
  );
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
  });
  return { api, ...view };
}

describe("Carousel", () => {
  it("renders a visible root that merges className and forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Carousel className="custom-class" ref={ref} />,
    );
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

describe("Carousel accessibility", () => {
  it("is a labelled carousel region whose slides are labelled groups", async () => {
    render(<Example />);
    const region = screen.getByRole("region", { name: "Release stages" });
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    const slides = await screen.findAllByRole("group");
    expect(slides).toHaveLength(4);
    slides.forEach((slide, index) => {
      expect(slide).toHaveAttribute("aria-roledescription", "slide");
      expect(slide).toHaveAccessibleName(`${index + 1} of 4`);
    });
  });

  it("names the previous and next buttons and keeps the disabled one focusable", () => {
    render(<Example />);
    const previous = screen.getByRole("button", { name: "Previous slide" });
    const next = screen.getByRole("button", { name: "Next slide" });
    expect(previous).toHaveAttribute("aria-disabled", "true");
    expect(previous).not.toBeDisabled();
    expect(next).not.toHaveAttribute("aria-disabled");
    previous.focus();
    expect(previous).toHaveFocus();
  });

  it("announces slide changes politely, and not while rotating", () => {
    render(<Example />);
    const live = document.querySelector('[data-slot="carousel-content"]');
    expect(live).toHaveAttribute("aria-live", "polite");
  });

  it("puts the scrolling viewport in the tab order for the arrow keys", () => {
    render(<Example />);
    expect(viewportOf()).toHaveAttribute("tabindex", "0");
    expect(viewportOf()).toHaveClass("focus-visible:ring-2");
  });
});

describe("Carousel layout", () => {
  it("pads slides at the end and takes it back at the content's end", () => {
    render(<Example />);
    expect(
      document.querySelector('[data-slot="carousel-content"]'),
    ).toHaveClass("flex", "-me-4");
    screen.getAllByRole("group").forEach((slide) => {
      expect(slide).toHaveClass("basis-full", "shrink-0", "pe-4");
    });
  });

  it("lays slides and buttons out vertically", () => {
    render(<Example orientation="vertical" />);
    expect(screen.getByRole("region")).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
    expect(
      document.querySelector('[data-slot="carousel-content"]'),
    ).toHaveClass("-mb-4", "flex-col");
    expect(screen.getAllByRole("group")[0]).toHaveClass("pb-4");
    expect(screen.getByRole("button", { name: "Previous slide" })).toHaveClass(
      "-top-12",
      "rotate-90",
    );
    expect(screen.getByRole("button", { name: "Next slide" })).toHaveClass(
      "-bottom-12",
      "rotate-90",
    );
  });

  it("forwards ref and className on the content and each slide", () => {
    const contentRef = createRef<HTMLDivElement>();
    const itemRef = createRef<HTMLDivElement>();
    render(
      <Carousel aria-label="Refs">
        <CarouselContent className="content-extra" ref={contentRef}>
          <CarouselItem className="item-extra" ref={itemRef} />
        </CarouselContent>
      </Carousel>,
    );
    expect(contentRef.current).toHaveClass("content-extra", "flex");
    expect(itemRef.current).toHaveClass("item-extra", "basis-full");
  });

  it("forwards ref, variant and className to the buttons", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Carousel aria-label="Buttons">
        <CarouselPrevious className="prev-extra" ref={ref} variant="ghost" />
      </Carousel>,
    );
    expect(ref.current).toBe(
      screen.getByRole("button", { name: "Previous slide" }),
    );
    expect(ref.current).toHaveClass("prev-extra", "hover:bg-accent");
    expect(ref.current).not.toHaveClass("border-input");
  });
});

describe("Carousel api", () => {
  let restore: () => void;
  beforeEach(() => {
    restore = mockLayout(4);
  });
  afterEach(() => {
    restore();
  });

  it("hands setApi the api once the slides are measured", async () => {
    const setApi = vi.fn();
    render(<Example setApi={setApi} />);
    expect(setApi).not.toHaveBeenCalled();
    await act(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
    });
    expect(setApi).toHaveBeenCalledTimes(1);
    const [api] = setApi.mock.calls[0] as [CarouselApi];
    expect(api.scrollSnapList()).toHaveLength(4);
    expect(api.selectedScrollSnap()).toBe(0);
    expect(api.canScrollPrev()).toBe(false);
    expect(api.canScrollNext()).toBe(true);
  });

  it("scrolls with scrollNext, scrollPrev and scrollTo and reports select", async () => {
    const { api } = await renderMeasured();
    const onSelect = vi.fn((selected: CarouselApi) =>
      selected.selectedScrollSnap(),
    );
    api.current?.on("select", onSelect);

    act(() => {
      api.current?.scrollNext();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(api.current?.selectedScrollSnap()).toBe(1);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveReturnedWith(1);
    expect(api.current?.canScrollPrev()).toBe(true);

    act(() => {
      api.current?.scrollTo(3);
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(api.current?.selectedScrollSnap()).toBe(3);
    expect(api.current?.canScrollNext()).toBe(false);
    expect(onSelect).toHaveReturnedWith(3);

    act(() => {
      api.current?.scrollPrev();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(api.current?.selectedScrollSnap()).toBe(2);
  });

  it("stops reporting select after off and returns the api from on and off", async () => {
    const { api } = await renderMeasured();
    const onSelect = vi.fn();
    expect(api.current?.on("select", onSelect)).toBe(api.current);
    expect(api.current?.off("select", onSelect)).toBe(api.current);
    act(() => {
      api.current?.scrollTo(2);
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("pages with the buttons and the arrow keys", async () => {
    const { api } = await renderMeasured();
    fireEvent.click(screen.getByRole("button", { name: "Next slide" }));
    expect(api.current?.selectedScrollSnap()).toBe(1);
    fireEvent.click(screen.getByRole("button", { name: "Previous slide" }));
    expect(api.current?.selectedScrollSnap()).toBe(0);

    fireEvent.keyDown(viewportOf(), { key: "ArrowRight" });
    expect(api.current?.selectedScrollSnap()).toBe(1);
    fireEvent.keyDown(viewportOf(), { key: "ArrowLeft" });
    expect(api.current?.selectedScrollSnap()).toBe(0);
  });

  it("marks the buttons aria-disabled at either end", async () => {
    const { api } = await renderMeasured();
    const previous = screen.getByRole("button", { name: "Previous slide" });
    const next = screen.getByRole("button", { name: "Next slide" });
    expect(previous).toHaveAttribute("aria-disabled", "true");
    act(() => {
      api.current?.scrollTo(3);
    });
    expect(next).toHaveAttribute("aria-disabled", "true");
    expect(previous).not.toHaveAttribute("aria-disabled");
  });

  it("reports reInit when the number of pages changes", async () => {
    const { api, rerender } = await renderMeasured();
    const onReInit = vi.fn();
    api.current?.on("reInit", onReInit);
    restore();
    restore = mockLayout(5);
    rerender(
      <Example
        count={5}
        setApi={(next) => {
          api.current = next;
        }}
      />,
    );
    await act(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
    });
    expect(api.current?.scrollSnapList()).toHaveLength(5);
    expect(onReInit).toHaveBeenCalledTimes(1);
  });

  it("starts on startIndex", async () => {
    const { api } = await renderMeasured({ opts: { startIndex: 2 } });
    expect(api.current?.selectedScrollSnap()).toBe(2);
  });

  it("wraps with loop", async () => {
    const { api } = await renderMeasured({ opts: { loop: true } });
    expect(api.current?.canScrollPrev()).toBe(true);
    act(() => {
      api.current?.scrollPrev();
    });
    expect(api.current?.selectedScrollSnap()).toBe(3);
  });

  it("turns swiping off with watchDrag false and keeps the keys", async () => {
    await renderMeasured({ opts: { watchDrag: false } });
    expect(viewportOf()).toHaveStyle({ overflowX: "hidden" });
  });

  it("scrolls several slides at a time with slidesToScroll", async () => {
    const { api } = await renderMeasured({ opts: { slidesToScroll: 2 } });
    expect(api.current?.scrollSnapList()).toHaveLength(2);
  });
});

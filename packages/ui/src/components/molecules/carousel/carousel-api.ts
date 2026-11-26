import {
  type CarouselController,
  createCarouselController,
} from "@ui-sdk/react/carousel";

type CarouselEvent = "reInit" | "select";
type CarouselListener = (api: CarouselApi) => void;

/**
 * The part of embla's API that carousels commonly use, backed by ui-sdk's
 * carousel controller. Positions are pages: one per slide, or per group of
 * `slidesToScroll` slides.
 */
type CarouselApi = {
  canScrollNext: () => boolean;
  canScrollPrev: () => boolean;
  off: (event: CarouselEvent, listener: CarouselListener) => CarouselApi;
  on: (event: CarouselEvent, listener: CarouselListener) => CarouselApi;
  scrollNext: () => void;
  scrollPrev: () => void;
  /** One progress value per page, evenly spaced from 0 to 1. */
  scrollSnapList: () => number[];
  scrollTo: (index: number) => void;
  selectedScrollSnap: () => number;
};

type CarouselApiHandle = {
  api: CarouselApi;
  controller: CarouselController;
  emit: (event: CarouselEvent) => void;
};

function scrolling(
  controller: CarouselController,
): Omit<CarouselApi, "off" | "on"> {
  return {
    canScrollNext: () => controller.canNext(),
    canScrollPrev: () => controller.canPrevious(),
    scrollNext() {
      controller.next();
    },
    scrollPrev() {
      controller.previous();
    },
    scrollSnapList() {
      const count = controller.getPageCount() ?? 0;
      return Array.from({ length: count }, (_, index) =>
        count > 1 ? index / (count - 1) : 0,
      );
    },
    scrollTo(index) {
      controller.setPage(index + 1);
    },
    selectedScrollSnap: () => controller.getPage() - 1,
  };
}

function createCarouselApi(): CarouselApiHandle {
  const controller = createCarouselController();
  const listeners: Record<CarouselEvent, Set<CarouselListener>> = {
    reInit: new Set(),
    select: new Set(),
  };

  const api: CarouselApi = {
    ...scrolling(controller),
    off(event, listener) {
      listeners[event].delete(listener);
      return api;
    },
    on(event, listener) {
      listeners[event].add(listener);
      return api;
    },
  };

  return {
    api,
    controller,
    emit(event) {
      listeners[event].forEach((listener) => {
        listener(api);
      });
    },
  };
}

export { type CarouselApi, createCarouselApi };

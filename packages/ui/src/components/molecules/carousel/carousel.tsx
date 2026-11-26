"use client";

import * as React from "react";

import {
  Carousel as CarouselPrimitive,
  CarouselContent as CarouselContentPrimitive,
  CarouselItem as CarouselItemPrimitive,
  CarouselNext as CarouselNextPrimitive,
  CarouselPrevious as CarouselPreviousPrimitive,
  CarouselViewport,
} from "@ui-sdk/react/carousel";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "../../../lib/utils";
import { Button } from "../../atoms/button/button";

import { type CarouselApi, createCarouselApi } from "./carousel-api";

type CarouselOrientation = "horizontal" | "vertical";

/** The embla options that ui-sdk's carousel honors. */
type CarouselOptions = {
  align?: "center" | "end" | "start";
  dragFree?: boolean;
  loop?: boolean;
  skipSnaps?: boolean;
  /** Slides per page: the count one step moves. */
  slidesToScroll?: "auto" | number;
  /** The slide the carousel starts on, from 0. */
  startIndex?: number;
  /** `false` turns swiping and dragging off; the buttons and keys still work. */
  watchDrag?: boolean;
};

export type CarouselProps = {
  opts?: CarouselOptions;
  orientation?: CarouselOrientation;
  setApi?: (api: CarouselApi) => void;
};

const OrientationContext =
  React.createContext<CarouselOrientation>("horizontal");

type CarouselApiSyncProps = {
  api: CarouselApi;
  emit: (event: "reInit") => void;
  pageCount: null | number;
  setApi?: (api: CarouselApi) => void;
};

/**
 * Calls `setApi` once the carousel has measured its slides, so
 * `scrollSnapList()` is ready, and reports a later change in the page count as
 * `reInit`.
 */
function CarouselApiSync({
  api,
  emit,
  pageCount,
  setApi,
}: CarouselApiSyncProps) {
  const measured = pageCount !== null;

  React.useEffect(() => {
    if (measured) {
      // react-doctor-disable-next-line react-doctor/no-pass-data-to-parent, react-doctor/no-pass-live-state-to-parent -- setApi is the documented public contract; the parent receives the api once the carousel has measured its slides
      setApi?.(api);
    }
  }, [api, measured, setApi]);

  const previousCount = React.useRef(pageCount);
  React.useEffect(() => {
    if (
      measured &&
      previousCount.current !== null &&
      previousCount.current !== pageCount
    ) {
      emit("reInit");
    }
    previousCount.current = pageCount;
  }, [emit, measured, pageCount]);

  return null;
}

const Carousel = ({
  children,
  className,
  opts,
  orientation = "horizontal",
  ref,
  setApi,
  ...props
}: CarouselProps &
  React.HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>;
  }) => {
  const [{ api, controller, emit }] = React.useState(createCarouselApi);

  return (
    <OrientationContext value={orientation}>
      <CarouselPrimitive
        align={opts?.align}
        className={cn("relative", className)}
        controller={controller}
        defaultPage={
          opts?.startIndex === undefined ? undefined : opts.startIndex + 1
        }
        drag={opts?.watchDrag}
        dragFree={opts?.dragFree}
        loop={opts?.loop}
        onPageChange={() => {
          // The page store updates right after this callback.
          queueMicrotask(() => {
            emit("select");
          });
        }}
        orientation={orientation}
        ref={ref}
        skipSnaps={opts?.skipSnaps}
        slidesPerPage={opts?.slidesToScroll}
        {...props}
      >
        {({ pageCount }) => (
          <>
            <CarouselApiSync
              api={api}
              emit={emit}
              pageCount={pageCount}
              setApi={setApi}
            />
            {children}
          </>
        )}
      </CarouselPrimitive>
    </OrientationContext>
  );
};
Carousel.displayName = "Carousel";

// Slides carry their gap as end padding, and the content takes it back with a
// negative end margin: ui-sdk pages by slide boxes, so padding at the start
// would offset every page after the first. The content stays on its own
// layer, as embla's inline transform kept it, so text renders as it did.
const CarouselContent = ({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const orientation = React.use(OrientationContext);

  return (
    <CarouselViewport className="ring-offset-background [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-scrollbar]:hidden">
      <CarouselContentPrimitive
        className={cn(
          "flex transform-gpu",
          orientation === "horizontal" ? "-me-4" : "-mb-4 flex-col",
          className,
        )}
        ref={ref}
        {...props}
      />
    </CarouselViewport>
  );
};
CarouselContent.displayName = "CarouselContent";

const CarouselItem = ({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const orientation = React.use(OrientationContext);

  return (
    <CarouselItemPrimitive
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pe-4" : "pb-4",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
};
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = ({
  className,
  ref,
  size = "icon",
  variant = "outline",
  ...props
}: React.ComponentProps<typeof Button> & {
  ref?: React.Ref<HTMLButtonElement>;
}) => {
  const orientation = React.use(OrientationContext);

  return (
    <CarouselPreviousPrimitive
      ref={ref}
      render={
        <Button
          className={cn(
            "absolute size-8 rounded-full aria-disabled:pointer-events-none aria-disabled:opacity-50",
            orientation === "horizontal"
              ? "-left-12 top-1/2 -translate-y-1/2"
              : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
            className,
          )}
          size={size}
          variant={variant}
          {...props}
        >
          <ArrowLeft className="size-4" />
          <span className="sr-only">Previous slide</span>
        </Button>
      }
    />
  );
};
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = ({
  className,
  ref,
  size = "icon",
  variant = "outline",
  ...props
}: React.ComponentProps<typeof Button> & {
  ref?: React.Ref<HTMLButtonElement>;
}) => {
  const orientation = React.use(OrientationContext);

  return (
    <CarouselNextPrimitive
      ref={ref}
      render={
        <Button
          className={cn(
            "absolute size-8 rounded-full aria-disabled:pointer-events-none aria-disabled:opacity-50",
            orientation === "horizontal"
              ? "-right-12 top-1/2 -translate-y-1/2"
              : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
            className,
          )}
          size={size}
          variant={variant}
          {...props}
        >
          <ArrowRight className="size-4" />
          <span className="sr-only">Next slide</span>
        </Button>
      }
    />
  );
};
CarouselNext.displayName = "CarouselNext";

export type { CarouselApi } from "./carousel-api";
export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
};

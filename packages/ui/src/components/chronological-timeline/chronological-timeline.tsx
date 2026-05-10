"use client";

import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "../../lib/utils";

/**
 * Media payload for a {@link ChronoEvent}.
 *
 * @public
 */
export type ChronoMedia =
  | {
      alt: string;
      caption?: ReactNode;
      credit?: ReactNode;
      src: string;
      type: "image";
    }
  | {
      alt?: string;
      caption?: ReactNode;
      credit?: ReactNode;
      src: string;
      type: "audio";
    }
  | {
      caption?: ReactNode;
      credit?: ReactNode;
      src: string;
      title?: string;
      type: "video";
    };

type ChronoCtx = {
  registerEvent: (id: string, node: HTMLElement | null) => void;
  setActiveId: (id: string) => void;
  titleId: string;
};

const ChronoContext = createContext<ChronoCtx | null>(null);

function useChronoContext(): ChronoCtx {
  const ctx = useContext(ChronoContext);
  if (!ctx) {
    throw new Error("ChronoEvent used outside ChronologicalTimeline.");
  }
  return ctx;
}

/**
 * Props for {@link ChronologicalTimeline}.
 *
 * @public
 */
export type ChronologicalTimelineProps = {
  /** Aria-label for the timeline progress strip. Defaults to `"Timeline progress"`. */
  progressLabel?: string;
  /** Headline rendered at the top of the timeline. */
  title?: ReactNode;
} & ComponentPropsWithoutRef<"section">;

/**
 * Props for {@link ChronoEvent}.
 *
 * @public
 */
export type ChronoEventProps = {
  /** Display date (free-form string — pass `"1957"`, `"October 4, 1957"`, etc.). */
  date: ReactNode;
  /** When `true`, the card renders larger to emphasise pivotal events. */
  featured?: boolean;
  /** Stable id. Defaults to a generated id; pass one for deep links. */
  id?: string;
  /** Optional media payload — image / video / audio. */
  media?: ChronoMedia;
  /** Optional subtitle. */
  subtitle?: ReactNode;
  /** Card title. */
  title: ReactNode;
} & Omit<ComponentPropsWithoutRef<"article">, "id" | "title">;

type ImageMediaProps = {
  media: Extract<ChronoMedia, { type: "image" }>;
};

function ImageMedia({ media }: ImageMediaProps): ReactNode {
  return (
    <figure className="overflow-hidden rounded-xl border bg-muted">
      <img
        alt={media.alt}
        className="aspect-video w-full object-cover"
        loading="lazy"
        src={media.src}
      />
      {media.caption || media.credit ? (
        <figcaption className="border-t bg-background px-3 py-2 text-xs text-muted-foreground">
          {media.caption ? (
            <span className="block">{media.caption}</span>
          ) : null}
          {media.credit ? (
            <span className="block italic">{media.credit}</span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

type VideoMediaProps = {
  media: Extract<ChronoMedia, { type: "video" }>;
};

function VideoMedia({ media }: VideoMediaProps): ReactNode {
  const iframeTitle = media.title || "Embedded timeline video";
  return (
    <figure className="overflow-hidden rounded-xl border bg-muted">
      <div className="aspect-video w-full">
        <iframe
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
          src={media.src}
          title={iframeTitle}
        />
      </div>
      {media.caption || media.credit ? (
        <figcaption className="border-t bg-background px-3 py-2 text-xs text-muted-foreground">
          {media.caption ? (
            <span className="block">{media.caption}</span>
          ) : null}
          {media.credit ? (
            <span className="block italic">{media.credit}</span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

type AudioMediaProps = {
  media: Extract<ChronoMedia, { type: "audio" }>;
};

function AudioMedia({ media }: AudioMediaProps): ReactNode {
  return (
    <figure className="overflow-hidden rounded-xl border bg-muted px-3 py-3">
      <audio
        aria-label={media.alt}
        className="w-full"
        controls
        preload="metadata"
        src={media.src}
      >
        <track kind="captions" />
      </audio>
      {media.caption || media.credit ? (
        <figcaption className="pt-2 text-xs text-muted-foreground">
          {media.caption ? (
            <span className="block">{media.caption}</span>
          ) : null}
          {media.credit ? (
            <span className="block italic">{media.credit}</span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

type MediaProps = {
  media: ChronoMedia;
};

function Media({ media }: MediaProps): ReactNode {
  if (media.type === "image") return <ImageMedia media={media} />;
  if (media.type === "video") return <VideoMedia media={media} />;
  return <AudioMedia media={media} />;
}

type DateColumnProps = {
  date: ReactNode;
};

function DateColumn({ date }: DateColumnProps): ReactNode {
  return (
    <div className="hidden items-start justify-end pr-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground md:flex md:group-[[data-side='right']]:order-3 md:group-[[data-side='right']]:justify-start md:group-[[data-side='right']]:pl-4 md:group-[[data-side='right']]:text-left">
      <time className="pt-2">{date}</time>
    </div>
  );
}

type RailColumnProps = {
  featured: boolean;
};

function RailColumn({ featured }: RailColumnProps): ReactNode {
  return (
    <div
      aria-hidden="true"
      className="relative hidden md:flex md:w-6 md:items-start md:justify-center"
    >
      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
      <span
        className={cn(
          "relative z-10 mt-3 block size-3 rounded-full border-2 border-background bg-primary",
          featured ? "size-4" : "",
        )}
      />
    </div>
  );
}

type EventCardProps = {
  children?: ReactNode;
  date: ReactNode;
  eventId: string;
  featured: boolean;
  media?: ChronoMedia;
  subtitle?: ReactNode;
  title: ReactNode;
};

function EventCard({
  children,
  date,
  eventId,
  featured,
  media,
  subtitle,
  title,
}: EventCardProps): ReactNode {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-background p-5 shadow-sm md:group-[[data-side='right']]:order-1",
        featured ? "ring-1 ring-primary/30" : "",
      )}
    >
      <header className="mb-3 flex flex-col gap-1">
        <time className="text-xs font-semibold uppercase tracking-wide text-muted-foreground md:hidden">
          {date}
        </time>
        <h3
          className={cn(
            "font-semibold text-foreground",
            featured ? "text-xl" : "text-lg",
          )}
          id={`${eventId}-title`}
        >
          {title}
        </h3>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </header>
      {media ? (
        <div className="mb-3">
          <Media media={media} />
        </div>
      ) : null}
      {children ? (
        <div className="space-y-2 text-sm leading-relaxed text-foreground [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground">
          {children}
        </div>
      ) : null}
    </div>
  );
}

/**
 * A single event card inside {@link ChronologicalTimeline}. Place
 * narrative paragraphs, blockquotes, and lists as children.
 *
 * @public
 */
export const ChronoEvent = forwardRef<HTMLElement, ChronoEventProps>(
  (props, forwardedRef) => {
    const {
      children,
      className,
      date,
      featured = false,
      id,
      media,
      subtitle,
      title,
      ...rest
    } = props;
    const generatedId = useId();
    const eventId = id ?? generatedId;
    const ref = useRef<HTMLElement | null>(null);
    const { registerEvent, setActiveId } = useChronoContext();

    const refCallback = useCallback(
      (node: HTMLElement | null) => {
        ref.current = node;
        registerEvent(eventId, node);
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [eventId, forwardedRef, registerEvent],
    );

    const handleFocus = useCallback(() => {
      setActiveId(eventId);
    }, [eventId, setActiveId]);

    return (
      <article
        aria-labelledby={`${eventId}-title`}
        className={cn(
          "group relative grid gap-4 py-6 md:grid-cols-[1fr_auto_1fr] md:gap-8",
          className,
        )}
        data-event-id={eventId}
        data-featured={featured ? "true" : undefined}
        id={eventId}
        onFocus={handleFocus}
        ref={refCallback}
        {...rest}
      >
        <DateColumn date={date} />
        <RailColumn featured={featured} />
        <EventCard
          date={date}
          eventId={eventId}
          featured={featured}
          media={media}
          subtitle={subtitle}
          title={title}
        >
          {children}
        </EventCard>
      </article>
    );
  },
);
ChronoEvent.displayName = "ChronoEvent";

type ProgressStripProps = {
  activeId?: string;
  ids: string[];
  label: string;
};

function ProgressStrip({
  activeId,
  ids,
  label,
}: ProgressStripProps): ReactNode {
  if (ids.length === 0) return null;
  const activeIndex = activeId ? ids.indexOf(activeId) : -1;
  const ratio = activeIndex < 0 ? 0 : (activeIndex + 1) / ids.length;
  return (
    <div
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(ratio * 100)}
      className="sticky top-0 z-10 h-1 w-full bg-border"
      role="progressbar"
    >
      <span
        className="block h-full bg-primary transition-[width] duration-200"
        style={{ width: `${(ratio * 100).toString()}%` }}
      />
    </div>
  );
}

function useChronoActiveTracker(): {
  activeId?: string;
  ids: string[];
  registerEvent: (id: string, node: HTMLElement | null) => void;
  setActiveId: (id: string) => void;
} {
  const eventsRef = useRef<Map<string, HTMLElement>>(new Map());
  const [ids, setIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();

  const registerEvent = useCallback((id: string, node: HTMLElement | null) => {
    const map = eventsRef.current;
    if (node) map.set(id, node);
    else map.delete(id);
    setIds([...map.keys()]);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0];
        if (first) {
          const target = first.target;
          if (target instanceof HTMLElement) {
            const eventId = target.dataset.eventId;
            if (eventId) setActiveId(eventId);
          }
        }
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: 0.1 },
    );
    [...eventsRef.current.values()].forEach((node) => {
      observer.observe(node);
    });
    return () => {
      observer.disconnect();
    };
  }, [ids]);

  return { activeId, ids, registerEvent, setActiveId };
}

type EventListProps = {
  activeId?: string;
  children: ReactNode;
};

function EventList({ activeId, children }: EventListProps): ReactNode {
  if (!Array.isArray(children)) {
    return (
      <ol className="relative flex flex-col px-4 pb-6 md:px-6">{children}</ol>
    );
  }
  return (
    <ol className="relative flex flex-col px-4 pb-6 md:px-6">
      {children.map((child, index) => (
        <li
          className="block list-none"
          data-active={
            isReactElementWithEventId(child, activeId) ? "true" : undefined
          }
          data-side={index % 2 === 0 ? "left" : "right"}
          key={getChildKey(child, index)}
        >
          {child}
        </li>
      ))}
    </ol>
  );
}

/**
 * Media-rich, scroll-driven chronological timeline. Cards alternate
 * sides on desktop and stack on mobile. Each {@link ChronoEvent} can
 * include an image, video, or audio payload plus narrative children
 * (paragraphs, blockquotes, lists). An `IntersectionObserver` follows
 * the reader and drives the progress strip + the active card flag.
 *
 * @example
 * ```tsx
 * <ChronologicalTimeline title="The Space Race">
 *   <ChronoEvent date="October 4, 1957" title="Sputnik 1" subtitle="First artificial satellite">
 *     <p>The Soviet Union launched Sputnik 1...</p>
 *   </ChronoEvent>
 *   <ChronoEvent date="July 20, 1969" title="Apollo 11" featured>
 *     <p>Neil Armstrong and Buzz Aldrin walked on the Moon...</p>
 *   </ChronoEvent>
 * </ChronologicalTimeline>
 * ```
 *
 * @public
 */
export const ChronologicalTimeline = forwardRef<
  HTMLElement,
  ChronologicalTimelineProps
>((props, ref) => {
  const {
    children,
    className,
    progressLabel = "Timeline progress",
    title,
    ...rest
  } = props;
  const titleId = useId();
  const { activeId, ids, registerEvent, setActiveId } =
    useChronoActiveTracker();

  const ctx = useMemo<ChronoCtx>(
    () => ({ registerEvent, setActiveId, titleId }),
    [registerEvent, setActiveId, titleId],
  );

  return (
    <ChronoContext.Provider value={ctx}>
      <section
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          "relative mx-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border bg-background text-foreground",
          className,
        )}
        ref={ref}
        {...rest}
      >
        <ProgressStrip activeId={activeId} ids={ids} label={progressLabel} />
        {title ? (
          <header className="px-6 py-6">
            <h2 className="text-2xl font-semibold tracking-tight" id={titleId}>
              {title}
            </h2>
          </header>
        ) : null}
        <EventList activeId={activeId}>{children}</EventList>
      </section>
    </ChronoContext.Provider>
  );
});
ChronologicalTimeline.displayName = "ChronologicalTimeline";

function isReactElementWithEventId(
  child: unknown,
  activeId: string | undefined,
): boolean {
  if (!activeId) return false;
  if (typeof child !== "object" || child === null) return false;
  if (!("props" in child)) return false;
  const props = (child as { props: unknown }).props;
  if (typeof props !== "object" || props === null) return false;
  const id = (props as { id?: unknown }).id;
  return typeof id === "string" && id === activeId;
}

function getChildKey(child: unknown, fallback: number): number | string {
  if (typeof child !== "object" || child === null) return fallback;
  if (!("key" in child)) return fallback;
  const key = (child as { key: unknown }).key;
  if (typeof key === "string" || typeof key === "number") return key;
  return fallback;
}

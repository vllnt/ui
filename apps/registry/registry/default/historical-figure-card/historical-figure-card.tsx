"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  useCallback,
  useState,
} from "react";

import { ChevronDown, User } from "lucide-react";

import { cn } from "@vllnt/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@vllnt/ui";
import { Badge } from "@vllnt/ui";

const FALLBACK_LIFESPAN_MIN_YEAR = 1500;
const FALLBACK_LIFESPAN_SPAN_YEARS = 100;

/**
 * Birth or death record for {@link HistoricalFigureCardProps}.
 *
 * @public
 */
export type HistoricalFigureCardLifeEvent = {
  /** Optional secondary line (e.g. "Vinci, Italy"). */
  place?: ReactNode;
  /**
   * Year as a positive integer for AD / a negative integer for BC.
   * Pass `undefined` for unknown.
   */
  year?: number;
};

/**
 * Connection between this figure and another.
 *
 * @public
 */
export type HistoricalFigureCardConnection = {
  /** Optional URL for the connected figure's profile. */
  href?: string;
  /** Connected figure's display name. */
  name: ReactNode;
  /** Free-form relation label (e.g. "Patron", "Contemporary/rival"). */
  relation: ReactNode;
};

/**
 * Pull-quote with attribution for {@link HistoricalFigureCardProps}.
 *
 * @public
 */
export type HistoricalFigureCardQuote = {
  /** Source/citation for the quote (book, letter, year). */
  source?: ReactNode;
  /** Quote text. */
  text: ReactNode;
};

/**
 * Localizable strings for the bio toggle button.
 *
 * @public
 */
export type HistoricalFigureCardLabels = {
  /** Caption for the bio toggle when expanded. Defaults to `"Hide biography"`. */
  collapseBio?: string;
  /** Heading rendered above the connections list. Defaults to `"Connections"`. */
  connections?: string;
  /** Caption for the bio toggle when collapsed. Defaults to `"Read biography"`. */
  expandBio?: string;
  /** Heading rendered above the fields list. Defaults to `"Fields"`. */
  fields?: string;
  /** Aria-label for the lifespan timeline bar. Defaults to `"Lifespan"`. */
  lifespan?: string;
  /** Heading rendered above the works list. Defaults to `"Notable works"`. */
  works?: string;
};

/**
 * Props for {@link HistoricalFigureCard}.
 *
 * @public
 */
export type HistoricalFigureCardProps = {
  /** Optional expandable biography content. */
  biography?: ReactNode;
  /** Birth event (year + optional place). */
  birth?: HistoricalFigureCardLifeEvent;
  /** Connections / relationships to other figures. */
  connections?: HistoricalFigureCardConnection[];
  /** Death event (year + optional place). */
  death?: HistoricalFigureCardLifeEvent;
  /** Era label, rendered as a Badge. */
  era?: ReactNode;
  /** Fields / domains tags (e.g. "Art", "Anatomy"). */
  fields?: ReactNode[];
  /** Localizable captions. */
  labels?: HistoricalFigureCardLabels;
  /** Display name. */
  name: ReactNode;
  /** Portrait image src. Falls back to a silhouette when omitted. */
  portrait?: string;
  /** Optional URL pointing to the full profile. */
  profileHref?: string;
  /** Optional pull-quote with attribution. */
  quote?: HistoricalFigureCardQuote;
  /** Optional descriptor under the name (e.g. "Polymath"). */
  title?: ReactNode;
  /** Notable works list. */
  works?: ReactNode[];
} & ComponentPropsWithoutRef<"article">;

const DEFAULT_LABELS = {
  collapseBio: "Hide biography",
  connections: "Connections",
  expandBio: "Read biography",
  fields: "Fields",
  lifespan: "Lifespan",
  works: "Notable works",
} as const satisfies Required<HistoricalFigureCardLabels>;

function formatYear(year: number | undefined): string | undefined {
  if (year === undefined) return undefined;
  if (year < 0) return `${Math.abs(year).toString()} BC`;
  return year.toString();
}

function getInitials(name: ReactNode): string {
  if (typeof name !== "string") return "";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

type LifespanBarProps = {
  birthYear?: number;
  deathYear?: number;
  label: string;
};

function LifespanBar({
  birthYear,
  deathYear,
  label,
}: LifespanBarProps): ReactNode {
  if (birthYear === undefined || deathYear === undefined) return null;
  if (deathYear <= birthYear) return null;

  const span = deathYear - birthYear;
  const min = Math.min(birthYear, FALLBACK_LIFESPAN_MIN_YEAR);
  const range =
    Math.max(deathYear, min + FALLBACK_LIFESPAN_SPAN_YEARS) - min || 1;
  const start = ((birthYear - min) / range) * 100;
  const width = (span / range) * 100;

  return (
    <div
      aria-label={`${label}: ${formatYear(birthYear) ?? ""} – ${formatYear(deathYear) ?? ""}`}
      className="relative mt-2 h-1.5 w-full rounded-full bg-muted"
      role="img"
    >
      <span
        className="absolute h-full rounded-full bg-primary"
        style={{ left: `${start.toString()}%`, width: `${width.toString()}%` }}
      />
    </div>
  );
}

type LifeEventLineProps = {
  caption: string;
  event?: HistoricalFigureCardLifeEvent;
};

function LifeEventLine({ caption, event }: LifeEventLineProps): ReactNode {
  if (!event) return null;
  const year = formatYear(event.year);
  if (year === undefined && !event.place) return null;
  return (
    <p className="text-xs text-muted-foreground">
      <span className="font-semibold text-foreground">{caption}</span>{" "}
      {year ?? "Unknown"}
      {event.place ? <span> · {event.place}</span> : null}
    </p>
  );
}

type FigureChipsProps = {
  heading: string;
  items: ReactNode[];
};

function FigureChips({ heading, items }: FigureChipsProps): ReactNode {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {heading}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, index) => (
          <Badge key={`chip-${index.toString()}`} variant="secondary">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

type FigureWorksListProps = {
  heading: string;
  items: ReactNode[];
};

function FigureWorksList({ heading, items }: FigureWorksListProps): ReactNode {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {heading}
      </h4>
      <ul className="flex flex-col gap-1 text-sm text-foreground">
        {items.map((item, index) => (
          <li className="leading-tight" key={`work-${index.toString()}`}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

type FigureConnectionsProps = {
  heading: string;
  items: HistoricalFigureCardConnection[];
};

function FigureConnections({
  heading,
  items,
}: FigureConnectionsProps): ReactNode {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {heading}
      </h4>
      <ul className="flex flex-col gap-1.5 text-sm">
        {items.map((connection, index) => {
          const labelNode = connection.href ? (
            <a
              className="font-medium text-foreground underline-offset-4 hover:underline"
              href={connection.href}
            >
              {connection.name}
            </a>
          ) : (
            <span className="font-medium text-foreground">
              {connection.name}
            </span>
          );
          return (
            <li
              className="flex items-baseline justify-between gap-3"
              key={`connection-${index.toString()}`}
            >
              {labelNode}
              <span className="text-xs text-muted-foreground">
                {connection.relation}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type FigureQuoteProps = {
  quote: HistoricalFigureCardQuote;
};

function FigureQuote({ quote }: FigureQuoteProps): ReactNode {
  return (
    <blockquote className="border-l-2 border-primary/40 pl-3 text-sm italic text-muted-foreground">
      “{quote.text}”
      {quote.source ? (
        <footer className="mt-1 text-xs not-italic text-muted-foreground/80">
          — {quote.source}
        </footer>
      ) : null}
    </blockquote>
  );
}

type FigureBioProps = {
  biography: ReactNode;
  collapseLabel: string;
  expandLabel: string;
};

function FigureBio({
  biography,
  collapseLabel,
  expandLabel,
}: FigureBioProps): ReactNode {
  const [open, setOpen] = useState(false);
  const handleToggle = useCallback(() => {
    setOpen((value) => !value);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <button
        aria-expanded={open}
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={handleToggle}
        type="button"
      >
        {open ? collapseLabel : expandLabel}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-4 w-4 transition-transform",
            open ? "rotate-180" : "rotate-0",
          )}
        />
      </button>
      {open ? (
        <div className="text-sm leading-relaxed text-foreground">
          {biography}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Profile card for historical figures with portrait, lifespan timeline,
 * fields / works / connections, optional pull-quote, and an expandable
 * biography section. Composes Avatar and Badge.
 *
 * @example
 * ```tsx
 * <HistoricalFigureCard
 *   name="Leonardo da Vinci"
 *   title="Polymath"
 *   era="Renaissance"
 *   birth={{ year: 1452, place: "Vinci, Italy" }}
 *   death={{ year: 1519, place: "Amboise, France" }}
 *   fields={["Art", "Science"]}
 *   works={["Mona Lisa", "Vitruvian Man"]}
 *   quote={{ text: "Learning never exhausts the mind.", source: "Notebooks" }}
 *   profileHref="/figures/da-vinci"
 * />
 * ```
 *
 * @public
 */
type FigureHeaderProps = {
  era?: ReactNode;
  name: ReactNode;
  portrait?: string;
  title?: ReactNode;
};

function FigureHeader({
  era,
  name,
  portrait,
  title,
}: FigureHeaderProps): ReactNode {
  const initials = getInitials(name);
  const altName = typeof name === "string" ? name : undefined;
  return (
    <header className="flex items-start gap-4">
      <Avatar className="h-14 w-14 shrink-0 ring-2 ring-border">
        {portrait ? <AvatarImage alt={altName} src={portrait} /> : null}
        <AvatarFallback className="text-sm">
          {initials || <User aria-hidden="true" className="h-5 w-5" />}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="text-base font-semibold leading-tight tracking-tight">
          {name}
        </h3>
        {title ? (
          <p className="text-sm text-muted-foreground">{title}</p>
        ) : null}
        {era ? (
          <Badge className="self-start" variant="outline">
            {era}
          </Badge>
        ) : null}
      </div>
    </header>
  );
}

type FigureLifeBlockProps = {
  birth?: HistoricalFigureCardLifeEvent;
  death?: HistoricalFigureCardLifeEvent;
  lifespanLabel: string;
};

function FigureLifeBlock({
  birth,
  death,
  lifespanLabel,
}: FigureLifeBlockProps): ReactNode {
  return (
    <div className="flex flex-col gap-1">
      <LifeEventLine caption="Born" event={birth} />
      <LifeEventLine caption="Died" event={death} />
      <LifespanBar
        birthYear={birth?.year}
        deathYear={death?.year}
        label={lifespanLabel}
      />
    </div>
  );
}

export const HistoricalFigureCard = forwardRef<
  HTMLElement,
  HistoricalFigureCardProps
>((props, ref) => {
  const {
    biography,
    birth,
    className,
    connections,
    death,
    era,
    fields,
    labels,
    name,
    portrait,
    profileHref,
    quote,
    title,
    works,
    ...rest
  } = props;

  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-2xl border bg-background p-5 text-foreground shadow-sm",
        className,
      )}
      ref={ref}
      {...rest}
    >
      <FigureHeader era={era} name={name} portrait={portrait} title={title} />

      <FigureLifeBlock
        birth={birth}
        death={death}
        lifespanLabel={resolvedLabels.lifespan}
      />

      {fields && fields.length > 0 ? (
        <FigureChips heading={resolvedLabels.fields} items={fields} />
      ) : null}

      {works && works.length > 0 ? (
        <FigureWorksList heading={resolvedLabels.works} items={works} />
      ) : null}

      {quote ? <FigureQuote quote={quote} /> : null}

      {connections && connections.length > 0 ? (
        <FigureConnections
          heading={resolvedLabels.connections}
          items={connections}
        />
      ) : null}

      {biography ? (
        <FigureBio
          biography={biography}
          collapseLabel={resolvedLabels.collapseBio}
          expandLabel={resolvedLabels.expandBio}
        />
      ) : null}

      {profileHref ? (
        <a
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          href={profileHref}
        >
          View full profile →
        </a>
      ) : null}
    </article>
  );
});
HistoricalFigureCard.displayName = "HistoricalFigureCard";

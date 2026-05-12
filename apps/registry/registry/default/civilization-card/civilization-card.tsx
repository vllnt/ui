import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { Globe } from "lucide-react";

import { cn } from "@vllnt/ui";
import { Badge } from "@vllnt/ui";

const CIVILIZATION_COLOR_VARIANTS: Record<
  CivilizationCardColor,
  { gradient: string; ring: string }
> = {
  amber: {
    gradient: "from-amber-500/20 to-amber-700/40",
    ring: "ring-amber-500/30",
  },
  blue: {
    gradient: "from-blue-500/20 to-blue-700/40",
    ring: "ring-blue-500/30",
  },
  emerald: {
    gradient: "from-emerald-500/20 to-emerald-700/40",
    ring: "ring-emerald-500/30",
  },
  neutral: {
    gradient: "from-muted to-muted-foreground/10",
    ring: "ring-border",
  },
  purple: {
    gradient: "from-purple-500/20 to-purple-700/40",
    ring: "ring-purple-500/30",
  },
  red: {
    gradient: "from-red-500/20 to-red-700/40",
    ring: "ring-red-500/30",
  },
};

/**
 * Color theme for the {@link CivilizationCard} hero band.
 *
 * @public
 */
export type CivilizationCardColor =
  | "amber"
  | "blue"
  | "emerald"
  | "neutral"
  | "purple"
  | "red";

/**
 * Era span (start / end years) for {@link CivilizationCardProps}.
 *
 * Use positive integers for CE / negative integers for BCE. `end` may be
 * omitted when the civilization is extant.
 *
 * @public
 */
export type CivilizationCardEra = {
  /** End year. Negative for BCE; omit when extant. */
  end?: number;
  /** Start year. Negative for BCE. */
  start: number;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type CivilizationCardLabels = {
  /** Heading above the achievements list. Defaults to `"Achievements"`. */
  achievements?: string;
  /** Caption for the capital row. Defaults to `"Capital"`. */
  capital?: string;
  /** Caption for the duration stat. Defaults to `"Duration"`. */
  duration?: string;
  /** Heading above the leaders list. Defaults to `"Notable leaders"`. */
  leaders?: string;
  /** Caption for the peak population stat. Defaults to `"Peak population"`. */
  peakPopulation?: string;
  /** Aria-label on the era timeline bar. Defaults to `"Era timeline"`. */
  timeline?: string;
};

/**
 * Props for {@link CivilizationCard}.
 *
 * @public
 */
export type CivilizationCardProps = {
  /** Notable achievements / cultural contributions. */
  achievements?: ReactNode[];
  /** Optional primary CTA href. Renders the card as a link card when set. */
  actionHref?: string;
  /** Optional capital city. */
  capital?: ReactNode;
  /** Color theme for the hero band. Defaults to `"neutral"`. */
  color?: CivilizationCardColor;
  /** Era span. */
  era?: CivilizationCardEra;
  /** Optional hero image src. Falls back to a globe icon. */
  image?: string;
  /** Localizable captions. */
  labels?: CivilizationCardLabels;
  /** Notable leaders. */
  leaders?: ReactNode[];
  /** Display name. */
  name: ReactNode;
  /** Optional peak population stat (string). */
  peakPopulation?: ReactNode;
  /** Optional geographic region. */
  region?: ReactNode;
} & ComponentPropsWithoutRef<"article">;

const DEFAULT_LABELS = {
  achievements: "Achievements",
  capital: "Capital",
  duration: "Duration",
  leaders: "Notable leaders",
  peakPopulation: "Peak population",
  timeline: "Era timeline",
} as const satisfies Required<CivilizationCardLabels>;

function formatEraYear(year: number): string {
  if (year < 0) return `${Math.abs(year).toString()} BCE`;
  return `${year.toString()} CE`;
}

function formatEra(era: CivilizationCardEra): string {
  const start = formatEraYear(era.start);
  if (era.end === undefined) return `${start} – present`;
  return `${start} – ${formatEraYear(era.end)}`;
}

function getDuration(era: CivilizationCardEra | undefined): string | undefined {
  if (!era) return undefined;
  const end = era.end ?? new Date().getFullYear();
  const years = end - era.start;
  if (years <= 0) return undefined;
  return `${years.toString()} years`;
}

type HeroProps = {
  color: CivilizationCardColor;
  image?: string;
  imageAlt?: string;
};

function CivilizationHero({ color, image, imageAlt }: HeroProps): ReactNode {
  const palette = CIVILIZATION_COLOR_VARIANTS[color];
  return (
    <div
      className={cn(
        "relative h-32 w-full overflow-hidden rounded-t-2xl bg-gradient-to-br",
        palette.gradient,
      )}
    >
      {image ? (
        <img
          alt={imageAlt ?? ""}
          className="h-full w-full object-cover mix-blend-multiply"
          src={image}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
          <Globe aria-hidden="true" className="size-12" />
        </div>
      )}
    </div>
  );
}

type EraTimelineProps = {
  era: CivilizationCardEra;
  label: string;
};

function EraTimeline({ era, label }: EraTimelineProps): ReactNode {
  const eraLabel = formatEra(era);
  return (
    <div
      aria-label={`${label}: ${eraLabel}`}
      className="flex flex-col gap-1"
      role="img"
    >
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {eraLabel}
      </span>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <span className="block h-full w-2/3 rounded-full bg-primary" />
      </div>
    </div>
  );
}

type StatsProps = {
  capital?: ReactNode;
  capitalCaption: string;
  durationCaption: string;
  durationValue?: string;
  peakCaption: string;
  peakPopulation?: ReactNode;
};

function CivilizationStats({
  capital,
  capitalCaption,
  durationCaption,
  durationValue,
  peakCaption,
  peakPopulation,
}: StatsProps): ReactNode {
  const items: { caption: string; value: ReactNode }[] = [];
  if (capital) items.push({ caption: capitalCaption, value: capital });
  if (peakPopulation) {
    items.push({ caption: peakCaption, value: peakPopulation });
  }
  if (durationValue) {
    items.push({ caption: durationCaption, value: durationValue });
  }
  if (items.length === 0) return null;
  return (
    <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
      {items.map((item) => (
        <div className="flex flex-col" key={item.caption}>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {item.caption}
          </dt>
          <dd className="font-medium text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

type ListBlockProps = {
  emptyHidden?: boolean;
  heading: string;
  items: ReactNode[];
  variant: "badge" | "list";
};

function CivilizationListBlock({
  heading,
  items,
  variant,
}: ListBlockProps): ReactNode {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {heading}
      </h4>
      {variant === "badge" ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, index) => (
            <Badge key={`${heading}-${index.toString()}`} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-1 text-sm text-foreground">
          {items.map((item, index) => (
            <li
              className="leading-tight"
              key={`${heading}-${index.toString()}`}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Overview card for historical civilizations: hero band with optional image
 * + color theme, era timeline (BCE / CE / present), key stats, achievement
 * chips, notable leaders, and an optional follow-up link.
 *
 * @example
 * ```tsx
 * <CivilizationCard
 *   name="Roman Empire"
 *   era={{ start: -27, end: 476 }}
 *   region="Mediterranean"
 *   capital="Rome"
 *   peakPopulation="70 million"
 *   color="red"
 *   achievements={["Aqueducts", "Roads", "Law", "Architecture"]}
 *   leaders={["Augustus", "Trajan", "Marcus Aurelius"]}
 *   actionHref="/civilizations/rome"
 * />
 * ```
 *
 * @public
 */
type CivilizationBodyProps = {
  achievements?: ReactNode[];
  actionHref?: string;
  capital?: ReactNode;
  era?: CivilizationCardEra;
  labels: Required<CivilizationCardLabels>;
  leaders?: ReactNode[];
  name: ReactNode;
  peakPopulation?: ReactNode;
  region?: ReactNode;
};

function CivilizationBody({
  achievements,
  actionHref,
  capital,
  era,
  labels,
  leaders,
  name,
  peakPopulation,
  region,
}: CivilizationBodyProps): ReactNode {
  const durationValue = getDuration(era);
  return (
    <div className="flex flex-col gap-4 p-5">
      <header className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold leading-tight tracking-tight">
          {name}
        </h3>
        {region ? (
          <p className="text-sm text-muted-foreground">{region}</p>
        ) : null}
      </header>

      {era ? <EraTimeline era={era} label={labels.timeline} /> : null}

      <CivilizationStats
        capital={capital}
        capitalCaption={labels.capital}
        durationCaption={labels.duration}
        durationValue={durationValue}
        peakCaption={labels.peakPopulation}
        peakPopulation={peakPopulation}
      />

      {achievements && achievements.length > 0 ? (
        <CivilizationListBlock
          heading={labels.achievements}
          items={achievements}
          variant="badge"
        />
      ) : null}

      {leaders && leaders.length > 0 ? (
        <CivilizationListBlock
          heading={labels.leaders}
          items={leaders}
          variant="list"
        />
      ) : null}

      {actionHref ? (
        <a
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          href={actionHref}
        >
          Explore →
        </a>
      ) : null}
    </div>
  );
}

export const CivilizationCard = forwardRef<HTMLElement, CivilizationCardProps>(
  (props, ref) => {
    const {
      achievements,
      actionHref,
      capital,
      className,
      color = "neutral",
      era,
      image,
      labels,
      leaders,
      name,
      peakPopulation,
      region,
      ...rest
    } = props;

    const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
    const palette = CIVILIZATION_COLOR_VARIANTS[color];
    const altName = typeof name === "string" ? name : undefined;

    return (
      <article
        className={cn(
          "flex flex-col overflow-hidden rounded-2xl border bg-background text-foreground shadow-sm ring-1",
          palette.ring,
          className,
        )}
        ref={ref}
        {...rest}
      >
        <CivilizationHero color={color} image={image} imageAlt={altName} />
        <CivilizationBody
          achievements={achievements}
          actionHref={actionHref}
          capital={capital}
          era={era}
          labels={resolvedLabels}
          leaders={leaders}
          name={name}
          peakPopulation={peakPopulation}
          region={region}
        />
      </article>
    );
  },
);
CivilizationCard.displayName = "CivilizationCard";

/**
 * Props for {@link CivilizationComparison}.
 *
 * @public
 */
export type CivilizationComparisonProps = ComponentPropsWithoutRef<"div">;

/**
 * Side-by-side comparison container for {@link CivilizationCard}s. Renders
 * children in a responsive grid (single column on mobile, two columns on
 * `md`, three on `lg`).
 *
 * @public
 */
export const CivilizationComparison = forwardRef<
  HTMLDivElement,
  CivilizationComparisonProps
>(({ children, className, ...rest }, ref) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      ref={ref}
      {...rest}
    >
      {children}
    </div>
  );
});
CivilizationComparison.displayName = "CivilizationComparison";

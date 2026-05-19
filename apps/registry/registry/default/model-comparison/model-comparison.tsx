"use client";

import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  use,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";

import { Eye, EyeOff } from "lucide-react";

import { cn } from "@vllnt/ui";
import { Badge } from "@vllnt/ui";
import { Button } from "@vllnt/ui";

const HIDDEN_LABEL_PREFIX = "Model";

/**
 * Localizable strings for {@link ModelComparison}.
 *
 * @public
 */
export type ModelComparisonLabels = {
  /** Caption for the cost stat. Defaults to `"Cost"`. */
  cost?: string;
  /** Caption for the blind-mode toggle when on. Defaults to `"Hide models"`. */
  hide?: string;
  /** Caption for the latency stat. Defaults to `"Latency"`. */
  latency?: string;
  /** Caption for the prompt heading. Defaults to `"Prompt"`. */
  prompt?: string;
  /** Caption for the blind-mode toggle when off. Defaults to `"Reveal models"`. */
  reveal?: string;
  /** Caption for the token count stat. Defaults to `"Tokens"`. */
  tokens?: string;
  /** Caption for the vote heading. Defaults to `"Which response is better?"`. */
  voteHeading?: string;
  /** Caption for the "tie" vote option. Defaults to `"Tie"`. */
  voteTie?: string;
};

const DEFAULT_LABELS = {
  cost: "Cost",
  hide: "Hide models",
  latency: "Latency",
  prompt: "Prompt",
  reveal: "Reveal models",
  tokens: "Tokens",
  voteHeading: "Which response is better?",
  voteTie: "Tie",
} as const satisfies Required<ModelComparisonLabels>;

type ModelComparisonContextValue = {
  blind: boolean;
  labels: Required<ModelComparisonLabels>;
};

const DEFAULT_CONTEXT: ModelComparisonContextValue = {
  blind: false,
  labels: DEFAULT_LABELS,
};

const ModelComparisonContext = createContext(DEFAULT_CONTEXT);

/**
 * Props for {@link ModelComparison}.
 *
 * @public
 */
export type ModelComparisonProps = {
  /** When true, replaces model labels with anonymous placeholders. */
  blindDefault?: boolean;
  /** When true, suppresses the built-in blind-mode toggle. */
  hideBlindToggle?: boolean;
  /** Localizable strings. */
  labels?: ModelComparisonLabels;
  /** The prompt that drove all responses. Hidden when omitted. */
  prompt?: ReactNode;
} & ComponentPropsWithoutRef<"section">;

type ComparisonHeaderProps = {
  blind: boolean;
  hideBlindToggle: boolean;
  labels: Required<ModelComparisonLabels>;
  onToggleBlind: () => void;
  prompt?: ReactNode;
};

function ComparisonHeader({
  blind,
  hideBlindToggle,
  labels,
  onToggleBlind,
  prompt,
}: ComparisonHeaderProps): ReactNode {
  if (!prompt && hideBlindToggle) return null;
  return (
    <header className="flex items-start justify-between gap-3">
      {prompt ? (
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {labels.prompt}
          </span>
          <p className="text-sm text-foreground">{prompt}</p>
        </div>
      ) : (
        <span aria-hidden="true" />
      )}
      {hideBlindToggle ? null : (
        <Button
          aria-pressed={blind}
          onClick={onToggleBlind}
          size="sm"
          type="button"
          variant="outline"
        >
          {blind ? (
            <>
              <Eye aria-hidden="true" className="mr-2 size-4" />
              {labels.reveal}
            </>
          ) : (
            <>
              <EyeOff aria-hidden="true" className="mr-2 size-4" />
              {labels.hide}
            </>
          )}
        </Button>
      )}
    </header>
  );
}

/**
 * Side-by-side comparison of AI model responses to the same prompt.
 * Composes {@link Badge} and {@link Button}.
 *
 * @example
 * ```tsx
 * <ModelComparison prompt="Explain closures in JavaScript">
 *   <ModelComparisonColumn model="claude-sonnet-4-6" label="Sonnet">
 *     {sonnetResponse}
 *     <ModelComparisonMeta tokens={320} latency="0.8s" cost="$0.003" />
 *   </ModelComparisonColumn>
 *   <ModelComparisonColumn model="gpt-4o" label="GPT-4o">
 *     {gptResponse}
 *     <ModelComparisonMeta tokens={410} latency="1.1s" cost="$0.005" />
 *   </ModelComparisonColumn>
 *   <ModelComparisonVote onVote={handleVote} />
 * </ModelComparison>
 * ```
 *
 * @public
 */
export const ModelComparison = (
  props: ModelComparisonProps & React.RefAttributes<HTMLElement>,
) => {
  const {
    blindDefault = false,
    children,
    className,
    hideBlindToggle = false,
    labels,
    prompt,
    ref,
    ...rest
  } = props;
  const resolvedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );
  const [blind, setBlind] = useState(blindDefault);

  const contextValue = useMemo<ModelComparisonContextValue>(
    () => ({ blind, labels: resolvedLabels }),
    [blind, resolvedLabels],
  );

  const handleToggleBlind = useCallback(() => {
    setBlind((value) => !value);
  }, []);

  return (
    <ModelComparisonContext.Provider value={contextValue}>
      <section
        className={cn(
          "flex flex-col gap-4 rounded-2xl border bg-background p-4",
          className,
        )}
        ref={ref}
        {...rest}
      >
        <ComparisonHeader
          blind={blind}
          hideBlindToggle={hideBlindToggle}
          labels={resolvedLabels}
          onToggleBlind={handleToggleBlind}
          prompt={prompt}
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {children}
        </div>
      </section>
    </ModelComparisonContext.Provider>
  );
};
ModelComparison.displayName = "ModelComparison";

/**
 * Props for {@link ModelComparisonColumn}.
 *
 * @public
 */
export type ModelComparisonColumnProps = {
  /** Optional badge text shown alongside the label (e.g. "Winner"). */
  badge?: ReactNode;
  /** Friendly display label for the model. Hidden in blind mode. */
  label?: ReactNode;
  /** Model identifier. Hidden in blind mode. */
  model: string;
} & ComponentPropsWithoutRef<"article">;

/**
 * Column for {@link ModelComparison}. Renders the model label and badge in
 * the header and the response content in the body.
 *
 * @public
 */
export const ModelComparisonColumn = (
  props: ModelComparisonColumnProps & React.RefAttributes<HTMLElement>,
) => {
  const { badge, children, className, label, model, ref, ...rest } = props;
  const id = useId();
  const { blind } = use(ModelComparisonContext);
  const displayLabel = blind
    ? `${HIDDEN_LABEL_PREFIX} ${id.slice(-2)}`
    : (label ?? model);

  return (
    <article
      aria-label={typeof displayLabel === "string" ? displayLabel : undefined}
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3",
        className,
      )}
      data-blind={blind ? "true" : "false"}
      data-model={blind ? undefined : model}
      ref={ref}
      {...rest}
    >
      <header className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold tracking-tight text-foreground">
          {displayLabel}
        </h4>
        {badge ? <Badge variant="secondary">{badge}</Badge> : null}
      </header>
      <div className="flex flex-1 flex-col gap-2 text-sm text-foreground">
        {children}
      </div>
    </article>
  );
};
ModelComparisonColumn.displayName = "ModelComparisonColumn";

/**
 * Props for {@link ModelComparisonMeta}.
 *
 * @public
 */
export type ModelComparisonMetaProps = {
  /** Cost stat (formatted). */
  cost?: ReactNode;
  /** Latency stat (formatted). */
  latency?: ReactNode;
  /** Token count. */
  tokens?: number | ReactNode;
} & ComponentPropsWithoutRef<"dl">;

/**
 * Inline statistics row for a {@link ModelComparisonColumn}: tokens,
 * latency, cost. Renders the stats whose props are present.
 *
 * @public
 */
export const ModelComparisonMeta = (
  props: ModelComparisonMetaProps & React.RefAttributes<HTMLDListElement>,
) => {
  const { className, cost, latency, ref, tokens, ...rest } = props;
  const { labels } = use(ModelComparisonContext);

  const items: { caption: string; value: ReactNode }[] = [];
  if (tokens !== undefined && tokens !== null) {
    items.push({
      caption: labels.tokens,
      value: typeof tokens === "number" ? tokens.toLocaleString() : tokens,
    });
  }
  if (latency !== undefined && latency !== null) {
    items.push({ caption: labels.latency, value: latency });
  }
  if (cost !== undefined && cost !== null) {
    items.push({ caption: labels.cost, value: cost });
  }
  if (items.length === 0) return null;

  return (
    <dl
      className={cn(
        "mt-auto flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-2 text-xs",
        className,
      )}
      ref={ref}
      {...rest}
    >
      {items.map((item) => (
        <div className="flex items-baseline gap-1" key={item.caption}>
          <dt className="font-medium uppercase tracking-wide text-muted-foreground">
            {item.caption}
          </dt>
          <dd className="text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
};
ModelComparisonMeta.displayName = "ModelComparisonMeta";

/**
 * Vote payload shape passed to {@link ModelComparisonVoteProps.onVote}.
 *
 * @public
 */
export type ModelComparisonVoteValue = "left" | "right" | "tie";

type VoteLabels = {
  left?: ReactNode;
  right?: ReactNode;
  tie?: ReactNode;
};

/**
 * Props for {@link ModelComparisonVote}.
 *
 * @public
 */
export type ModelComparisonVoteProps = {
  /** Optional captions for the left / right / tie buttons. */
  buttonLabels?: VoteLabels;
  /** Fires with the user's choice. */
  onVote?: (vote: ModelComparisonVoteValue) => void;
} & ComponentPropsWithoutRef<"div">;

/**
 * Vote bar for {@link ModelComparison}. Renders three buttons — left, tie,
 * right — that each emit `onVote` with the chosen value.
 *
 * @public
 */
export const ModelComparisonVote = (
  props: ModelComparisonVoteProps & React.RefAttributes<HTMLDivElement>,
) => {
  const { buttonLabels, className, onVote, ref, ...rest } = props;
  const { labels: contextLabels } = use(ModelComparisonContext);

  const handleLeft = useCallback(() => {
    onVote?.("left");
  }, [onVote]);
  const handleTie = useCallback(() => {
    onVote?.("tie");
  }, [onVote]);
  const handleRight = useCallback(() => {
    onVote?.("right");
  }, [onVote]);

  return (
    <div
      className={cn("flex flex-col items-center gap-2", className)}
      ref={ref}
      {...rest}
    >
      <p className="text-sm font-medium text-foreground">
        {contextLabels.voteHeading}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={handleLeft} size="sm" type="button" variant="outline">
          {buttonLabels?.left ?? "← Left"}
        </Button>
        <Button onClick={handleTie} size="sm" type="button" variant="ghost">
          {buttonLabels?.tie ?? contextLabels.voteTie}
        </Button>
        <Button onClick={handleRight} size="sm" type="button" variant="outline">
          {buttonLabels?.right ?? "Right →"}
        </Button>
      </div>
    </div>
  );
};
ModelComparisonVote.displayName = "ModelComparisonVote";

"use client";

import {
  Children,
  createContext,
  isValidElement,
  use,
  useCallback,
  useMemo,
} from "react";

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible";
import { renderElement } from "@ui-sdk/react/primitive";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  GraduationCap,
  Link2,
  Lock,
  PlayCircle,
} from "lucide-react";
import type { ReactNode } from "react";

import { useControllableState } from "../../../lib/use-controllable-state";
import { cn } from "../../../lib/utils";

export type LessonStatus = "available" | "completed" | "in-progress" | "locked";
export type LessonDifficulty = "advanced" | "beginner" | "intermediate";

type CurriculumContextValue = {
  expandedModules: ReadonlySet<string>;
  toggleModule: (id: string) => void;
};

const CurriculumContext = createContext<CurriculumContextValue | null>(null);

function useCurriculumContext(): CurriculumContextValue {
  const ctx = use(CurriculumContext);
  if (!ctx) {
    throw new Error("CurriculumModule must be used within a Curriculum");
  }
  return ctx;
}

type LessonProgressSummary = {
  completed: number;
  total: number;
};

type LessonElementProps = {
  children?: ReactNode;
  status?: LessonStatus;
};

function summarizeLessonProgress(children: ReactNode): LessonProgressSummary {
  let completed = 0;
  let total = 0;

  Children.forEach(children, (child) => {
    if (!isValidElement<LessonElementProps>(child)) {
      return;
    }

    if (child.type === CurriculumLesson) {
      total += 1;
      if (child.props.status === "completed") {
        completed += 1;
      }
      return;
    }

    const nested = summarizeLessonProgress(child.props.children);
    total += nested.total;
    completed += nested.completed;
  });

  return { completed, total };
}

function statusLabel(status: LessonStatus): string {
  if (status === "completed") return "Completed";
  if (status === "in-progress") return "In progress";
  if (status === "locked") return "Locked";
  return "Available";
}

function statusIcon(status: LessonStatus): ReactNode {
  if (status === "completed") {
    return (
      <CheckCircle2 className="size-4 flex-shrink-0 text-green-600 dark:text-green-500" />
    );
  }
  if (status === "in-progress") {
    return <PlayCircle className="size-4 flex-shrink-0 text-primary" />;
  }
  if (status === "locked") {
    return <Lock className="size-4 flex-shrink-0 text-muted-foreground" />;
  }
  return <BookOpen className="size-4 flex-shrink-0 text-muted-foreground" />;
}

const difficultyStyles: Record<LessonDifficulty, string> = {
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  beginner:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  intermediate:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

type ProgressBarProps = {
  completed: number;
  progressPct: number;
  total: number;
};

function ProgressBar({
  completed,
  progressPct,
  total,
}: ProgressBarProps): React.ReactNode {
  if (total === 0) return null;
  return (
    <div className="mt-1 flex items-center gap-2">
      <div className="h-1.5 max-w-[120px] flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">
        {completed}/{total}
      </span>
    </div>
  );
}

type LessonMetaProps = {
  difficulty?: LessonDifficulty;
  duration?: string;
  prerequisites?: string[];
};

function LessonMeta({
  difficulty,
  duration,
  prerequisites,
}: LessonMetaProps): React.ReactNode {
  const prerequisitesLabel = prerequisites?.length
    ? `Requires: ${prerequisites.join(", ")}`
    : null;

  return (
    <div className="flex flex-shrink-0 items-center gap-2">
      {prerequisitesLabel ? (
        <span
          className="flex items-center gap-1 text-xs text-muted-foreground"
          title={prerequisitesLabel}
        >
          <Link2 aria-hidden="true" className="size-3" />
          <span className="sr-only">{prerequisitesLabel}</span>
        </span>
      ) : null}
      {difficulty ? (
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-xs font-medium capitalize",
            difficultyStyles[difficulty],
          )}
        >
          {difficulty}
        </span>
      ) : null}
      {duration ? (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {duration}
        </span>
      ) : null}
    </div>
  );
}

type ModuleTriggerProps = {
  completed: number;
  description?: string;
  estimatedHours?: number;
  isExpanded: boolean;
  progressPct: number;
  title: string;
  total: number;
};

function ModuleTrigger({
  completed,
  description,
  estimatedHours,
  isExpanded,
  progressPct,
  title,
  total,
}: ModuleTriggerProps): React.ReactNode {
  return (
    <CollapsibleTrigger
      className={cn(
        "w-full flex items-start justify-between gap-3 rounded-md px-6 py-4 text-left transition-colors",
        "hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isExpanded && "bg-secondary/30",
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-sm font-medium">{title}</span>
        {description ? (
          <span className="line-clamp-1 text-xs text-muted-foreground">
            {description}
          </span>
        ) : null}
        <ProgressBar
          completed={completed}
          progressPct={progressPct}
          total={total}
        />
      </div>
      <div className="mt-0.5 flex flex-shrink-0 items-center gap-3">
        {estimatedHours === undefined ? null : (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            {estimatedHours}h
          </span>
        )}
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-180",
          )}
        />
      </div>
    </CollapsibleTrigger>
  );
}

export type CurriculumProps = {
  children: ReactNode;
  className?: string;
  defaultExpandedModules?: string[];
  /** Ids of the open modules. Pair it with `onExpandedModulesChange`. */
  expandedModules?: string[];
  /** Called with the ids of the open modules after a module opens or closes. */
  onExpandedModulesChange?: (ids: string[]) => void;
  title: string;
  totalHours?: number;
};

function CurriculumRoot({
  children,
  className,
  defaultExpandedModules,
  expandedModules: expandedModulesProperty,
  onExpandedModulesChange,
  title,
  totalHours,
}: CurriculumProps): React.ReactNode {
  const [expandedIds, setExpandedIds] = useControllableState<string[]>({
    defaultValue: defaultExpandedModules ?? [],
    onChange: onExpandedModulesChange,
    value: expandedModulesProperty,
  });
  const expandedModules = useMemo(() => new Set(expandedIds), [expandedIds]);

  const toggleModule = useCallback(
    (id: string) => {
      setExpandedIds(
        expandedModules.has(id)
          ? expandedIds.filter((expandedId) => expandedId !== id)
          : [...expandedIds, id],
      );
    },
    [expandedIds, expandedModules, setExpandedIds],
  );

  const contextValue = useMemo(
    () => ({ expandedModules, toggleModule }),
    [expandedModules, toggleModule],
  );

  return (
    <CurriculumContext.Provider value={contextValue}>
      <div
        className={cn(
          "my-6 rounded-lg border bg-card text-card-foreground shadow-sm",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          {totalHours === undefined ? null : (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="size-4" />
              <span>{totalHours}h total</span>
            </div>
          )}
        </div>
        <div aria-label={title} className="divide-y" role="group">
          {children}
        </div>
      </div>
    </CurriculumContext.Provider>
  );
}

export type CurriculumModuleProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  estimatedHours?: number;
  id: string;
  title: string;
};

/** Keeps the module a `section`, like the markup before the collapsible. */
function renderSection(props: Record<string, unknown>, state: object) {
  return renderElement("section", props, undefined, state);
}

function CurriculumModule({
  children,
  className,
  description,
  estimatedHours,
  id,
  title,
}: CurriculumModuleProps): React.ReactNode {
  const { expandedModules, toggleModule } = useCurriculumContext();
  const isExpanded = expandedModules.has(id);
  const { completed, total } = useMemo(
    () => summarizeLessonProgress(children),
    [children],
  );
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Collapsible
      className={className}
      onOpenChange={() => {
        toggleModule(id);
      }}
      open={isExpanded}
      render={renderSection}
    >
      <ModuleTrigger
        completed={completed}
        description={description}
        estimatedHours={estimatedHours}
        isExpanded={isExpanded}
        progressPct={progressPct}
        title={title}
        total={total}
      />
      <CollapsiblePanel
        className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height,opacity] duration-200 data-[ending-style]:h-0 data-[starting-style]:h-0 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
        keepMounted
      >
        <div className="divide-y divide-border/50 pb-2">{children}</div>
      </CollapsiblePanel>
    </Collapsible>
  );
}

export type CurriculumLessonProps = {
  className?: string;
  difficulty?: LessonDifficulty;
  duration?: string;
  href?: string;
  id?: string;
  prerequisites?: string[];
  status?: LessonStatus;
  title: string;
};

function CurriculumLesson({
  className,
  difficulty,
  duration,
  href,
  prerequisites,
  status = "available",
  title,
}: CurriculumLessonProps): React.ReactNode {
  const isLocked = status === "locked";

  const inner = (
    <div
      aria-disabled={isLocked || undefined}
      className={cn(
        "flex items-center gap-3 px-6 py-3 pl-10 text-sm transition-colors",
        isLocked ? "cursor-not-allowed opacity-60" : "",
        !isLocked && href ? "cursor-pointer hover:bg-secondary/40" : "",
        className,
      )}
    >
      {statusIcon(status)}
      <span className="sr-only">{statusLabel(status)}</span>{" "}
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          status === "completed" && "text-muted-foreground line-through",
          status === "in-progress" && "font-medium",
        )}
      >
        {title}
        {isLocked ? <span className="sr-only"> (Locked)</span> : null}
      </span>
      <LessonMeta
        difficulty={difficulty}
        duration={duration}
        prerequisites={prerequisites}
      />
    </div>
  );

  if (href && !isLocked) {
    return (
      <a
        className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        href={href}
      >
        {inner}
      </a>
    );
  }

  return inner;
}

type CurriculumComponent = ((props: CurriculumProps) => React.ReactNode) & {
  Lesson: typeof CurriculumLesson;
  Module: typeof CurriculumModule;
};

const Curriculum = Object.assign(CurriculumRoot, {
  Lesson: CurriculumLesson,
  Module: CurriculumModule,
}) as CurriculumComponent;

export { Curriculum, CurriculumLesson, CurriculumModule };

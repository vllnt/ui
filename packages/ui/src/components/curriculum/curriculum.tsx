"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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

import { cn } from "../../lib/utils";

export type LessonStatus = "available" | "completed" | "in-progress" | "locked";
export type LessonDifficulty = "advanced" | "beginner" | "intermediate";

type CurriculumContextValue = {
  expandedModules: Set<string>;
  toggleModule: (id: string) => void;
};

const CurriculumContext = createContext<CurriculumContextValue | null>(null);

function useCurriculumContext(): CurriculumContextValue {
  const ctx = useContext(CurriculumContext);
  if (!ctx) {
    throw new Error("CurriculumModule must be used within a Curriculum");
  }
  return ctx;
}

type ModuleContextValue = {
  moduleId: string;
  registerLesson: (id: string, status: LessonStatus) => void;
};

const ModuleContext = createContext<ModuleContextValue | null>(null);

function useModuleContext(): ModuleContextValue | null {
  return useContext(ModuleContext);
}

type ModuleProgress = {
  completed: number;
  moduleCtx: ModuleContextValue;
  progressPct: number;
  total: number;
};

function useModuleProgress(id: string): ModuleProgress {
  const [lessonStatuses, setLessonStatuses] = useState<
    Map<string, LessonStatus>
  >(() => new Map());

  const registerLesson = useCallback(
    (lessonId: string, status: LessonStatus) => {
      setLessonStatuses((previous) => {
        if (previous.get(lessonId) === status) return previous;
        const next = new Map(previous);
        next.set(lessonId, status);
        return next;
      });
    },
    [],
  );

  const moduleCtx = useMemo(
    () => ({ moduleId: id, registerLesson }),
    [id, registerLesson],
  );

  const total = lessonStatuses.size;
  const completed = [...lessonStatuses.values()].filter(
    (s) => s === "completed",
  ).length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, moduleCtx, progressPct, total };
}

function statusIcon(status: LessonStatus): ReactNode {
  if (status === "completed") {
    return <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />;
  }
  if (status === "in-progress") {
    return <PlayCircle className="h-4 w-4 flex-shrink-0 text-primary" />;
  }
  if (status === "locked") {
    return <Lock className="h-4 w-4 flex-shrink-0 text-muted-foreground" />;
  }
  return <BookOpen className="h-4 w-4 flex-shrink-0 text-muted-foreground" />;
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
      <div className="h-1.5 max-w-[120px] flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
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
  return (
    <div className="flex flex-shrink-0 items-center gap-2">
      {prerequisites && prerequisites.length > 0 ? (
        <span
          className="flex items-center gap-1 text-xs text-muted-foreground"
          title={`Requires: ${prerequisites.join(", ")}`}
        >
          <Link2 className="h-3 w-3" />
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
          <Clock className="h-3 w-3" />
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
  id: string;
  isExpanded: boolean;
  progressPct: number;
  title: string;
  toggle: () => void;
  total: number;
};

function ModuleTrigger({
  completed,
  description,
  estimatedHours,
  id,
  isExpanded,
  progressPct,
  title,
  toggle,
  total,
}: ModuleTriggerProps): React.ReactNode {
  return (
    <button
      aria-controls={`module-content-${id}`}
      className={cn(
        "w-full flex items-start justify-between gap-3 px-6 py-4 text-left transition-colors",
        "hover:bg-muted/50",
        isExpanded && "bg-muted/30",
      )}
      onClick={toggle}
      type="button"
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
            <Clock className="h-3.5 w-3.5" />
            {estimatedHours}h
          </span>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-180",
          )}
        />
      </div>
    </button>
  );
}

export type CurriculumProps = {
  children: ReactNode;
  className?: string;
  defaultExpandedModules?: string[];
  title: string;
  totalHours?: number;
};

function Curriculum({
  children,
  className,
  defaultExpandedModules,
  title,
  totalHours,
}: CurriculumProps): React.ReactNode {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => new Set(defaultExpandedModules ?? []),
  );

  const toggleModule = useCallback((id: string) => {
    setExpandedModules((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

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
            <GraduationCap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          {totalHours === undefined ? null : (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{totalHours}h total</span>
            </div>
          )}
        </div>
        <div aria-label={title} className="divide-y" role="tree">
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
  const { completed, moduleCtx, progressPct, total } = useModuleProgress(id);

  return (
    <ModuleContext.Provider value={moduleCtx}>
      <div
        aria-expanded={isExpanded}
        aria-selected={false}
        className={cn("", className)}
        role="treeitem"
      >
        <ModuleTrigger
          completed={completed}
          description={description}
          estimatedHours={estimatedHours}
          id={id}
          isExpanded={isExpanded}
          progressPct={progressPct}
          title={title}
          toggle={() => {
            toggleModule(id);
          }}
          total={total}
        />
        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
          )}
          id={`module-content-${id}`}
          role="group"
        >
          <div className="divide-y divide-border/50 pb-2">{children}</div>
        </div>
      </div>
    </ModuleContext.Provider>
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
  id,
  prerequisites,
  status = "available",
  title,
}: CurriculumLessonProps): React.ReactNode {
  const moduleCtx = useModuleContext();
  const lessonId = id ?? title;

  useEffect(() => {
    if (moduleCtx) {
      moduleCtx.registerLesson(lessonId, status);
    }
  }, [lessonId, moduleCtx, status]);

  const isLocked = status === "locked";

  const inner = (
    <div
      aria-selected={status === "in-progress"}
      className={cn(
        "flex items-center gap-3 px-6 py-3 pl-10 text-sm transition-colors",
        isLocked ? "cursor-not-allowed opacity-60" : "",
        !isLocked && href ? "cursor-pointer hover:bg-muted/40" : "",
        className,
      )}
      role="treeitem"
    >
      {statusIcon(status)}
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          status === "completed" && "text-muted-foreground line-through",
          status === "in-progress" && "font-medium",
        )}
      >
        {title}
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
      <a className="block" href={href} tabIndex={0}>
        {inner}
      </a>
    );
  }

  return inner;
}

Curriculum.Module = CurriculumModule;
Curriculum.Lesson = CurriculumLesson;

export { Curriculum, CurriculumLesson, CurriculumModule };

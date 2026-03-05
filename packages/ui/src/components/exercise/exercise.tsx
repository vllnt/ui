"use client";

import { useState } from "react";

import { Check, Dumbbell, Eye, EyeOff } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Button } from "../button";

const difficultyConfig = {
  easy: { className: "text-green-600 dark:text-green-400", label: "Easy" },
  hard: { className: "text-red-600 dark:text-red-400", label: "Hard" },
  medium: { className: "text-amber-600 dark:text-amber-400", label: "Medium" },
};

type HeaderProps = {
  completed: boolean;
  config: { className: string; label: string };
  onToggle: () => void;
  title: string;
};

function ExerciseHeader({ completed, config, onToggle, title }: HeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Dumbbell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{title}</h4>
          <span className={cn("text-xs font-medium", config.className)}>
            {config.label}
          </span>
        </div>
      </div>
      <Button
        className={cn(completed && "bg-green-500 hover:bg-green-600")}
        onClick={onToggle}
        size="sm"
        variant={completed ? "default" : "outline"}
      >
        {completed ? (
          <>
            <Check className="h-4 w-4 mr-1" />
            Done
          </>
        ) : (
          "Mark Complete"
        )}
      </Button>
    </div>
  );
}

type HintProps = { hint: string; onShow: () => void; showHint: boolean };

function ExerciseHint({ hint, onShow, showHint }: HintProps) {
  return (
    <div className="mb-4">
      {showHint ? (
        <div className="p-3 rounded bg-muted/50 text-sm">
          <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Hint
          </p>
          <p className="text-muted-foreground italic">{hint}</p>
        </div>
      ) : (
        <button
          className="text-sm text-primary hover:underline"
          onClick={onShow}
          type="button"
        >
          Need a hint?
        </button>
      )}
    </div>
  );
}

type SolutionProps = {
  onToggle: () => void;
  showSolution: boolean;
  solution: ReactNode;
};

function ExerciseSolution({ onToggle, showSolution, solution }: SolutionProps) {
  return (
    <div>
      <Button className="mb-3" onClick={onToggle} size="sm" variant="outline">
        {showSolution ? (
          <>
            <EyeOff className="h-4 w-4 mr-1" />
            Hide Solution
          </>
        ) : (
          <>
            <Eye className="h-4 w-4 mr-1" />
            Show Solution
          </>
        )}
      </Button>
      {showSolution ? (
        <div className="p-4 rounded-lg bg-card border text-sm [&>pre]:my-0">
          <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Solution
          </p>
          {solution}
        </div>
      ) : null}
    </div>
  );
}

export type ExerciseProps = {
  children: ReactNode;
  difficulty?: "easy" | "hard" | "medium";
  hint?: string;
  solution?: ReactNode;
  title: string;
};

export function Exercise({
  children,
  difficulty = "medium",
  hint,
  solution,
  title,
}: ExerciseProps) {
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);

  return (
    <div className="my-6 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-6">
      <ExerciseHeader
        completed={completed}
        config={difficultyConfig[difficulty]}
        onToggle={() => {
          setCompleted(!completed);
        }}
        title={title}
      />
      <div className="text-sm text-muted-foreground mb-4 [&>p]:mb-2 [&>ul]:mb-2">
        {children}
      </div>
      {hint ? (
        <ExerciseHint
          hint={hint}
          onShow={() => {
            setShowHint(true);
          }}
          showHint={showHint}
        />
      ) : null}
      {solution ? (
        <ExerciseSolution
          onToggle={() => {
            setShowSolution(!showSolution);
          }}
          showSolution={showSolution}
          solution={solution}
        />
      ) : null}
    </div>
  );
}

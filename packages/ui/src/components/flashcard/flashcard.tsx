"use client";

import { useState } from "react";

import { RefreshCcw } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Badge } from "../badge";
import { Button } from "../button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../card";

export type FlashcardProps = {
  answer: ReactNode;
  category?: string;
  className?: string;
  defaultFlipped?: boolean;
  hint?: string;
  onFlipChange?: (flipped: boolean) => void;
  question: ReactNode;
  title?: string;
};

export function Flashcard({
  answer,
  category,
  className,
  defaultFlipped = false,
  hint,
  onFlipChange,
  question,
  title = "Flashcard",
}: FlashcardProps): ReactNode {
  const [flipped, setFlipped] = useState(defaultFlipped);

  const toggleFlipped = (): void => {
    const nextValue = !flipped;
    setFlipped(nextValue);
    onFlipChange?.(nextValue);
  };

  return (
    <Card
      className={cn(
        "my-6 overflow-hidden border-primary/20 bg-gradient-to-br from-card to-primary/5",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b bg-background/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Study</Badge>
            {category ? <Badge variant="outline">{category}</Badge> : null}
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
        <Button onClick={toggleFlipped} size="sm" variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Flip
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="min-h-40 rounded-xl border bg-background p-6 shadow-sm">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {flipped ? "Answer" : "Prompt"}
          </p>
          <div className="text-base text-foreground [&>p]:mb-3">
            {flipped ? answer : question}
          </div>
        </div>
        {hint ? (
          <p className="text-sm text-muted-foreground">Hint: {hint}</p>
        ) : null}
      </CardContent>
      <CardFooter className="justify-between border-t bg-background/80 px-6 py-4">
        <span className="text-sm text-muted-foreground">
          {flipped
            ? "Use this side to check your recall."
            : "Try answering before flipping the card."}
        </span>
        <Button onClick={toggleFlipped} variant="ghost">
          {flipped ? "Show prompt" : "Reveal answer"}
        </Button>
      </CardFooter>
    </Card>
  );
}

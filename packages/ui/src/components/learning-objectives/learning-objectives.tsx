'use client'

import { CheckCircle2, Clock, GraduationCap, Target } from 'lucide-react'
import type { ReactNode } from 'react'

export type LearningObjectivesProps = {
  estimatedTime?: string
  objectives: string[]
  title?: string
}

export function LearningObjectives({
  estimatedTime,
  objectives,
  title = "What you'll learn",
}: LearningObjectivesProps) {
  return (
    <div className="my-6 rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h4 className="font-semibold text-foreground">{title}</h4>
        </div>
        {estimatedTime ? (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{estimatedTime}</span>
          </div>
        ) : null}
      </div>
      <ul className="space-y-2">
        {objectives.map((objective, index) => (
          <li className="flex items-start gap-2" key={index}>
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground">{objective}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export type PrerequisitesProps = {
  items: string[]
  level?: 'advanced' | 'beginner' | 'intermediate'
  title?: string
}

export function Prerequisites({ items, level, title = 'Prerequisites' }: PrerequisitesProps) {
  return (
    <div className="my-6 rounded-lg border bg-muted/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-muted-foreground" />
          <h4 className="font-semibold text-foreground">{title}</h4>
        </div>
        {level ? (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
            {level}
          </span>
        ) : null}
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li className="flex items-start gap-2 text-sm text-muted-foreground" key={index}>
            <span className="text-primary">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export type SummaryProps = {
  children: ReactNode
  keyTakeaways?: string[]
  title?: string
}

export function Summary({ children, keyTakeaways, title = 'Summary' }: SummaryProps) {
  return (
    <div className="my-6 rounded-lg border bg-muted/30 p-6">
      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <GraduationCap className="h-5 w-5" />
        {title}
      </h4>
      <div className="text-sm text-muted-foreground [&>p]:mb-2">{children}</div>
      {keyTakeaways && keyTakeaways.length > 0 ? (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Key Takeaways
          </p>
          <ul className="space-y-1">
            {keyTakeaways.map((takeaway, index) => (
              <li className="flex items-start gap-2 text-sm" key={index}>
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

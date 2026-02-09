'use client'

import { useState } from 'react'

import type { ReactNode } from 'react'

import { cn } from '../../../lib/utils'

export type StepProps = {
  children: ReactNode
  className?: string
  number?: number
  title: string
}

function Step({ children, className, number, title }: StepProps): React.ReactNode {
  return (
    <div className={cn('flex gap-4', className)}>
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
          {number}
        </div>
        <div className="w-px flex-1 bg-border mt-2" />
      </div>
      <div className="flex-1 pb-8 last:pb-0">
        <h4 className="font-semibold text-foreground mb-2">{title}</h4>
        <div className="text-sm text-muted-foreground [&>p]:mb-2 [&>pre]:my-2">{children}</div>
      </div>
    </div>
  )
}

type InteractiveStepProps = {
  children: ReactNode
  isCompleted: boolean
  isLast: boolean
  onToggle: () => void
  stepNumber: number
  title: string
}

function InteractiveStep({
  children,
  isCompleted,
  isLast,
  onToggle,
  stepNumber,
  title,
}: InteractiveStepProps): React.ReactNode {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <button
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors',
            isCompleted ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground',
          )}
          onClick={onToggle}
          type="button"
        >
          {isCompleted ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          ) : (
            stepNumber
          )}
        </button>
        {!isLast && (
          <div className={cn('w-px flex-1 mt-2', isCompleted ? 'bg-green-500' : 'bg-border')} />
        )}
      </div>
      <div className={cn('flex-1 pb-8 transition-opacity', isCompleted && 'opacity-60')}>
        <h4 className={cn('font-semibold text-foreground mb-2', isCompleted && 'line-through')}>
          {title}
        </h4>
        <div className="text-sm text-muted-foreground [&>p]:mb-2 [&>pre]:my-2">{children}</div>
      </div>
    </div>
  )
}

export type StepByStepProps = {
  children: ReactNode
  className?: string
  interactive?: boolean
  title?: string
}

function StepByStep({
  children,
  className,
  interactive = false,
  title,
}: StepByStepProps): React.ReactNode {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const steps = Array.isArray(children) ? children : [children]

  const toggleStep = (index: number): void => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(index)) newCompleted.delete(index)
    else newCompleted.add(index)
    setCompletedSteps(newCompleted)
  }

  if (!interactive) {
    return (
      <div className={cn('my-6', className)}>
        {title ? (
          <div className="flex items-center gap-2 mb-4">
            <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
        ) : null}
        <div className="space-y-0">
          {steps.map((step, index) => {
            const stepElement = step as React.ReactElement<StepProps>
            return (
              <Step key={index} number={index + 1} title={stepElement.props.title}>
                {stepElement.props.children}
              </Step>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('my-6', className)}>
      {title ? (
        <div className="flex items-center gap-2 mb-4">
          <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          <h3 className="font-semibold text-lg">{title}</h3>
          <span className="text-xs text-muted-foreground ml-auto">
            {completedSteps.size}/{steps.length} completed
          </span>
        </div>
      ) : null}
      <div className="space-y-0">
        {steps.map((step, index) => (
          <InteractiveStep
            isCompleted={completedSteps.has(index)}
            isLast={index === steps.length - 1}
            key={index}
            onToggle={() => {
              toggleStep(index)
            }}
            stepNumber={index + 1}
            title={(step as React.ReactElement<StepProps>).props.title}
          >
            {(step as React.ReactElement<StepProps>).props.children}
          </InteractiveStep>
        ))}
      </div>
    </div>
  )
}

StepByStep.Step = Step

export { Step, StepByStep }

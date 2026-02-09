'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'

import { cn } from '../../lib/utils'
import { buttonVariants } from '../button/button'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function IconLeft() {
  return <ChevronLeft className="h-4 w-4" />
}

function IconRight() {
  return <ChevronRight className="h-4 w-4" />
}

function ChevronComponent({
  orientation = 'right',
}: {
  orientation?: 'down' | 'left' | 'right' | 'up'
}) {
  return orientation === 'left' ? <IconLeft /> : <IconRight />
}

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn('p-3', className)}
      classNames={{
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1',
        ),
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1',
        ),
        caption_label: 'text-sm font-medium',
        day: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
        ),
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        month: 'space-y-4',
        month_caption: 'flex justify-center pt-1 relative items-center',
        month_grid: 'w-full border-collapse space-y-1',
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        nav: 'space-x-1 flex items-center',
        outside:
          'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
        range_end: 'day-range-end',
        range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        today: 'bg-accent text-accent-foreground',
        week: 'flex w-full mt-2',
        weekday: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        weekdays: 'flex',
        ...classNames,
      }}
      components={{
        Chevron: ChevronComponent,
      }}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }

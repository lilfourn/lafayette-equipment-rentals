"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-gray-800 text-white rounded-lg", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-white",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-gray-700 text-white p-0 opacity-70 hover:opacity-100 border-gray-600"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7 justify-items-center mb-2",
        head_cell: "text-gray-400 font-normal text-[0.8rem] text-center",
        row: "grid grid-cols-7 justify-items-center mt-2",
        cell: "h-9 text-sm p-0 relative flex items-center justify-center",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 flex items-center justify-center rounded-md text-white hover:bg-gray-700"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-orange-600 text-white hover:bg-orange-700 focus:bg-orange-700 focus:text-white",
        day_today: "bg-gray-700 text-white border border-orange-500",
        day_outside:
          "day-outside text-gray-500 aria-selected:bg-gray-700 aria-selected:text-gray-400",
        day_disabled: "text-gray-500 opacity-50",
        day_range_middle:
          "aria-selected:bg-gray-700 aria-selected:text-white",
        day_hidden: "invisible",
        ...classNames,
      }}
      // Remove any clear button or related logic
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

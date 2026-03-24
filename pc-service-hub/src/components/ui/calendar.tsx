import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-3 shadow-sm",
        className,
      )}
    >
      <DayPicker
        classNames={{
          months: "flex flex-col sm:flex-row gap-4",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium text-slate-900",
          nav: "space-x-1 flex items-center",
          nav_button:
            "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-lg border border-slate-200",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-slate-50 first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg",
          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-lg hover:bg-slate-100",
          day_selected:
            "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
          day_today: "border border-blue-200",
          day_outside: "text-slate-400 opacity-50",
          day_disabled: "text-slate-300 opacity-50",
          day_range_middle: "aria-selected:bg-slate-100 aria-selected:text-slate-900",
          ...classNames,
        }}
        {...props}
      />
    </div>
  );
}


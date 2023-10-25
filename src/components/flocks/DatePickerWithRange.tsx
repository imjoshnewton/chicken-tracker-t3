"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { subDays, format, subMonths } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@lib/utils";
import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@components/ui/popover";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [previousDate, setPreviousDate] = React.useState<DateRange | undefined>(
    undefined,
  );

  const router = useRouter();
  const searchParams = useSearchParams();
  const path = usePathname();

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.to ? subMonths(date.to, 1) : new Date()}
            selected={date}
            onSelect={(value) => {
              setPreviousDate(() => date);
              setDate(value);
            }}
            numberOfMonths={2}
            toDate={new Date()}
          />
          <div className="flex w-full justify-end p-3 pt-1 ">
            <PopoverClose asChild>
              <Button
                variant="ghost"
                onClick={() => {
                  console.log("previousDate", previousDate);
                  console.log("date", date);
                  if (previousDate) {
                    setDate(previousDate);
                  }
                }}
              >
                Cancel
              </Button>
            </PopoverClose>
            <PopoverClose asChild>
              <Button
                variant="secondary"
                onClick={() => {
                  if (!date?.from || !date?.to) {
                    return;
                  }
                  const curParams = new URLSearchParams(searchParams || "");

                  curParams.set(
                    "statsRange",
                    `${format(date.from, "yyyy-MM-dd")},${format(
                      date.to,
                      "yyyy-MM-dd",
                    )}`,
                  );

                  router.replace(`${path}?${curParams.toString()}`);
                }}
              >
                Done
              </Button>
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

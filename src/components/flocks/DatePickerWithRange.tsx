"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { subDays, format, subMonths, parseISO } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";

export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  // Get router, searchParams, and path from next/navigation
  const router = useRouter();
  const searchParams = useSearchParams();
  const path = usePathname();

  // These steps make sure the date range is set correctly when the page is refreshed
  const statsRange = searchParams.get("statsRange"); // Get statsRange from URL
  // Split statsRange into from and to
  const from = statsRange?.split(",")[0];
  const to = statsRange?.split(",")[1];

  // console.log("statsRange: ", statsRange);
  // console.log("from: ", parseISO(from!));
  // console.log("to: ", parseISO(to!));

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: from ? parseISO(from) : subDays(new Date(), 7), // If from exists, use it, otherwise use 7 days ago
    to: to ? parseISO(to) : new Date(), // If to exists, use it, otherwise use today
  });
  const [previousDate, setPreviousDate] = React.useState<DateRange | undefined>(
    date, // Set previousDate to date
  );

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal sm:w-[300px]",
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
        <PopoverContent
          align="start"
          className="flex w-auto flex-col space-y-2 p-2"
        >
          <Select
            onValueChange={(value) =>
              setDate({
                from: subDays(new Date(), parseInt(value)),
                to: new Date(),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="14">Last 14 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="60">Last 60 Days</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden rounded-md border sm:block">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.to ? subMonths(date.to, 1) : new Date()}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              toDate={new Date()}
            />
          </div>
          <div className="block rounded-md border sm:hidden" aria-hidden>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.to}
              selected={date}
              onSelect={setDate}
              numberOfMonths={1}
              toDate={new Date()}
            />
          </div>
          <div className="flex w-full justify-end ">
            <PopoverClose asChild>
              <Button
                variant="ghost"
                type="button"
                role="cancel"
                onClick={() => {
                  // If previousDate exists, set date to previousDate which resets the calendar
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
                type="button"
                role="submit"
                onClick={() => {
                  // If date is undefined, return
                  if (!date?.from || !date?.to) {
                    return;
                  }

                  setPreviousDate(date); // Set new previousDate for when people click cancel
                  // Get current searchParams
                  const curParams = new URLSearchParams(searchParams || "");

                  // Set statsRange to the new date range
                  curParams.set(
                    "statsRange",
                    `${format(date.from, "yyyy-MM-dd")},${format(
                      date.to,
                      "yyyy-MM-dd",
                    )}`,
                  );

                  // Replace the URL with the new searchParams
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

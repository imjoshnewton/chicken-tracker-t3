"use client";

import { useState } from "react";
import { trpc } from "../../utils/trpc";
import { MdOutlineEditNote } from "react-icons/md";
import toast from "react-hot-toast";
import { RiLoader4Fill } from "react-icons/ri";
import { handleTimezone } from "./date-utils";
import { format, startOfDay } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { cn } from "@lib/utils";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@components/ui/calendar";
import { ResponsiveDialog, DrawerClose } from "@components/ui/responsive-dialog";

const LogModal = ({ flockId }: { flockId: string | undefined }) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [count, setCount] = useState<number>();
  const [notes, setNotes] = useState<string>();
  const [breedId, setBreedId] = useState<string>();

  const router = useRouter();

  const utils = trpc.useUtils();

  const { mutateAsync: createLogMutation, isPending } =
    trpc.logs.createLog.useMutation({
      onSuccess: () => {
        utils.stats.getStats.invalidate();
        utils.stats.getExpenseStats.invalidate();
        router.refresh();
        toast.success("New log created!");
      },
    });

  const flockQuery = trpc.flocks.getFlock.useQuery({
    flockId: flockId as string,
  });

  function closeModal(): void {
    setOpen(false);
  }

  function resetFormValues(): void {
    setDate(new Date());
    setNotes(undefined);
    setCount(undefined);
    setBreedId(undefined);
  }

  async function createNewLog(
    flockId: string,
    date: Date,
    count: number,
    notes?: string,
  ): Promise<void> {
    await createLogMutation({
      flockId,
      date: startOfDay(date),
      count,
      notes,
      breedId,
    });
    closeModal();
    resetFormValues();
  }

  if (!flockId) {
    return null;
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          className="mb-1 mr-1 h-10 w-full rounded px-4 py-2 shadow outline-none transition-all focus:outline-none"
          variant={"secondary"}
        >
          <MdOutlineEditNote className="text-2xl" />
          &nbsp;Log Eggs
        </Button>
      }
      title="Log Eggs"
      footer={
        <>
          <DrawerClose asChild>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
          </DrawerClose>
          <Button
            variant="secondary"
            disabled={isPending}
            onClick={async () => {
              if (date && count) {
                await createNewLog(
                  flockId,
                  date,
                  count,
                  notes,
                );
              }
            }}
          >
            {isPending ? (
              <RiLoader4Fill className="animate-spin text-2xl" />
            ) : (
              "Submit"
            )}
          </Button>
        </>
      }
    >
      <form
        className="flex w-full flex-col gap-4 p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (date && count) {
            await createNewLog(
              flockId,
              date,
              count,
              notes,
            );
          }
        }}
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "h-12 w-full justify-start bg-white text-left font-normal",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? (
                format(date, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => {
                return setDate(handleTimezone(date));
              }}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              autoFocus
            />
          </PopoverContent>
        </Popover>
        
        <Input
          type="tel"
          className="h-12 w-full rounded border bg-white px-2 py-2 text-black"
          required
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          placeholder="Count"
        />
        
        <fieldset className="my-0">
          <Select onValueChange={(val) => setBreedId(val)}>
            <SelectTrigger className="h-12 w-full bg-white text-black">
              <SelectValue placeholder="Select bird(s) (Optional)" />
            </SelectTrigger>
            <SelectContent>
              {flockQuery.data?.breeds
                .filter((breed) => breed.averageProduction > 0)
                .map((breed) => {
                  return (
                    <SelectItem value={breed.id} key={breed.id}>
                      {breed.name && `${breed.name} - `}
                      {breed.breed}
                    </SelectItem>
                  );
                })}
            </SelectContent>
          </Select>
        </fieldset>
        
        <Textarea
          className="w-full rounded border bg-white px-2 py-2 text-black"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes..."
        />
      </form>
    </ResponsiveDialog>
  );
};

export default LogModal;
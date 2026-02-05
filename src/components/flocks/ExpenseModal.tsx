import { Button } from "@components/ui/button";
import { format, startOfDay } from "date-fns";
import { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineDollar } from "react-icons/ai";
import { RiLoader4Fill } from "react-icons/ri";
import { trpc } from "../../utils/trpc";
import { handleTimezone } from "./date-utils";
import MoneyInput from "@components/ui/moneyinput";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { Calendar } from "@components/ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons";
import { cn } from "@lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Textarea } from "@components/ui/textarea";
import { ResponsiveDialog, DialogClose } from "@components/ui/responsive-dialog";

const ExpenseModal = ({ flockId }: { flockId: string | undefined }) => {
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState(0);
  const [memo, setMemo] = useState<string>();
  const [category, setCategory] = useState<string>("feed");

  const utils = trpc.useUtils();

  const { mutateAsync: createExpense, isLoading } =
    trpc.expenses.createExpense.useMutation({
      onSuccess: () => {
        utils.stats.getExpenseStats.invalidate();
        toast.success("Expense added!");
      },
    });

  function closeModal(): void {
    setShowModal(false);
  }

  function resetFormValues(): void {
    setDate(new Date());
    setMemo(undefined);
    setAmount(0);
  }

  async function createNewLog(
    flockId: string,
    date: Date,
    amount: number,
    category: string,
    memo?: string,
  ): Promise<void> {
    await createExpense({
      flockId,
      date: startOfDay(date),
      amount,
      category,
      memo,
    });
    closeModal();
    resetFormValues();
  }

  if (!flockId) {
    return null;
  }

  const handleSubmit = async () => {
    if (date && amount) {
      await createNewLog(
        flockId,
        date,
        amount,
        category ? category : "other",
        memo,
      );
    }
  };

  const trigger = (
    <Button
      className="mb-1 mr-1 h-10 w-full rounded px-4 py-2 shadow outline-none transition-all focus:outline-none"
      type="button"
      variant={"secondary"}
    >
      <AiOutlineDollar className="text-xl" />
      &nbsp;Log an Expense
    </Button>
  );

  const footer = (
    <>
      <DialogClose asChild>
        <Button
          variant="ghost"
          type="button"
          onClick={closeModal}
        >
          Cancel
        </Button>
      </DialogClose>
      <Button
        variant="secondary"
        type="button"
        disabled={isLoading}
        onClick={handleSubmit}
      >
        {isLoading ? (
          <RiLoader4Fill className="animate-spin text-2xl" />
        ) : (
          "Submit"
        )}
      </Button>
    </>
  );

  return (
    <ResponsiveDialog
      trigger={trigger}
      title="Log an Expense"
      footer={footer}
      open={showModal}
      onOpenChange={setShowModal}
      contentClassName="bg-[#FEF9F6] p-0"
    >
      <form
        className="flex w-full flex-col gap-4 p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await handleSubmit();
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
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <MoneyInput
          name="Money Input"
          placeholder="Amount"
          value={amount}
          setValue={setAmount}
        />
        
        <Select onValueChange={(val) => setCategory(val)} defaultValue={category}>
          <SelectTrigger className="h-12 w-full bg-white text-black">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="feed">Feed</SelectItem>
            <SelectItem value="suplements">Suplements</SelectItem>
            <SelectItem value="medication">Medication</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Textarea
          className="w-full appearance-none rounded border bg-white px-2 py-2 text-black"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="Memo..."
        />
      </form>
    </ResponsiveDialog>
  );
};

export default ExpenseModal;
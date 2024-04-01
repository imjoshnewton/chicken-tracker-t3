import { Button } from "@components/ui/button";
import { format, startOfDay } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import CurrencyInput from "react-currency-input-field";
import toast from "react-hot-toast";
import { AiOutlineDollar } from "react-icons/ai";
import { MdClose } from "react-icons/md";
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

  const dropIn = {
    hidden: {
      y: "100%",
      opacity: 0,
    },
    visible: {
      y: "0",
      opacity: 1,
      transition: {
        duration: 0.15,
        type: "spring",
        damping: 25,
        stiffness: 500,
      },
    },
    exit: {
      y: "100%",
      opacity: 0,
      transition: {
        duration: 0.3,
        type: "spring",
        damping: 25,
        stiffness: 500,
      },
    },
  };

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

  return (
    <>
      <Button
        className="mb-1 mr-1 h-10 w-full rounded px-4 py-2 shadow outline-none transition-all focus:outline-none md:w-auto"
        type="button"
        variant={"secondary"}
        onClick={() => setShowModal(true)}
      >
        <AiOutlineDollar className="text-xl" />
        &nbsp;Log an Expense
      </Button>
      <AnimatePresence
        // Disable any initial animations on children that
        // are present when the component is first rendered
        initial={false}
      >
        {showModal && (
          <>
            <motion.div
              onClick={() => closeModal()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none lg:items-center"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                variants={dropIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative mx-auto h-full w-full min-w-[350px] rounded-t-sm pt-4 lg:my-6 lg:h-auto lg:w-auto lg:max-w-3xl lg:rounded-lg"
              >
                <div className="pb-safe relative flex h-full w-full flex-col border-0 bg-[#FEF9F6] shadow-lg outline-none focus:outline-none lg:h-auto lg:rounded-lg lg:pb-0">
                  <div className="flex items-center justify-between rounded-t border-b border-solid border-gray-300 py-3 pl-4 pr-3 lg:py-3 lg:pl-5 lg:pr-3 ">
                    <h3 className="text-xl">Log an Expense</h3>
                    <button
                      onClick={() => closeModal()}
                      className=" rounded p-3 text-xl hover:bg-slate-50 hover:shadow"
                    >
                      <MdClose />
                    </button>
                  </div>
                  <div className="relative flex-auto">
                    <form
                      className="flex w-full flex-col gap-4 p-4 lg:px-8 lg:pb-8 lg:pt-6"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        // await createNewLog(flockId, date, count, notes);
                        if (date && amount) {
                          await createNewLog(
                            flockId,
                            date,
                            amount,
                            category ? category : "other",
                            memo,
                          );
                        }
                      }}
                    >
                      {/* <label className="mb-1 block text-sm font-bold text-black">
                        Date
                      </label> */}
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
                      {/* <input */}
                      {/*   className="w-full appearance-none rounded border px-1 py-2 text-black" */}
                      {/*   max={format(new Date(), "yyyy-MM-dd")} */}
                      {/*   required */}
                      {/*   value={format(handleTimezone(date), "yyyy-MM-dd")} */}
                      {/*   onChange={(event) => */}
                      {/*     setDate(handleTimezone(new Date(event.target.value))) */}
                      {/*   } */}
                      {/*   // onChange={(e) => { */}
                      {/*   //   if (e.target.valueAsDate) { */}
                      {/*   //     var date = e.target.valueAsDate; */}
                      {/*   //     var userTimezoneOffset = */}
                      {/*   //       date.getTimezoneOffset() * 60000; */}
                      {/**/}
                      {/*   //     setDate( */}
                      {/*   //       new Date(date.getTime() + userTimezoneOffset) */}
                      {/*   //     ); */}
                      {/*   //   } */}
                      {/*   // }} */}
                      {/*   type="date" */}
                      {/* /> */}
                      {/* <label className="mb-1 mt-2 block text-sm font-bold text-black">
                        Amount
                      </label> */}
                      <MoneyInput
                        name="Money Input"
                        placeholder="Amount"
                        value={amount}
                        setValue={setAmount}
                      />
                      {/* <CurrencyInput */}
                      {/*   id="amount-input" */}
                      {/*   name="amount-input" */}
                      {/*   prefix="$" */}
                      {/*   placeholder="Amount" */}
                      {/*   decimalsLimit={2} */}
                      {/*   decimalScale={2} */}
                      {/*   onValueChange={(value) => setAmount(Number(value))} */}
                      {/*   className="w-full appearance-none rounded border px-1 py-2 text-black" */}
                      {/* /> */}
                      <fieldset className="my-0">
                        {/* <label className="mb-1 mt-2 block text-sm font-bold text-black">
                          Category:&nbsp;&nbsp;
                        </label> */}
                        <Select onValueChange={(val) => setCategory(val)}>
                          <SelectTrigger className="h-12 w-full bg-white text-black">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="feed">Feed</SelectItem>
                            <SelectItem value="suplements">
                              Suplements
                            </SelectItem>
                            <SelectItem value="medication">
                              Medication
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {/* <select */}
                        {/*   onChange={(e) => setCategory(e.target.value)} */}
                        {/*   value={category} */}
                        {/*   className="h-12 w-full rounded border px-1 py-2 text-black" */}
                        {/* > */}
                        {/*   <option value="" disabled> */}
                        {/*     Category */}
                        {/*   </option> */}
                        {/*   <option value="feed">Feed</option> */}
                        {/*   <option value="suplements">Suplements</option> */}
                        {/*   <option value="medication">Medication</option> */}
                        {/*   <option value="other">Other</option> */}
                        {/* </select> */}
                      </fieldset>

                      {/* <label className="mb-1 block text-sm font-bold text-black">
                        Memo
                      </label> */}
                      <Textarea
                        className="w-full appearance-none rounded border bg-white px-2 py-2 text-black "
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="Memo..."
                      />
                    </form>
                  </div>
                  <div className="border-blueGray-200 flex items-center justify-end rounded-b border-t border-solid p-3 lg:p-6">
                    <Button
                      variant="outline"
                      className="background-transparent mb-1 mr-1 rounded px-6 py-3 uppercase hover:bg-slate-50 focus:outline-none"
                      type="button"
                      onClick={closeModal}
                    >
                      CANCEL
                    </Button>
                    <Button
                      variant="secondary"
                      className="btn mb-1 mr-1 rounded px-6 py-3 font-bold uppercase text-white shadow outline-none hover:shadow-lg focus:outline-none"
                      type="button"
                      disabled={isLoading}
                      onClick={async () => {
                        // await createNewLog(flockId, date, count, notes);
                        if (date && amount) {
                          await createNewLog(
                            flockId,
                            date,
                            amount,
                            category ? category : "other",
                            memo,
                          );
                        }
                      }}
                    >
                      {isLoading ? (
                        <RiLoader4Fill className="animate-spin text-2xl" />
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExpenseModal;

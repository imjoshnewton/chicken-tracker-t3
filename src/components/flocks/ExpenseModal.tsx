import { useState } from "react";
import CurrencyInput from "react-currency-input-field";
import { trpc } from "../../utils/trpc";
import { AiOutlineDollar } from "react-icons/ai";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

const ExpenseModal = ({ flockId }: { flockId: string | undefined }) => {
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState<Date>();
  const [amount, setAmount] = useState(0);
  const [memo, setMemo] = useState<string>();
  const [category, setCategory] = useState<string>("other");

  const utils = trpc.useContext();

  const { mutateAsync: createExpense, isLoading } =
    trpc.expenses.createExpense.useMutation({
      onSuccess: () => {
        utils.stats.getExpenseStats.invalidate();
        toast.success("Expense added!");
      },
    });

  const dropIn = {
    hidden: {
      y: "-100vh",
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
      y: "-100vh",
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
    setDate(undefined);
    setMemo(undefined);
    setAmount(0);
  }

  async function createNewLog(
    flockId: string,
    date: Date,
    amount: number,
    category: string,
    memo?: string
  ): Promise<void> {
    await createExpense({
      flockId,
      date,
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
      <button
        className="btn mr-1 mb-1 h-10 w-full rounded px-4 py-2 shadow outline-none transition-all hover:shadow-lg focus:outline-none md:w-auto"
        type="button"
        onClick={() => setShowModal(true)}
      >
        <AiOutlineDollar className="text-xl" />
        &nbsp;Log an Expense
      </button>
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
              className="modal-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                variants={dropIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative my-6 mx-auto w-auto min-w-[350px] max-w-3xl"
              >
                <div className="relative flex w-full flex-col rounded-lg border-0 bg-white shadow-lg outline-none focus:outline-none">
                  <div className="flex items-start justify-between rounded-t border-b border-solid border-gray-300 p-5 ">
                    <h3 className="font=semibold text-xl">New Expense</h3>
                  </div>
                  <div className="relative flex-auto">
                    <form
                      className="w-full px-8 pt-6 pb-8"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        // await createNewLog(flockId, date, count, notes);
                        if (date && amount) {
                          await createNewLog(
                            flockId,
                            date,
                            amount,
                            category,
                            memo
                          );
                        }
                      }}
                    >
                      <label className="mb-1 block text-sm font-bold text-black">
                        Date
                      </label>
                      <input
                        className="w-full appearance-none rounded border py-2 px-1 text-black"
                        required
                        onChange={(e) => {
                          if (e.target.valueAsDate) {
                            var date = e.target.valueAsDate;
                            var userTimezoneOffset =
                              date.getTimezoneOffset() * 60000;

                            setDate(
                              new Date(date.getTime() + userTimezoneOffset)
                            );
                          }
                        }}
                        type="date"
                      />
                      <label className="mb-1 mt-2 block text-sm font-bold text-black">
                        Amount
                      </label>
                      <CurrencyInput
                        id="amount-input"
                        name="amount-input"
                        prefix="$"
                        placeholder="0.00"
                        decimalsLimit={2}
                        decimalScale={2}
                        onValueChange={(value, name) =>
                          setAmount(Number(value))
                        }
                        className="w-full appearance-none rounded border py-2 px-1 text-black"
                      />
                      <fieldset className="my-3">
                        <label className="mb-1 mt-2 block text-sm font-bold text-black">
                          Category:&nbsp;&nbsp;
                        </label>
                        <select
                          onChange={(e) => setCategory(e.target.value)}
                          value={category}
                          className="w-full rounded border py-2 px-1 text-black"
                        >
                          <option value="feed">Feed</option>
                          <option value="suplements">Suplements</option>
                          <option value="medication">Medication</option>
                          <option value="other">Other</option>
                        </select>
                      </fieldset>

                      <label className="mb-1 block text-sm font-bold text-black">
                        Memo
                      </label>
                      <textarea
                        className="w-full appearance-none rounded border py-2 px-1 text-black"
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="Memo..."
                      />
                    </form>
                  </div>
                  <div className="border-blueGray-200 flex items-center justify-end rounded-b border-t border-solid p-6">
                    <button
                      className="background-transparent mr-1 mb-1 rounded px-6 py-3 text-sm uppercase text-black outline-none hover:bg-slate-50 focus:outline-none"
                      type="button"
                      onClick={closeModal}
                    >
                      Close
                    </button>
                    <button
                      className="mr-1 mb-1 rounded bg-secondary px-6 py-3 text-sm font-bold uppercase text-white shadow outline-none hover:shadow-lg focus:outline-none"
                      type="button"
                      disabled={isLoading}
                      onClick={async () => {
                        // await createNewLog(flockId, date, count, notes);
                        if (date && amount) {
                          await createNewLog(
                            flockId,
                            date,
                            amount,
                            category,
                            memo
                          );
                        }
                      }}
                    >
                      Submit
                    </button>
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

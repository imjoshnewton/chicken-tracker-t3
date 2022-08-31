import { useState } from "react";
import CurrencyInput from "react-currency-input-field";
import { trpc } from "../utils/trpc";
import { AiOutlineDollar } from "react-icons/ai";

const ExpenseModal = ({ flockId }: { flockId: string | undefined }) => {
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState<Date>();
  const [amount, setAmount] = useState(0);
  const [memo, setMemo] = useState<string>();
  const [category, setCategory] = useState<string>("other");

  const utils = trpc.useContext();

  const createExpenseMutation = trpc.useMutation(["expenses.createExpense"], {
    onSuccess: () => {
      utils.invalidateQueries();
    },
  });

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
    await createExpenseMutation.mutateAsync({
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
        className='px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 btn w-full md:w-auto h-10 transition-all'
        type='button'
        onClick={() => setShowModal(true)}>
        <AiOutlineDollar className='text-xl' />
        &nbsp;Add New Expense
      </button>
      {showModal ? (
        <>
          <div className='flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none modal-overlay'>
            <div className='relative w-auto my-6 mx-auto max-w-3xl min-w-[350px]'>
              <div className='border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none'>
                <div className='flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t '>
                  <h3 className='text-xl font=semibold'>New Expense</h3>
                </div>
                <div className='relative flex-auto'>
                  <form
                    className='px-8 pt-6 pb-8 w-full'
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
                    }}>
                    <label className='block text-black text-sm font-bold mb-1'>
                      Date
                    </label>
                    <input
                      className='appearance-none border rounded w-full py-2 px-1 text-black'
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
                      type='date'
                    />
                    <label className='block text-black text-sm font-bold mb-1 mt-2'>
                      Amount
                    </label>
                    <CurrencyInput
                      id='amount-input'
                      name='amount-input'
                      prefix='$'
                      placeholder='0.00'
                      defaultValue={100.0}
                      decimalsLimit={2}
                      decimalScale={2}
                      onValueChange={(value, name) => setAmount(Number(value))}
                      className='appearance-none border rounded w-full py-2 px-1 text-black'
                    />
                    <fieldset className='my-3'>
                      <label className='block text-black text-sm font-bold mb-1 mt-2'>
                        Category:&nbsp;&nbsp;
                      </label>
                      <select
                        onChange={(e) => setCategory(e.target.value)}
                        value={category}
                        className='border rounded w-full py-2 px-1 text-black'>
                        <option value='feed'>Feed</option>
                        <option value='suplements'>Suplements</option>
                        <option value='medication'>Medication</option>
                        <option value='other'>Other</option>
                      </select>
                    </fieldset>

                    <label className='block text-black text-sm font-bold mb-1'>
                      Memo
                    </label>
                    <textarea
                      className='appearance-none border rounded w-full py-2 px-1 text-black'
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      placeholder='Memo...'
                    />
                  </form>
                </div>
                <div className='flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b'>
                  <button
                    className='text-black background-transparent uppercase px-6 py-3 text-sm outline-none focus:outline-none mr-1 mb-1 hover:bg-slate-50 rounded'
                    type='button'
                    onClick={closeModal}>
                    Close
                  </button>
                  <button
                    className='text-white bg-yellow-500 active:bg-yellow-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1'
                    type='button'
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
                    }}>
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default ExpenseModal;

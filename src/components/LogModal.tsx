import { useState } from "react";
import { trpc } from "../utils/trpc";
import { MdOutlineEditNote } from "react-icons/md";

const LogModal = ({ flockId }: { flockId: string | undefined }) => {
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState<Date>();
  const [count, setCount] = useState(0);
  const [notes, setNotes] = useState<string>();

  const utils = trpc.useContext();

  const createLogMutation = trpc.useMutation(["logs.createLog"], {
    onSuccess: () => {
      utils.invalidateQueries("stats.getStats");
    },
  });

  function closeModal(): void {
    setShowModal(false);
  }

  function resetFormValues(): void {
    setDate(undefined);
    setNotes(undefined);
    setCount(0);
  }

  async function createNewLog(
    flockId: string,
    date: Date,
    count: number,
    notes?: string
  ): Promise<void> {
    await createLogMutation.mutateAsync({ flockId, date, count, notes });
    closeModal();
    resetFormValues();
  }

  if (!flockId) {
    return null;
  }

  return (
    <>
      <button
        className='px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 btn w-full md:w-auto h-10'
        type='button'
        onClick={() => setShowModal(true)}>
        <MdOutlineEditNote className='text-2xl' />
        &nbsp;Add Log Entry
      </button>
      {showModal ? (
        <>
          <div className='flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none modal-overlay'>
            <div className='relative w-auto my-6 mx-auto max-w-3xl min-w-[350px]'>
              <div className='border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none'>
                <div className='flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t '>
                  <h3 className='text-xl font=semibold'>New Log Entry</h3>
                </div>
                <div className='relative flex-auto'>
                  <form
                    className='px-8 pt-6 pb-8 w-full'
                    onSubmit={async (e) => {
                      e.preventDefault();
                      // await createNewLog(flockId, date, count, notes);
                      if (date && count) {
                        await createNewLog(flockId, date, count, notes);
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
                      Count
                    </label>
                    <input
                      className='appearance-none border rounded w-full py-2 px-1 text-black'
                      required
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      placeholder='0'
                      type='number'
                    />
                    <label className='block text-black text-sm font-bold mb-1'>
                      Notes
                    </label>
                    <textarea
                      className='appearance-none border rounded w-full py-2 px-1 text-black'
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder='Notes...'
                    />
                  </form>
                </div>
                <div className='flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b'>
                  <button
                    className='text-black background-transparent uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1'
                    type='button'
                    onClick={closeModal}>
                    Close
                  </button>
                  <button
                    className='text-white bg-yellow-500 active:bg-yellow-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1'
                    type='button'
                    onClick={async () => {
                      // await createNewLog(flockId, date, count, notes);
                      if (date && count) {
                        await createNewLog(flockId, date, count, notes);
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

export default LogModal;

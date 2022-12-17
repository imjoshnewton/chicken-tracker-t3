import { useState } from "react";
import { trpc } from "../utils/trpc";
import { MdOutlineEditNote } from "react-icons/md";
import toast from "react-hot-toast";

const LogModal = ({ flockId }: { flockId: string | undefined }) => {
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState<Date>();
  const [count, setCount] = useState<number>();
  const [notes, setNotes] = useState<string>();

  const utils = trpc.useContext();

  const createLogMutation = trpc.logs.createLog.useMutation({
    onSuccess: () => {
      utils.stats.getStats.invalidate();
      toast.success("New log created!");
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
        className="btn mr-1 mb-1 h-10 w-full rounded px-4 py-2 shadow outline-none transition-all hover:shadow-lg focus:outline-none md:w-auto"
        type="button"
        onClick={() => setShowModal(true)}
      >
        <MdOutlineEditNote className="text-2xl" />
        &nbsp;Add Log Entry
      </button>
      {showModal ? (
        <>
          <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
            <div className="relative my-6 mx-auto w-auto min-w-[350px] max-w-3xl">
              <div className="relative flex w-full flex-col rounded-lg border-0 bg-white shadow-lg outline-none focus:outline-none">
                <div className="flex items-start justify-between rounded-t border-b border-solid border-gray-300 p-5 ">
                  <h3 className="font=semibold text-xl">New Log Entry</h3>
                </div>
                <div className="relative flex-auto">
                  <form
                    className="w-full px-8 pt-6 pb-8"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      // await createNewLog(flockId, date, count, notes);
                      if (date && count) {
                        await createNewLog(flockId, date, count, notes);
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
                      Count
                    </label>
                    <input
                      className="w-full appearance-none rounded border py-2 px-1 text-black"
                      required
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      placeholder=""
                      type="number"
                    />
                    <label className="mb-1 block text-sm font-bold text-black">
                      Notes
                    </label>
                    <textarea
                      className="w-full appearance-none rounded border py-2 px-1 text-black"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notes..."
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
                    onClick={async () => {
                      // await createNewLog(flockId, date, count, notes);
                      if (date && count) {
                        await createNewLog(flockId, date, count, notes);
                      }
                    }}
                  >
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

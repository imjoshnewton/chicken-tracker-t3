import { useState } from "react";
import { trpc } from "../../utils/trpc";
import { MdClose, MdOutlineEditNote } from "react-icons/md";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { RiLoader4Fill } from "react-icons/ri";
import { formatDate, handleTimezone } from "./date-utils";
import { format, startOfDay } from "date-fns";
import { useRouter } from "next/navigation";

const LogModal = ({ flockId }: { flockId: string | undefined }) => {
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [count, setCount] = useState<number>();
  const [notes, setNotes] = useState<string>();
  const [breedId, setBreedId] = useState<string>();

  const router = useRouter();

  const utils = trpc.useContext();

  const { mutateAsync: createLogMutation, isLoading } =
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
    setDate(new Date()); //({ startDate: new Date(), endDate: null });
    setNotes(undefined);
    setCount(undefined);
    setBreedId(undefined);
  }

  async function createNewLog(
    flockId: string,
    date: Date,
    count: number,
    notes?: string
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
    <>
      <motion.button
        // whileHover={{ scale: 1.05 }}
        // whileTap={{ scale: 0.95 }}
        className="btn mb-1 mr-1 h-10 w-full rounded px-4 py-2 shadow outline-none transition-all focus:outline-none md:w-auto"
        type="button"
        onClick={() => setShowModal(true)}
      >
        <MdOutlineEditNote className="text-2xl" />
        &nbsp;Log Eggs
      </motion.button>
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
                    <h3 className="text-xl">Log Eggs</h3>
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
                        if (date && count) {
                          await createNewLog(
                            flockId,
                            date, //new Date(date.startDate.toLocaleString()),
                            count,
                            notes
                          );
                        }
                      }}
                    >
                      {/* <fieldset className="flex gap-3"> */}
                      {/* <label className="mb-1 block text-sm font-bold text-black">
                        Date
                      </label> */}
                      {/* <Datepicker
                        useRange={false}
                        asSingle={true}
                        value={date}
                        onChange={(newValue) => {
                          setDate(newValue);
                        }}
                        containerClassName="relative rounded border"
                        inputClassName={`px-2 py-2 w-full rounded`}
                        // popoverDirection={"up" as PopoverDirectionType}
                        displayFormat={"MM/DD/YYYY"}
                        toggleClassName="absolute top-0 rounded-r-lg text-white right-0 h-full px-3 text-gray-400 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                      /> */}
                      <input
                        id="date"
                        className="w-full appearance-none rounded border px-1 py-2 text-black"
                        required
                        value={format(handleTimezone(date), "yyyy-MM-dd")}
                        onChange={(event) =>
                          setDate(handleTimezone(new Date(event.target.value)))
                        }
                        type="date"
                      />
                      {/* <label className="mb-1 mt-2 block text-sm font-bold text-black">
                        Count
                      </label> */}
                      <input
                        type="tel"
                        className="w-full appearance-none rounded border px-2 py-2 text-black"
                        required
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        placeholder="Count"
                      />
                      {/* </fieldset> */}
                      <fieldset className="my-0">
                        {/* <label className="mb-1 mt-2 block text-sm font-bold text-black">
                          Bird(s) (optional)
                        </label> */}
                        <select
                          onChange={(e) => setBreedId(e.target.value)}
                          value={breedId}
                          className="h-12 w-full rounded border px-1 py-2 text-black"
                        >
                          <option value="">Select bird(s) (Optional)</option>
                          {flockQuery.data?.breeds
                            .filter((breed) => breed.averageProduction > 0)
                            .map((breed) => {
                              return (
                                <option value={breed.id} key={breed.id}>
                                  {breed.name && `${breed.name} - `}
                                  {breed.breed}
                                </option>
                              );
                            })}
                        </select>
                      </fieldset>
                      {/* <label className="mb-1 block text-sm font-bold text-black">
                        Notes
                      </label> */}
                      <textarea
                        className="w-full appearance-none rounded border px-1 py-2 text-black"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Notes..."
                      />
                    </form>
                  </div>
                  <div className="border-blueGray-200 flex items-center justify-end rounded-b border-t border-solid p-3 lg:p-6">
                    <button
                      className="background-transparent mb-1 mr-1 rounded px-6 py-3 text-sm uppercase text-black outline-none hover:bg-slate-50 focus:outline-none"
                      type="button"
                      onClick={closeModal}
                    >
                      CANCEL
                    </button>
                    <button
                      className="btn mb-1 mr-1 rounded px-6 py-3 text-sm font-bold uppercase text-white shadow outline-none hover:shadow-lg focus:outline-none"
                      type="button"
                      disabled={isLoading}
                      onClick={async () => {
                        // await createNewLog(flockId, date, count, notes);
                        if (date && count) {
                          await createNewLog(
                            flockId,
                            date, //new Date(date.startDate.toLocaleString()),
                            count,
                            notes
                          );
                        }
                      }}
                    >
                      {isLoading ? (
                        <RiLoader4Fill className="animate-spin text-2xl" />
                      ) : (
                        "Submit"
                      )}
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

export default LogModal;

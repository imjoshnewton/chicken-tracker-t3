import { useState } from "react";
import { trpc } from "../../utils/trpc";
import { MdClose, MdOutlineEdit, MdOutlineEditNote } from "react-icons/md";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { RiLoader4Fill } from "react-icons/ri";
import { formatDate, handleTimezone } from "./date-utils";
import { format } from "date-fns";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import FlockForm from "src/app/app/flocks/FlockEditForm";
import { Session } from "next-auth";
// import Datepicker from "react-tailwindcss-datepicker";
// import {
//   PopoverDirectionType,
//   type DateValueType,
// } from "react-tailwindcss-datepicker/dist/types";

const EditModal = ({
  session,
  flockId,
}: {
  session: Session;
  flockId: string;
}) => {
  const [showModal, setShowModal] = useState(false);

  const utils = trpc.useContext();

  const {
    data: flock,
    isLoading,
    isError,
  } = trpc.flocks.getFlock.useQuery({ flockId });

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

  if (!session.user?.id || !flockId || !flock) {
    return null;
  }

  return (
    <>
      <motion.button
        // whileHover={{ scale: 1.05 }}
        // whileTap={{ scale: 0.95 }}
        className="absolute top-0 right-0 mt-3 mr-5 flex items-center p-3 text-stone-400 transition-colors hover:cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 md:mt-2"
        type="button"
        onClick={() => setShowModal(true)}
      >
        Edit&nbsp;&nbsp;
        <MdOutlineEdit />
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
                    <h3 className="text-xl">Edit Flock</h3>
                    <button
                      onClick={() => closeModal()}
                      className=" rounded p-3 text-xl hover:bg-slate-50 hover:shadow"
                    >
                      <MdClose />
                    </button>
                  </div>
                  <div className="relative">
                    <FlockForm
                      flock={flock}
                      userId={session.user.id}
                      onCancel={closeModal}
                      onComplete={closeModal}
                    ></FlockForm>
                  </div>
                  {/* <div className="border-blueGray-200 flex items-center justify-end rounded-b border-t border-solid p-3 lg:p-6">
                    <button
                      className="background-transparent mr-1 mb-1 rounded px-6 py-3 text-sm uppercase text-black outline-none hover:bg-slate-50 focus:outline-none"
                      type="button"
                      onClick={closeModal}
                    >
                      Close
                    </button>
                    <button
                      className="btn mr-1 mb-1 rounded px-6 py-3 text-sm font-bold uppercase text-white shadow outline-none hover:shadow-lg focus:outline-none"
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
                  </div> */}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default EditModal;

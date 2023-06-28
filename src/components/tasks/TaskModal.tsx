import { Task } from "@prisma/client";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { MdClose } from "react-icons/md";
import { TaskForm } from "src/app/app/flocks/TaskForm";

const TaskModal = ({
  userId,
  flockId,
  closeModal,
  task,
}: {
  userId: string;
  flockId: string;
  closeModal: () => void;
  task?: Task;
}) => {
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

  return (
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
              <h3 className="text-xl">Add Task</h3>
              <button
                onClick={() => closeModal()}
                className=" rounded p-3 text-xl hover:bg-slate-50 hover:shadow"
              >
                <MdClose />
              </button>
            </div>
            <div className="relative flex flex-auto flex-col">
              <TaskForm
                flockId={flockId}
                userId={userId}
                onCancel={closeModal}
                onComplete={closeModal}
                task={
                  task
                    ? { ...task, dueDate: format(task.dueDate, "yyyy-MM-dd") }
                    : undefined
                }
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default TaskModal;

// import { Task } from "@prisma/client";
import type { Task } from "@lib/db/schema";
import { format, parseISO } from "date-fns";
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
  return (
    <>
      <div 
        onClick={() => closeModal()}
        className="modal-overlay fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none bg-black bg-opacity-50 transition-opacity lg:items-center"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative mx-auto h-full w-full min-w-[350px] rounded-t-sm pt-4 animate-slide-up lg:my-6 lg:h-auto lg:w-auto lg:max-w-3xl lg:rounded-lg"
        >
          <div className="drawer-container pb-safe relative flex h-full w-full flex-col border-0 bg-[#FEF9F6] shadow-lg outline-none focus:outline-none lg:h-auto lg:rounded-lg lg:pb-0">
            <div className="flex items-center justify-between rounded-t border-b border-solid border-gray-300 py-3 pl-4 pr-3 lg:py-3 lg:pl-5 lg:pr-3 ">
              <h3 className="text-xl">{task ? "Edit Task" : "Add Task"}</h3>
              <button
                onClick={() => closeModal()}
                className="rounded p-3 text-xl hover:bg-slate-50 hover:shadow"
              >
                <MdClose />
              </button>
            </div>
            <div className="mobile-modal-content relative flex flex-auto flex-col">
              <TaskForm
                flockId={flockId}
                userId={userId}
                onCancel={closeModal}
                onComplete={closeModal}
                task={
                  task
                    ? {
                        ...task,
                        dueDate: format(parseISO(task.dueDate), "yyyy-MM-dd"),
                      }
                    : undefined
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskModal;
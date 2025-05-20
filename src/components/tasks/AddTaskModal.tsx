import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { MdAddTask } from "react-icons/md";
import TaskModal from "./TaskModal";

const AddTaskModal = ({
  userId,
  flockId,
}: {
  userId: string;
  flockId: string;
}) => {
  const [showModal, setShowModal] = useState(false);

  function closeModal(): void {
    setShowModal(false);
  }

  if (!userId || !flockId) {
    return null;
  }

  return (
    <>
      <button
        className="flex items-center p-3 text-stone-400 transition-colors hover:cursor-pointer hover:text-stone-700 dark:hover:text-stone-200"
        type="button"
        onClick={() => setShowModal(true)}
      >
        <MdAddTask className="mr-2" />
        Add Task
      </button>
      <AnimatePresence initial={false}>
        {showModal && (
          <TaskModal
            flockId={flockId}
            userId={userId}
            closeModal={closeModal}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AddTaskModal;
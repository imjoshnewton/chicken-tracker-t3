import { AnimatePresence, motion } from "framer-motion";
import { Session } from "next-auth";
import { useState } from "react";
import { MdAddTask } from "react-icons/md";
import TaskModal from "./TaskModal";

const AddTaskModal = ({
  session,
  flockId,
}: {
  session: Session;
  flockId: string;
}) => {
  // const router = useRouter();
  const [showModal, setShowModal] = useState(false);

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

  if (!session.user?.id || !flockId) {
    return null;
  }

  return (
    <>
      <motion.button
        // whileHover={{ scale: 1.05 }}
        // whileTap={{ scale: 0.95 }}
        className="flex items-center p-3 text-stone-400 transition-colors hover:cursor-pointer hover:text-stone-700 dark:hover:text-stone-200"
        type="button"
        onClick={() => setShowModal(true)}
      >
        <MdAddTask className="mr-2" />
        Add Task
      </motion.button>
      <AnimatePresence
        // Disable any initial animations on children that
        // are present when the component is first rendered
        initial={false}
      >
        {showModal && (
          <TaskModal
            flockId={flockId}
            userId={session.user.id}
            closeModal={closeModal}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AddTaskModal;

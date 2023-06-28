import { useState } from "react";
import { Task } from "@prisma/client";
import { MdOutlineDeleteOutline, MdOutlineExpandMore } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import { trpc } from "@utils/trpc";
import { toast } from "react-hot-toast";
import { deleteTask, markTaskAsComplete } from "src/app/app/server";
import { RiLoader4Fill } from "react-icons/ri";
import TaskModal from "./TaskModal";

type TaskListProps = {
  tasks: Task[];
  flockId: string;
  userId: string;
};

const TaskItem: React.FC<{
  task: Task;
  index: number;
  onClick: () => void;
}> = ({ task, index, onClick }) => {
  const utils = trpc.useContext();
  const [deleting, setDeleting] = useState(false);

  const handleMarkComplete = () => {
    // e.stopPropagation();
    console.log(`Completing task with id: ${task.id}`);

    toast
      .promise(
        markTaskAsComplete({ taskId: task.id, recurrence: task.recurrence }),
        {
          loading: "Updating task...",
          success: "Task completed!",
          error: "Error completing task",
        }
      )
      .then(() => utils.flocks.invalidate());
  };

  const handleDeleteTask = () => {
    // e.stopPropagation();
    setDeleting(true);

    console.log(`Deleting task with id: ${task.id}`);

    toast
      .promise(deleteTask({ taskId: task.id }), {
        loading: "Deleting task...",
        success: "Task deleted!",
        error: "Error deleting task",
      })
      .then(() => utils.flocks.invalidate())
      .finally(() => setDeleting(false));
  };

  return (
    <motion.li
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        ease: "easeInOut",
        duration: 0.3,
        delay: index * 0.1,
      }}
      className={`border-1 group relative flex w-full items-center justify-between border-gray-200 py-2 px-2 hover:cursor-pointer`}
      key={task.id}
      layout
      layoutId={task.id}
      onClick={onClick}
    >
      <input
        type="checkbox"
        className="form-checkbox mr-2 h-5 w-5 text-secondary hover:cursor-pointer"
        checked={task.completed}
        readOnly={task.completed}
        onClick={(e) => {
          e.stopPropagation();
          handleMarkComplete();
        }}
      />
      <div className="flex-grow ">
        <h3 className="text-lg font-bold">{task.title}</h3>
        <p className="text-sm">{task.dueDate.toLocaleDateString()}</p>
      </div>
      {task.recurrence && task.recurrence !== "" && (
        <p className="text-sm">{task.recurrence}</p>
      )}

      <button
        className="opacity-1 rounded bg-red-500 py-1 px-2 text-white transition duration-200 ease-in-out hover:cursor-pointer hover:shadow-lg group-hover:opacity-100 lg:opacity-0"
        disabled={deleting}
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteTask();
        }}
      >
        {deleting ? (
          <RiLoader4Fill className="animate-spin text-2xl" />
        ) : (
          <>
            <span className="hidden lg:block">Delete</span>
            <span className="lg:hidden">
              <MdOutlineDeleteOutline className="text-xl" />
            </span>
          </>
        )}
      </button>
    </motion.li>
  );
};

const TaskList: React.FC<TaskListProps> = ({ tasks, flockId, userId }) => {
  const [isActive, setIsActive] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSellectedTask] = useState<Task | undefined>(
    undefined
  );

  const incompleteTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <div className="mt-4">
      <h2
        className="mb-6 flex items-center justify-between dark:text-gray-300"
        onClick={() => setIsActive(!isActive)}
      >
        Tasks
        <MdOutlineExpandMore
          className={
            "inline transition-all lg:hidden " +
            (isActive ? "rotate-180" : "rotate-0")
          }
        />
      </h2>
      <AnimatePresence>
        {isActive && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap justify-between gap-y-4 divide-y overflow-y-hidden dark:text-gray-300 lg:gap-x-2"
          >
            {tasks.length > 0 ? (
              incompleteTasks.length > 0 ? (
                incompleteTasks.map((task, index) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    index={index}
                    onClick={() => {
                      setSellectedTask(task);
                      setShowModal(true);
                    }}
                  />
                ))
              ) : (
                !showCompleted && (
                  <p className="w-full py-2 text-center">
                    You&apos;ve completed all of your tasks! 👍
                  </p>
                )
              )
            ) : (
              <p className="py-2 text-center">No tasks available.</p>
            )}
            {showCompleted &&
              completedTasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={index}
                  onClick={() => void 0}
                />
              ))}
            {tasks.length > 0 && completedTasks.length > 0 && isActive && (
              <button
                className="background-transparent mx-auto rounded !border-t-0 px-6 py-3 text-sm uppercase outline-none hover:bg-slate-50 focus:outline-none"
                onClick={() => setShowCompleted(!showCompleted)}
              >
                {showCompleted ? "Hide" : "Show"} completed tasks
              </button>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {showModal && (
          <TaskModal
            flockId={flockId}
            userId={userId}
            task={selectedTask}
            closeModal={() => {
              setShowModal(false);
              setSellectedTask(undefined);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskList;

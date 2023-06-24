import { useState } from "react";
import { Task } from "@prisma/client";
import { MdOutlineExpandLess, MdOutlineExpandMore } from "react-icons/md";
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
      <h3 className="flex-grow text-lg font-bold">{task.title}</h3>
      {task.recurrence && task.recurrence !== "" && (
        <p className="text-sm">{task.recurrence}</p>
      )}
      <p className="mx-10 text-sm">{task.dueDate.toLocaleDateString()}</p>

      <button
        className="rounded bg-red-500 py-1 px-2 text-white opacity-0 transition duration-200 ease-in-out hover:cursor-pointer hover:shadow-lg group-hover:opacity-100"
        disabled={deleting}
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteTask();
        }}
      >
        {deleting ? (
          <RiLoader4Fill className="animate-spin text-2xl" />
        ) : (
          "Delete"
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
        {isActive ? (
          <MdOutlineExpandLess className="inline lg:hidden" />
        ) : (
          <MdOutlineExpandMore className="inline lg:hidden" />
        )}
      </h2>
      <motion.ul
        className={
          isActive
            ? "flex flex-col gap-y-2 divide-y divide-gray-200 dark:text-gray-300 lg:gap-x-2"
            : "hidden flex-col gap-y-2 divide-y divide-gray-200 dark:text-gray-300 lg:flex lg:gap-x-2"
        }
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
              <p className="py-2 text-center">
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
      </motion.ul>
      {/* Show completed tasks button */}

      {tasks.length > 0 && completedTasks.length > 0 && isActive && (
        <button
          className="background-transparent mx-auto rounded px-6 py-3 text-sm uppercase outline-none hover:bg-slate-50 focus:outline-none"
          onClick={() => setShowCompleted(!showCompleted)}
        >
          {showCompleted ? "Hide" : "Show"} completed tasks
        </button>
      )}
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

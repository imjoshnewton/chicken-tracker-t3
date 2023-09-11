import { useState } from "react";
import { Task } from "@prisma/client";
import {
  MdCheckCircle,
  MdEdit,
  MdOutlineCircle,
  MdOutlineExpandMore,
} from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import { trpc } from "@utils/trpc";
import { toast } from "react-hot-toast";
import { markTaskAsComplete } from "src/app/app/server";
import { RiLoopRightFill } from "react-icons/ri";
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
  const passedDue = new Date(task.dueDate).getTime() < new Date().getTime();

  const handleMarkComplete = () => {
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
    >
      <button
        type="button"
        className="flex items-center pl-1 pt-3 pr-3 pb-3 text-stone-400 transition-colors hover:cursor-pointer hover:text-stone-700 dark:hover:text-stone-200"
        onClick={(e) => {
          e.stopPropagation();
          handleMarkComplete();
        }}
      >
        {task.completed ? (
          <MdCheckCircle className="text-2xl" />
        ) : (
          <MdOutlineCircle className="text-2xl" />
        )}
      </button>
      <div className="flex-grow ">
        <h3 className="text-lg font-bold">{task.title}</h3>
        <p
          className={
            "text-sm " + (passedDue && !task.completed ? "text-red-500" : "")
          }
        >
          {task.dueDate.toLocaleDateString()}{" "}
          {task.recurrence && task.recurrence !== "" && (
            <RiLoopRightFill className="-mt-1 inline text-sm font-bold" />
          )}
        </p>
      </div>

      {!task.completed && (
        <button
          className="opacity-1 rounded bg-transparent py-1 px-2 transition duration-200 ease-in-out hover:cursor-pointer hover:!opacity-100 group-hover:opacity-50 lg:opacity-0"
          onClick={onClick}
        >
          <span>
            <MdEdit className="text-xl" />
          </span>
        </button>
      )}
    </motion.li>
  );
};

const TaskList: React.FC<TaskListProps> = ({ tasks, flockId, userId }) => {
  const [isActive, setIsActive] = useState(false);
  const [showToday, setShowToday] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSellectedTask] = useState<Task | undefined>(
    undefined
  );

  // all incomplete tasks that are due today or overdue
  const todaysTasks = tasks.filter(
    (task) =>
      !task.completed &&
      new Date(task.dueDate).getTime() <= new Date().getTime()
  );

  // All upcoming tasks that aren't completed
  const upComingTasks = tasks.filter((task) => !task.completed);

  // All completed tasks
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <div className="mt-4">
      <h2
        className="flex items-center justify-between hover:cursor-pointer dark:text-gray-300"
        onClick={() => setIsActive(!isActive)}
      >
        Tasks
        <MdOutlineExpandMore
          className={
            "inline transition-all " + (isActive ? "rotate-180" : "rotate-0")
          }
        />
      </h2>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-y-4"
          >
            <div className="mb-4 flex gap-4 !border-b-0 text-sm text-stone-500">
              <button
                onClick={() => setShowToday(true)}
                // disabled={showToday}
                className="relative p-1 "
              >
                Today
                {showToday ? (
                  <motion.div
                    className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-gray-500"
                    layoutId="underline"
                  />
                ) : null}
              </button>
              <button
                onClick={() => setShowToday(false)}
                // disabled={!showToday}
                className="relative p-1 "
              >
                Upcoming
                {!showToday ? (
                  <motion.div
                    className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-gray-500"
                    layoutId="underline"
                  />
                ) : null}
              </button>
            </div>
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap justify-between gap-y-4 divide-y overflow-y-hidden dark:text-gray-300 lg:gap-x-2"
            >
              {tasks.length > 0 ? (
                todaysTasks.length > 0 && showToday ? (
                  todaysTasks.map((task, index) => (
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
                ) : upComingTasks.length > 0 && !showToday ? (
                  upComingTasks.map((task, index) => (
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
                    <p className="w-full !border-t-0 py-2 text-center">
                      You&apos;ve completed all of your tasks! 👍
                    </p>
                  )
                )
              ) : (
                <p className="w-full py-2 text-center">No tasks available.</p>
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
          </motion.div>
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

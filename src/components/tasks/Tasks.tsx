import { useState } from "react";
import {
  MdCheckCircle,
  MdEdit,
  MdOutlineCircle,
  MdOutlineExpandMore,
} from "react-icons/md";
import { trpc } from "@utils/trpc";
import { toast } from "react-hot-toast";
import { markTaskAsComplete } from "../../actions/tasks.actions";
import { RiLoopRightFill } from "react-icons/ri";
import TaskModal from "./TaskModal";
import { Switch } from "@components/ui/switch";
import { Label } from "@components/ui/label";
import { Task } from "@lib/db/schema";
import { useMutation } from "@tanstack/react-query";

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
  const utils = trpc.useUtils();
  const passedDue = new Date(task.dueDate).getTime() < new Date().getTime();

  const { mutate: completeTask } = useMutation({
    mutationFn: () =>
      markTaskAsComplete({ taskId: task.id, recurrence: task.recurrence }),
    onSuccess: () => {
      utils.flocks.invalidate();
      toast.success("Task completed!");
    },
    onError: () => {
      toast.error("Error completing task");
    },
  });

  const handleMarkComplete = () => {
    console.log(`Completing task with id: ${task.id}`);
    completeTask();
  };

  return (
    <li
      className="border-1 group relative flex w-full items-center justify-between border-gray-200 px-2 py-2 transition-opacity duration-300 ease-in-out hover:cursor-pointer"
      key={task.id}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <button
        type="button"
        className="flex items-center pb-3 pl-1 pr-3 pt-3 text-stone-400 transition-colors hover:cursor-pointer hover:text-stone-700 dark:hover:text-stone-200"
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
          {new Date(task.dueDate).toLocaleDateString()}{" "}
          {task.recurrence && task.recurrence !== "" && (
            <RiLoopRightFill className="-mt-1 inline text-sm font-bold" />
          )}
        </p>
      </div>

      {!task.completed && (
        <button
          className="opacity-1 rounded bg-transparent px-2 py-1 transition duration-200 ease-in-out hover:cursor-pointer hover:!opacity-100 group-hover:opacity-50 lg:opacity-0"
          onClick={onClick}
        >
          <span>
            <MdEdit className="text-xl" />
          </span>
        </button>
      )}
    </li>
  );
};

const TaskList: React.FC<TaskListProps> = ({ tasks, flockId, userId }) => {
  const [isActive, setIsActive] = useState(false);
  const [showToday, setShowToday] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSellectedTask] = useState<Task | undefined>(
    undefined,
  );

  // all incomplete tasks that are due today or overdue
  const todaysTasks = tasks.filter(
    (task) =>
      !task.completed &&
      new Date(task.dueDate).getTime() <= new Date().getTime(),
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

      {isActive && (
        <div
          className="flex flex-col gap-y-4 animate-fade-in"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex gap-4 !border-b-0 text-sm text-stone-500">
              <button
                onClick={() => setShowToday(true)}
                className="relative p-1"
              >
                Today
                {showToday ? (
                  <div
                    className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-gray-500"
                  />
                ) : null}
              </button>
              <button
                onClick={() => setShowToday(false)}
                className="relative p-1"
              >
                Upcoming
                {!showToday ? (
                  <div
                    className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-gray-500"
                  />
                ) : null}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="show-completed"
                checked={showCompleted}
                onCheckedChange={(val) => {
                  setShowCompleted(val);
                }}
                disabled={
                  tasks.length > 0 && completedTasks.length > 0 && isActive
                    ? false
                    : true
                }
              />
              <Label className="text-stone-500" htmlFor="show-completed">
                Show Completed
              </Label>
            </div>
          </div>
          <ul
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
          </ul>
        </div>
      )}
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
    </div>
  );
};

export default TaskList;

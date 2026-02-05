
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@utils/trpc";
import toast from "react-hot-toast";
import { createNewTask, updateTask, deleteTask } from "../../../actions/tasks.actions";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";

const TaskSchema = z.object({
  title: z.string(),
  description: z.string(),
  dueDate: z.string(),
  recurrence: z.string(),
  status: z.optional(z.string()),
});

interface TaskFormValues {
  id?: string;
  title: string;
  description: string;
  dueDate: string;
  recurrence: string;
  status?: string;
  userId: string;
  flockId: string;
}

interface TaskFormProps {
  userId: string;
  flockId: string;
  task?: TaskFormValues;
  onComplete?: () => void;
  onCancel?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  userId,
  flockId,
  task,
  onComplete,
  onCancel,
}) => {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm<TaskFormValues>({
    resolver: zodResolver(TaskSchema),
    defaultValues: task ? task : {},
    mode: "onChange",
  });

  const { isValid, isDirty, errors } = formState;

  const utils = trpc.useUtils();

  const updateTaskMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      dueDate: Date;
      recurrence: string;
      id: string;
      status: string;
      completed: boolean;
    }) => updateTask(data),
    onSuccess: async (data) => {
      await utils.flocks.invalidate();
      toast.success(`${data.title} updated successfully!!`);
      if (onComplete) onComplete();
      else if (task?.id) router.push(`/app/tasks/${task.id}`);
    },
    onError: (err) => {
      toast.error(`This just happened: ${String(err)}`);
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      dueDate: Date;
      recurrence: string;
      userId: string;
      flockId: string;
    }) => createNewTask(data),
    onSuccess: async (data) => {
      await utils.flocks.invalidate();
      toast.success(`${data.title} created successfully!!`);
      if (onComplete) onComplete();
      else router.push(`/app/tasks/`);
    },
    onError: (err) => {
      toast.error(`This just happened: ${String(err)}`);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (data: { taskId: string }) => deleteTask(data),
    onSuccess: async (data) => {
      await utils.flocks.invalidate();
      toast.success(`${data.title} deleted successfully!!`);
      if (onComplete) onComplete();
      else router.push(`/app/tasks/`);
    },
    onError: (err) => {
      toast.error(`This just happened: ${String(err)}`);
    },
  });

  const createOrUpdateTask = async (taskData: TaskFormValues) => {
    const result = TaskSchema.safeParse(taskData);
    if (!result.success) {
      console.error(result.error);
      return;
    }
    const { title, description, dueDate, recurrence, status } = result.data;

    const [year = 0, month = 0, day = 0] = dueDate.split("-").map(Number);

    if (task?.id) {
      updateTaskMutation.mutate({
        title,
        description,
        dueDate: new Date(year, month - 1, day),
        recurrence,
        id: task.id,
        status: status ? status : "",
        completed: false,
      });
    } else {
      createTaskMutation.mutate({
        title,
        description,
        dueDate: new Date(year, month - 1, day),
        recurrence,
        userId,
        flockId,
      });
    }
  };

  const deleteCurrentTask = async () => {
    if (task?.id) {
      deleteTaskMutation.mutate({ taskId: task.id });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(createOrUpdateTask)}
      className="flex flex-auto flex-col"
    >
      <div className="flex w-full flex-col gap-4 p-4 lg:px-8 lg:pb-8 lg:pt-6">
        <input
          {...register("title")}
          placeholder="Title"
          type="text"
          className="w-full appearance-none rounded border px-1 py-2 text-black"
        />
        {errors.title && <p>{errors.title.message}</p>}

        <textarea
          {...register("description")}
          placeholder="Description"
          className="w-full appearance-none rounded border px-1 py-2 text-black"
        />
        {errors.description && <p>{errors.description.message}</p>}

        <input
          {...register("dueDate")}
          type="date"
          className="w-full appearance-none rounded border px-1 py-2 text-black"
        />
        {errors.dueDate && <p>{errors.dueDate.message}</p>}

        <select
          {...register("recurrence")}
          className="h-12 w-full rounded border px-1 py-2 text-black"
        >
          <option value="">Select recurrence</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        {errors.recurrence && <p>{errors.recurrence.message}</p>}
      </div>
      <div className="border-blueGray-200 mt-auto flex items-center justify-end rounded-b border-t border-solid p-3 lg:p-6">
        {task?.id && (
          <button
            type="button"
            onClick={deleteCurrentTask}
            className="background-transparent mb-1 mr-auto rounded px-3 py-3 text-red-500 outline-none hover:bg-slate-50 focus:outline-none"
          >
            <MdOutlineDeleteOutline />
          </button>
        )}

        <button
          type="button"
          onClick={onCancel}
          className="background-transparent mb-1 mr-1 rounded px-6 py-3 text-sm uppercase text-black outline-none hover:bg-slate-50 focus:outline-none"
        >
          CANCEL
        </button>
        <button
          type="submit"
          disabled={!isDirty || !isValid}
          className="btn mb-1 mr-1 rounded px-6 py-3 text-sm font-bold uppercase text-white shadow outline-none hover:shadow-lg focus:outline-none"
        >
          {task ? "UPDATE" : "CREATE"} TASK
        </button>
      </div>
    </form>
  );
};

"use client";

// import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@utils/trpc";
import toast from "react-hot-toast";
import { createNewTask, updateTask } from "../server";

const TaskSchema = z.object({
  title: z.string(),
  description: z.string(),
  dueDate: z.coerce.date(),
  recurrence: z.string(),
  status: z.optional(z.string()),
});

interface TaskFormValues {
  id?: string;
  title: string;
  description: string;
  dueDate: Date;
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

  const utils = trpc.useContext();

  const createOrUpdateTask = async (taskData: TaskFormValues) => {
    const parsedData = {
      ...taskData,
      dueDate: new Date(taskData.dueDate),
    };
    const result = TaskSchema.safeParse(parsedData);
    if (!result.success) {
      console.error(result.error);
      return;
    }
    const { title, description, dueDate, recurrence, status } = result.data;

    if (task?.id) {
      toast
        .promise(
          updateTask({
            title,
            description,
            dueDate,
            recurrence,
            id: task.id,
            status: status ? status : "",
            completed: false,
          }),
          {
            loading: "Creating task...",
            success: (data) => `${data.title} created successfully!!`,
            error: (err) => `This just happened: ${err.toString()}`,
          }
        )
        .then(async (task) => {
          await utils.flocks.invalidate();
        });
      if (onComplete) onComplete();
      else router.push(`/app/tasks/${task.id}`);
    } else {
      // Here you can call the method for creating a new task using taskData
      toast
        .promise(
          createNewTask({
            title,
            description,
            dueDate,
            recurrence,
            // status,
            userId,
            flockId,
          }),
          {
            loading: "Creating task...",
            success: (data) => `${data.title} created successfully!!`,
            error: (err) => `This just happened: ${err.toString()}`,
          }
        )
        .then(async (task) => {
          await utils.flocks.invalidate();
        });

      if (onComplete) onComplete();
      else router.push(`/app/tasks/`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(createOrUpdateTask)}
      className="flex flex-auto flex-col"
    >
      <div className="flex w-full flex-col gap-4 p-4 lg:px-8 lg:pt-6 lg:pb-8">
        <input
          {...register("title")}
          placeholder="Title"
          type="text"
          className="w-full appearance-none rounded border py-2 px-1 text-black"
        />
        {errors.title && <p>{errors.title.message}</p>}

        <textarea
          {...register("description")}
          placeholder="Description"
          className="w-full appearance-none rounded border py-2 px-1 text-black"
        />
        {errors.description && <p>{errors.description.message}</p>}

        <input
          {...register("dueDate")}
          type="date"
          className="w-full appearance-none rounded border py-2 px-1 text-black"
        />
        {errors.dueDate && <p>{errors.dueDate.message}</p>}

        <select
          {...register("recurrence")}
          className="h-12 w-full rounded border py-2 px-1 text-black"
        >
          <option value="">Select recurrence</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        {errors.recurrence && <p>{errors.recurrence.message}</p>}

        {task && (
          <select
            {...register("status")}
            className="h-12 w-full rounded border py-2 px-1 text-black"
          >
            <option value="">Select status</option>
            <option value="Incomplete">Incomplete</option>
            <option value="Completed">Completed</option>
          </select>
        )}
        {task && errors.status && <p>{errors.status.message}</p>}
      </div>
      <div className="border-blueGray-200 mt-auto flex items-center justify-end rounded-b border-t border-solid p-3 lg:p-6">
        <button
          type="button"
          onClick={onCancel}
          className="background-transparent mr-1 mb-1 rounded px-6 py-3 text-sm uppercase text-black outline-none hover:bg-slate-50 focus:outline-none"
        >
          CANCEL
        </button>
        <button
          type="submit"
          disabled={!isDirty || !isValid}
          className="btn mr-1 mb-1 rounded px-6 py-3 text-sm font-bold uppercase text-white shadow outline-none hover:shadow-lg focus:outline-none"
        >
          {task ? "UPDATE" : "CREATE"} TASK
        </button>
      </div>
    </form>
  );
};

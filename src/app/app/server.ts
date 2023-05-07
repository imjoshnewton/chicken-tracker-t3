"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "../../server/db/client";
// import toast from "react-hot-toast";

export async function deleteLog(id: string) {
  console.log("deleteLog: ", id);

  const log = await prisma.eggLog.delete({
    where: {
      id: id,
    },
  });

  revalidatePath(`/app/logs`);

  return log;
}

export async function deleteExpense(id: string) {
  console.log("deleteExpense: ", id);

  const expense = await prisma.expense.delete({
    where: {
      id: id,
    },
  });

  revalidatePath(`/app/expenses`);

  return expense;
}

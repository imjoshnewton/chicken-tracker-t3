"use server";

import { db } from "@lib/db";
import { eggLog, expense } from "@lib/db/schema-postgres";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
// import toast from "react-hot-toast";

export async function deleteLog(id: string) {
  console.log("deleteLog: ", id);

  const log = await db.delete(eggLog).where(eq(eggLog.id, id));

  revalidatePath(`/app/logs`);

  return log;
}

export async function deleteExpense(id: string) {
  console.log("deleteExpense: ", id);

  const expenseRes = await db.delete(expense).where(eq(expense.id, id));

  revalidatePath(`/app/expenses`);

  return expenseRes;
}

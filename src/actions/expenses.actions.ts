"use server";

import * as expensesService from "../services/expenses.service";
import { revalidatePath } from "next/cache";

export async function deleteExpense(id: string) {
  const result = await expensesService.deleteExpense(id);
  revalidatePath(`/app/expenses`);
  return result;
}

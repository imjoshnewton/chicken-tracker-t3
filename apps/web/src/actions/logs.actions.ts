"use server";

import * as logsService from "../services/logs.service";
import { revalidatePath } from "next/cache";

export async function deleteLog(id: string) {
  const result = await logsService.deleteLog(id);
  revalidatePath(`/app/logs`);
  return result;
}

"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "../../../server/db/client";

export default async function deleteLog(id: string) {
  console.log("deleteLog: ", id);

  const log = await prisma.eggLog.delete({
    where: {
      id: id,
    },
  });

  revalidatePath(`/app/logs`);

  return log;
}

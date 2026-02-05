"use server";

import * as flocksService from "../services/flocks.service";
import { revalidatePath } from "next/cache";

export async function createFlock(input: {
  userId: string;
  name: string;
  description: string;
  type: string;
  imageUrl: string;
}) {
  const result = await flocksService.createFlock({
    ...input,
    imageUrl: input.imageUrl || "",
  });
  if (!result) {
    throw new Error("Could not create flock.");
  }
  revalidatePath(`/app/flocks/`);
  return result;
}

export async function updateFlock(input: {
  id: string;
  name: string;
  description: string;
  type: string;
  imageUrl: string;
}) {
  const result = await flocksService.updateFlock(input.id, {
    name: input.name,
    description: input.description,
    type: input.type,
    imageUrl: input.imageUrl || "",
  });
  if (!result) {
    throw new Error("Could not update flock.");
  }
  revalidatePath(`/app/flocks/`);
  revalidatePath(`/app/flocks/[flockId]`);
  return result;
}

export async function deleteFlock(input: { flockId: string }) {
  const result = await flocksService.deleteFlock(input.flockId);
  revalidatePath(`/app/flocks/`);
  revalidatePath(`/app/flocks/[flockId]`);
  return result;
}

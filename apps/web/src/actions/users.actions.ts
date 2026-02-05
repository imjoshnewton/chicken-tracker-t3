"use server";

import * as usersService from "../services/users.service";
import { revalidatePath } from "next/cache";

export async function updateUser(input: {
  userId: string;
  name: string;
  image: string;
}) {
  const result = await usersService.updateUser(input.userId, {
    name: input.name,
    image: input.image,
  });
  revalidatePath(`/app/settings`);
  revalidatePath(`/app/`);
  return result;
}

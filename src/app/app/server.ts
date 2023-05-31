"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../server/db/client";
// import toast from "react-hot-toast";

export async function deleteLog(id: string) {
  console.log("deleteLog: ", id);

  await prisma.eggLog.delete({
    where: {
      id: id,
    },
  });

  revalidatePath(`/app/logs`);

  // return log;
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

export async function createFlock(input: {
  userId: string;
  name: string;
  description: string;
  type: string;
  imageUrl: string;
}) {
  console.log("createFlock: ", input);

  const flock = await prisma.flock.create({
    data: {
      userId: input.userId,
      name: input.name,
      description: input.description,
      type: input.type,
      imageUrl: input.imageUrl ? input.imageUrl : "",
    },
  });

  revalidatePath(`/app/flocks`);
  // redirect(`/app/flocks/${flock.id}`);

  return flock;
}

export async function updateFlock(input: {
  id: string;
  name: string;
  description: string;
  type: string;
  imageUrl: string;
}) {
  console.log("updateFlock: ", input);

  const flock = await prisma.flock.update({
    where: {
      id: input.id,
    },
    data: {
      name: input.name,
      description: input.description,
      type: input.type,
      imageUrl: input.imageUrl ? input.imageUrl : "",
    },
  });

  revalidatePath(`/app/flocks`);
  // redirect(`/app/flocks/${flock.id}`);

  return flock;
}

export async function updateUser(input: {
  userId: string;
  name: string;
  image: string;
}) {
  const user = await prisma.user.update({
    where: {
      id: input.userId,
    },
    data: {
      name: input.name,
      image: input.image,
    },
  });

  revalidatePath(`/app/settings`);

  return user;
}

export async function markNotificationAsRead(input: {
  notificationId: string;
}) {
  const notification = await prisma.notification.update({
    where: {
      id: input.notificationId,
    },
    data: {
      read: true,
    },
  });

  revalidatePath(`/app`);

  return notification;
}

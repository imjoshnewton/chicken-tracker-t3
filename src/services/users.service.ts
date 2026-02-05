import * as usersRepo from "../data/users.repository";
import { db } from "@lib/db";
import { withTransaction } from "@lib/db/utils";

export const getUserByClerkId = async (clerkId: string) => {
  return usersRepo.getUserByClerkId(db, clerkId);
};

export const updateUser = async (userId: string, data: { name: string; image: string }) => {
  return withTransaction(async (tx) => {
    const result = await usersRepo.updateUser(tx, userId, data);
    return result[0];
  }, { maxRetries: 2, operation: "Update user" });
};

export const setDefaultFlock = async (userId: string, flockId: string) => {
  return usersRepo.setDefaultFlock(db, userId, flockId);
};

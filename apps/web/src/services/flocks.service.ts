import * as flocksRepo from "../data/flocks.repository";
import { db } from "@lib/db";
import { withTransaction } from "@lib/db/utils";
import { createId } from "@paralleldrive/cuid2";

export const getUserFlocks = async (userId: string) => {
  return flocksRepo.getFlocksByUserId(db, userId);
};

export const getFlockById = async (flockId: string) => {
  return flocksRepo.getFlockById(db, flockId);
};

export const getFlockWithTasks = async (flockId: string) => {
  const [flockData, taskData] = await Promise.all([
    flocksRepo.getFlockById(db, flockId),
    flocksRepo.getFlockTasks(db, flockId),
  ]);
  return { flockData, taskData };
};

export const getFlockBasic = async (flockId: string) => {
  return flocksRepo.getFlockBasic(db, flockId);
};

export const createFlock = async (data: {
  name: string;
  description: string;
  type: string;
  imageUrl: string | null;
  userId: string;
}) => {
  const id = createId();
  return withTransaction(async (tx) => {
    const result = await flocksRepo.createFlock(tx, { ...data, id });
    return result[0];
  }, { maxRetries: 3, operation: "Create flock" });
};

export const updateFlock = async (id: string, data: {
  name: string;
  description: string;
  type: string;
  imageUrl: string | null;
}) => {
  return withTransaction(async (tx) => {
    const result = await flocksRepo.updateFlock(tx, id, data);
    return result[0];
  }, { maxRetries: 3, operation: "Update flock" });
};

export const deleteFlock = async (flockId: string) => {
  return withTransaction(async (tx) => {
    const flock = await flocksRepo.deleteFlock(tx, flockId);
    if (!flock) throw new Error("Could not find flock.");
    return flock;
  }, { maxRetries: 3, operation: "Delete flock" });
};

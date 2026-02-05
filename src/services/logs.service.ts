import * as logsRepo from "../data/logs.repository";
import { db } from "@lib/db";
import { executeWithRetry } from "@lib/db/utils";
import { createId } from "@paralleldrive/cuid2";
import { format } from "date-fns";

const PAGE_SIZE = 25;

const formatDateForDB = (dateObj: Date) => {
  return format(dateObj, "yyyy-MM-dd HH:mm:ss.SSS");
};

export const getLogs = async (userId: string, page: number, flockId?: string) => {
  let logs;
  let count;
  if (flockId) {
    logs = await logsRepo.getLogsByFlock(db, userId, flockId, page, PAGE_SIZE);
    count = await logsRepo.getLogCountByFlock(db, userId, flockId);
  } else {
    logs = await logsRepo.getLogsByUserId(db, userId, page, PAGE_SIZE);
    count = await logsRepo.getLogCount(db, userId);
  }
  const totalPages = Math.ceil(count / PAGE_SIZE);
  return [logs, totalPages] as const;
};

export const createLog = async (data: {
  flockId: string;
  date: Date;
  count: number;
  breedId?: string;
  notes?: string;
}) => {
  const id = createId();
  return logsRepo.createLog(db, {
    id,
    ...data,
    date: formatDateForDB(data.date),
  });
};

export const deleteLog = async (logId: string) => {
  return executeWithRetry(async () => {
    const result = await logsRepo.deleteLog(db, logId);
    return result[0];
  }, { maxRetries: 2, operation: "Delete log" });
};

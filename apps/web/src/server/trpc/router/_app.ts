import { router } from "../trpc";
import { authRouter } from "./auth";
import { breedsRouter } from "./breeds";
import { expensesRouter } from "./expenses";
import { flocksRouter } from "./flocks";
import { logsRouter } from "./logs";
import { statsRouter } from "./stats";
import { tasksRouter } from "./tasks";

export const appRouter = router({
  auth: authRouter,
  breeds: breedsRouter,
  expenses: expensesRouter,
  flocks: flocksRouter,
  logs: logsRouter,
  stats: statsRouter,
  tasks: tasksRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

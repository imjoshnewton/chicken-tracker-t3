// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { userRouter } from "./user";
import { flocksRouter } from "./flocks";
import { logsRouter } from "./logs";
import { statsRouter } from "./stats";
import { expensesRouter } from "./expenses";
import { breedssRouter } from "./breeds";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("user.", userRouter)
  .merge("flocks.", flocksRouter)
  .merge("breeds.", breedssRouter)
  .merge("logs.", logsRouter)
  .merge("expenses.", expensesRouter)
  .merge("stats.", statsRouter);

// export type definition of API
export type AppRouter = typeof appRouter;

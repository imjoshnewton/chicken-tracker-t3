// Re-export types from the web app's tRPC router
// The web app's AppRouter is the source of truth
export type { AppRouter } from "../../../apps/web/src/server/trpc/router/_app";

import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../apps/web/src/server/trpc/router/_app";

/**
 * Inference helpers for tRPC inputs
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for tRPC outputs
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

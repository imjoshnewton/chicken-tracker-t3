import { currentUsr } from "@lib/auth";

/**
 * Re-export currentUsr as currentUser for consistent naming.
 */
export const currentUser = currentUsr;

/**
 * A higher-order function that wraps server actions with authentication checks.
 * If the user is not authenticated, it throws an "Unauthorized" error.
 */
type ServerAction<T extends unknown[], R> = (...args: T) => Promise<R>;

export function withAuth<T extends unknown[], R>(
  action: ServerAction<T, R>,
): ServerAction<T, R> {
  return async (...args: T) => {
    const user = await currentUsr();
    if (!user) {
      throw new Error("Unauthorized");
    }
    return action(...args);
  };
}

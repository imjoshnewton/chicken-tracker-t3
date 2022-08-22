import { createContext } from "react";

interface BaseUser {
  id: string;
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
}

export const UserContext = createContext<{
  user: BaseUser | null | undefined;
  defaultFlock: string | null | undefined;
}>({ user: null, defaultFlock: null });

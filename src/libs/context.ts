import { createContext } from 'react';
import { BaseUser } from './hooks';

export const UserContext = createContext <{ user: BaseUser | null | undefined, defaultFlock: string | null | undefined }>({ user: null, defaultFlock: null });
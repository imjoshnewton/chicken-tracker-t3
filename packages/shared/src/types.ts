export interface User {
  id: string;
  clerkId: string;
  secondaryClerkId?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface Flock {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Breed {
  id: string;
  name: string;
  image?: string | null;
  description?: string | null;
  eggColor?: string | null;
  flockId: string;
  count: number;
}

export interface EggLog {
  id: string;
  count: number;
  notes?: string | null;
  date: Date;
  flockId: string;
  breedId?: string | null;
  createdAt: Date;
}

export interface Expense {
  id: string;
  amount: string;
  memo?: string | null;
  category: string;
  date: Date;
  flockId: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  dueDate?: Date | null;
  recurrence?: string | null;
  flockId: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  userId: string;
  flockId?: string | null;
  createdAt: Date;
}

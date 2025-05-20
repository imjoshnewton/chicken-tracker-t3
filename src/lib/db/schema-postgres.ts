import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  pgTableCreator,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

// Using same table prefix pattern for consistency
export const pgTable = pgTableCreator((name) => `flocknerd_${name}`);

export const account = pgTable(
  "Account",
  {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    idToken: text("id_token"),
    sessionState: varchar("session_state", { length: 255 }),
  },
  (table) => {
    return {
      providerProviderAccountIdKey: uniqueIndex(
        "Account_provider_providerAccountId_key",
      ).on(table.provider, table.providerAccountId),
      userIdIdx: index("Account_userId_idx").on(table.userId),
    };
  },
);

export const breed = pgTable(
  "Breed",
  {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    name: text("name"),
    description: text("description"),
    count: smallint("count").notNull(),
    imageUrl: text("imageUrl"),
    averageProduction: doublePrecision("averageProduction").notNull(),
    flockId: varchar("flockId", { length: 255 }).notNull(),
    breed: text("breed")
      .default('')
      .notNull(),
    deleted: boolean("deleted").default(false).notNull(),
  },
  (table) => {
    return {
      flockIdIdx: index("Breed_flockId_idx").on(table.flockId),
    };
  },
);

export const breedRelations = relations(breed, ({ one }) => ({
  flock: one(flock, {
    fields: [breed.flockId],
    references: [flock.id],
  }),
}));

export const eggLog = pgTable(
  "EggLog",
  {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    count: smallint("count").notNull(),
    notes: text("notes"),
    date: date("date", { mode: "string" }).notNull(),
    flockId: varchar("flockId", { length: 255 }).notNull(),
    breedId: varchar("breedId", { length: 255 }),
  },
  (table) => {
    return {
      breedIdIdx: index("EggLog_breedId_idx").on(table.breedId),
      flockIdIdx: index("EggLog_flockId_idx").on(table.flockId),
    };
  },
);

export const eggLogRelations = relations(eggLog, ({ one }) => ({
  flock: one(flock, {
    fields: [eggLog.flockId],
    references: [flock.id],
  }),
}));

export const expense = pgTable(
  "Expense",
  {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    amount: doublePrecision("amount").notNull(),
    date: date("date", { mode: "string" }).notNull(),
    memo: text("memo"),
    flockId: varchar("flockId", { length: 255 }).notNull(),
    category: varchar("category", { length: 255 }).default("other").notNull(),
  },
  (table) => {
    return {
      flockIdIdx: index("Expense_flockId_idx").on(table.flockId),
    };
  },
);

export const expenseRelations = relations(expense, ({ one }) => ({
  flock: one(flock, {
    fields: [expense.flockId],
    references: [flock.id],
  }),
}));

export const flock = pgTable(
  "Flock",
  {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    name: text("name").notNull(),
    description: text("description"),
    imageUrl: text("imageUrl").notNull(),
    type: varchar("type", { length: 255 }).notNull(),
    userId: varchar("userId", { length: 255 }).notNull(),
    zip: varchar("zip", { length: 255 }).default(""),
    deleted: boolean("deleted").default(false).notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("Flock_userId_idx").on(table.userId),
    };
  },
);

export const flockRelations = relations(flock, ({ many, one }) => ({
  breeds: many(breed),
  eggLogs: many(eggLog),
  expenses: many(expense),
  user: one(user, {
    fields: [flock.userId],
    references: [user.id],
  }),
  tasks: many(task),
}));

export const notification = pgTable(
  "Notification",
  {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    date: timestamp("date", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    read: boolean("read").default(false).notNull(),
    readDate: timestamp("readDate", { precision: 3, mode: "string" }),
    userId: varchar("userId", { length: 255 }).notNull(),
    link: varchar("link", { length: 255 }).notNull(),
    action: varchar("action", { length: 255 }).default("View").notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("Notification_userId_idx").on(table.userId),
    };
  },
);

export const session = pgTable(
  "Session",
  {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    sessionToken: varchar("sessionToken", { length: 255 }).notNull(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: timestamp("expires", { precision: 3, mode: "string" }).notNull(),
  },
  (table) => {
    return {
      sessionTokenKey: uniqueIndex("Session_sessionToken_key").on(
        table.sessionToken,
      ),
      userIdIdx: index("Session_userId_idx").on(table.userId),
    };
  },
);

export const task = pgTable(
  "Task",
  {
    id: varchar("id", { length: 255 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    dueDate: timestamp("dueDate", { precision: 3, mode: "string" }).notNull(),
    recurrence: varchar("recurrence", { length: 255 }).notNull(),
    status: varchar("status", { length: 255 }).default("Incomplete").notNull(),
    userId: varchar("userId", { length: 255 }).notNull(),
    flockId: varchar("flockId", { length: 255 }).notNull(),
    completed: boolean("completed").default(false).notNull(),
    completedAt: timestamp("completedAt", { precision: 3, mode: "string" }),
  },
  (table) => {
    return {
      flockIdIdx: index("Task_flockId_idx").on(table.flockId),
      userIdIdx: index("Task_userId_idx").on(table.userId),
      taskId: primaryKey(table.id),
    };
  },
);

export const taskRelations = relations(task, ({ one }) => ({
  flock: one(flock, {
    fields: [task.flockId],
    references: [flock.id],
  }),
}));

export const user = pgTable(
  "User",
  {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }),
    emailVerified: timestamp("emailVerified", { precision: 3, mode: "string" }),
    image: text("image"),
    defaultFlock: varchar("defaultFlock", { length: 255 })
      .default("")
      .notNull(),
    clerkId: varchar("clerkId", { length: 255 }),
    secondaryClerkId: varchar("secondaryClerkId", { length: 255 }),
  },
  (table) => {
    return {
      emailKey: uniqueIndex("User_email_key").on(table.email),
      clerkIdKey: uniqueIndex("User_clerkId_key").on(table.clerkId),
      clerkIdIdx: index("User_clerkId_idx").on(table.clerkId),
      secondaryClerkIdIdx: index("User_secondaryClerkId_idx").on(table.secondaryClerkId),
    };
  },
);

export const userRelations = relations(user, ({ many }) => ({
  flocks: many(flock),
}));

export const verificationToken = pgTable(
  "VerificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).primaryKey().notNull(),
    expires: timestamp("expires", { precision: 3, mode: "string" }).notNull(),
  },
  (table) => {
    return {
      identifierTokenKey: uniqueIndex(
        "VerificationToken_identifier_token_key",
      ).on(table.identifier, table.token),
      tokenKey: uniqueIndex("VerificationToken_token_key").on(table.token),
    };
  },
);

export const dateTest = pgTable("DateTest", {
  dt_column: timestamp("dt_column").notNull(),
  d_column: date("d_column").notNull(),
});

export type User = typeof user.$inferInsert;
export type Notification = typeof notification.$inferInsert;
export type Task = typeof task.$inferInsert;
export type Flock = typeof flock.$inferInsert;
export type Breed = typeof breed.$inferInsert;
export type Expense = typeof expense.$inferInsert;
export type EggLog = typeof eggLog.$inferInsert;
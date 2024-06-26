import { relations, sql } from "drizzle-orm";
import {
  date,
  datetime,
  double,
  index,
  int,
  mysqlTableCreator,
  primaryKey,
  smallint,
  text,
  tinyint,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const mysqlTable = mysqlTableCreator((name) => `flocknerd_${name}`);

export const account = mysqlTable(
  "Account",
  {
    id: varchar("id", { length: 191 }).primaryKey().notNull(),
    userId: varchar("userId", { length: 191 }).notNull(),
    type: varchar("type", { length: 191 }).notNull(),
    provider: varchar("provider", { length: 191 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 191 }).notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: int("expires_at"),
    tokenType: varchar("token_type", { length: 191 }),
    scope: varchar("scope", { length: 191 }),
    idToken: text("id_token"),
    sessionState: varchar("session_state", { length: 191 }),
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

export const breed = mysqlTable(
  "Breed",
  {
    id: varchar("id", { length: 191 }).primaryKey().notNull(),
    name: text("name"),
    description: text("description"),
    count: smallint("count").notNull(),
    imageUrl: text("imageUrl"),
    averageProduction: double("averageProduction").notNull(),
    flockId: varchar("flockId", { length: 191 }).notNull(),
    breed: text("breed")
      .default(sql`('')`)
      .notNull(),
    deleted: tinyint("deleted").default(0).notNull(),
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

export const eggLog = mysqlTable(
  "EggLog",
  {
    id: varchar("id", { length: 191 }).primaryKey().notNull(),
    count: smallint("count").notNull(),
    notes: text("notes"),
    // date: datetime("date", { mode: "string", fsp: 3 }).notNull(),
    date: date("date", { mode: "string" }).notNull(),
    flockId: varchar("flockId", { length: 191 }).notNull(),
    breedId: varchar("breedId", { length: 191 }),
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

export const expense = mysqlTable(
  "Expense",
  {
    id: varchar("id", { length: 191 }).primaryKey().notNull(),
    amount: double("amount").notNull(),
    date: date("date", { mode: "string" }).notNull(),
    memo: text("memo"),
    flockId: varchar("flockId", { length: 191 }).notNull(),
    category: varchar("category", { length: 191 }).default("other").notNull(),
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

export const flock = mysqlTable(
  "Flock",
  {
    id: varchar("id", { length: 191 }).primaryKey().notNull(),
    name: text("name").notNull(),
    description: text("description"),
    imageUrl: text("imageUrl").notNull(),
    type: varchar("type", { length: 191 }).notNull(),
    userId: varchar("userId", { length: 191 }).notNull(),
    zip: varchar("zip", { length: 191 }).default(""),
    deleted: tinyint("deleted").default(0).notNull(),
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

export const notification = mysqlTable(
  "Notification",
  {
    id: varchar("id", { length: 191 }).primaryKey().notNull(),
    title: varchar("title", { length: 191 }).notNull(),
    message: text("message").notNull(),
    date: datetime("date", { mode: "string", fsp: 3 })
      .default(sql`(CURRENT_TIMESTAMP(3))`)
      .notNull(),
    read: tinyint("read").default(0).notNull(),
    readDate: datetime("readDate", { mode: "string", fsp: 3 }),
    userId: varchar("userId", { length: 191 }).notNull(),
    link: varchar("link", { length: 191 }).notNull(),
    action: varchar("action", { length: 191 }).default("View").notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("Notification_userId_idx").on(table.userId),
    };
  },
);

export const session = mysqlTable(
  "Session",
  {
    id: varchar("id", { length: 191 }).primaryKey().notNull(),
    sessionToken: varchar("sessionToken", { length: 191 }).notNull(),
    userId: varchar("userId", { length: 191 }).notNull(),
    expires: datetime("expires", { mode: "string", fsp: 3 }).notNull(),
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

export const task = mysqlTable(
  "Task",
  {
    id: varchar("id", { length: 191 }).notNull(),
    title: varchar("title", { length: 191 }).notNull(),
    description: varchar("description", { length: 191 }).notNull(),
    dueDate: datetime("dueDate", { mode: "string", fsp: 3 }).notNull(),
    recurrence: varchar("recurrence", { length: 191 }).notNull(),
    status: varchar("status", { length: 191 }).default("Incomplete").notNull(),
    userId: varchar("userId", { length: 191 }).notNull(),
    flockId: varchar("flockId", { length: 191 }).notNull(),
    completed: tinyint("completed").default(0).notNull(),
    completedAt: datetime("completedAt", { mode: "string", fsp: 3 }),
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

export const user = mysqlTable(
  "User",
  {
    id: varchar("id", { length: 191 }).primaryKey().notNull(),
    name: varchar("name", { length: 191 }),
    email: varchar("email", { length: 191 }),
    emailVerified: datetime("emailVerified", { mode: "string", fsp: 3 }),
    image: text("image"),
    defaultFlock: varchar("defaultFlock", { length: 191 })
      .default("")
      .notNull(),
    clerkId: varchar("clerkId", { length: 191 }),
  },
  (table) => {
    return {
      emailKey: uniqueIndex("User_email_key").on(table.email),
      clerkIdKey: uniqueIndex("User_clerkId_key").on(table.clerkId),
      clerkIdIdx: index("User_clerkId_idx").on(table.clerkId),
    };
  },
);

export const userRelations = relations(user, ({ many }) => ({
  flocks: many(flock),
}));

export const verificationToken = mysqlTable(
  "VerificationToken",
  {
    identifier: varchar("identifier", { length: 191 }).notNull(),
    token: varchar("token", { length: 191 }).primaryKey().notNull(),
    expires: datetime("expires", { mode: "string", fsp: 3 }).notNull(),
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

export const dateTest = mysqlTable(
  "DateTest",
  {
    dt_column: datetime("dt_column").notNull(),
    d_column: date("d_column").notNull(),
  },
  (table) => {
    return {};
  },
);

export type User = typeof user.$inferInsert;
export type Notification = typeof notification.$inferInsert;
export type Task = typeof task.$inferInsert;
export type Flock = typeof flock.$inferInsert;
export type Breed = typeof breed.$inferInsert;
export type Expense = typeof expense.$inferInsert;
export type EggLog = typeof eggLog.$inferInsert;

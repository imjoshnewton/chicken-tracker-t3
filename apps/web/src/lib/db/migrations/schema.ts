import { sql } from "drizzle-orm";
import {
  date,
  datetime,
  double,
  index,
  int,
  mysqlTable,
  primaryKey,
  smallint,
  text,
  tinyint,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

export const flocknerdAccount = mysqlTable(
  "flocknerd_Account",
  {
    id: varchar("id", { length: 191 }).notNull(),
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
      accountUserIdIdx: index("Account_userId_idx").on(table.userId),
      flocknerdAccountId: primaryKey(table.id),
      accountProviderProviderAccountIdKey: unique(
        "Account_provider_providerAccountId_key",
      ).on(table.provider, table.providerAccountId),
    };
  },
);

export const flocknerdBreed = mysqlTable(
  "flocknerd_Breed",
  {
    id: varchar("id", { length: 191 }).notNull(),
    name: text("name"),
    description: text("description"),
    count: smallint("count").notNull(),
    imageUrl: text("imageUrl"),
    averageProduction: double("averageProduction").notNull(),
    flockId: varchar("flockId", { length: 191 }).notNull(),
    breed: text("breed")
      .default(sql`''`)
      .notNull(),
    deleted: tinyint("deleted").default(0).notNull(),
  },
  (table) => {
    return {
      breedFlockIdIdx: index("Breed_flockId_idx").on(table.flockId),
      flocknerdBreedId: primaryKey(table.id),
    };
  },
);

export const flocknerdDateTest = mysqlTable("flocknerd_DateTest", {
  dtColumn: datetime("dt_column", { mode: "string" }),
  // you can use { mode: 'date' }, if you want to have Date as type for this column
  dColumn: date("d_column", { mode: "string" }),
});

export const flocknerdEggLog = mysqlTable(
  "flocknerd_EggLog",
  {
    id: varchar("id", { length: 191 }).notNull(),
    count: smallint("count").notNull(),
    notes: text("notes"),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    date: date("date", { mode: "string" }).notNull(),
    flockId: varchar("flockId", { length: 191 }).notNull(),
    breedId: varchar("breedId", { length: 191 }),
  },
  (table) => {
    return {
      eggLogFlockIdIdx: index("EggLog_flockId_idx").on(table.flockId),
      eggLogBreedIdIdx: index("EggLog_breedId_idx").on(table.breedId),
      flocknerdEggLogId: primaryKey(table.id),
    };
  },
);

export const flocknerdExpense = mysqlTable(
  "flocknerd_Expense",
  {
    id: varchar("id", { length: 191 }).notNull(),
    amount: double("amount").notNull(),
    date: datetime("date", { mode: "string", fsp: 3 }).notNull(),
    memo: text("memo"),
    flockId: varchar("flockId", { length: 191 }).notNull(),
    category: varchar("category", { length: 191 }).default("other").notNull(),
  },
  (table) => {
    return {
      expenseFlockIdIdx: index("Expense_flockId_idx").on(table.flockId),
      flocknerdExpenseId: primaryKey(table.id),
    };
  },
);

export const flocknerdFlock = mysqlTable(
  "flocknerd_Flock",
  {
    id: varchar("id", { length: 191 }).notNull(),
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
      flockUserIdIdx: index("Flock_userId_idx").on(table.userId),
      flocknerdFlockId: primaryKey(table.id),
    };
  },
);

export const flocknerdNotification = mysqlTable(
  "flocknerd_Notification",
  {
    id: varchar("id", { length: 191 }).notNull(),
    title: varchar("title", { length: 191 }).notNull(),
    message: text("message").notNull(),
    date: datetime("date", { mode: "string", fsp: 3 })
      .default(sql`now(3)`)
      .notNull(),
    read: tinyint("read").default(0).notNull(),
    readDate: datetime("readDate", { mode: "string", fsp: 3 }),
    userId: varchar("userId", { length: 191 }).notNull(),
    link: varchar("link", { length: 191 }).notNull(),
    action: varchar("action", { length: 191 }).default("View").notNull(),
  },
  (table) => {
    return {
      notificationUserIdIdx: index("Notification_userId_idx").on(table.userId),
      flocknerdNotificationId: primaryKey(table.id),
    };
  },
);

export const flocknerdSession = mysqlTable(
  "flocknerd_Session",
  {
    id: varchar("id", { length: 191 }).notNull(),
    sessionToken: varchar("sessionToken", { length: 191 }).notNull(),
    userId: varchar("userId", { length: 191 }).notNull(),
    expires: datetime("expires", { mode: "string", fsp: 3 }).notNull(),
  },
  (table) => {
    return {
      sessionUserIdIdx: index("Session_userId_idx").on(table.userId),
      flocknerdSessionId: primaryKey(table.id),
      sessionSessionTokenKey: unique("Session_sessionToken_key").on(
        table.sessionToken,
      ),
    };
  },
);

export const flocknerdTask = mysqlTable(
  "flocknerd_Task",
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
      taskUserIdIdx: index("Task_userId_idx").on(table.userId),
      taskFlockIdIdx: index("Task_flockId_idx").on(table.flockId),
      flocknerdTaskId: primaryKey(table.id),
    };
  },
);

export const flocknerdUser = mysqlTable(
  "flocknerd_User",
  {
    id: varchar("id", { length: 191 }).notNull(),
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
      userClerkIdIdx: index("User_clerkId_idx").on(table.clerkId),
      flocknerdUserId: primaryKey(table.id),
      userEmailKey: unique("User_email_key").on(table.email),
      userClerkIdKey: unique("User_clerkId_key").on(table.clerkId),
    };
  },
);

export const flocknerdVerificationToken = mysqlTable(
  "flocknerd_VerificationToken",
  {
    identifier: varchar("identifier", { length: 191 }).notNull(),
    token: varchar("token", { length: 191 }).notNull(),
    expires: datetime("expires", { mode: "string", fsp: 3 }).notNull(),
  },
  (table) => {
    return {
      verificationTokenTokenKey: unique("VerificationToken_token_key").on(
        table.token,
      ),
      verificationTokenIdentifierTokenKey: unique(
        "VerificationToken_identifier_token_key",
      ).on(table.identifier, table.token),
    };
  },
);

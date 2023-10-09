import { currentUsr } from "@lib/auth";
import { db } from "@lib/db";
import { notification } from "@lib/db/schema";
import { desc, eq } from "drizzle-orm";
import AppLayout from "./AppLayout";

export const metadata = {
  title: "FlockNerd - Egg-ceptional Insights",
  description: "Flock Stats for Nerds",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUsr();

  const notifications = await db
    .select()
    .from(notification)
    .limit(10)
    .orderBy(desc(notification.date))
    .where(eq(notification.userId, user?.id));

  return <AppLayout notifications={notifications}>{children}</AppLayout>;
}

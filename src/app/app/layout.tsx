import AppLayout from "./AppLayout";
import { currentUsr } from "@lib/auth";
import { db } from "@lib/db";
import { eq, desc } from "drizzle-orm";
import { notification } from "@lib/db/schema";

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

  // const notifications = await prisma.notification.findMany({
  //   where: {
  //     userId: user?.id,
  //   },
  //   orderBy: {
  //     date: "desc",
  //   },
  //   take: 10,
  // });

  return <AppLayout notifications={notifications}>{children}</AppLayout>;
}

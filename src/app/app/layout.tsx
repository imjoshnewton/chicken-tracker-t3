import AppLayout from "./AppLayout";
import { prisma } from "../../server/db/client";
import type { User } from "@clerk/nextjs/api";
import { currentUser } from "@clerk/nextjs";

export const metadata = {
  title: "FlockNerd - Egg-ceptional Insights",
  description: "Flock Stats for Nerds",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkUser: User | null = await currentUser();
  const user = await prisma.user.findUnique({
    where: {
      id: clerkUser?.id,
    },
  });

  const notifications = await prisma.notification.findMany({
    where: {
      userId: user?.id,
    },
    orderBy: {
      date: "desc",
    },
    take: 10,
  });

  return <AppLayout notifications={notifications}>{children}</AppLayout>;
}

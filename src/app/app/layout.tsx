import { getServerSession } from "next-auth";
import { authOptions } from "../../pages/api/auth/[...nextauth]";
import AppLayout from "./AppLayout";
import "../../styles/globals.scss";
import "animate.css";
import { redirect } from "next/navigation";
import { prisma } from "../../server/db/client";

export const metadata = {
  title: "FlockNerd - Egg-ceptional Insights",
  description: "Flock Stats for Nerds",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin");
  }
  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user?.id,
    },
    orderBy: {
      date: "desc",
    },
    take: 10,
  });

  return (
    <html>
      <body>
        <AppLayout session={session} notifications={notifications}>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}

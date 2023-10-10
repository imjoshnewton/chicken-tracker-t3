import { auth } from "@clerk/nextjs";
import { getServerClient } from "../_trpc/serverClient";
import AppLayout from "./AppLayout";
import { TrpcProvider } from "./Provider";

export const metadata = {
  title: "FlockNerd - Egg-ceptional Insights",
  description: "Flock Stats for Nerds",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authRes = await auth();

  const serverClient = getServerClient(authRes);

  const notifications = await serverClient.auth.getUserNotifications();

  return (
    <TrpcProvider>
      <AppLayout initialNotifications={notifications}>{children}</AppLayout>
    </TrpcProvider>
  );
}

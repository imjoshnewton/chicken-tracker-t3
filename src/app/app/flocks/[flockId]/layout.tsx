import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "src/app/api/auth/[...nextauth]/route";
import { TrpcProvider } from "./Provider";

export const metadata = {
  title: "FlockNerd - Egg-ceptional Insights",
  description: "Flock Stats for Nerds",
};

export default async function FlockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin");
  }

  return <TrpcProvider>{children}</TrpcProvider>;
}

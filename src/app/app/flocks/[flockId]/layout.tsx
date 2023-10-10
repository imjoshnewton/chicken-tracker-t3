import { TrpcProvider } from "../../Provider";

export const metadata = {
  title: "FlockNerd - Egg-ceptional Insights",
  description: "Flock Stats for Nerds",
};

export default async function FlockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

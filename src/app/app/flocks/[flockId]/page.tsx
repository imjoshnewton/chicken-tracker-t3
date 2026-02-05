import { currentUsr } from "@lib/auth";
import { redirect } from "next/navigation";
import Flock from "./Flock";

export const metadata = {
  title: "FlockNerd - Flock Details",
  description: "Flock Stats for Nerds",
};

// Simplest possible approach for Next.js 15 compatibility
export default async function Page(props: any) {
  // Extract params and searchParams from props
  const searchParams = await props.searchParams;
  const params = await props.params;
  const flockId = params.flockId;
  
  // const authRes = await auth();
  const user = await currentUsr();

  if (!user) redirect("/api/auth/signin");

  return <Flock userId={user.id} flockId={flockId} />;
}

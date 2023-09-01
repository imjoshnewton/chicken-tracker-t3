import { currentUsr } from "@lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "src/app/api/auth/[...nextauth]/route";
import Flock from "./Flock";

export const metadata = {
  title: "FlockNerd - Flock Details",
  description: "Flock Stats for Nerds",
};

const Page = async ({
  params,
  searchParams,
}: {
  params: { flockId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const user = await currentUsr();

  if (!user) redirect("/api/auth/signin");

  return <Flock userId={user.id} flockId={params.flockId} />;
};

export default Page;

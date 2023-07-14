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
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/api/auth/signin");

  return <Flock session={session} flockId={params.flockId} />;
};

export default Page;

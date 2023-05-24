import { getServerSession } from "next-auth";
import { authOptions } from "src/pages/api/auth/[...nextauth]";
import { redirect } from "next/navigation";
import Flock from "./Flock";

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

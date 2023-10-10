import { currentUsr } from "@lib/auth";
import { redirect } from "next/navigation";
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
  // const authRes = await auth();
  const user = await currentUsr();

  // const serverClient = getServerClient(authRes);
  // const flock = await serverClient.flocks.getFlock({
  //   flockId: params.flockId,
  // });

  // console.log("flock", flock);

  if (!user) redirect("/api/auth/signin");

  return <Flock userId={user.id} flockId={params.flockId} />;
};

export default Page;

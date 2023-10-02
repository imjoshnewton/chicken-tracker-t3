import { currentUsr } from "@lib/auth";
import { redirect } from "next/navigation";
import Card from "../../../../../components/shared/Card";
import { prisma } from "../../../../../server/db/client";
import FlockForm from "../../FlockEditForm";

export const metadata = {
  title: "FlockNerd - Edit Flock",
  description: "Flock Stats for Nerds",
};

const Edit = async ({
  params,
  searchParams,
}: {
  params: { flockId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const user = await currentUsr();

  const flockId = params.flockId;
  const flock = await prisma.flock.findFirst({
    where: {
      id: flockId,
      userId: user.id,
    },
    include: {
      breeds: {
        orderBy: {
          breed: "asc",
        },
      },
    },
  });

  if (!flock) redirect("/app/flocks");

  return (
    <main className="h-full p-0 lg:h-auto lg:p-8 lg:px-[3.5vw]">
      <Card
        title="Edit Flock"
        className="pb-safe h-full !pl-0 !pr-0 lg:h-auto lg:pb-0 lg:pt-4"
        titleStyle="pl-8 !mb-0"
      >
        <FlockForm flock={flock} userId={user.id}></FlockForm>
      </Card>
    </main>
  );
};

export default Edit;

import Card from "../../../../../components/shared/Card";
import FlockForm from "../../FlockEditForm";
import { getServerSession } from "next-auth";
import { authOptions } from "src/pages/api/auth/[...nextauth]";
import { redirect } from "next/navigation";
import { prisma } from "../../../../../server/db/client";

const Edit = async ({
  params,
  searchParams,
}: {
  params: { flockId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/api/auth/signin");

  const flockId = params.flockId;
  const flock = await prisma.flock.findFirst({
    where: {
      id: flockId,
      userId: session.user.id,
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
        className="pb-safe h-full py-0 lg:h-auto lg:pt-4 lg:pb-4"
      >
        <FlockForm flock={flock} userId={session.user.id}></FlockForm>
      </Card>
    </main>
  );
};

export default Edit;

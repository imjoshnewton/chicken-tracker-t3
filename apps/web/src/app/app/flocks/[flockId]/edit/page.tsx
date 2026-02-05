import { currentUsr } from "@lib/auth";
import { db } from "@lib/db";
import { breed as Breeds, flock as Flocks } from "@lib/db/schema-postgres";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Card from "../../../../../components/shared/Card";
import FlockForm from "../../FlockEditForm";

export const metadata = {
  title: "FlockNerd - Edit Flock",
  description: "Flock Stats for Nerds",
};

// Simplest possible approach for Next.js 15 compatibility
export default async function Edit(props: any) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const flockId = params.flockId;
  const user = await currentUsr();
  const flock = await db.query.flock.findFirst({
    where: eq(Flocks.id, flockId),
    with: {
      breeds: {
        where: eq(Breeds.deleted, false),
        orderBy: (breeds, { asc }) => [asc(breeds.id)],
      },
    },
  });

  if (!flock) redirect("/app/flocks");

  // const flock = {
  //   ...flockRes,
  //   deleted: flockRes.deleted === 1,
  //   breeds: flockRes.breeds.map((breed) => {
  //     return {
  //       ...breed,
  //       deleted: breed.deleted === 1,
  //     };
  //   }, []),
  // };

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
}

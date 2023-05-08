import Card from "../../../components/shared/Card";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import { prisma } from "../../../server/db/client";
import { redirect } from "next/navigation";
import FlockForm from "./FlockEditForm";
import AddFlockButton from "./AddFlockButton";

const Flocks = async ({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/api/auth/signin");

  const flocks = await prisma.flock.findMany({
    where: {
      userId: session.user.id,
    },
  });

  if (flocks.length == 1) {
    redirect(`/app/flocks/${flocks[0]?.id}`);
  }

  if (!flocks?.length || searchParams?.addFlock) {
    return (
      <main>
        <div className="shadow">
          <Card title="New FLock">
            <FlockForm
              flock={{
                id: "",
                name: "",
                description: "",
                imageUrl: "",
                type: "",
                zip: "",
                userId: "",
                breeds: [],
              }}
              userId={session.user.id}
            />
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <AddFlockButton />
      </div>
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {flocks?.map((flock, index) => {
          return (
            <li
              className="animate__animated animate__fadeIn"
              style={{ animationDelay: `${index * 0.15}s` }}
              key={flock.id}
            >
              <Link href={`/app/flocks/${flock.id}`}>
                <div className="shadow transition-all hover:shadow-2xl">
                  <Card title={"Flock"}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                      <Image
                        src={flock?.imageUrl}
                        width="150"
                        height="150"
                        className="flock-image aspect-square object-cover"
                        alt="Image that represents the user's flock"
                      />
                      <div>
                        <div className="flex items-center">
                          <h1 className="mr-3 dark:text-gray-300">
                            {flock?.name}
                          </h1>
                        </div>
                        <p className="description dark:text-gray-300">
                          {flock?.description}
                        </p>
                        <p className="mt-2 text-gray-400 dark:text-gray-400">
                          {flock?.type}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </Link>
            </li>
          );
        })}
        <li className="basis-3/4"></li>
      </ul>
    </main>
  );
};

export default Flocks;

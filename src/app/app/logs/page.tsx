import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Card from "../../../components/shared/Card";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import { prisma } from "../../../server/db/client";
import DeleteButton from "./DeleteButton";

async function Logs() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/api/auth/signin");

  const flocks = await prisma.flock.findMany({
    where: {
      userId: session.user?.id,
    },
    include: {
      logs: {
        take: 25,
        orderBy: {
          date: "desc",
        },
      },
    },
  });
  const logs = flocks.flatMap((f) => f.logs);

  return (
    <main className="p-0 lg:p-8 lg:px-[3.5vw]">
      <div className="shadow-xl">
        <Card title="All Logs" className="pb-safe py-0 lg:pt-4 lg:pb-4">
          <ul className="mt-4 flex flex-col">
            {logs?.map((log, index) => {
              return (
                <li
                  className="animate__animated animate__fadeInUp mb-3 flex min-h-[50px] items-center rounded border border-solid px-3 py-2 shadow"
                  style={{ animationDelay: `${index * 0.03}s` }}
                  key={log.id}
                >
                  <div className="basis-1/3 md:basis-1/4">
                    {log.date.toDateString()}
                  </div>
                  <span className="basis-1/3 md:basis-1/6">
                    Count: {log.count}
                  </span>
                  <span className="hidden basis-1/3 md:block">
                    Notes: {log.notes}
                  </span>
                  <div className="ml-auto">
                    <DeleteButton id={log.id} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </main>
  );
}

export default Logs;

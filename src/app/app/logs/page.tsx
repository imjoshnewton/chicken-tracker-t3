import { type EggLog } from "@prisma/client";
import { getServerSession, Session } from "next-auth";
import { redirect } from "next/navigation";
import Card from "../../../components/shared/Card";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import { prisma } from "../../../server/db/client";
import DeleteButton from "./DeleteButton";
import Pagination from "../../../components/flocks/Pagination";

const PAGE_SIZE = 25;

// Fetch logs function
async function fetchLogs(session: Session, page: number) {
  const flocks = await prisma.flock.findMany({
    where: {
      userId: session.user?.id,
    },
    include: {
      logs: {
        skip: page * PAGE_SIZE,
        take: PAGE_SIZE,
        orderBy: {
          date: "desc",
        },
      },
    },
  });

  return flocks.flatMap((f) => f.logs);
}

async function fetchLogCount(session: Session) {
  const count = await prisma.eggLog.count({
    where: {
      flock: {
        userId: session.user?.id,
      },
    },
  });

  return count;
}
// Log item component
function LogItem({ log, index }: { log: EggLog; index: number }) {
  return (
    <li
      className="animate__animated animate__fadeInUp mb-3 flex min-h-[50px] items-center rounded border border-solid px-3 py-2 shadow"
      style={{ animationDelay: `${index * 0.03}s` }}
      key={log.id}
    >
      <div className="basis-1/3 md:basis-1/4">{log.date.toDateString()}</div>
      <span className="basis-1/3 md:basis-1/6">Count: {log.count}</span>
      <span className="hidden basis-1/3 md:block">Notes: {log.notes}</span>
      <div className="ml-auto">
        <DeleteButton id={log.id} />
      </div>
    </li>
  );
}

async function Logs({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);
  const page = parseInt(searchParams.page as string) || 0;

  if (!session) redirect("/api/auth/signin");

  const totalPages = Math.ceil((await fetchLogCount(session)) / PAGE_SIZE);
  const logs = await fetchLogs(session, page);

  return (
    <main className="p-0 lg:p-8 lg:px-[3.5vw]">
      <div className="shadow-xl">
        <Card title="All Logs" className="pb-safe py-0 lg:pt-4 lg:pb-4">
          <ul className="mt-4 flex flex-col">
            {logs?.map((log, index) => (
              <LogItem log={log} index={index} key={index} />
            ))}
          </ul>
          <Pagination totalPages={totalPages} />
        </Card>
      </div>
    </main>
  );
}

export default Logs;

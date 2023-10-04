import { type EggLog } from "@prisma/client";
import { redirect } from "next/navigation";
import Card from "../../../components/shared/Card";
import { currentUsr } from "@lib/auth";
import Pagination from "../../../components/flocks/Pagination";
import DeleteButton from "./DeleteButton";
import { fetchLogCount, fetchLogs, PAGE_SIZE } from "@lib/fetch";

export const metadata = {
  title: "FlockNerd - All Logs",
  description: "Flock Stats for Nerds",
};

export const runtime = "edge";

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
  const user = await currentUsr();
  const page = parseInt(searchParams.page as string) || 0;

  if (!user) redirect("/auth/sign-in");

  const totalPages = Math.ceil((await fetchLogCount(user.id)) / PAGE_SIZE);
  const logs = await fetchLogs(user.id, page);

  return (
    <main className="p-0 lg:p-8 lg:px-[3.5vw]">
      <div className="shadow-xl">
        <Card title="All Logs" className="pb-safe py-0 lg:pb-4 lg:pt-4">
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

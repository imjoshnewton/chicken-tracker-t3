import { currentUsr } from "@lib/auth";
import { type EggLog } from "@lib/db/schema";
import * as logsService from "../../../services/logs.service";
import { parseISO } from "date-fns";
import { redirect } from "next/navigation";
import Pagination from "../../../components/flocks/Pagination";
import Card from "../../../components/shared/Card";
import DeleteButton from "./DeleteButton";
import FlockSelect from "./FlockSelect";

export const metadata = {
  title: "FlockNerd - All Logs",
  description: "Flock Stats for Nerds",
};

export const runtime = "nodejs";

// Log item component
function LogItem({ log, index }: { log: EggLog; index: number }) {
  return (
    <li
      className="animate__animated animate__fadeInUp mb-3 flex min-h-[50px] items-center rounded border border-solid px-3 py-2 shadow"
      style={{ animationDelay: `${index * 0.03}s` }}
      key={log.id}
    >
      <div className="basis-1/3 md:basis-1/4">
        {parseISO(log.date).toDateString()}
      </div>
      <span className="basis-1/3 md:basis-1/6">Count: {log.count}</span>
      <span className="hidden basis-1/3 md:block">Notes: {log.notes}</span>
      <div className="ml-auto">
        <DeleteButton id={log.id} />
      </div>
    </li>
  );
}

// Simplest possible approach for Next.js 15 compatibility
export default async function Page(props: any) {
  const searchParams = await props.searchParams || {};
  const user = await currentUsr();
  const page = parseInt(searchParams.page as string) || 0;
  const flockId = searchParams.flockId as string;

  if (!user) redirect("/auth/sign-in");

  const [logs, totalPages] = await logsService.getLogs(user.id, page, flockId);

  return (
    <main className="p-0 lg:p-8 lg:px-[3.5vw]">
      <div className="shadow-xl">
        <Card className="pb-safe py-0 lg:pb-4 lg:pt-7">
          <FlockSelect />
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


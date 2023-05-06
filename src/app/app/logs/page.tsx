import { AnimatePresence, motion } from "framer-motion";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Card from "../../../components/shared/Card";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import { prisma } from "../../../server/db/client";
// import AppLayout from "../../../layouts/AppLayout";
// import { trpc } from "../../../utils/trpc";

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

  //   const utils = trpc.useContext();

  //   const mutation = trpc.logs.deleteLog.useMutation({
  //     onSuccess: () => {
  //       utils.stats.getStats.invalidate();
  //       utils.logs.getLogs.invalidate();
  //       toast.success("Log deleted!");
  //     },
  //   });

  //   async function deleteLog(id: string): Promise<void> {
  //     await mutation.mutateAsync({ id: id });
  //   }

  return (
    <main className="p-0 lg:p-8 lg:px-[3.5vw]">
      <div className="shadow-xl">
        <Card title="All Logs" className="pb-safe py-0 lg:pt-4 lg:pb-4">
          {/* <AnimatePresence initial={true}> */}
          <ul className="mt-4 flex flex-col">
            {logs?.map((log, index) => {
              return (
                <li
                  // initial={{ opacity: 0, x: 30 }}
                  // animate={{
                  //   opacity: 1,
                  //   x: 0,
                  //   transition: {
                  //     duration: 0.15,
                  //     type: "spring",
                  //     damping: 25,
                  //     stiffness: 500,
                  //     delay: index * 0.05,
                  //   },
                  // }}
                  // exit={{
                  //   x: "-100vw",
                  //   opacity: 0,
                  //   transition: {
                  //     duration: 0.15,
                  //   },
                  // }}
                  className="mb-3 flex min-h-[50px] items-center rounded border border-solid px-3 py-2 shadow"
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
                    <span
                      className="rounded bg-red-500 py-1 px-2 text-white hover:cursor-pointer hover:shadow-lg"
                      // onClick={async () => {
                      //   await deleteLog(log.id);
                      // }}
                    >
                      Delete
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          {/* </AnimatePresence> */}
        </Card>
      </div>
    </main>
  );
}

// Logs.getLayout = function getLayout(page: React.ReactElement) {
//   return <AppLayout>{page}</AppLayout>;
// };

export default Logs;

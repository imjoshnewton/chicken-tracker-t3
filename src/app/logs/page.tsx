import { unstable_getServerSession } from "next-auth";
import Card from "../../components/Card";
import { prisma } from "../../server/db/client";
import DeleteLogButton from "./DeleteLogButton";

export default async function Logs() {
  const session = await unstable_getServerSession();
  const flocks = await prisma.flock.findMany({
    where: {
      userId: session?.user?.id,
    },
    include: {
      logs: {
        orderBy: {
          date: "desc",
        },
      },
    },
  });
  const logs = flocks.flatMap((f) => f.logs);

  console.log("Logs: ", logs);

  return (
    <main>
      <div className='shadow-xl'>
        <Card title='All Logs'>
          <ul className='flex flex-col mt-4'>
            {logs?.map((log) => {
              return (
                <li
                  className='mb-3 shadow min-h-[50px] flex items-center px-3 py-2 border-solid border rounded'
                  key={log.id}>
                  <div className='basis-1/3 md:basis-1/4'>
                    {log.date.toDateString()}
                  </div>
                  <span className='basis-1/3 md:basis-1/6'>
                    Count: {log.count}
                  </span>
                  <span className='basis-1/3 hidden md:block'>
                    Notes: {log.notes}
                  </span>
                  <div className='ml-auto'>
                    <DeleteLogButton id={log.id} />
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

import toast from "react-hot-toast";
import Card from "../../../components/Card";
import AppLayout from "../../../layouts/AppLayout";
import { trpc } from "../../../utils/trpc";

const Logs = () => {
  const flocks = trpc.logs.getLogs.useQuery();
  const logs = flocks.data?.flatMap((f) => f.logs);

  const utils = trpc.useContext();

  const mutation = trpc.logs.deleteLog.useMutation({
    onSuccess: () => {
      utils.stats.getStats.invalidate();
      utils.logs.getLogs.invalidate();
      toast.success("Log deleted!");
    },
  });

  async function deleteLog(id: string): Promise<void> {
    await mutation.mutateAsync({ id: id });
  }

  return (
    <main>
      <div className="shadow-xl">
        <Card title="All Logs">
          <ul className="mt-4 flex flex-col">
            {logs?.map((log) => {
              return (
                <li
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
                    <button
                      className="rounded bg-red-500 py-1 px-2 text-white hover:cursor-pointer hover:shadow-lg"
                      onClick={async () => {
                        await deleteLog(log.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </main>
  );
};

Logs.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};

export default Logs;

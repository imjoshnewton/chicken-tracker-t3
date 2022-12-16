import toast from "react-hot-toast";
import Card from "../../components/Card";
import { trpc } from "../../utils/trpc";

export default function Logs() {
  const flocks = trpc.useQuery(["logs.getLogs"]);
  const logs = flocks.data?.flatMap((f) => f.logs);

  const utils = trpc.useContext();

  const mutation = trpc.useMutation("logs.deleteLog", {
    onSuccess: () => {
      utils.invalidateQueries("stats.getStats");
      utils.invalidateQueries("logs.getLogs");
      toast.success("Log deleted!");
    },
  });

  async function deleteLog(id: string): Promise<void> {
    await mutation.mutateAsync({ id: id });
  }

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
                    <button
                      className='bg-red-500 text-white hover:shadow-lg hover:cursor-pointer rounded py-1 px-2'
                      onClick={async () => {
                        await deleteLog(log.id);
                      }}>
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
}
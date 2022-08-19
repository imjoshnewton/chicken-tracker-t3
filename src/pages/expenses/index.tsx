import Card from "../../components/Card";
import { trpc } from "../../utils/trpc";

export default function Logs() {
  const flocks = trpc.useQuery(["expenses.getExpenses"]);
  const expenses = flocks.data?.flatMap((f) => f.expenses);

  const utils = trpc.useContext();

  const mutation = trpc.useMutation("expenses.deleteExpense", {
    onSuccess: () => {
      utils.invalidateQueries();
    },
  });

  async function deleteLog(id: string): Promise<void> {
    await mutation.mutateAsync({ id: id });
  }

  return (
    <main>
      <Card title='All Expenses'>
        <ul className='flex flex-col mt-4'>
          {expenses?.map((expense) => {
            return (
              <li
                className='mb-3 shadow min-h-[50px] flex items-center px-3 py-2 border-solid border rounded'
                key={expense.id}>
                <div className='basis-1/3 md:basis-1/4'>
                  {expense.date.toDateString()}
                </div>
                <span className='basis-1/3 md:basis-1/6'>
                  Amount: ${expense.amount}
                </span>
                <span className='basis-1/3 hidden md:block'>
                  Memo: {expense.memo}
                </span>
                <div className='ml-auto'>
                  <button
                    className='bg-red-500 hover:shadow-lg hover:cursor-pointer rounded py-1 px-2'
                    onClick={async () => {
                      await deleteLog(expense.id);
                    }}>
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </main>
  );
}

import toast from "react-hot-toast";
import Card from "../../components/Card";
import { trpc } from "../../utils/trpc";

export default function Logs() {
  const flocks = trpc.expenses.getExpenses.useQuery();
  const expenses = flocks.data?.flatMap((f) => f.expenses);

  const utils = trpc.useContext();

  const mutation = trpc.expenses.deleteExpense.useMutation({
    onSuccess: () => {
      utils.stats.getExpenseStats.invalidate();
      utils.expenses.getExpenses.invalidate();
      toast.success("Expense deleted!");
    },
  });

  async function deleteLog(id: string): Promise<void> {
    await mutation.mutateAsync({ id: id });
  }

  return (
    <main>
      <div className="shadow-xl">
        <Card title="All Expenses">
          <ul className="mt-4 flex flex-col">
            {expenses?.map((expense) => {
              return (
                <li
                  className="mb-3 flex min-h-[50px] items-center rounded border border-solid px-3 py-2 shadow"
                  key={expense.id}
                >
                  <div className="basis-1/3 md:basis-1/4">
                    {expense.date.toDateString()}
                  </div>
                  <span className="basis-1/3 md:basis-1/6">
                    Amount: ${expense.amount}
                  </span>
                  <span className="hidden basis-1/3 md:block">
                    Memo: {expense.memo}
                  </span>
                  <div className="ml-auto">
                    <button
                      className="rounded bg-red-500 py-1 px-2 text-white hover:cursor-pointer hover:shadow-lg"
                      onClick={async () => {
                        await deleteLog(expense.id);
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
}

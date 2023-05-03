import { AnimatePresence, motion, stagger } from "framer-motion";
import toast from "react-hot-toast";
import Card from "../../../components/shared/Card";
import AppLayout from "../../../layouts/AppLayout";
import { trpc } from "../../../utils/trpc";

const Expenses = () => {
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

  const slideLeft = {
    hidden: {
      x: 30,
      opacity: 0,
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.15,
        type: "spring",
        damping: 25,
        stiffness: 500,
      },
      delay: stagger(0.1),
    },
    exit: {
      x: "-100vw",
      opacity: 0,
      transition: {
        duration: 0.15,
      },
    },
  };

  async function deleteLog(id: string): Promise<void> {
    await mutation.mutateAsync({ id: id });
  }

  return (
    <main className="p-0 lg:p-8 lg:px-[3.5vw]">
      <div className="shadow-xl">
        <Card title="All Expenses" className="pb-safe py-0 lg:pt-4 lg:pb-4">
          <AnimatePresence initial={true}>
            <motion.ul className="mt-4 flex flex-col">
              {expenses?.map((expense, index) => {
                return (
                  <motion.li
                    initial={{ opacity: 0, x: 30 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: {
                        duration: 0.15,
                        type: "spring",
                        damping: 25,
                        stiffness: 500,
                        delay: index * 0.05,
                      },
                    }}
                    exit={{
                      x: "-100vw",
                      opacity: 0,
                      transition: {
                        duration: 0.15,
                      },
                    }}
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
                  </motion.li>
                );
              })}
            </motion.ul>
          </AnimatePresence>
        </Card>
      </div>
    </main>
  );
};

Expenses.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};

export default Expenses;

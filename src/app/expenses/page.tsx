import { unstable_getServerSession } from "next-auth";
import Card from "../../components/Card";
import { prisma } from "../../server/db/client";
import DeleteExpenseButton from "./DeleteExpenseButton";

export default async function Expenses() {
  const session = await unstable_getServerSession();
  const flocks = await prisma.flock.findMany({
    where: {
      userId: session?.user?.id,
    },
    include: {
      expenses: {
        orderBy: {
          date: "desc",
        },
      },
    },
  });
  const expenses = flocks.flatMap((f) => f.expenses);

  console.log("Expenses: ", expenses);

  return (
    <main>
      <div className='shadow-xl'>
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
                    {/* <button
                      className='bg-red-500 text-white hover:shadow-lg hover:cursor-pointer rounded py-1 px-2'
                      onClick={async () => {
                        await deleteLog(expense.id);
                      }}>
                      Delete
                    </button> */}
                    <DeleteExpenseButton id={expense.id} />
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

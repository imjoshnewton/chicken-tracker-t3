import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Card from "../../../components/shared/Card";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import { prisma } from "../../../server/db/client";
import DeleteButton from "./DeleteButton";

const Expenses = async () => {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/api/auth/signin");

  const flocks = await prisma.flock.findMany({
    where: {
      userId: session.user?.id,
    },
    include: {
      expenses: {
        take: 25,
        orderBy: {
          date: "desc",
        },
      },
    },
  });
  const expenses = flocks.flatMap((f) => f.expenses);

  return (
    <main className="p-0 lg:p-8 lg:px-[3.5vw]">
      <div className="shadow-xl">
        <Card title="All Expenses" className="pb-safe py-0 lg:pt-4 lg:pb-4">
          <ul className="mt-4 flex flex-col">
            {expenses?.map((expense, index) => {
              return (
                <li
                  className="animate__animated animate__fadeInUp mb-3 flex min-h-[50px] items-center rounded border border-solid px-3 py-2 shadow"
                  style={{ animationDelay: `${index * 0.05}s` }}
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
                    <DeleteButton id={expense.id} />
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

export default Expenses;

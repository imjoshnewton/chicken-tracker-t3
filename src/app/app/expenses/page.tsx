import { getServerSession, Session } from "next-auth";
import { redirect } from "next/navigation";
import Card from "../../../components/shared/Card";
import { authOptions } from "src/app/api/auth/[...nextauth]/route";
import { prisma } from "../../../server/db/client";
import DeleteButton from "./DeleteButton";
import Pagination from "../../../components/flocks/Pagination";
import { type Expense } from "@prisma/client";
import { db } from "@lib/db";
import { expense, flock } from "@lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";

const PAGE_SIZE = 25;

export const metadata = {
  title: "FlockNerd - All Expenses",
  description: "Flock Stats for Nerds",
};

// Fetch expenses function
async function fetchExpenses(session: Session, page: number) {
  if (!session?.user) redirect("/api/auth/signin");

  const flockJoin = await db
    .select({
      id: expense.id,
      date: expense.date,
      amount: expense.amount,
      category: expense.category,
      memo: expense.memo,
      flockId: expense.flockId,
    })
    .from(flock)
    .where(eq(flock.userId, session.user.id))
    .innerJoin(expense, eq(expense.flockId, flock.id))
    .orderBy(desc(expense.date))
    .offset(page * PAGE_SIZE)
    .limit(PAGE_SIZE);

  return flockJoin.map((f) => {
    return {
      ...f,
      date: new Date(f.date),
    };
  });
}

// Fetch expense count function
async function fetchExpenseCount(session: Session) {
  if (!session?.user) redirect("/api/auth/signin");

  const [result] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(flock)
    .where(eq(flock.userId, session.user.id))
    .innerJoin(expense, eq(expense.flockId, flock.id));

  return result ? result.count : 0;
}

// Expense item component
function ExpenseItem({ expense, index }: { expense: Expense; index: number }) {
  return (
    <li
      className="animate__animated animate__fadeInUp mb-3 flex min-h-[50px] items-center rounded border border-solid px-3 py-2 shadow"
      style={{ animationDelay: `${index * 0.05}s` }}
      key={expense.id}
    >
      <div className="basis-1/3 md:basis-1/4">
        {expense.date.toDateString()}
      </div>
      <span className="basis-1/3 md:basis-1/6">Amount: ${expense.amount}</span>
      <span className="hidden basis-1/3 md:block">Memo: {expense.memo}</span>
      <div className="ml-auto">
        <DeleteButton id={expense.id} />
      </div>
    </li>
  );
}

async function Expenses({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);
  const page = parseInt(searchParams.page as string) || 0;

  if (!session) redirect("/api/auth/signin");

  const totalPages = Math.ceil((await fetchExpenseCount(session)) / PAGE_SIZE);
  const expenses = await fetchExpenses(session, page);

  return (
    <main className="p-0 lg:p-8 lg:px-[3.5vw]">
      <div className="shadow-xl">
        <Card title="All Expenses" className="pb-safe py-0 lg:pt-4 lg:pb-4">
          <ul className="mt-4 flex flex-col">
            {expenses?.map((expense, index) => (
              <ExpenseItem expense={expense} index={index} key={index} />
            ))}
          </ul>
          <Pagination totalPages={totalPages} />
        </Card>
      </div>
    </main>
  );
}

export default Expenses;

import { currentUsr } from "@lib/auth";
import { fetchExpenses } from "@lib/fetch";
import { type Expense } from "@lib/db/schema";
import { redirect } from "next/navigation";
import Pagination from "../../../components/flocks/Pagination";
import Card from "../../../components/shared/Card";
import DeleteButton from "./DeleteButton";
import { parseISO } from "date-fns";
import FlockSelect from "../logs/FlockSelect";

export const metadata = {
  title: "FlockNerd - All Expenses",
  description: "Flock Stats for Nerds",
};

export const runtime = "edge";

// Expense item component
function ExpenseItem({ expense, index }: { expense: Expense; index: number }) {
  return (
    <li
      className="animate__animated animate__fadeInUp mb-3 flex min-h-[50px] items-center rounded border border-solid px-3 py-2 shadow"
      style={{ animationDelay: `${index * 0.05}s` }}
      key={expense.id}
    >
      <div className="basis-1/3 md:basis-1/4">
        {parseISO(expense.date).toDateString()}
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
  const user = await currentUsr();
  const page = parseInt(searchParams.page as string) || 0;
  const flockId = searchParams.flockId as string;

  if (!user) redirect("/auth/sign-in");

  const [expenses, totalPages] = await fetchExpenses(user.id, page, flockId);

  return (
    <main className="p-0 lg:p-8 lg:px-[3.5vw]">
      <div className="shadow-xl">
        <Card className="pb-safe py-0 lg:pb-4 lg:pt-7">
          <FlockSelect />
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

import { addMonths, getDaysInMonth } from "date-fns";
import { prisma } from "../../../../../server/db/client";
import FlockSummary from "./FlockSummary";

export const metadata = {
  title: "FlockNerd - Flock Summary",
  description: "Flock Stats for Nerds",
};

const Summary = async ({
  params,
  searchParams,
}: {
  params: { flockId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const flockId = params.flockId;
  const month = searchParams.month as string;
  const year = searchParams.year as string;

  async function getSummaryData({
    month,
    year,
    flockId,
  }: {
    month: string;
    year: string;
    flockId: string;
  }) {
    const startOfMonth = new Date(`${month}/01/${year}`);
    const startOfNextMonth = addMonths(startOfMonth, 1);

    console.log("Start of this month: ", startOfMonth);
    console.log("Start of next month: ", startOfNextMonth);

    const flockData = await prisma.flock.findUniqueOrThrow({
      where: {
        id: flockId,
      },
      include: {
        breeds: true,
      },
    });

    const expenseData = await prisma.expense.groupBy({
      where: {
        flockId: flockId,
        date: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
      by: ["category"],
      _sum: {
        amount: true,
      },
    });

    const logData = await prisma.eggLog.aggregate({
      where: {
        flockId: flockId,
        date: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
      _avg: {
        count: true,
      },
      _sum: {
        count: true,
      },
      _max: {
        count: true,
      },
      _count: {
        id: true,
      },
    });

    const totalExpenses = expenseData
      .map((exp) => exp._sum.amount ?? 0)
      .reduce((acc, cur) => acc + cur);

    return {
      flock: {
        id: flockData.id,
        name: flockData.name,
        image: flockData.imageUrl,
      },
      expenses: {
        total: totalExpenses,
        categories: expenseData.map((exp) => {
          return {
            category: exp.category,
            amount: exp._sum.amount ?? 0,
          };
        }),
      },
      logs: {
        total: logData._sum.count,
        numLogs: logData._count.id,
        average: logData._avg.count,
        calcAvg: (logData._sum.count ?? 0) / getDaysInMonth(startOfMonth),
        largest: logData._max.count,
      },
      year: startOfMonth.toLocaleString("default", { year: "numeric" }),
      month: startOfMonth.toLocaleString("default", { month: "long" }),
    };
  }

  const summary = await getSummaryData({
    flockId: typeof flockId == "string" ? flockId : "",
    month: typeof month == "string" ? month : "",
    year: typeof year == "string" ? year : "",
  });

  return (
    <>
      <main className="flex flex-col items-center justify-center">
        <FlockSummary summary={summary} twoDigitMonth={month} />
      </main>
    </>
  );
};

export default Summary;

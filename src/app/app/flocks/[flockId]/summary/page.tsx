import { getSummaryData } from "@lib/fetch";
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

  const summary = await getSummaryData({
    flockId: typeof flockId == "string" ? flockId : "",
    month: typeof month == "string" ? month : "",
    year: typeof year == "string" ? year : "",
  });

  if (!summary) throw new Error("No summary data found");

  return (
    <>
      <main className="flex flex-col items-center justify-center">
        <FlockSummary summary={summary} twoDigitMonth={month} />
      </main>
    </>
  );
};

export default Summary;

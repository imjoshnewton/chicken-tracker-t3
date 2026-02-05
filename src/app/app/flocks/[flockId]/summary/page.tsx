import * as statsService from "../../../../../services/stats.service";
import FlockSummary from "./FlockSummary";

export const metadata = {
  title: "FlockNerd - Flock Summary",
  description: "Flock Stats for Nerds",
};

// Simplest possible approach for Next.js 15 compatibility
export default async function Summary(props: any) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const flockId = params.flockId;
  const month = searchParams?.month as string;
  const year = searchParams?.year as string;

  const summary = await statsService.getFlockSummary({
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
}

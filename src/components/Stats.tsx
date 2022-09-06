import { Breed, Flock } from "@prisma/client";
import Loader from "./Loader";
import ProductionChart from "./ProductionChart";
import ExpenseChart from "./ExpenseChart";

export default function Stats({
  stats,
  flock,
  className,
  limit,
  onRangeChange,
}: {
  stats: any | null | undefined;
  flock: Flock & { breeds: Breed[] };
  className: string;
  limit: string;
  onRangeChange: any;
}) {
  if (!flock || !stats.logs) {
    return (
      <div className='flex justify-center items-center basis-[48%]'>
        <Loader show={true}></Loader>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className='flex justify-between'>
        <h2 className='mb-4 dark:text-gray-300'>Stats</h2>
      </div>
      <div className='flex flex-wrap'>
        <ProductionChart
          stats={stats}
          flock={flock}
          className={"flex-48"}
          limit={limit}
          onRangeChange={onRangeChange}
        />
        <div className='p-2'></div>
        <ExpenseChart stats={stats} className={"flex-48"} />
      </div>
    </div>
  );
}

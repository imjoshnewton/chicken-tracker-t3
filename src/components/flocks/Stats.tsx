import { Breed, Flock } from "@prisma/client";
import Loader from "../shared/Loader";
import ProductionChart from "./ProductionChart";
import ExpenseChart from "./ExpenseChart";
import { MdFilterAlt } from "react-icons/md";

export default function Stats({
  stats,
  flock,
  className,
  limit,
  onRangeChange,
  filter,
}: {
  stats: any | null | undefined;
  flock: Flock & { breeds: Breed[] };
  className: string;
  limit: string;
  onRangeChange: any;
  filter?: string;
}) {
  if (!flock || !stats.logs) {
    return (
      <div className="flex basis-[48%] items-center justify-center">
        <Loader show={true}></Loader>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4 flex justify-between">
        <h2 className="dark:text-gray-300">Stats</h2>
        {filter && (
          <span className="flex items-center rounded-full bg-gray-200 px-3 text-xs">
            <MdFilterAlt className="mt-0" />
            &nbsp;{filter}
          </span>
        )}
      </div>
      <div className="flex flex-wrap">
        <ProductionChart
          stats={stats}
          flock={flock}
          className={"flex-48"}
          limit={limit}
          onRangeChange={onRangeChange}
        />
        <div className="p-2"></div>
        <ExpenseChart stats={stats} className={"flex-48"} />
      </div>
    </div>
  );
}
